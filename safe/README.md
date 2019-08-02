<!-- TOC -->

- [安全相关](#安全相关)
    - [跨站脚本攻击（XSS）](#跨站脚本攻击xss)
        - [DOM 型 XSS](#dom-型-xss)
        - [解决方案](#解决方案)
    - [参考](#参考)

<!-- /TOC -->

# 安全相关

## 跨站脚本攻击（XSS）

关于 XSS 的概念这里就不再多说了，可自行查找相关概念，这里主要总结一些防止 XSS 攻击的策略。

### DOM 型 XSS

早期的前端开发人员在写代码时通常会用到 `element.innerHTML()` 方法，实际上这个方法是存在很大漏洞的,来看下面一个例子：

```js
var element = document.getElementById("root");
element.innerHTML = '<script>alert("XSS Attack");</script>';
```

看到这里似乎完成了一个简单的 XSS 攻击。执行一下，发现什么都没有发生 😂。事实上，内建的安全机制已经将传入的 DOM 进行了解析并执行。这里我查阅了一下[文档](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/innerHTML)，里面有这样一段话：

> HTML 5 中指定不执行由 innerHTML 插入的 `<script>` 标签。然而，有很多不依赖 `<script>` 标签去执行 JavaScript 的方式。所以当你使用 innerHTML 去设置你无法控制的字符串时，这仍然是一个安全问题。例如：

```js
var element = document.getElementById("root");
element.innerHTML = "<img src=x onerror=\"alert('XSS Attack')\">";
```

此时，我们注入的脚本还是被执行了。

### 解决方案

1. 使用 `textContent`

```js
element.textContent = "<img src=x onerror=\"alert('XSS Attack')\">";
```

此时，我们会将 `<img src=x onerror="alert(\'XSS Attack\')">` 以字符串的形式来存取，因而可以避免执行脚本.

2. 对待传入 DOM 的内容进行净化

虽然 `textContent` 能解决一部分问题，但是并不能解决所有问题，当我们需要添加额外的标记时，还是需要使用 `innerHTML` 的。例如：

```js
element.innerHTML = "<h1>" + yourString + "</h1>";
```

这个时候，我们只能选择对 `yourString` 进行净化：

```js
var sanitizeHTML = function(str) {
  var temp = document.createElement("div");
  temp.textContent = str;
  return temp.innerHTML;
};
```

通过创建一个临时的 `div` 并通过 `textContent` 存入内容，从而将特殊字符进行转译，然后再通过 `innerHTML` 返回这些转译过的内容，这是因为 `innerHTML` 可以阻止转译后的字符被转换回未转译的状态。

```js
var div = document.getElementById("root");
div.innerHTML =
  "<h1>" +
  sanitizeHTML("<img src=x onerror=\"alert('XSS Attack')\">") +
  "</h1>";
```

这是一种更为通用的做法。

## 参考

[Preventing cross-site scripting attacks when using innerHTML in vanilla JavaScript](https://gomakethings.com/preventing-cross-site-scripting-attacks-when-using-innerhtml-in-vanilla-javascript/)