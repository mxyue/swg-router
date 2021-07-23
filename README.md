
# api加载

## 单个路由写法

*router/action.js*

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
      consumes: ['text/xml'], 
      produces: ['text/xml'],
      responses: {
        200: resbody({
          return_code: '返回状态码',
          return_msg: '返回信息 (错误原因)',
        }, 'xml'),
      },
    },
    auth: 'skip',
    method: 'post',
    path: '/actions',
    handler: async(ctx)=>{
      return({docs: []})
    }
  }]
```
**parameters**
  - inpath: 地址栏的参数，第一个参数是字段名，第二个参数是描述，inpath默认required是true
  - inheader: header参数，第一个参数是字段名，第二个参数是描述，参数第三个是required，第四个为options参数。默认是字符串类型
  - inquery: query参数，第一个参数是字段名，第二个参数是描述，参数第三个是required，第四个为options参数。默认是字符串类型
  - inform: form参数，第一个参数是字段名，第二个参数是描述，参数第三个是required，第四个为options参数。默认是字符串类型
  - inbody: body参数，第一个参数是结构对象，第二个参数是类型，默认json格式，也可以传xml。

> inbody的data按需要传入的参数格式定义。例如:

``` javascript
  inbody({
     field_name1: '描述内容',
     grade: {$type: 'integer', $desc: '年级'},
     addresses: [{$desc: 'addresses地址', phone: "手机号", road: "xx大道84号"}],
  })
```
>  默认字段类型是按对应的value推断的 如 {key1: 1},则推断出的类型是 integer   <br/> 
>  数组类型，需要设定第一个元素，如 arr: [{itemKey1: 1, itemKey2: 'itemKey2描述' }]
>  $type: 定义类型  <br/> 
>  $desc: 定义描述  <br/> 

**swagOps**

- swagger的其他参数。按swagger文档进行设置。
- resbody: 生成response的解构，参数同`inbody`一样， 第一个参数是结构对象，第二个参数是类型，默认json格式，也可以传xml。

**skipWrap: boolearn**
- handler中的函数，默认直接return 即可在response返回数据，返回的数据为`{code: 0, data: {}}`，skipWrap: true后 需要手动进行如 ctx.body=xxx 进行返回。

**auth**
- 是否进行校验，默认使用中间件校验，检验的中间件为下文路由加载中的 Router初始化 `authMid`，如果不校验则 auth: 'skip'，
 
**middleware: []**
- 其他中间件，如果此路由需要加载其他中间件，可以在此字段添加，中间件在authMid之后调用。

## 路由加载

*router/index.js*

``` javascript
const Router = require('koa-router')
const swgApi = require('swg-router')

const authMid = function(ctx){}

const router = new Router()

swgApi.Router(router, __dirname, {prefix: '', frame: 'koa', authMid })

module.exports = router
```

`swgApi.Router(router, __dirname, {prefix: '', frame: 'koa', authMid})` 
会加载当前目录和子目录中所有的js结尾的文件，并绑定里面的handler。



# swagger 文档加载用法

## 基础配置

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



