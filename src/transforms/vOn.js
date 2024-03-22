import { createObjectProperty, createSimpleExpression } from '../ast.js'

export function transformOn(dir, node, context) {
  const { arg } = dir
  let eventName
  if (arg.type === 'SIMPLE_EXPRESSION') {
    let rawName = arg.content
    const eventString = 'on' + capitalize(rawName)
    eventName = createSimpleExpression(eventString, true)
  }

  const exp = dir.exp
  const ret = { props: [createObjectProperty(eventName, exp)] }
  return ret
}
const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1)
