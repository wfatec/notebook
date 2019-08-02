<!-- TOC -->

- [那些不常用到却很好用的 DOM API](#那些不常用到却很好用的-dom-api)
    - [classList](#classlist)
        - [基本用法](#基本用法)
        - [实例](#实例)

<!-- /TOC -->

# 那些不常用到却很好用的 DOM API

## classList

按照[官网文档](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/classList)所说，`Element.classList` 是一个只读属性，返回一个元素的类属性的实时 `DOMTokenList` 集合。

### 基本用法

```js
let elementClasses = elementNodeReference.classList;
```

这里的 `elementNodeReference` 表示一个 DOM 节点的引用，通常可以通过 `getElementById` 等等方法获取。

```js
const div = document.createElement("div");
div.className = "foo";

// our starting state: <div class="foo"></div>
console.log(div.outerHTML);

// use the classList API to remove and add classes
div.classList.remove("foo");
div.classList.add("anotherclass");

// <div class="anotherclass"></div>
console.log(div.outerHTML);

// if visible is set remove it, otherwise add it
div.classList.toggle("visible");

// add/remove visible, depending on test conditional, i less than 10
div.classList.toggle("visible", i < 10);

console.log(div.classList.contains("foo"));

// add or remove multiple classes
div.classList.add("foo", "bar", "baz");
div.classList.remove("foo", "bar", "baz");

// add or remove multiple classes using spread syntax
const cls = ["foo", "bar"];
div.classList.add(...cls);
div.classList.remove(...cls);

// replace class "foo" with class "bar"
div.classList.replace("foo", "bar");
```

以上是官网给出的实例，基本覆盖了所有的用法。下面我们结合一个实际场景来简单应用一下。

### 实例

```js
// index.js
import React, { Component } from "react";
import { Icon } from "antd";
import "./style.css";

export default class ExampleCss extends Component {
  handleClick() {
    const wrapper = document.getElementById("wrapper");
    wrapper.classList.toggle("is-nav-open");
  }

  render() {
    return (
      <div id="wrapper" className="wrapper">
        <div className="nav">
          <Icon
            className="nav__icon"
            type="menu-fold"
            onClick={() => this.handleClick()}
          />
          <div className="nav__body">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Beatae
            ducimus est laudantium libero nam omnis optio repellat sit unde
            voluptatum?
          </div>
        </div>
      </div>
    );
  }
}
```

```css
.wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  transition: margin 0.5s;
  margin: 0 0 0 -250px;
}

.wrapper.is-nav-open {
  margin-left: 0;
}

.nav {
  position: relative;
  width: 250px;
  height: 100%;
  padding: 20px;
  border-right: 1px solid #ccc;
}

.nav__icon {
  position: absolute;
  top: 0;
  right: -60px;
  padding: 20px;
  font-size: 20px;
  cursor: pointer;
  transition: color 0.3s;
}

.nav__icon:hover {
  color: #5eb2ff;
}
```

这里，我们直接通过 

```js
wrapper.classList.toggle("is-nav-open");`
```

来动态控制 `is-nav-open` 类的增加和删除。

> 注意：通常 react 并不建议直接操作 DOM 元素来控制样式，如果需要实现该效果，更好的做法是通过 `classnames` 类库来实现，或者通过一个自定义的 state 来进行控制。
