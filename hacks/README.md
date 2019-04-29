# 我遇到的一些坑

## 巧用concat

在ES6解构赋值大行其道的今天，`concat`的地位越发尴尬，但有时候，灵活的`concat`还是有着不可替代的作用。

**问题描述**:后台在向前端发送相应数据时都常会在只有一条数据时返回一个字典，而有多条数据时返回列表，这就不可避免的需要前端或后台对数据类型进行判断，那么如何避免这样的繁琐处理呢？有没有什么方法能够将数据统一转化为数组而不使用`if`语句呢？

**问题解答**:我们可以使用`concat`将返回的对象或数组传递进来，例如：
```js
const handledArray = [].concat(rowData)
```
此时无论我们的`rowData`是对象还是数组，最终都将统一转化为数组，这样我们就能统一进行处理了，是不是很简洁呢？:)

## 跨域问题

前端调用时存在`cors`策略，`CORS`请求默认不发送`Cookie`和`HTTP`认证信息。如果要把`Cookie`发到服务器，一方面要服务器同意，指定`Access-Control-Allow-Credentials`字段:

```
Access-Control-Allow-Credentials: true
```

另一方面，开发者必须在`AJAX`请求中打开`withCredentials`属性:

```js
var xhr = new XMLHttpRequest();
xhr.withCredentials = true;
```

否则，即使服务器同意发送`Cookie`，浏览器也不会发送。或者，服务器要求设置`Cookie`，浏览器也不会处理。

**需要注意的是，如果要发送Cookie，Access-Control-Allow-Origin就不能设为星号，必须指定明确的、与请求网页一致的域名**。

而七牛云的`server`默认将`Access-Control-Allow-Origin`设置成了通配符`*`，如果前端设置了`withCredentials=true`，那么将出现如下错误：

```js
Access to XMLHttpRequest at 'https://xxx.xx.com' from origin 'http://localhost:8080' has been blocked by CORS policy: The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'. The credentials mode of requests initiated by the XMLHttpRequest is controlled by the withCredentials attribute.
```

因此需要在`sdk`中显示的设置`withCredentials=false`，防止意外出现上述问题。

## 上传文件（Element-UI）

由于业务需要，我们需要采用手动上传的方式：

```html
<el-upload
    class="upload-demo"
    ref="upload"
    multiple
    action="http://jsonplaceholder.typicode.com/posts/"
    :on-remove="handleRemove"
    :on-change="handleFileChange"
    :auto-upload="false">
    <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
    <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
    <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
</el-upload>
```

将数据保存在`fileList`中：

```js
data() {
    return {
        fileList: []
    };
},
``` 

每次文件发上变化时进行修改：

```js
handleFileChange(file, fileList) {
    this.fileList = fileList;
},
```

上传文件方法为：

```js
submitUpload() {
    const files = this.fileList.map(file => {
        file.path = 'test/';
        return file;
    });

    // 获取 SDK 实例
    let upload = this.getUpload();

    // 添加文件
    upload.addfiles(files);
    
    // 提交文件
    upload.submit({
        
        headers: {},
        // 取得token时添加业务参数
        gettoken: {},
        // 添加业务参数
        notifier: {},
        // 添加业务参数
        exists: {}

    },function(err, data){
        // 上传结果回调
    },function(err, process){
        // 上传进度回调
    });
},
```

这里简化了很多校验及交互逻辑，仅保留了主干部分，这里由于`sdk`需要，我们在每个`file`中添加`path`属性。点击上传之后一切正常，但是查看云存储文件管理页面发现刚上传的文件内容仅几百字节，明显出现了问题，查看请求体，发现`request payload`的值为`[object Object]`，很明显是最终的`file`文件未能被正确识别为文件对象。最终找到原因为真正上传的文件对象并非这里的`file`，而是`file.raw`，打开控制台打印`file`对象，也会发现`raw`的类型为`File`。看来似乎找到原因了，于是将代码修改为：

```js
const files = this.fileList.map(file => {
    file.raw.path = 'test/';
    return file.raw;
});
```

最终成功上传到`bucket`。平时还是要多注意细节啊～


## `iframe`子页面登陆

**问题描述：** 有两个独立的系统，现需要在其中一个系统中通过`iframe`引入另一个系统中的某一个页面，但由于两个系统都有权限验证，且彼此独立，那如何才能自动完成子页面的权限验证呢？

**方案一**：通过`cookie`访问策略，将主系统所在域名设置为引入系统的上一级域名，例如主系统域名为`def.abc.com`，则引入系统域名设置为`gh.def.abc.com`，这样引入系统就能够获取到主系统的`cookie`信息，借此实现通信。例如由主系统后台向引入系统发送登录请求，避开跨域问题，获取到临时`token`，并设置到`cookie`中，则可以避开引入系统的权限验证。

**方案二**：通过`iframe`的`src`属性，在其`url`链接后加入`hash`，此时需要修改引入系统的前端代码，可以用定时器等方法监测`url`的`hash`值变化，作出相应的鉴权处理。

## 七牛云上传中文文件编码问题

在使用七牛云进行分片上传时，当所有`chunk`上传完成时，需要调用`mkfile`接口将多个`chunk`合并成完整的文件，此时需要对参数进行编码，我这里使用了`crypto-js`类库，核心代码如下：

```js
let key = cryptoBase64.stringify( cryptoUtf8.parse(file.key) );
let host = [ file.host, 'mkfile', file.size, 'key', key, 'fname', key].join('/');
```

其中，`host`即为最终的`url`，由于测试时使用的时数字和字母命名的文件，所以完全没问题，但是在线上测试时，传入含中文文件名的大文件(>4M)时，在`mkfile`时报出`400`错误，`msg`为`unvalid key`，可见我们的编码规则出了问题，经排查，七牛云的`mkfile`接口需使用`base64 urlsafe`编码，
> Base64是将二进制转码成可见字符,从而方便我们在进行http请求时进行传输，但是Base64转码时会生成“+”，“/”符号,这些是被URL进行转码的特殊字符，这样就会导致两方面数据不一致,导致我们发送数据请求时,无法跟后台接口正确对接。
因此我需要在发送前将“+”，“/”替换成URL不会转码的字符，接收到数据后，再将这些字符替换回去，再进行解码。

修改后代码如下:

```js
let key = cryptoBase64.stringify( cryptoUtf8.parse(file.key) ).replace(/\+/g, '-').replace(/\//, '_');
let host = [ file.host, 'mkfile', file.size, 'key', key, 'fname', key].join('/');
```

我们将`+`和`/`替换为`-`和`_`，最终问题得解！

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
