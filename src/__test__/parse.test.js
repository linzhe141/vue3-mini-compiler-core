import { expect, describe, test } from 'vitest'
import { baseParse } from '../parse'

describe('parse', () => {
  test('element', () => {
    const input = '<div>linzhe</div>'
    const ast = baseParse(input)
    expect(ast.children.length).toBe(1)
    expect(ast.children[0].type).toBe('ELEMENT')
    expect(ast.children[0].tag).toBe('div')
    expect(ast.children[0].children.length).toBe(1)
    expect(ast.children[0].children[0].type).toBe('TEXT')
    expect(ast.children[0].children[0].content).toBe('linzhe')
  })
  test('event', () => {
    const input = '<div @click="()=>foo()"></div>'
    const ast = baseParse(input)
    expect(ast.children.length).toBe(1)
    expect(ast.children[0].type).toBe('ELEMENT')
    expect(ast.children[0].tag).toBe('div')
    expect(ast.children[0].props.length).toBe(1)
    expect(ast.children[0].props[0].type).toBe('DIRECTIVE')
    expect(ast.children[0].props[0].name).toBe('on')
    expect(ast.children[0].props[0].rawName).toBe('@')
    expect(ast.children[0].props[0].arg.content).toBe('click')
    expect(ast.children[0].props[0].exp.content).toBe('()=>foo()')
    expect(ast.children[0].children.length).toBe(0)
  })
  test('interpolation', () => {
    const input = '<div>{x}</div>'
    const ast = baseParse(input)
    expect(ast.children.length).toBe(1)
    expect(ast.children[0].type).toBe('ELEMENT')
    expect(ast.children[0].tag).toBe('div')
    expect(ast.children[0].children.length).toBe(1)
    expect(ast.children[0].children[0].type).toBe('TEXT')
    expect(ast.children[0].children[0].content).toBe('{x}')
  })
})
