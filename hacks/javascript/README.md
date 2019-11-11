<!-- TOC -->

- [JavaScript 中有趣的特性](#javascript-中有趣的特性)
    - [基本类型的包装类型](#基本类型的包装类型)
    - [JavaScript 词法](#javascript-词法)
    - [解构赋值](#解构赋值)
        - [我为什么喜欢解构赋值？](#我为什么喜欢解构赋值)
        - [解构赋值默认值生效的问题](#解构赋值默认值生效的问题)
    - [split 妙用](#split-妙用)
    - [ES5 构造函数使用的一些注意点](#es5-构造函数使用的一些注意点)
    - [纯 JS 实现文件上传](#纯-js-实现文件上传)
    - [函数参数解构特性](#函数参数解构特性)
    - [尾调用优化](#尾调用优化)
        - [尾递归优化](#尾递归优化)

<!-- /TOC -->

# JavaScript 中有趣的特性

## 基本类型的包装类型

我们都知道 JS 有基本类型和引用类型两个大类，这里我们不讨论两者的区别，我想谈的是一个关于基本类型的有趣的现象，并从这个现象来发现一些特性。

当我们想要将十进制数字转化为十六进制字符串时，我们很自然的想到了`toString()`方法：

```js
const num = 97;
console.log(num.toString(16));
```

输出结果为`61`。看起来非常理所当然，但是我们进一步思考，如果直接执行

```js
console.log(97.toString(16))
```

会发生什么呢？

答案是会打印如下错误信息：

```
Uncaught SyntaxError: Invalid or unexpected token
```

说明这是一个语法错误！那么为什么先赋值给变量 `num` 再去执行`toString()` 就可以了呢？或者说这个简单的赋值语句到底做了哪些事情呢？这里由于未能找到较为有说服力的说明，只能暂时给出自己的理解。

基本类型在赋值给变量时，编译器会根据其类型调用相应的内置构造器，来实现变量的存储，但是此时的构造器与我们常用的函数构造器又有很大的区别，首先这个内置构造器生成的值是保存在栈中而非堆中，且基本类型的赋值过程中每次都会创建新的地址空间来存放新的赋值变量。这样设计是有原因的，因为基本类型往往比较小，因此这样的复制操作并不会占用太多资源空间。此外基本类型往往更改频繁，如果像引用类型一样需要通过引用地址在堆中进行查找(堆的存取速度大大慢于栈)，执行效率上会存在问题。

所以我们基于此大概知道了，虽然基本类型的赋值与引用类型不尽相同，但是其底层一定也有类似引用类型一样的构造器，从而实现基本类型的一些内置方法。而 `js` 也提供了基本类型的构造器函数供开发者调用。

```js
console.log(Number(97).toString(16));
```

此时方能输出正确的结果。而这个时候`Number(97)`实际上就做了类似变量赋值的处理。

```js
typeof Number(97) === "number";
```

而如果使用`new`来创建：

```js
console.log(new Number(97).toString(16));
```

结果仍是正确的，但此时：

```js
typeof new Number(97) === "object";
```

可见，`new`方法会将基本类型的值转化为引用类型，而同时其内置方法也会继承过来。

## JavaScript 词法

最近通过学习，了解到了 JS 的词法相关知识，从而解除了上一小节的一个疑惑，发现其中自己的理解是有很大问题的，那就是`97.toString()`为什么会报错？

实际上这就涉及到了数字直接量(NumericLiteral)这个概念，在 JavaScript 中数字直接量有以下四种：

- 二进制数
- 八进制数
- 十进制数
- 十六进制数

而十进制数有一个特殊的用法，那就是可以带小数：

```js
10.3;
0.3;
10;
```

这几种写法都是可以的，联想此前的`97.toString()`我们就能发现，当词法分析器分析到`97.`的时候，默认会将`.`看作是一个小数点，因此当发现小数点后面的字符不是`Number`时，就会抛出以下错误：

```
Uncaught SyntaxError: Invalid or unexpected token
```

因此，为了让`.`符号被识别为一个独立的 `token` 而不是小数点，我们可以用空格或增加一个`.`等方式实现：

```js
(97).toString();
(97).toString();
```

这两种方式都能够将`.`与之前的数字字符进行隔离，从而被词法分析器识别为单独的 `token`。

## 解构赋值

### 我为什么喜欢解构赋值？

在拿到一个对象或数组时，我通常习惯用解构的方式来进行赋值：

```js
const { aa, bb, cc } = obj || {};
const [dd, ee, ff] = arr || [];
```

这样做有以下几个好处:

1. 代码整体较为简洁，逻辑清晰

2. 容错性较好，无需加入一些难看的容错判断

3. 可以进行批量赋值

如果不实用结构赋值的方式，上面的两行代码可能会是这样：

```js
const aa = obj && obj.aa;
const bb = obj && obj.bb;
const cc = obj && obj.cc;
const dd = isArray(arr) && arr[0];
const ee = isArray(arr) && arr[1];
const ff = isArray(arr) && arr[2];
```

这么一对比，是不是更为明显了呢？

### 解构赋值默认值生效的问题

在实际使用过程中，尤其是被解构的对象和数组是通过异步请求的方式从后端获取的，我们无法确定返回值是否符合需求，这个时候就需要我们设置解构赋值的默认值，类似这样：

```js
const { aa = 1 } = obj || {};
const [bb = 1] = arr || [];
```

这样，当 obj 中没有字段 `aa` 或 `aa` 字段值为 `undefined` 时， `aa` 将使用默认值 1。

注意：**当 obj 中 `aa` 字段为 `null`, `''`, `false` 或 `0` 时，默认值不会生效**，例如：

```js
const { aa = 1 } = {}; // 1
const { aa = 1 } = { aa: undefined }; // 1
const { aa = 1 } = { aa: null }; // null
const { aa = 1 } = { aa: "" }; // ''
const { aa = 1 } = { aa: false }; // false
const { aa = 1 } = { aa: 0 }; // 0
```

数组的情况与之类似，我此前就犯了个错，误认为

```js
const { aa = 1 } = { aa: null };
```

时，`aa` 值会使用默认值 1，造成了 bug，希望大家不要再犯同样的错～

## split 妙用

最近研究 material-ui 源码时，遇到一个有趣的问题：material-ui 的文档是通过解析 markdown 文件动态生成的，markdown 文件内容大概是这样：

```md
## Contained Buttons（实心按钮）

[实心按钮](https://material.io/design/components/buttons.html#contained-button)表示高度的强调, 根据他们的立体效果和填充颜色来区分彼此。 它们用于触发应用程序所具有的主要功能。

以下演示的最后一个例子演示了如何使用上传按钮。

{{"demo": "pages/components/buttons/ContainedButtons.js"}}

## Text Buttons（文本按钮）

[文本按钮](https://material.io/design/components/buttons.html#text-button)通常用于不太醒目的操作, 包括那些位于:

- 对话框中
- 卡片中

在卡片中，使用文本按钮有助于保持卡片内容的醒目程度。

{{"demo": "pages/components/buttons/TextButtons.js"}}

## Outlined Buttons（描边按钮）
```

在解析过程中，会通过 `parseMarkdown.js` 的 `getContent()` 方法将 markdown 字符串分割成数组：

```js
export function getContents(markdown) {
  return markdown
    .replace(headerRegExp, "") // Remove header information
    .split(/^{{("demo":[^}]*)}}$/gm) // Split markdown into an array, separating demos
    .filter(content => !emptyRegExp.test(content)); // Remove empty lines
}
```

注意这里的 **“.split(/^{{("demo":[^}]*)}}\$/gm)”** 这里会以 `{{"demo": "pages/components/buttons/TextButtons.js"}}` 为分割符进行分割，并且会在结果中保留分割符，为什么会这样的？实际上就是正则表达式中的 `()` 在起作用，他会保留括号中的部分，我们测试一下：

```js
let str = "aaa,bbb,ccc";
console.log(str.split(/(,)/));
console.log(str.split(/,/));
```

结果为：

```
["aaa", ",", "bbb", ",", "ccc"]
["aaa", "bbb", "ccc"]
```

符合预期。

## ES5 构造函数使用的一些注意点

1. 函数作为构造函数时，只能使用声明式

```js
function MyConstructor() {}
```

而不能是变量赋值的方式：

```js
var MyConstructor = function() {};
```

## 纯 JS 实现文件上传

我们在实现文件上传时，通常的方式是通过使用 `input` 标签来实现：

```js
<input type="file" value="请选择文件" />
```

然后通过监听 `input` 标签的 `onchange` 事件来获取选中文件，并上传。

但是有时候我们可能并不希望使用 `input` 标签，例如作为 sdk 工具被引入时，我们希望仅仅引入 JS 文件就能实现需求。

思路如下：

1. 通过 JS 动态创建临时 `<input />` 节点

```js
var input = document.createElement("input");
input.type = "file";
```

2. 触发点击事件

```js
input.click();
```

此时我们成功的打开了系统的文件选择窗口

3. 监听 `onchange` 事件并获取 file 元素

```js
input.onchange = function() {
  var file = input.files[0];
  // 后续上传功能省略
};
```

实际上，我们需要纯 JS 实现图片上传时，很多时候需要直接获取 base64 格式的源文件，用以直接进行展示，因此这里额外展示一下如何将源文件转化为 base64 格式：

```js
var reader = new FileReader();
reader.readAsDataURL(file);
var size = file.size;
var tempFilePath = file.name;
reader.onloadend = function(e) {
  var tempFile = e.target.result;
  // ...
};
```

这里的 `tempFile` 就是我们需要的 base64 格式的文件。对于`<img />` 等元素，可以接通过 `src` 引入。

完整代码如下：

```js
function tempUpload() {
  var input = document.createElement("input");
  var reader = new FileReader();
  input.type = "file";
  input.click();
  input.onchange = function() {
    var file = input.files[0];
    reader.readAsDataURL(file);
    var size = file.size;
    var tempFilePath = file.name;
    reader.onloadend = function(e) {
      var tempFile = e.target.result;
      window[lazyMethodCallBack.chooseImage](
        data2ResStrWithoutData({
          tempFilePath: tempFilePath,
          tempFile: tempFile,
          size: size
        })
      );
    };
  };
}
```

## 函数参数解构特性

最近在开发中遇到了一个以前未能注意的特性，再此简单记录以作警示。

首先来看一个例子：

```js
var arr = []; 

var func = function(...arg){
	console.log(arg)
}

func(...arr, "www")
```

此时输出结果为:`[www]`。也就是说，`arr` 为空时， `...arr` 并不会出现在入参列表中。若 `arr = ["aaa", "bbb"]`，输出为 `["aaa", "bbb", "www"]`


这个特性可以帮助我们灵活的对函数参数进行处理。

## 尾调用优化

> 主要引用了阮一峰老师的[尾调用优化](http://es6.ruanyifeng.com/#docs/function#%E5%B0%BE%E8%B0%83%E7%94%A8%E4%BC%98%E5%8C%96)部分和[尾递归](http://es6.ruanyifeng.com/#docs/function#%E5%B0%BE%E9%80%92%E5%BD%92)，描述的非常清楚。

尾调用就是指某个函数的最后一步是调用另一个函数的形式：

```js
function f(x){
  return g(x);
}
```

**尾调用之所以与其他调用不同，就在于它的特殊的调用位置**。

我们知道，函数调用会在内存形成一个“调用记录”，又称“调用帧”（call frame），保存调用位置和内部变量等信息。如果在函数A的内部调用函数B，那么在A的调用帧上方，还会形成一个B的调用帧。等到B运行结束，将结果返回到A，B的调用帧才会消失。如果函数B内部还调用函数C，那就还有一个C的调用帧，以此类推。所有的调用帧，就形成一个“调用栈”（call stack）。

**尾调用由于是函数的最后一步操作，所以不需要保留外层函数的调用帧**，因为调用位置、内部变量等信息都不会再用到了，只要直接用内层函数的调用帧，取代外层函数的调用帧就可以了。

```js
function f() {
  let m = 1;
  let n = 2;
  return g(m + n);
}
f();

// 等同于
function f() {
  return g(3);
}
f();

// 等同于
g(3);
```

上面代码中，如果函数 `g` 不是尾调用，函数f就需要保存内部变量 `m` 和 `n` 的值、`g` 的调用位置等信息。但由于调用 `g` 之后，函数 `f` 就结束了，所以执行到最后一步，完全可以删除 `f(x)` 的调用帧，只保留 `g(3)` 的调用帧。

这就叫做“尾调用优化”（Tail call optimization），即只保留内层函数的调用帧。如果所有函数都是尾调用，那么完全可以做到每次执行时，调用帧只有一项，这将大大节省内存。这就是“尾调用优化”的意义。

**注意，目前只有 Safari 浏览器支持尾调用优化，Chrome 和 Firefox 都不支持。**

### 尾递归优化

以 Fibonacci 数列为例，非尾递归实现如下：

```js
function Fibonacci (n) {
  if ( n <= 1 ) {return 1};

  return Fibonacci(n - 1) + Fibonacci(n - 2);
}

Fibonacci(10) // 89
Fibonacci(100) // 超时
Fibonacci(500) // 超时
```

尾递归优化过的 Fibonacci 数列实现如下。

```js
function Fibonacci2 (n , ac1 = 1 , ac2 = 1) {
  if( n <= 1 ) {return ac2};

  return Fibonacci2 (n - 1, ac2, ac1 + ac2);
}

Fibonacci2(100) // 573147844013817200000
Fibonacci2(1000) // 7.0330367711422765e+208
Fibonacci2(10000) // Infinity
```

由此可见，“尾调用优化”对递归操作意义重大，所以一些函数式编程语言将其写入了语言规格。ES6 亦是如此，第一次明确规定，所有 ECMAScript 的实现，都必须部署“尾调用优化”。这就是说，ES6 中只要使用尾递归，就不会发生栈溢出（或者层层递归造成的超时），相对节省内存。

**ES6 的尾调用优化只在严格模式下开启，正常模式是无效的。**

这是因为在正常模式下，函数内部有两个变量，可以跟踪函数的调用栈。

- `func.arguments`：返回调用时函数的参数。
- `func.caller`：返回调用当前函数的那个函数。

尾调用优化发生时，函数的调用栈会改写，因此上面两个变量就会失真。严格模式禁用这两个变量，所以尾调用模式仅在严格模式下生效。

```js
function restricted() {
  'use strict';
  restricted.caller;    // 报错
  restricted.arguments; // 报错
}
restricted();
```