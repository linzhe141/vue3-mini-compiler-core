import { expect, describe, test } from 'vitest'
import { baseCompile as compile } from '../compile'
describe('codegen', () => {
  test('element', () => {
    const input = `<div id="test" disabled x @click="()=>foo()">{{yy}}</div>`
    const { code } = compile(input)
    expect(code).toMatchSnapshot()
  })
})
