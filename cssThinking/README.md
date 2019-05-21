# `CSS`拾遗

<!-- TOC -->

- [`CSS`拾遗](#css拾遗)
    - [选择器](#选择器)
        - [选中带有`class`或`id`的元素](#选中带有class或id的元素)
        - [选中多个`class`](#选中多个class)
        - [选择器组合](#选择器组合)
        - [使用`dom`结构作为选择器](#使用dom结构作为选择器)
    - [层叠(Cascading)](#层叠cascading)
        - [具体性(Specificity)](#具体性specificity)
        - [如何计算具体性](#如何计算具体性)
            - [位置1](#位置1)
            - [位置2](#位置2)
            - [位置3](#位置3)
            - [位置4](#位置4)
            - [位置5](#位置5)
    - [继承](#继承)
        - [强制继承属性](#强制继承属性)
        - [强制不继承属性](#强制不继承属性)
        - [其它特殊值](#其它特殊值)
    - [Import](#import)
    - [属性选择器](#属性选择器)
        - [属性存在选择器](#属性存在选择器)
        - [属性值匹配选择器](#属性值匹配选择器)
        - [部分属性值匹配](#部分属性值匹配)
    - [伪类](#伪类)
    - [伪元素](#伪元素)

<!-- /TOC -->

## 选择器

### 选中带有`class`或`id`的元素

```css
p.dog {
    color: yellow;
}
```
或者
```css
p#dog {
    color: yellow;
}
```

思考一下，当我们已经可以通过`class`或`id`锁定目标时，为什么还要加上元素标签`p`呢？

### 选中多个`class`

```css
.dog.cat {
    color: yellow;
}
```

此时元素必须同时拥有`dog`和`cat`类。

同理，同时包含某个`class`和`id`，可以写为：

```css
.dog#john {
    color: yellow;
}
```

### 选择器组合

```css
p, .dog {
    color: yellow;
}
```

### 使用`dom`结构作为选择器

```html
<spqn>
    hello
</span>

<p>
    My dog's name is:
    <spqn class="name">
        John
    </span>
</p>
```

```css
p span{
    color: yellow;
}
```

注意：即使右边元素在更深的层级，选择器也会生效。如果想让右边元素只能在第一个层级，可以使用`>`：

```css
p > span{
    color: yellow;
}
```

此外，使用`+`可以让我们选择在指定的元素后出现的目标元素：

```css
p + span {
    color: yellow;
}
```

这时，`html`结构为：

```html
<p>this is p</p>
<span>this is color span</span>
```

## 层叠(Cascading)

`css`的全称是层叠样式表(Cascading Style Sheets)，那么**层叠**在`css`中的重要性就不言而喻了，它关系到浏览器以什么样的规则在页面上渲染元素。

### 具体性(Specificity)

当某个元素被多条规则选中时，该如何决定渲染优先级呢？例如：

```html
<p class="name">john</p>
```

```css
.name {
    color: yellow;
}

p {
    color: red;
}

p.name {
    color: black;
}
```

最终的渲染颜色会是什么呢？显然会是最后一个获胜，记住如下规则：**更具体的规则获胜**。而如果**具体程度相同，则出现在最后面的规则获胜**。

### 如何计算具体性

这里有一个惯例，假设我们有四个位位置，初始值均为0：`0 0 0 0`，越往左边权重越大，如`1 0 0 0`大于`0 1 0 0`，以此类推。

#### 位置1

是最右边的一位，即权重最低的一位。

我们每增加一个元素选择器时，在该位加一：

```css
p {}              /* 0 0 0 1 */
span {}           /* 0 0 0 1 */
p span {}         /* 0 0 0 2 */
p > span {}       /* 0 0 0 2 */
div p > span {}   /* 0 0 0 3 */
```

#### 位置2

该位置数值的增长由以下因素决定：

- 类选择器
- 伪类选择器
- 属性选择器

每次遇到上述选择器时，该位置计数加一：

```css
.name{}                 /* 0 0 0 1 */
.users .name{}          /* 0 0 0 2 */
[href$=".pdf"] {}       /* 0 0 0 1 */
:hover {}               /* 0 0 0 1 */
```

同样的，位置二和位置一也会组合出现：

```css
div .name {}            /* 0 0 1 1 */
a[href$=".pdf"] {}      /* 0 0 1 1 */
.pic img:hover {}       /* 0 0 2 1 */
```

我们还可以通过重复使用相同类选择器来增加其数值：

```css
.name {}                /* 0 0 1 0 */
.name .name {}          /* 0 0 2 0 */
.name .name .name {}    /* 0 0 3 0 */
```

#### 位置3

该位置主要受`id`选择器影响，每个元素只能包含一个`id`

```css
#name {}                /* 0 1 0 0 */
.user #name {}          /* 0 1 1 0 */
#name span {}           /* 0 1 0 1 */
```

#### 位置4

主要由行内样式影响，任意行内样式拥有比外部`css`文件和 `style` 标签内样式更高的优先级。

```html
<span style="color: red">test</span>  /* 1 0 0 0 */
```

到这里，似乎行内样式大时无敌的，直到`!important`的出现。。。

#### 位置5

`!important`可以影响到位置5:

```css
p {
    color: yellow!important;
}
```

这时，其优先级将是最高的，会覆盖其它所有样式规则。

## 继承

有些属性具有继承大的特性，而有些属性却没有，这是根据属性的特点决定的，例如`font-family`属性写在`body`选择器下，可以让子元素继承该属性值，简化了代码的书写，而像`background-color`这样的属性，就没有多少继承的意义了。

具体有哪些属性可以被继承请参考[css继承介绍](https://www.sitepoint.com/css-inheritance-introduction/)

### 强制继承属性

当你希望当前元素继承父级元素的属性值时，可以使用强制继承：

```css
body {
    background-color: yellow;
}

p {
    background-color: inherit;
}
```

### 强制不继承属性

```css
body {
    font-family: yellow;
}

p {
    font-family: inherit;
}
```

### 其它特殊值

- `initial`: 初始默认值
- `unset`: 表示如果该属性默认可继承，则值为inherit，否则值为initial

## Import

使用`@import`可以导入其它`css`文件。

```css
@import url(myfile.css)
```

注意：`@import`只能放在文件的最上方，否则会被忽略。

## 属性选择器

### 属性存在选择器

我们可以通过在元素后加入`[]`来判断元素是否拥有某属性，例如`p[id]`可以判断`p`标签是否存在`id`属性。

### 属性值匹配选择器

明确具体属性值：`p[id="name"]`

### 部分属性值匹配

`=`表示绝对匹配，事实上我们还有其他一些方式来进行部分匹配：

- `*=`：属性包含该值
- `^=`：属性以该部分开头
- `$=`：属性以该部分结尾

## 伪类

伪类是一种预定义的关键字用于根据状态选择元素，或选择指定的子元素。

伪类以冒号`:`结尾。

## 伪元素

伪元素用于指向元素特定的部分。以双冒号`::`开头。

`::before`和`::after`也许是最常用的伪元素了。

name | 描述 |
-|-|-
::before | 可以在元素的内容前面插入新内容 |
::after | 可以在元素的内容之后插入新内容 |
::first-letter | 向文本的第一个字母添加特殊样式。 |
::first-line | 向文本的首行添加特殊样式 |