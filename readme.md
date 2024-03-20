# vue3-mini-compiler-core

这个项目是基于 Vue 3 的源代码（版本：3.4.19）提炼出来的一个简化版本的 `compiler-core`。它的目的是为了学习 Vue 3 的编译器核心部分，了解大概的编译流程。

> [!WARNING]
> 该库旨在用于学习 `compiler-core`，并且是一项正在进行的工作。 预计未来版本中会有重大变化。


## TODO
- [x] parse
- [ ] transform
  - [x] transformText 
  - [x] transformElement 
  - [x] v-on 
- [x] generate
  - [x] genElement 
  - [x] genText 
  - [x] genElement v-on 
- [ ] unit testing with vitest
