const FileUtil = require('./file')

const koaApiAsync = (handler) => async (ctx, next) => {
  let result = await handler(ctx)
  ctx.response.body = {
    code: 0,
    data: result,
  }
}

const expressApiAsync = (handler) => (req, res, next) => {
  return handler(req, res)
    .then(result => {
      res.status(200)
      .json({
        code: 0,
        data: result,
      })
      next()
    })
    .catch(err => {
      console.log('api err:', err)
      next(err)
    })
}


module.exports = function(router, path, opts={}) {
  let {prefix, authMid, middlewares, frame} = opts
  middlewares = middlewares || []
  let fullPaths = FileUtil.getJsPaths(path)
  fullPaths.forEach(function (fullPath) {
    if (!fullPath.endsWith('index.js.js') && fullPath.endsWith('.js')) {
      let controllers = require(fullPath)
      if (controllers instanceof Array) {
        controllers.forEach(cont => {
          try {
            let handler
            let handMids = cont.middleware || []
            if (cont.skipWrap) {
              handler = cont.handler
            } else {
              if(frame === 'koa'){
                handler = koaApiAsync(cont.handler)
              }else{
                handler = expressApiAsync(cont.handler)
              }
            }
            if (cont.auth === 'skip' || !authMid) {
              router[cont.method](`${prefix}${cont.path}`, ...middlewares, ...handMids, handler)
            } else {
              router[cont.method](`${prefix}${cont.path}`, authMid, ...middlewares, ...handMids, handler)
            }
          } catch (err) {
            error(`add router error, file: ${fullPath}, method: ${cont.method}, path: ${cont.path}`)
            error(err.message)
          }
        })
      }
    }
  })
}