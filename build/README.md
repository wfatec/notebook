<!-- TOC -->

- [项目构建](#项目构建)
    - [批量增加`proposal`语法支持](#批量增加proposal语法支持)
    - [`.babelrc`失效](#babelrc失效)
    - [webpack 配置别名](#webpack-配置别名)
    - [关于`import`和`export`的技巧](#关于import和export的技巧)
        - [`default`的使用](#default的使用)
        - [`import`中的解构赋值](#import中的解构赋值)
        - [`export`导出解构对象](#export导出解构对象)
        - [从类库直接`export`指定方法](#从类库直接export指定方法)
    - [自动引入 react](#自动引入-react)

<!-- /TOC -->

# 项目构建

## 批量增加`proposal`语法支持

在某次新项目构建中需要增加对`spread`语法的支持，由于`babel 7.0`版本废弃了对`stage-x`的支持，因此我们无法直接通过`@babel/preset-stage-0`来直接配置`proposal`语法支持，但官方依然可以让我们通过手动增加相应的`plugin`来进行适配。例如这里的`spread`语法，就可以通过`@babel/plugin-proposal-object-rest-spread`来进行支持，具体安装可以见[官方文档](https://babeljs.io/docs/en/babel-plugin-proposal-object-rest-spread)。

这里需要指出的是，官方给出了一个好用的工具---[babel-upgrade](https://github.com/babel/babel-upgrade)，来帮助我们批量的增加`proposl`语法的支持，免去了手动一次导入的繁琐，其本意是为了让之前已经使用了`stage-x`的用户能够快速迁移到新版本的`babel`中来。具体用法如下：

```
# npx lets you run babel-upgrade without installing it locally
npx babel-upgrade --write

# or install globally and run
npm install babel-upgrade -g
babel-upgrade --write
```

当然，在使用之前，记得在`devDependencies`中先加入`@babel/preset-stage-0`，这样所有`stage-0`以上的语法相关的插件都会被批量安装进来，效果如下：

```json
"devDependencies": {
    "@babel/core": "^7.0.0",
    "@babel/plugin-proposal-class-properties": "^7.0.0",
    "@babel/plugin-proposal-decorators": "^7.0.0",
    "@babel/plugin-proposal-do-expressions": "^7.0.0",
    "@babel/plugin-proposal-export-default-from": "^7.0.0",
    "@babel/plugin-proposal-export-namespace-from": "^7.0.0",
    "@babel/plugin-proposal-function-bind": "^7.0.0",
    "@babel/plugin-proposal-function-sent": "^7.0.0",
    "@babel/plugin-proposal-json-strings": "^7.0.0",
    "@babel/plugin-proposal-logical-assignment-operators": "^7.0.0",
    "@babel/plugin-proposal-nullish-coalescing-operator": "^7.0.0",
    "@babel/plugin-proposal-numeric-separator": "^7.0.0",
    "@babel/plugin-proposal-object-rest-spread": "^7.4.4",
    "@babel/plugin-proposal-optional-chaining": "^7.0.0",
    "@babel/plugin-proposal-pipeline-operator": "^7.0.0",
    "@babel/plugin-proposal-throw-expressions": "^7.0.0",
    "@babel/plugin-syntax-dynamic-import": "^7.0.0",
    "@babel/plugin-syntax-import-meta": "^7.0.0",
  },
```

大功告成！接下来只需要将合适的`plugin`在`.babelrc`中进行配置 即可，例如支持`spread`语法：

```json
"plugins":[
    // 支持`spread`语法
    "@babel/plugin-proposal-object-rest-spread"
]
```

## `.babelrc`失效

有时候子配置时，忽然发现`.babelrc`中新增的配置项不起作用，当时是想加入`@babel/plugin-proposal-object-rest-spread`，但执行代码发现始终未能生效，最终找到一个解决办法，新建一个`babel.config.js`文件，将`.babelrc`中的内容原样复制过来，并通过`module.export`到处，例如：

```js
module.exports={
    "presets": [
        //es6运行环境
        "@babel/preset-env",
        //react运行环境
        "@babel/preset-react"
    ],
    "plugins":[
        //运行时编译es6，入口文件引用作为辅助和内建，
        //1.自动添加垫片到你的当前代码模块而非全局，以避免编译输出的重复问题
        //2.为你的代码创建一个沙盒环境，将内置插件起了别名 core-js，这样就可以无缝的使用它们，并且无需使用 polyfill
        "@babel/plugin-transform-runtime",
        //支持 spread 语法
        "@babel/plugin-proposal-object-rest-spread"
    ]
}
```

而此前的`.babelrc`可以`let it go`，不管它，再次执行代码，神奇的成功了。。。

之后又查询了相关资料，始终没有一个明确的说法，只能暂且归咎于`babel`的一个`bug`了==！

## webpack 配置别名

有时候我们的项目文件会出现嵌套较深的情况，这时层级较低的文件内部访问其它高层级文件价内部文件内容时，就会出现`../../../../utils`这样的可怕情况，这时我们就可以通过设置别名来实现文件的快速访问。具体做法是，在`webpack.config`文件中的`resolve`属性下配置`alias`：

```js
 alias: {
    "@src":path.resolve("src"),
    "@component":path.resolve("src/component"),
    "@routes":path.resolve("src/routes"),
    "@utils":path.resolve("src/utils"),
},
```

现在，就能通过`@src`指向根目录下的`src`文件夹了，用法：

```js
import HomePage from '@src/routes/HomePage'
// or
import HomePage from '@routes/HomePage'
```

是不是很方便呢？

## 关于`import`和`export`的技巧

### `default`的使用

我们都知道，如果一个类库在`export`时提供了`default`，即：
```js
export default xxlib`
```
那么我们就能够直接使用
```js
import xxlib from "xxlib"
```
这样的方式，而如果直接
```js
export {method}`或`export const method = xxx
```
则引入方式只能是
```js
import {method} from "xxlib"
```
而如果想将`xxlib`中所有的方法引入到一个变量中，则可以使用：
```js
import * as xxlib from "xxlib"
```
这时，`export default xxx`导出的方法，则会包含在`xxlib`的`default`字段下。

### `import`中的解构赋值

假设又一个文件`studnt.js`:
```js
// student.js
export default {
    name: "bili",
    age: 16
}
```

我们想在`score.js`中引入：

```js
// score.js
import student from "./student"

const {name} = student;
console.log(name);
```

这是完全ok的，但是当我们尝试在`import`时使用解构赋值，则会出现问题：

```js
// score.js
import {name} from "./student"

console.log(name);
```

此时的`name`值是`undefined`，这是为什么呢？

原来，`import`中的解构与一般意义上的解构并不完全一致，我们的代码在经过`babel`转译之后会发生变化：

```js
export default {
    name: "bili",
    age: 16
}
```

事实上会变成：

```js
module.exports.default = {
    name: "bili",
    age: 16
}
```

也就是说，我们在`import`时，实际拿到的是：

```js
{
    default: {
        name: "bili",
        age: 16
    }
}
```

这下我们就能明白为什么我们的解构赋值会不生效了。同时需要注意，我们在`import student from "student"`时，程序实际上会去自动获取`student.js`的`default`下的值，舅舅是为什么能够直接获取`student`的原因。

根据以上原理，我们如何才能实现`import`的解构赋值呢？其实很简单，只要我们能够将`default`下的值直接复制到`module.exports`下不就可以了吗？即实现以下操作：

```js
module.exports = exports['default'];
```

当然这个过程已经有相应的插件[babel-plugin-add-module-exports](https://github.com/59naga/babel-plugin-add-module-exports#readme)帮我们实现了，具体用法看文档即可，安装之后我们就能愉快的使用`import`的解构语法了：

```js
import {name} from "./student"
```

### `export`导出解构对象

有时候我们需要批量导出已知类库的方法，这个时候我们使用`export {module1, module2, ...}`这样的方法就会显得非常繁琐，那么我们可不可以直接使用对象解构批量导出呢？类似这样：

```js
import xxxlib from "xxxlib"

export {...xxxlib}
```

很遗憾，答案是不可以。因为`export {module1, module2}`中的`{module11, module2, ...}`实际上**并不是一个对象，而是一个`exports`列表！**。明白了吧，所以在这里使用解构是不成立的。

而`export default {...xxxlib}`确是可以生效的，但缺点也很明显，无法在`import`时直接使用解构赋值获取，原因上面已经做过解释。

最后一种方案，我们如果直接使用`module.exports`，则可以实现类似的解构效果。

```js
module.exports = {...xxxlib}
```

但是需要注意的是，新版本的`babel`不支持`import`和`module.exports`的混合使用(但是`require`和`export`的混用是支持的)。这意味着我们在使用`module.exports`时，只能够使用`require`来导入依赖文件了。

综上，目前还没有一个较为优雅的处理方式，期待以后能有更好的方案吧！



### 从类库直接`export`指定方法

有时候我们可能需要从某个包中直接导出某些方法，这时我们可以直接：
```js
export {method1, method2} from "xxxlib"
```
这时`method1`和`method2`将会同其它导出项一起`export`出去，非常简洁。

## 自动引入 react

1. 使用[babel-plugin-react-require](https://github.com/vslinko/babel-plugin-react-require)

通过 `babel-plugin-react-require` 来实现`react`的自动导入，实际上该插件的功能非常简单，就是在转译时，在文件头插入`import React from 'react';`。同时需要注意的是，该插件**只对未继承`React.Component`的无状态函数式组件生效**，因此对于其它`react`函数，则仍需手动引入`react`!

2. 使用 webpack 自带的 ProvidePlugin

ProvidePlugin 可以让我们无需引入的情况下，以全局的模式直接使用模块变量。因此我们可以在插件中使用：

```js
new webpack.ProvidePlugin({
    'React': 'react'
})
```

这样，我们就能够在不手动引入 react 的情况下直接使用了。