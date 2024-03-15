import { Tokenizer, isWhitespace } from './token.js'
let currentOpenTag = null
let currentProp = null
let currentAttrValue = ''

let currentInput = ''
let root = null
const stack = []

function addNode(node) {
  ;(stack[0] || root).children.push(node)
}
function endOpenTag(end) {
  addNode(currentOpenTag)
  stack.unshift(currentOpenTag)
  currentOpenTag = null
}

const tokenizer = new Tokenizer(stack, {
  ontext(start, end) {
    const content = currentInput.slice(start, end)
    console.log('ontext->', content)
    const parent = stack[0] || root
    const lastNode = parent.children[parent.children.length - 1]
    if (lastNode?.type === 'TEXT') {
      // merge 字符串拼接
      lastNode.content += content
    } else {
      parent.children.push({
        type: 'TEXT',
        content,
      })
    }
  },
  ondirname(start, end) {
    const raw = currentInput.slice(start, end)
    // @
    const name = 'on'
    // const name =
    //   raw === '.' || raw === ':'
    //     ? 'bind'
    //     : raw === '@'
    //       ? 'on'
    //       : raw === '#'
    //         ? 'slot'
    //         : raw.slice(2)

    currentProp = {
      type: 'DIRECTIVE',
      name,
      rawName: raw,
      exp: undefined,
      arg: undefined,
    }
  },
  oninterpolation(start, end) {
    let innerStart = start + '{{'.length
    let innerEnd = end - '}}'.length
    // 去除头尾空格
    while (isWhitespace(currentInput.charAt(innerStart))) {
      innerStart++
    }
    while (isWhitespace(currentInput.charAt(innerEnd - 1))) {
      innerEnd--
    }
    const exp = currentInput.slice(innerStart, innerEnd)
    addNode({
      type: 'INTERPOLATION',
      // content: createExp(exp, false, getLoc(innerStart, innerEnd)),
      content: {
        type: 'SIMPLE_EXPRESSION',
        content: exp,
        constType: 'NOT_CONSTANT',
      },
    })
  },
  ondirarg(start, end) {
    if (start === end) return
    const arg = currentInput.slice(start, end)
    currentProp.arg = {
      type: 'SIMPLE_EXPRESSION',
      content: arg,
      constType: 'CAN_STRINGIFY',
    }
  },
  onopentagname(start, end) {
    const name = currentInput.slice(start, end)
    console.log('onopentagname->', name)
    currentOpenTag = {
      type: 'ELEMENT',
      tag: name,
      props: [],
      children: [],
      // codegenNode: undefined,
    }
  },
  onopentagend(end) {
    console.log('onopentagend')
    endOpenTag(end)
  },
  onselfclosingtag(end) {
    const name = currentOpenTag.tag
    currentOpenTag.isSelfClosing = true
    endOpenTag(end)
    if (stack[0]?.tag === name) {
      stack.shift()
    }
  },
  onattribname(start, end) {
    const name = currentInput.slice(start, end)
    console.log('onattribname->', name)
    currentProp = {
      type: 'ATTRIBUTE',
      name,
      value: undefined,
    }
  },
  onattribnameend(end) {
    console.log('onattribnameend')
  },
  onattribend(quote, end) {
    console.log('onattribend')
    if (currentOpenTag && currentProp) {
      if (quote !== 'QuoteType.NoValue') {
        if (currentProp.type === 'ATTRIBUTE') {
          // assign value

          currentProp.value = {
            type: 'TEXT',
            content: currentAttrValue,
          }
        } else {
          // directive
          currentProp.exp = {
            type: 'SIMPLE_EXPRESSION',
            content: currentAttrValue,
            constType: 'NOT_CONSTANT',
          }
        }
      }
      currentOpenTag.props.push(currentProp)
    }
    currentAttrValue = ''
  },
  onattribdata(start, end) {
    const name = currentInput.slice(start, end)
    console.log('onattribdata->', name)
    currentAttrValue += name
  },
  onclosetag(start, end) {
    const name = currentInput.slice(start, end)
    console.log('onclosetag->', name)
    for (let i = 0; i < stack.length; i++) {
      const e = stack[i]
      if (e.tag.toLowerCase() === name.toLowerCase()) {
        for (let j = 0; j <= i; j++) {
          stack.shift()
          // const el = stack.shift()
          // onCloseTag(el, end, j < i)
        }
        break
      }
    }
  },
})

function createRoot(children, source) {
  return {
    type: 'ROOT',
    source,
    children,
    // codegenNode,
  }
}
export function parse(input) {
  currentInput = input
  root = createRoot([], currentInput)
  tokenizer.parse(currentInput)
  return root
}
