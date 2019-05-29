<!-- TOC -->

- [项目构建](#项目构建)
    - [批量增加`proposal`语法支持](#批量增加proposal语法支持)
    - [`.babelrc`失效](#babelrc失效)

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
