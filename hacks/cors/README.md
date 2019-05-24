# 跨域问题

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