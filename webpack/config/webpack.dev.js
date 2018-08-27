const path = require("path")
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
    mode:'development',
    // 入口文件地址
    entry:{
        //将src/main.js设置为入口文件，main可任意设置，这里设为文件名相同
        main:'./src/main.js'
    },
    // 出口文件配置
    output:{
        // 最终打包路径
        path:path.resolve(__dirname,'../dist'),
        // 打包文件的名称,name为入口文件的名称
        filename:'[name].js'
    },
    //模块，用于对不同文件进行匹配和处理
    module:{},
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
            inject:true
        })
    ],
    // webpack开发服务器
    devServer:{
        //设置开发服务起的目标地址
        contentBase:path.resolve(__dirname,'../dist'),
        //服务器访问地址
        host:'localhost',
        //服务器端口
        port:8080,
        //是否启用服务器压缩
        compress:true
    }

}