import { parse } from './src/parse.js'
const input = `<div id="test" disabled x @click="()=>foo()">
  <i id="test-i">i-content</i>
  div-content
  {{yy}}
</div><span t="t" />`
// const input = `<div>{{ x }}</div>`
const ast = parse(input)
console.log(ast)
