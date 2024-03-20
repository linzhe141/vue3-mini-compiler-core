function isString(val) {
  return typeof val === 'string'
}
export function createObjectProperty(key, value) {
  return {
    type: 'JS_PROPERTY',
    key: isString(key) ? createSimpleExpression(key, true) : key,
    value,
  }
}
export function createSimpleExpression(content, isStatic) {
  return {
    type: 'SIMPLE_EXPRESSION',
    content,
    isStatic,
    constType: 'CAN_STRINGIFY',
  }
}

export function createObjectExpression(properties) {
  return {
    type: 'JS_OBJECT_EXPRESSION',
    properties,
  }
}
