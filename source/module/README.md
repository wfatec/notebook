<!-- TOC -->

- [nodejs 的模块化实现](#nodejs-的模块化实现)
    - [CommonJS](#commonjs)
    - [参考](#参考)

<!-- /TOC -->

# nodejs 的模块化实现

前端模块化已经是我们前端工程化浪潮中不可或缺的一部分了，应该说，如果没有前端模块化，前端工程化也就无从说起。而目前绝大多数的工程化方案实际上都是依托于 node 技术来展开的，那么在 nodde 中，是如何实现模块化的呢？

## CommonJS

## 参考

- [node 源码](https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/loader.js)
- [require() 源码解读](http://www.ruanyifeng.com/blog/2015/05/require.html)