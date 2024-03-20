export function generate(ast, options) {
  const context = createCodegenContext(ast, options)
  const { mode, push } = context
  // const helpers = Array.from(ast.helpers)
  // const hasHelpers = helpers.length > 0

  if (mode === 'module') {
    genModulePreamble(ast, context)
  }
  const functionName = `render`
  const args = ['_ctx', '_cache']
  const signature = args.join(', ')
  push(`function ${functionName}(${signature}) {`)
  push(`return `)
  if (ast.codegenNode) {
    genNode(ast.codegenNode, context)
  } else {
    push(`null`)
  }
  push(`}`)
  return {
    ast,
    code: context.code,
  }
}

function isString(val) {
  return typeof val === 'string'
}
function genNullableArgs(args) {
  return args.map(arg => arg || `null`)
}
export const isArray = Array.isArray

function genNodeListAsArray(nodes, context) {
  context.push(`[`)
  genNodeList(nodes, context)
  context.push(`]`)
}
function genNodeList(nodes, context) {
  const { push } = context
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (isString(node)) {
      push(node)
    } else if (isArray(node)) {
      genNodeListAsArray(node, context)
    } else {
      genNode(node, context)
    }
    if (i < nodes.length - 1) {
      push(', ')
    }
  }
}
function genVNodeCall(node, context) {
  const { push, helper } = context
  const { tag, props, children, isBlock } = node
  if (isBlock) {
    push(`(${helper('OPEN_BLOCK')}(), `)
  }
  const callHelper = isBlock ? 'CREATE_ELEMENT_BLOCK' : 'CREATE_ELEMENT_VNODE'
  push(helper(callHelper) + `(`)
  genNodeList(genNullableArgs([tag, props, children]), context)
  push(`)`)
  if (isBlock) {
    push(`)`)
  }
}
function genText(node, context) {
  context.push(JSON.stringify(node.content))
}
function genExpression(node, context) {
  // isStatic 为true 就是 <div id="13" /> 的id就是一个字符串
  // isStatic 为false 就是 <div @click="()=>foo()" /> 的click应该是一个表达式，所有在generate时，不用在进行字符串化
  const { content, isStatic } = node
  context.push(isStatic ? JSON.stringify(content) : content)
}

function genInterpolation(node, context) {
  const { push, helper } = context
  push(`${helper('TO_DISPLAY_STRING')}(`)
  genNode(node.content, context)
  push(`)`)
}
function genCompoundExpression(node, context) {
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i]
    if (isString(child)) {
      context.push(child)
    } else {
      genNode(child, context)
    }
  }
}
function genCallExpression(node, context) {
  const { push, helper } = context
  const callee = helper(node.callee)
  push(callee + `(`)
  genNodeList(node.arguments, context)
  push(`)`)
}
function genExpressionAsPropertyKey(node, context) {
  const { push } = context
  const text = node.content
  push(text)
}
function genObjectExpression(node, context) {
  const { push } = context
  const { properties } = node
  if (!properties.length) {
    push(`{}`)
    return
  }
  push(`{ `)
  for (let i = 0; i < properties.length; i++) {
    const { key, value } = properties[i]
    // key
    genExpressionAsPropertyKey(key, context)
    push(`: `)
    // value
    genNode(value, context)
    if (i < properties.length - 1) {
      push(`,`)
    }
  }
  push(` }`)
}

function genNode(node, context) {
  // <template>xx</template>
  // 这种就只push xx
  if (isString(node)) {
    context.push(node)
    return
  }
  switch (node.type) {
    case 'ELEMENT':
      genNode(node.codegenNode, context)
      break
    case 'TEXT':
      genText(node, context)
      break
    case 'SIMPLE_EXPRESSION':
      genExpression(node, context)
      break

    case 'INTERPOLATION':
      genInterpolation(node, context)
      break
    case 'TEXT_CALL':
      genNode(node.codegenNode, context)
      break
    case 'COMPOUND_EXPRESSION':
      genCompoundExpression(node, context)
      break
    case 'VNODE_CALL':
      genVNodeCall(node, context)
      break

    case 'JS_CALL_EXPRESSION':
      genCallExpression(node, context)
      break
    case 'JS_OBJECT_EXPRESSION':
      genObjectExpression(node, context)
      break
    default:
      break
  }
}

function genModulePreamble(ast, context) {
  const { push } = context
  // generate import statements for helpers
  if (ast.helpers.size) {
    const helpers = Array.from(ast.helpers)
    push(
      `import {${helpers
        .map(s => `${formatKey(s)} as _${formatKey(s)}`)
        .join(', ')}} from ${JSON.stringify('vue')}\n`
    )
  }
  push(`export `)
}

function createCodegenContext(ast, options) {
  const { mode } = options
  const context = {
    mode,
    code: ``,
    helper(key) {
      return `_${formatKey(key)}`
    },
    push(code) {
      context.code += code
    },
  }
  return context
}
function formatKey(inputString) {
  return inputString.toLowerCase().replace(/_[a-z]/g, function (match) {
    return match.charAt(1).toUpperCase()
  })
}
