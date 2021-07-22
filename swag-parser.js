const FileUtil = require('./file')

const lodash = require('lodash')

function getSwagDocuments(opt={}) {
  return {
    "swagger": "2.0",
    "info": {
      version: opt.version || "1.0.0",
      title: opt.title,
      description: opt.description,
    },
    basePath: opt.basePath || "",
    "schemes": ["http"],
    "consumes": ["application/json"],
    "produces": ["application/json"],
    "securityDefinitions": {
      "apiKey": {
        "name": "X-APP-KEY",
        "type": "apiKey",
        "in": "header"
      }
    },
    "responses": {
      "SuccessResponse": {
        "description": "成功",
        "schema": {
          "type": "object",
          "properties": {
            "code": {
              "description": "状态码",
              "type": "integer"
            },
            "data": {
              "description": "数据",
              "type": "object"
            }
          }
        }
      }
    },
    paths: opt.paths,
  }
  
}

function toSwgPath(url) {
  if (!url.includes(':')) {
    return url
  }
  return url.split('/').map(item => {
    if (item.startsWith(':')) {
      return item.replace(':', '{') + '}'
    }
    return item
  }).join('/')
}

function consum(parameters) {
  let inForm = parameters.some(param => {
    return param.in === 'formData'
  })
  if (inForm) {
    return ['application/x-www-form-urlencoded']
  }
  return []
}

function genRouterDoc(item, apiPrefix = '') {
  const urlPath = toSwgPath(item.path)
  const options = item.swagOps || {}
  // log('item.parameters->', item.parameters)
  if (!options.consumes || options.consumes.length === 0) {
    options.consumes = consum(item.parameters)
  }
  return {
    [`${apiPrefix}${urlPath}`]: {
      [item.method]: {
        tags: item.tags,
        summary: item.summary,
        description: item.description,
        parameters: item.parameters,
        responses: {
          "200": {
            "$ref": "#/responses/SuccessResponse"
          }
        },
        ...options,
      }
    }
  }
}

function loaderPaths(basePaths, path, apiPrefix) {
  let fullPaths = FileUtil.getJsPaths(path)
  fullPaths.forEach(function (fullPath) {
    if (!fullPath.endsWith('index.js.js') && fullPath.endsWith('.js')) {
      let controllers = require(fullPath)
      if (controllers instanceof Array) {
        controllers.forEach(item => {
          try {
            // log(`${item.tags}, ${item.summary}`)
            if (item.tags && item.summary) {
              let aDoc = genRouterDoc(item, apiPrefix)
              // log('aDoc->', JSON.stringify(aDoc))
              basePaths = lodash.merge(basePaths, aDoc)
            }
          } catch (err) {
            error('prase swagger', err.message)
          }
        })
      }
    }
  })
}


// {routerPaths: [{path, prefix}]}
module.exports = function(opts){
  let basePaths = {}
  for(let ropt of opts.routerPaths){
    loaderPaths(basePaths, ropt.path, ropt.prefix)  
  }
  let other = lodash.omit(opts, ['routerPaths'])
  return getSwagDocuments({...other, paths: basePaths})
}