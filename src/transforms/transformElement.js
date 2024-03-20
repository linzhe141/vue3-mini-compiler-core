import {
  createObjectProperty,
  createSimpleExpression,
  createObjectExpression,
} from '../ast.js'
export function transformElement(node, context) {
  return function postTransformElement() {
    if (!(node.type === 'ELEMENT')) {
      return
    }
    const { tag, props } = node
    const vnodeTag = `"${tag}"`
    let vnodeProps
    let vnodeChildren

    let shouldUseBlock = false
    // props
    if (props.length > 0) {
      const propsBuildResult = buildProps(node)
      vnodeProps = propsBuildResult.props
    }
    // children
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
      props: vnodeProps,
      children: vnodeChildren,
      isBlock: shouldUseBlock,
    }
  }
}

function buildProps({ props }) {
  const properties = []
  for (let i = 0; i < props.length; i++) {
    // static attribute
    const prop = props[i]
    if (prop.type === 'ATTRIBUTE') {
      const { name, value } = prop
      let isStatic = true

      properties.push(
        createObjectProperty(
          createSimpleExpression(name, true),
          createSimpleExpression(value ? value.content : '', isStatic)
        )
      )
    } else {
      // TODO
      // directives v-on
    }
  }
  const propsExpression = createObjectExpression(properties)
  return {
    props: propsExpression,
  }
}
