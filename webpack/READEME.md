# webpack实践
webpack是一个前端模组化构建工具，它可以帮助我们实现前端项目的工程化开发，相信我，工程化真的很重要。目前的版本为4.17.1，关于webpack4的一些特性大家可以看[这里](https://www.webpackjs.com/concepts/)。
## 1. 初始化项目
新建一个项目文件夹
```
mkdir webpack-start && cd webpack-start
```
执行以下命令(个人比较习惯用yarn，当然用npm也没问题)
```
yarn init -y
```
此时可以看到多出一个package.json文件，这个文件就是npm的项目配置文件
## 2. 安装webpack
```
yarn add webpack -D
```
在package.json中看到
```
{
  …
  "devDependencies": {
    "webpack": "^4.17.1"  //版本号以安装时为准
  }
}
```
## 3. 安装[webpack-cli](https://webpack.docschina.org/api/cli/)
此工具可以通过CLI或者配置文件（默认值：webpack.config.js）获取配置并传递给Webpack进行打包。
```
yarn add webpack-cli -D
```
然后再package.json中添加
```
"scripts": {
  "build": "webpack"
}
```
执行
```
npm run build
```
此时我们发现控制台出现以下错误
```
ERROR in Entry module not found: Error: Can't resolve './src' in '~\webpack-start'
```
也就是说webpack默认打包入口在'./src'文件夹下的'index.js'，这是webpack4的一个新特性。此外还有一个warning
```
WARNING in configuration
The 'mode' option has not been set, webpack will fallback to 'production' for this value. Set 'mode' option to 'development' or
 'production' to enable defaults for each environment.
You can also set it to 'none' to disable any default behavior. Learn more: https://webpack.js.org/concepts/mode/
```
大意为'mode'未设置，webpack默认会使用'production'模式，即生产模式。现在我们将build命令修改为
```
"build": "webpack --mode=production"
```
且新建src文件夹，并在文件夹内创建'index.js',内容为
```
console.log('hello webpack!')
```
此时执行'npm run build'，我们发现打包成功，切打包文件自动被放到'dist/main.js'，由于使用了生产模式，所以webpack会开启一系列额外的优化，包括minification, scope hoisting, tree-shaking等。
## 4. webpack配置文件
你当然可以直接通过命令行来运行webpack，并完全使用默认配置，但在大多数场景我们仍需要进行一些个性化配置，这时将这些设置直接卸载命令行中就显得不合时宜了，这时我们可以通过编写webpack.config.js，来规范化我们的webpack配置，这也是目前最主流的做法。

在根目录下创建config文件夹，之后新建webpack.dev.js和webpack.prod.js分别作为开发环境和生产环境下的配置文件。我们主要以开发环境的配置为主，生产环境的配置其实大同小异。将webpack.dev.js修改为
```
const path = require("path")
module.exports = {
    mode:'development',
    // 入口文件地址
    entry:{
        //将src/index.js设置为入口文件，main可任意设置，这里设为文件名相同
        main:'./src/index.js'
    },
    // 出口文件配置
    output:{
        // 最终打包路径
        path:path.resolve(__dirname,'../dist'),
        // 打包文件的名称,name为入口文件的名称
        filename:'[name].js'
    }
}
```
build命令修改为
```
"build": "webpack --config=config/webpack.config.js"
```
我们可以看到dist文件下出现了我们打包后的main.js文件。

## 5. 使用HtmlWebpackPlugin
我们在dist下新建一个index.html文件，内容为
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    <div id="root"></div>
    <script src="./main.js" type="text/javascript" />
</body>
</html>
```
将html在浏览器中打开即可。

我们之前通过手写html文件，并将打包后的main.js引入，但是如果出现类似打包文件名称发生变更的情况，就需要重新更改引入项，有没有什么方法能自动生成html文件，并自动引入依赖文件呢？答案就是html-webpack-plugin。
安装html-webpack-plugin：
```
yarn add html-webpack-plugin -D
```
在public文件夹下新建index.html作为模板文件，内容为：
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    <div id="root"></div>
</body>
</html>
```
放入favicon.ico文件，webpack.config.js加入html-webpack-plugin插件
```
const path = require("path")
//自动生成html文件并注入script标签引用
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
    mode:'development',
    // 入口文件地址
    entry:{
        //将src/index.js设置为入口文件，main可任意设置，这里设为文件名相同
        main:'./src/index.js'
    },
    // 出口文件配置
    output:{
        // 最终打包路径
        path:path.resolve(__dirname,'../dist'),
        // 打包文件的名称,name为入口文件的名称
        filename:'[name].js'
    },
    //插件，类似于中间件，可在打包过程中进行功能扩展
    plugins:[
        new HtmlWebpackPlugin({
            //生成html文件的标题
            title:"webpack",
            //html文件的文件名，默认是index.html
            filename:"index.html",
            //生成文件依赖的模板，支持加载器(如handlebars、ejs、undersore、html等)
            template: './public/index.html',
            // script标签插入位置
            // true 默认值，script标签位于html文件的 body 底部
            // body script标签位于html文件的 body 底部
            // head script标签位于html文件的 head中
            // false 不插入生成的js文件，这个几乎不会用到的
            inject:true,
            //将给定的图标加入到输出的html文件
            favicon:'./public/favicon.ico'
        })
    ],
}
```
打包后的dist/index.html为
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
<link rel="shortcut icon" href="favicon.ico"></head>
<body>
    <div id="root"></div>
<script type="text/javascript" src="main.js"></script></body>
</html>
```
我们可以看到JS和icon文件自动被引入进来
## 6. 使用webpack-dev-server
之前的操作可以让我们顺利的用webpack打包项目文件，但是在开发过程中每次打包后才能看到最终效果无疑会造成严重的效率损失，那么有什么方法能让我们实时的看到代码更改所产生的效果呢？答案就是[webpack-dev-server](https://webpack.js.org/configuration/dev-server/)

首先进行安装，执行
```
yarn add webpack-dev-server -D
```
在webpack.config.js中加入
```
// webpack开发服务器
    devServer:{
        //设置开发服务起的目标地址
        contentBase:path.resolve(__dirname,'../dist'),
        //服务器访问地址
        host:'localhost',
        //服务器端口
        port:8088,
        //是否启用服务器压缩
        compress:true
    }
```
在package.json的script下增加
```
"start": "webpack-dev-server --config=config/webpack.config.js",
```
执行
```
npm start
```
这时我们就能在8088端口下实时调试我们的代码了



