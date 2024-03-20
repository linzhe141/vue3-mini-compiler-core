export function transform(root, options) {
  const context = createTransformContext(root, options)
  traverseNode(root, context)
  createRootCodegen(root, context)
  root.helpers = new Set([...context.helpers.keys()])
}
function isSingleElementRoot(root, child) {
  const { children } = root
  return children.length === 1 && child.type === 'ELEMENT'
}
function convertToBlock(node, { helper }) {
  if (!node.isBlock) {
    node.isBlock = true
    helper('OPEN_BLOCK')
    helper('CREATE_ELEMENT_BLOCK')
  }
}
function createRootCodegen(root, context) {
  const { helper } = context
  const { children } = root
  if (children.length === 1) {
    const child = children[0]
    if (isSingleElementRoot(root, child) && child.codegenNode) {
      // single element root is never hoisted so codegenNode will never be
      // SimpleExpressionNode
      const codegenNode = child.codegenNode
      if (codegenNode.type === 'VNODE_CALL') {
        convertToBlock(codegenNode, context)
      }
      root.codegenNode = codegenNode
    } else {
      // - single <slot/>, IfNode, ForNode: already blocks.
      // - single text node: always patched.
      // root codegen falls through via genNode()
      root.codegenNode = child
    }
  } else {
    // FRAGMENT
  }
}

function createTransformContext(root, options) {
  const context = {
    root,
    helpers: new Map(),
    nodeTransforms: options.nodeTransforms || [],
    helper(name) {
      context.helpers.set(name, 1)
      return name
    },
  }
  return context
}

function traverseNode(root, context) {
  const node = root
  const { nodeTransforms } = context
  const exitFns = []
  for (let i = 0; i < nodeTransforms.length; i++) {
    const onExit = nodeTransforms[i](node, context)
    if (onExit) {
      exitFns.push(onExit)
    }
  }

  switch (node.type) {
    case 'INTERPOLATION':
      context.helper('TO_DISPLAY_STRING')
      break
    case 'ELEMENT':
    case 'ROOT':
      traverseChildren(node, context)
      break
  }
  let i = exitFns.length
  while (i--) {
    exitFns[i]()
  }
}

function traverseChildren(parent, context) {
  for (let i = 0; i < parent.children.length; i++) {
    const child = parent.children[i]
    traverseNode(child, context)
  }
}
