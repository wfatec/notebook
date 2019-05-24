<!-- TOC -->

- [转译相关](#转译相关)
    - [转译`ES6+`类库](#转译es6类库)

<!-- /TOC -->

# 转译相关

## 转译`ES6+`类库

我们在进行日常的前端开发时可能会借助`create-react-app`,`vue-cli`或是`webpack`之类的构建工具，这些工具将我们从繁杂的环境配置中解放出来，从而将精力集中到业务逻辑的开发上来。但是，如果你需要开发一个`sdk`，那么使用这些构建工具就显得有些笨重了。更好的方式是直接使用`babel`命令行进行`release`。

要想能够将`ES6+`转译成`ES5`或以下，我们需要依赖以下几个插件：`@babel/cli`, `@babel/core`, `@babel/node`, `@babel/preset-env`。在
我们在进行日常的前端开发时可能会借助`create-react-app`,`vue-cli`或是`webpack`之类的构建工具，这些工具将我们从繁杂的环境配置中解放出来，从而将精力集中到业务逻辑的开发上来。但是，如果你需要开发一个`sdk`，那么使用这些构建工具就显得有些笨重了。更好的方式是直接使用`babel`命令行进行`release`。要想能够将`ES6+`转译成`ES5`或以下，我们需要依赖以下几个插件：`@babel/cli`, `@babel/core`, `@babel/node`, `@babel/preset-env`。

首先执行：
```
yarn add --dev @babel/cli @babel/core
```
其`@babel/cli`和`@babel/core`通常成对安装，用于在命令行引入`babel`。安装后就可以执行一些简单的`babel`命令了。例如在`scripts`下增加：
```
"release": "babel ./src/ -d ./lib"
```
这时，执行`npm run release`将会在同级目录的`lib`文件夹下生成转译之后的文件。

**但是**，这里仅限于较为早期版本的语法，如果`src`下的文件使用了最新的一些特性，那么在转译时将输出语法错误，这时轮到`@babel/preset-env`登场了！
```
yarn add --dev @babel/preset-env
```
同时，在根目录下新增`.babelrc`文件，并输入:
```json
{
    "presets": [ "@babel/preset-env" ]
}
```
这时，我们的新特性语法也能顺利执行啦！

到这里就剩下发布了，由于我们要发布的是`lib`下的文件，因此需要对`package.json`下的入口文件进行修改：
```
"main": "lib/index.js",
```
之后只需要执行`npm`的发布流程即可完成了。

**最后**，在进行本地开发和测试时，我们可以使用`@babel/node`进行实时编译：
```
yarn add --dev @babel/node
```
新增`scripts`命令：
```
"dev": "babel-node app.js",
```
这时我们就能做到在`node`环境下使用各种炫酷的新特性了，如果想体验热更新效果，可以安装`nodemon`,
```
yarn add --dev nodemon
```
此时，修改`scripts`命令：
```
"dev": "nodemon --exec babel-node app.js"
```
大功告成！