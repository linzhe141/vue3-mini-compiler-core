import { baseParse } from './parse.js'
import { generate } from './codegen.js'
import { transform } from './transform.js'
import { transformElement } from './transforms/transformElement.js'
import { transformText } from './transforms/transformText.js'
import { transformOn } from './transforms/vOn.js'
export function baseCompile(source, options = {}) {
  const mode = options.mode || 'module'

  const ast = baseParse(source)
  transform(ast, {
    nodeTransforms: [transformElement, transformText],
    directiveTransforms: {
      on: transformOn,
    },
  })

  return generate(ast, { mode })
}
