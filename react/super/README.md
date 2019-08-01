<!-- TOC -->

- [class 中的 super()](#class-中的-super)
    - [为什么 super() 需要在构造器开头调用？](#为什么-super-需要在构造器开头调用)
    - [为什么不调用 super() 也能运行？](#为什么不调用-super-也能运行)
    - [为什么 react 组件类要传入 props ？](#为什么-react-组件类要传入-props-)
    - [为什么 super() 不传入 props 也能生效？](#为什么-super-不传入-props-也能生效)

<!-- /TOC -->

# class 中的 super()

## 为什么 super() 需要在构造器开头调用？

我们在使用 class 的方式定义一个组件的时候都会采用如下写法：

```js
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { name: "wfatec" };
  }
  // ...
}
```

**注意**：这里的`super()`必须在`constructor`方法的最上层进行调用。

为什么呢？这实际上是 ES6 的规范，其规定在子类构造器中 `super()` 方法必须在头部进行调用。假设 ES6 允许 `super()` 在任意位置，让我们来想想会发生什么？当我们在子类调用父类的属性或者方法时，如果父类的构造器尚未执行，那么这些被调用的属性或方法将会不存在，进而导致错误。举个例子：

```js
class Father {
  constructor(props) {
    this.name = "parent";
  }
}

class Son extends Father {
  constructor(name) {
    this.getFatherName();
    super(name);
  }
  getFatherName() {
    console.log(`My father's name is ${this.name}`);
  }
}
```

因此，为了避免类似的错误， ES6 强制我们将 `super()` 调用放在构造器的头部。

## 为什么不调用 super() 也能运行？

有时候没我们会发现，我们在子类中没有定义构造器，程序也能正常运行：

```jsx
class MyComponent extends React.Component {
  render() {
    return (
      <div>
        Hello, world!
      </div>
    );
  }
}
```

这实际上是因为当子类中没有构造器函数 `constructor()` 时，运行环境会自动执行：

```js
constructor() {
    super(props);
  }
```

## 为什么 react 组件类要传入 props ？

```js
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { name: "wfatec" };
  }
  // ...
}
```

其实通过上文的分析我们已经能够推测出答案了 -- 让 `Component` 初始化 `this.props`，看一下 `Component` 的[源码](https://github.com/facebook/react/blob/1d25aa5787d4e19704c049c3cfa985d3b5190e0d/packages/react/src/ReactBaseClasses.js#L22):

```js
function Component(props, context, updater) {
  this.props = props;
  // 忽略无关代码
}
```

正如我们所料，实际上传入的 `props` 就是为了初始化父类 `Component`。

## 为什么 super() 不传入 props 也能生效？

我们在写 react 代码的时候可能会发现，即使我们直接调用 `super()` ，往往程序也能运行，且能够在内部方法中获取到 `this.props`。这实际上是 react 内部执行了一个 hack 操作 ==！

```js
const instance = new MyComponent(props);
instance.props = props;
```

react 内部直接在组件类的实例上挂载了一个 props 属性。。。

但是需要强调的是，这一机制只是一个非常规手段，会造成逻辑的混乱，且在构造函数执行过程中，`this.props` 都是 `undefined`，仅在实例化之后，才能访问到。因此，我们**应该执行调用super(props)而非super()**