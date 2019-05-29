<!-- TOC -->

- [JSX相关](#jsx相关)
    - [为什么函数组件也需要引入`React`？](#为什么函数组件也需要引入react)

<!-- /TOC -->

# JSX相关

## 为什么函数组件也需要引入`React`？

> 这里主要参考了[Why import React from “react” in a functional component?](https://hackernoon.com/why-import-react-from-react-in-a-functional-component-657aed821f7a)，并作了适当修改和补充。

随着新版本`React`正式引入了`hooks`，函数式组件的使用会变得更加普遍，但是不知道你有没有注意过，我们有时候在代码中明明没有使用`React`，仍然需要在头部写上`import React from "React"`。

下面我们创建一个简单的函数式组件：

```js
import React from "react";
const App = () => (
  <div>Hello World!!!</div>
);
export default App;
```

我们看到，代码中除了开头引入时出现了`React`，其它地方都没有其踪影。但是当去掉`import React from "react"`时，程序却会执行出错`ReferenceError： React is not defined`。

**那么原因出在哪儿呢？**

当我们深入了解`React`底层的执行原理后就会发现并理解问题的原因！

答案就是，我们的`JSX`语法只是一种语法糖，它最终会被转译成纯粹的`js`语法，因此在`babel`转译之后，我们的代码就变成了：

```js
var App = function App() {
  return React.createElement(
    "div",
    null,
    "Hello World!!!"
  );
};
```

**这里出现了`React.createElement`**，这就是为什么我们需要在函数式组件开头引入`React`的原因！

当然，有时候我们频繁的手动引入`React`过于繁琐，因此我们可以通过[babel-plugin-react-require](https://github.com/vslinko/babel-plugin-react-require)来实现`react`的自动导入，实际上该插件的功能非常简单，就是在转译时，在文件头插入`import React from 'react';`。同时需要注意的是，该插件**只对未继承`React.Component`的无状态函数式组件生效**，因此对于其它`react`函数，则仍需手动引入`react`!

当然，并不是所有地方都需要引入`react`的，例如：

```js
export default props => ["Not importing React is fine!", 1, 2, 3];
```

这仍是一个函数式组件，但其转译之后并没有用到`React.createElement`，因此无需引入`react`。

