# 校验`JSON`字符串

在完成表单校验时遇到过一个需求，要求校验输入字符串是否为`JSON`字符串，一开始想的很复杂，使用`stack`，使用正则等等，后来发现**THE EASIER THE BETTER**这句话真是真理，尤其对于程序来说。我们都用过`JSON.parse()`方法来对`json`字符串进行反编译，若传入的字符串为非法`json`串，则程序会报错。那如何将这一特性用于`json`校验呢？而校验函数的逻辑是：若输入值是`json`串，则返回`true`，反之则为`false`。那么，实际上我们只需要通过`try...catch...`捕捉到错误，并返回`false`，若正常则返回`true`。

代码如下：

```js
function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
```

是不是很简洁呢？

