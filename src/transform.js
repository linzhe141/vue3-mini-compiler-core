export function transform(root, options) {
  const context = createTransformContext(root, options)
  traverseNode(root, context)
  createRootCodegen(root, context)
  root.helpers = new Set([...context.helpers.keys()])
}

function createRootCodegen(root, context) {
  const { helper } = context
  const { children } = root
  if (children.length === 1) {
    const child = children[0]
    root.codegenNode = child
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
