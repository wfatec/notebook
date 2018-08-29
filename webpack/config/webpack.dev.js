const path = require("path")
//自动生成html文件并注入script标签引用
const HtmlWebpackPlugin = require('html-webpack-plugin')
//将css抽离成单独的文件
const ExtractTextPlugin = require('extract-text-webpack-plugin');
module.exports = {
    mode:'development',
    // 入口文件地址
    entry:{
        //为项目添加垫片
        polyfill:'babel-polyfill',
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
    /**
     * 此选项控制是否生成，以及如何生成 source map
     * -----------------------------------------------------
     * @param {string}      'source-map'      原始源代码
     * @param {string}      ''                打包后的代码
     */
    devtool:'',
    //模块，用于对不同文件进行匹配和处理
    module:{
        rules: [
            {
                //匹配js或jsx类型文件
                test:/\.(js|jsx)$/,
                //使用babel-loader进行转义
                use:['babel-loader'],
                //设置目标文件
                include:path.resolve(__dirname,'../src'),
                //设置排除文件
                exclude:path.resolve(__dirname,'../node_modules')
            },{
                //匹配less文件
                test:/\.less$/,
                // #extract,从一个已存在的 loader 中，创建一个提取(extract) loader
                use:ExtractTextPlugin.extract({
                    //
                    fallback:"style-loader",
                    use:[
                        //生成一个内容为最终解析完的css代码的style标签，放到head标签里
                        // 'style-loader',
                        //解析css模块引入
                        'css-loader',
                        //可以对css进行样式补全等操作
                        'postcss-loader',
                        //将less解析为css
                        'less-loader'
                    ]
                })
            }
        ]
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
        }),
        //将css单独打包
        new ExtractTextPlugin({
            //生成文件的文件名。可能包含 [name], [id] and [contenthash]
            //[contenthash]在webpack4.3以上需要改成[hash],原因是与在webpack4存在命名冲突
            filename: 'css/[name].[hash].css',
            // filename:  (getPath) => {
            //     return getPath('css/[name].css').replace('css/js', 'css');
            // },
            //从所有额外的 chunk提取,当使用 CommonsChunkPlugin 
            //并且在公共 chunk 中有提取的 chunk（来自ExtractTextPlugin.extract）时，
            //allChunks **必须设置为 true
            allChunks:true
        })
    ],
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

}