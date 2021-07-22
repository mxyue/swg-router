
function buildSchema(schema){
  if(schema instanceof Array){
    throw new Error('body params 暂时不支持 数组') //todo 需要完善
  }
  let props = {}
  Object.keys(schema).forEach(key=>{
    let value = schema[key]
    let type, description
    if(typeof value === 'string'){
      type = 'string'
      description = value
    }else if (typeof value === 'number'){
      type = 'integer'
      description = '-'
    }else if(typeof value === 'object'){
      if(value.type){
        type = value.type
      }
      if(value.desc){
        description = value.desc
      }
      if(!value.type && !value.child){
        type = 'string'
      }
      if(value.child){
        throw new Error('body params 暂时不支持 对象') //todo 需要完善
      }
    }
    props[key] = {type, description}
  })
  return {
    "type": "object",
    "description": "内容",
    properties: props
  }
}

let help = {
  inpath(name, describe){
    return {
      "name": name,
      "in": "path",
      "description": describe,
      "type": "string",
      "required": true
    }
  },
  inquery(name, describe, required, opt={}){
    return {
      "name": name,
      "in": "query",
      "description": describe,
      "type": "string",
      "required": !!required,
      ...opt,
    }
  },
  inheader(name, describe, required, opt={}){
    return {
      "name": name,
      "in": "header",
      "description": describe,
      "type": "string",
      "required": !!required,
      ...opt,
    }
  },
  inform(name, describe, required, opt={}){
    return {
      "type": "string",
      "description": describe,
      "name": name,
      "in": "formData",
      "required": !!required,
      ...opt,
    }
  },
  inbody(data, type=''){
    let schema = buildSchema(data)
    if(type === 'xml'){
      schema.xml = {name: 'xml'}
    }
    let body = {
      "name": "body",
      "in": "body",
      "required": true,
      "description": "body",
      "schema": schema,
    }
    return body
  },

  resbody(data, type=''){
    let schema = buildSchema(data)
    if(type === 'xml'){
      schema.xml = {name: 'xml'}
    }
    let body = {
      "200": {
        schema
      }
    }
    return body
  }
}

module.exports = help