<!-- TOC -->

- [JavaScript 中有趣的特性](#javascript-中有趣的特性)
    - [基本类型的包装类型](#基本类型的包装类型)
    - [JavaScript 词法](#javascript-词法)
    - [解构赋值](#解构赋值)
        - [我为什么喜欢解构赋值？](#我为什么喜欢解构赋值)
        - [解构赋值默认值生效的问题](#解构赋值默认值生效的问题)
    - [split 妙用](#split-妙用)

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

注意这里的 **“.split(/^{{("demo":[^}]*)}}$/gm)”** 这里会以 `{{"demo": "pages/components/buttons/TextButtons.js"}}` 为分割符进行分割，并且会在结果中保留分割符，为什么会这样的？实际上就是正则表达式中的 `()` 在起作用，他会保留括号中的部分，我们测试一下：

```js
let str = "aaa,bbb,ccc";
console.log(str.split(/(,)/))
console.log(str.split(/,/))
```

结果为：

```
["aaa", ",", "bbb", ",", "ccc"]
["aaa", "bbb", "ccc"]
```

符合预期。

