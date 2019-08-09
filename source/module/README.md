<!-- TOC -->

- [NodeJS 的模块化实现](#nodejs-的模块化实现)
    - [CommonJS](#commonjs)
        - [require](#require)
        - [Module Context](#module-context)
        - [Module Identifiers](#module-identifiers)
    - [NodeJS 中的 CommonJS](#nodejs-中的-commonjs)
        - [什么是 module？](#什么是-module)
        - [源码实现](#源码实现)
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

关于 CommonJS 的具体规则着实费了一番功夫去寻找，最后在[维基百科](http://wiki.commonjs.org/wiki/Modules/1.1.1)上找到了一个相对权威的定义，接下来我们将以此为依据对 CommonJS 规范进行简述。

### require

require 是一个函数，包含如下功能：

1. 接收一个 module 标识(identifier)

2. 返回引入 module 的输出(exported) API

3. 如果遇到循环引用，此时 require 返回的对象必须包含引入 module 中 exports 对象的**未完成的副本**，加载完成后将 exports 对象返回并继续执行另一个 require。

> NodeJS 官网的解释：当 main.js 加载 a.js 时， a.js 又加载 b.js。 此时， b.js 会尝试去加载 a.js。 为了防止无限的循环，会返回一个 a.js 的 exports 对象的 未完成的副本 给 b.js 模块。 然后 b.js 完成加载，并将 exports 对象提供给 a.js 模块。

大家可以参考[官网的例子](https://nodejs.org/dist/latest-v10.x/docs/api/modules.html#modules_cycles)，自己跑一下就明白了。

4. 如果引入的 module 无法返回，则跑出错误

5. require 函数有一个 main 属性

6. require 函数有一个 path 属性，该属性是一个具有优先级的字符串数组，优先级从高到低排列，用于存放模块的可能路径

### Module Context

1. 在一个 module 中存在一个 require 变量，遵从上面的规范

2. 在一个 module 中存在变量 exports， 在需要向外暴露API时，在 exports 的对象上添加属性。

3. 在一个 module 中必须要有一个 Object 变量 module

### Module Identifiers

module identifier 定义了 require 函数的所能接收的参数规则

1. 每一项必须是用斜杠分隔的字符串

2. 每一项必须是驼峰命名方式，"."，或者是 ".."

3. 可以没有 ".js" 后缀

4. 可以是相对路径或者绝对路径

以上就是 Modules 规范的全部内容，大家可以以此为参照，看看 node 的 module 模块是否实现了这些规范。

## NodeJS 中的 CommonJS

### 什么是 module？

作为一个前端工程师，`require` 和 `module.exports` 这对好基友我们一定不会陌生，实际上它们都来自于 `Module` 函数，这个稍后会将，本节先来感性的认识一下**什么是 module？**

首先新建 `a.js`，输入内容：

```js
console.log(module);
```

只有一个简单的控制台输出逻辑，执行 `node a.js` 让我们看看这里的 `module` 到底是个什么

### 源码实现

为了搞清楚 NodeJS 的 CommonJS  实现，我们需要深入[源码](https://github.com/nodejs/node)进行分析。

NodeJS 的各模块源码主要在 [lib](https://github.com/nodejs/node/tree/master/lib) 文件夹下，本文所关注的 `module` 模块就保存在 `module.js` 中，具体内容为：

```js
'use strict';

module.exports = require('internal/modules/cjs/loader').Module;
```

继续打开 `internal/modules/cjs/loader.js`，其中的 [Module](https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/loader.js#L104-L113) 即为真正的输出内容：

```js
function Module(id = '', parent) {
  this.id = id;
  this.path = path.dirname(id);
  this.exports = {};
  this.parent = parent;
  updateChildren(parent, this, false);
  this.filename = null;
  this.loaded = false;
  this.children = [];
}
```

## 参考

- [wiki/Modules/1.1.1](http://wiki.commonjs.org/wiki/Modules/1.1.1)
- [node 源码](https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/loader.js)
- [require() 源码解读](http://www.ruanyifeng.com/blog/2015/05/require.html)
- [CommonJS规范](http://javascript.ruanyifeng.com/nodejs/module.html)