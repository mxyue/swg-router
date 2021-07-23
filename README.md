
## api写法

router/action.js

``` javascript

const {inpath, inquery, inform, resbody} = require('swg-router/swg-parameter')

module.exports = [{
    tags: ["活动"],
    summary: "添加活动记录",
    description: "添加活动记录",
    parameters: [
      inquery('type', '类型', true),
      inform('activity_id', '活动id', true),
    ],
    swagOps: {
      consumes: ['text/xml'], produces: ['text/xml'],
      responses: {
        200: resbody({
          return_code: '返回状态码',
          return_msg: '返回信息 (错误原因)',
        }, 'xml'),
      },
    },
    method: 'post',
    path: '/actions',
    handler: async(ctx)=>{
      return({docs: []})
    }
  }]
```
inpath: 地址栏的参数，第一个参数是字段名，第二个参数是描述，inpath默认required是true

inheader: header参数，第一个参数是字段名，第二个参数是描述，参数第三个是required，第四个为options参数。默认是字符串类型

inquery: query参数，第一个参数是字段名，第二个参数是描述，参数第三个是required，第四个为options参数。默认是字符串类型

inform: form参数，第一个参数是字段名，第二个参数是描述，参数第三个是required，第四个为options参数。默认是字符串类型

inbody: body参数，第一个参数是结构对象，第二个参数是类型，默认json格式，也可以传xml。

inbody的data按需要传入的参数格式设定。例如:

``` javascript
  inbody({
     field_name1: '描述内容',
     grade: {$type: 'integer', $desc: '年级'},
     addresses: [{phone: "手机号", road: "xx大道84号"}],
  })
```

swagOps: swagger的其他参数。按swagger文档进行设置。

resbody: 第一个参数是结构对象，第二个参数是类型，默认json格式，也可以传xml。


router/index.js

``` javascript
const Router = require('koa-router')
const swgApi = require('swg-router')

const router = new Router()

swgApi.Router(router, __dirname, {prefix: '', frame: 'koa'})

module.exports = router
```

`swgApi.Router(router, __dirname, {prefix: '', frame: 'koa'})` 会加载当前目录和子目录中所有的js结尾的文件，并绑定里面的handler。



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

## 配置静态文件

``` javascript
const swgApi = require('swg-router')
swagOpts = {
  favicon: '图标url',
  swgUICss: '静态样式 url',
  bundleJS: 'js1 url',
  standaloneJS: 'js2 url',
}
swgApi.Swagger(swagOpts)
```
在public中存放了静态文件，可以放到自己的资源服务器上，然后更改配置。



