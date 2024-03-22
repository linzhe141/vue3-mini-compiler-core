import { expect, describe, test } from 'vitest'
import { baseParse } from '../parse'
import { transform } from '../transform'
import { transformElement } from '../transforms/transformElement'
import { transformText } from '../transforms/transformText'
import { generate } from '../codegen'
describe('codegen', () => {
  test('element', () => {
    const input = '<div>linzhe</div>'
    const ast = baseParse(input)
    transform(ast, {
      nodeTransforms: [transformElement, transformText],
    })
    const node = generate(ast, { mode: 'module' })
    expect(node).toMatchSnapshot()
  })
})
