export function transformText(node, context) {
  if (node.type === 'ROOT' || node.type === 'ELEMENT') {
    return () => {
      const children = node.children
      let currentContainer
      let hasText = false
      for (let i = 0; i < children.length; i++) {
        const child = children[i]
        if (isText(child)) {
          hasText = true
          for (let j = i + 1; j < children.length; j++) {
            const next = children[j]
            if (isText(next)) {
              if (!currentContainer) {
                currentContainer = children[i] = {
                  type: 'COMPOUND_EXPRESSION',
                  children: [child],
                }
              }
              currentContainer.children.push(` + `, next)
              children.splice(j, 1)
              j--
            } else {
              currentContainer = undefined
              break
            }
          }
        }
      }

      // 预先转换为 createTextVNode(text)
      for (let i = 0; i < children.length; i++) {
        const child = children[i]
        if (isText(child) || child.type === 'COMPOUND_EXPRESSION') {
          const callArgs = []
          if (child.type !== 'TEXT' || child.content !== ' ') {
            callArgs.push(child)
          }
          children[i] = {
            type: 'TEXT_CALL',
            content: child,
            codegenNode: {
              type: 'JS_CALL_EXPRESSION',
              callee: context.helper('CREATE_TEXT'),
              arguments: callArgs,
            },
          }
        }
      }
    }
  }
}

function isText(node) {
  return node.type === 'TEXT' || node.type === 'INTERPOLATION'
}
