// import { baseParse } from './src/parse.js'
// import { generate } from './src/codegen.js'
// import { transform } from './src/transform.js'
// import { transformElement } from './src/transforms/transformElement.js'
// import { transformText } from './src/transforms/transformText.js'
// import { transformOn } from './src/transforms/vOn.js'
// const input = `<div id="test" disabled x @click="()=>foo()">
//   <i id="test-i">i-content</i>
//   div-content
//   {{yy}}
// </div>`
// // const input = `<div>{{ x }}</div>`
// const ast = baseParse(input)
// transform(ast, {
//   nodeTransforms: [transformElement, transformText],
//   directiveTransforms: {
//     on: transformOn,
//   },
// })
// const { code } = generate(ast, {
//   mode: 'module',
// })
// console.log(code)

import { baseCompile as compile } from './src/compile.js'
const input = `<div id="test" disabled x @click="()=>foo()">
  <i id="test-i">i-content</i>
  div-content
  {{yy}}
</div>`
const { code } = compile(input)
console.log(code)
