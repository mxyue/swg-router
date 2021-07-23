function _buildObj(value){
  let hasChild = Object.keys(value).some(key => !key.startsWith('$') )
  let properties
  if(hasChild){
    let childObj = Object.keys(value).reduce((obj, key) =>{
      if(!key.startsWith('$')){
        obj[key] = value[key]
      }
      return obj
    }, {})
    properties = buildPropertyies(childObj)
  }
  return {
    type: hasChild ? "object" : value.$type || 'string', 
    description: value.$desc,
    properties
  }
}

function _buildArr(value){
  if(value.length === 0){
    return {type: 'array'}
  }
  let items, description
  if(typeof value[0] === 'object'){
    items = _buildObj(value[0])
    description = value[0].$desc
  }else{
    items = buildPropertyies(value[0])
  }
  return {type: 'array', description, items: items }
}

function buildPropertyies(schema){
  if(typeof schema === 'string'){
    return {type: 'string', description: schema}
  }else if (typeof schema === 'number'){
    return {type: 'integer', description: ''}
  }

  let props = Object.keys(schema).reduce((obj, key)=>{
    let value = schema[key]
    if(typeof value === 'string'){
      obj[key] = {type: 'string', description: value}
    }else if (typeof value === 'number'){
      obj[key] = {type: 'integer', description: ''}
    }else if(value instanceof Array){
      obj[key] = _buildArr(value)
    }else if(typeof value === 'object'){
      obj[key] = _buildObj(value)
    }
    return obj
  }, {})
  return props 
}

function buildSchema(schema){
  if(schema instanceof Array){
    return {type: 'array', description: '-', items: {properties: buildPropertyies(schema[0]) }} 
  }
  return {type: 'object', description: '-', properties: buildPropertyies(schema)} 
}

let help = {
  inpath(name, describe, opt={}){
    return {
      "name": name,
      "in": "path",
      "description": describe,
      "type": opt.type || "string",
      "required": true,
      ...opt,
    }
  },
  inquery(name, describe, required, opt={}){
    return {
      "name": name,
      "in": "query",
      "description": describe,
      "type": opt.type || "string",
      "required": !!required,
      ...opt,
    }
  },
  inheader(name, describe, required, opt={}){
    return {
      "name": name,
      "in": "header",
      "description": describe,
      "type": opt.type || "string",
      "required": !!required,
      ...opt,
    }
  },
  inform(name, describe, required, opt={}){
    return {
      "type": opt.type || "string",
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
      schema
    }
    return body
  }
}


module.exports = help