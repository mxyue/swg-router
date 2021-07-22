
## api写法

router/action.js

``` javascript

const {inpath, inquery, inform} = require('swg-router/swg-parameter')

module.exports = [{
    tags: ["活动"],
    summary: "添加活动记录",
    description: "添加活动记录",
    parameters: [
      inquery('activity_id', '活动id', true),
      inform('activity_id', '活动id', true),
    ],
    method: 'post',
    path: '/actions',
    handler: async(ctx)=>{
      let docs = {docs: []}
      return(docs)
    }
  }]
```

router/index.js

``` javascript
const Router = require('koa-router')
const swgApi = require('swg-router')

const router = new Router()

swgApi.Router(router, __dirname, {prefix: '', frame: 'koa'})

module.exports = router
```


## swagger 文档加载用法

``` javascript

const Router = require('koa-router')
const swgApi = require('swg-router')
const path = require('path')
const router = new Router({prefix: '/swagger'})

let routerPaths = [
  {path: path.resolve(__dirname, '../internal'), prefix: ''},
  {path: path.resolve(__dirname, '../mb/v1'), prefix: ''},
]

let swagOpts = {
  frame: 'koa', //如果是express，不传此字段
  title: 'api接口', 
  version: '3.0.0',
  description: '描述',
  routerPrefix: router.opts.prefix,
  routerPaths,
}

router.get('/', swgApi.Swagger(swagOpts))


module.exports = router


```