
const Handlebars =require("handlebars")
const path = require("path")
const fs = require("fs")
const swagParser = require('./swag-parser')
const lodash = require('lodash')

const swgUICss = "https://yqj-h5.oss-cn-hangzhou.aliyuncs.com/swagger/nodejs/3.38.0/swagger-ui.min.css"
const bundleJS = "https://yqj-h5.oss-cn-hangzhou.aliyuncs.com/swagger/nodejs/3.38.0/swagger-ui-bundle.js"
const standaloneJS = "https://yqj-h5.oss-cn-hangzhou.aliyuncs.com/swagger/nodejs/3.38.0/swagger-ui-standalone-preset.js"
const favicon = "https://yqj-h5.oss-cn-hangzhou.aliyuncs.com/swagger/nodejs/3.38.0/favicon.png"

const defaultOptions = {
  oauthOptions: false,
  swaggerOptions: {
    dom_id: '#swagger-ui',
    url: 'https://petstore.swagger.io/v2/swagger.json',
    layout: 'StandaloneLayout',
  },
  swaggerVersion: '3.38.0',
  exposeSpec: false,
  hideTopbar: false,
}


module.exports = function(config = {}) {
  let swgSpec = swagParser({
    ...lodash.omit(config, ['routerPaths']),
    routerPaths: config.routerPaths,
  })
  let swgDoc = {
    routerPrefix: config.routerPrefix,
    title: config.title, 
    swaggerOptions: { spec: swgSpec } 
  }
  // Setup default options
  const options = _.defaultsDeep(swgDoc, defaultOptions)
  Handlebars.registerHelper('json', (context) => JSON.stringify(context))
  Handlebars.registerHelper('strfnc', (fnc) => fnc)
  Handlebars.registerHelper('isset', function (conditional, opt) {
    return conditional ? opt.fn(this) : opt.inverse(this)
  })
  const index = Handlebars.compile(fs.readFileSync(path.join(__dirname, './index.hbs'), 'utf-8'))
  const indexObj = Object.assign(options, {
    swgUICss: config.swgUICss || swgUICss,
    favicon: config.favicon || favicon,
    bundleJS: config.bundleJS || bundleJS,
    standaloneJS: config.standaloneJS || standaloneJS,
  })
  if(config.frame === 'koa'){
    return function (ctx, next) {
      if (options.exposeSpec && ctx.path === options.specPrefix) {
        ctx.body = options.swaggerOptions.spec
        return next()
      }
      ctx.type = 'text/html'
      ctx.body = index(indexObj)
      return next()
    }
  }

  return function expressSwaggerUi(req, res, next) {
    res.send(index(indexObj))
    return next()
  }
}