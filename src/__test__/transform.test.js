import { expect, describe, test } from 'vitest'
import { baseParse } from '../parse'
import { transform } from '../transform'
import { transformElement } from '../transforms/transformElement'
import { transformText } from '../transforms/transformText'
import { transformOn } from '../transforms/vOn'

describe('transform', () => {
  test('element', () => {
    const input = '<div>linzhe</div>'
    const ast = baseParse(input)
    transform(ast, {
      nodeTransforms: [transformElement, transformText],
    })
    expect(ast.codegenNode.type).toBe('VNODE_CALL')
    expect(ast.codegenNode.children.length).toBe(1)
    expect(ast.codegenNode.children[0].type).toBe('TEXT_CALL')
    expect(ast.codegenNode.children[0].codegenNode.callee).toBe('CREATE_TEXT')
  })
  test('interpolation', () => {
    const input = '<div>{{x}}</div>'
    const ast = baseParse(input)
    transform(ast, {
      nodeTransforms: [transformElement, transformText],
    })
    expect(ast.codegenNode.type).toBe('VNODE_CALL')
    expect(ast.codegenNode.children.length).toBe(1)
    expect(ast.codegenNode.children[0].type).toBe('TEXT_CALL')
    expect(ast.codegenNode.children[0].codegenNode.arguments.length).toBe(1)
    expect(
      ast.codegenNode.children[0].codegenNode.arguments[0].content.content
    ).toBe('x')
    expect(ast.codegenNode.children[0].codegenNode.arguments[0].type).toBe(
      'INTERPOLATION'
    )
  })
  test('event', () => {
    const input = '<div @click="()=>foo()"></div>'
    const ast = baseParse(input)
    transform(ast, {
      nodeTransforms: [transformElement],
      directiveTransforms: {
        on: transformOn,
      },
    })
    expect(ast.codegenNode.type).toBe('VNODE_CALL')
    expect(ast.codegenNode.props.properties.length).toBe(1)
    expect(ast.codegenNode.props.properties[0].type).toBe('JS_PROPERTY')
    expect(ast.codegenNode.props.properties[0].key.content).toBe('onClick')
    expect(ast.codegenNode.props.properties[0].key.isStatic).toBe(true)
    expect(ast.codegenNode.props.properties[0].value.content).toBe('()=>foo()')
    expect(!!ast.codegenNode.props.properties[0].value.isStatic).toBe(false)
    expect(ast.codegenNode.props.type).toBe('JS_OBJECT_EXPRESSION')
    expect(ast.codegenNode.children).toBe(undefined)
  })
})
