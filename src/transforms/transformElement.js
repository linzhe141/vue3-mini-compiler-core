export function transformElement(node, context) {
  return function postTransformElement() {
    if (!(node.type === 'ELEMENT')) {
      return
    }
    const { tag, props } = node
    const vnodeTag = `"${tag}"`
    let vnodeChildren
    let shouldUseBlock = false
    if (node.children.length > 0) {
      if (node.children.length === 1) {
        const child = node.children[0]
        const type = child.type
        const hasDynamicTextChild = type === 'INTERPOLATION'
        if (hasDynamicTextChild || type === 'TEXT') {
          vnodeChildren = child
        } else {
          vnodeChildren = node.children
        }
      } else {
        vnodeChildren = node.children
      }
    }
    if (shouldUseBlock) {
      context.helper('OPEN_BLOCK')
      context.helper('CREATE_ELEMENT_BLOCK')
    } else {
      context.helper('CREATE_ELEMENT_VNODE')
    }
    // if (directives) {
    //   context.helper(WITH_DIRECTIVES)
    // }
    node.codegenNode = {
      type: 'VNODE_CALL',
      tag: vnodeTag,
      children: vnodeChildren,
      isBlock: shouldUseBlock,
    }
  }
}
