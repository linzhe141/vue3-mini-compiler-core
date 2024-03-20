import { parse } from './src/parse.js'
import { generate } from './src/codegen.js'
import { transform } from './src/transform.js'
import { transformElement } from './src/transforms/transformElement.js'
import { transformText } from './src/transforms/transformText.js'
const input = `<div id="test" disabled x @click="()=>foo()">
  <i id="test-i">i-content</i>
  div-content
  {{yy}}
</div>`
// const input = `<div>{{ x }}</div>`
const ast = parse(input)
transform(ast, {
  nodeTransforms: [transformElement, transformText],
  // TODO
  // directiveTransforms: {
  //   on: transformOn,
  // },
})
const { code } = generate(ast, {
  mode: 'module',
})
console.log(code)
