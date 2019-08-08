<!-- TOC -->

- [NodeJS 的模块化实现](#nodejs-的模块化实现)
    - [CommonJS](#commonjs)
    - [参考](#参考)

<!-- /TOC -->

# NodeJS 的模块化实现

前端模块化已经是我们前端工程化浪潮中不可或缺的一部分了，应该说，如果没有前端模块化，前端工程化也就无从说起。而目前绝大多数的工程化方案实际上都是依托于 node 技术来展开的，那么在 NodeJS 中，是如何实现模块化的呢？

## CommonJS

CommonJS 规范是 node 原生支持的模块化方案，因此，理解 NodeJS 是如何实现 CommonJS 的也就是了解 NodeJS 模块化的关键，那么什么是 CommonJS 规范呢？

CommonJS 是一种规范，提供一些 API 来实现代码的模块化，具有如下特点：

- 所有代码都运行在模块作用域，不会污染全局作用域。

- 模块可以多次加载，但是只会在第一次加载时运行一次，然后运行结果就被缓存了，以后再加载，就直接读取缓存结果。要想让模块再次运行，必须清除缓存。

- 模块加载的顺序，按照其在代码中出现的顺序。

## 参考

- [node 源码](https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/loader.js)
- [require() 源码解读](http://www.ruanyifeng.com/blog/2015/05/require.html)
- [CommonJS规范](http://javascript.ruanyifeng.com/nodejs/module.html)