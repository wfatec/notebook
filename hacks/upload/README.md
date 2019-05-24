<!-- TOC -->

- [上传文件](#上传文件)
    - [Element-UI 上传文件](#element-ui-上传文件)
    - [七牛云上传中文文件编码问题](#七牛云上传中文文件编码问题)

<!-- /TOC -->

# 上传文件

## Element-UI 上传文件

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