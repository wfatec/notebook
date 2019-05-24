# npm 相关

## 私有仓库的包管理

在日常开发中我们总会使用公司内部搭建的私有仓库来发布一些的`sdk`或工具方法，具体如何发布这里不做讨论，大体而言和在`npm`网站上发布的流程类似。那么发布之后我们如何在实际项目中使用呢？

要知道我们大部分的依赖项都是在`npm`上，全局配置`registry`显然不合适，那么我们如何将内部依赖指定到我们的私有仓库呢？

**方案一：配置`scope`** 
在根目录下新建`.npmrc`文件，内容为：
```
# 指定 scope 才走私服
@myscope:registry=http://localhost:8888/
```

修改私有模块的`package.json`，加上`scope`:
```
{
  "name": "@myscope/private-package",
  "version": "1.0.0",
  "description": "private",
  "main": "index.js",
  ...
}
```
此时执行命令行：
```
npm install @myscope/private-package
``` 
会默认从私有仓库进行下载。

**方案二：--registry**
虽然方案一是私有包管理的比较好的方式，但是需要我们为包名称加上`scope`，如果这个出于因各种原因不能随意修改包名称，那么此时可以在安装时加上`--registry`：

```
npm install private-package --registry=http://localhost:8888
```
缺点是每次安装需要输入额外命令。