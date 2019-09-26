# 这些年我遇到的奇葩 BUG

## 不管使用哪种路由，初次渲染 url 都默认添加 hash

在使用 react-router 时，通过 `createBrowserHistory()` 生成 browserHistory，并作为 history 属性传入框架实例 XXX：

```js
const app = XXX({ history: createBrowserHistory() });
```

刷新页面后，发现 url 仍然带有 hash 字段，但是点击导航栏切换页面后，又恢复正常，最终发现，原来框架入口文件中有这样一段代码：

```js
export default createXXX({
  // ...
  defaultHistory: createHashHistory(),
  // ...
});
```

而 createXXX 是一个高阶函数，用于生成框架的实例：

```js
export default function createXXX(options) {
  const {
    // ...
    defaultHistory,
    // ...
  } = options;

  return function XXX(opts = {}) {
    const history = opts.history || defaultHistory;
    // ...
  }
}
```

由此，也就意味着，首次访问页面的时候，`createHashHistory()` 方法也执行了，并且在执行时会为当前 url 添加 hash 值，而 `createBrowserHistory()` 执行时，并不会改变当前的 url，因而出现了上述的 bug。想修复该 bug，只需要在真正需要的时候才执行 `createHashHistory()`，因此代码可修改为：

```js
export default createXXX({
  // ...
  defaultHistory: createHashHistory(),
  // ...
});

export default function createXXX(options) {
  const {
    // ...
    defaultHistory,
    // ...
  } = options;

  return function XXX(opts = {}) {
    const history = opts.history || defaultHistory();
    // ...
  }
}
```

## 监听 pushState/replaceState 时遇到的问题

单页面中，我们无法通过 popState 事件来监听路由的跳转，这是由于 history 对象中 pushState/replaceState 的执行并不会触发 popState。而为了实现监听 pushState/replaceState 的需求，我使用了发布订阅的方式，通过增强 pushState/replaceState 方法来发布事件，并在全局通过监听该事件来间接实现同样的效果，具体代码如下：

```js
const routeEventList = ["pushState", "replaceState"];
// popstate/hashchange 事件增强
const wrapper = (type) => {
  const orig = history[type];
  return function() {
    const rv = orig.apply(this, arguments);
    const e = new Event(type);
    e.arguments = arguments;
    window.dispatchEvent(e);
    return rv;
  };
};

const wrapRouteEventFactory = () => {
  routeEventList.map(routeEventName => {
    window.history[routeEventName] = wrapper(routeEventName)
    window.addEventListener(routeEventName, console.log)
  });
};

wrapRouteEventFactory()
```

此时，我们能够正常捕获到路由事件，并完成跳转。那么如果我们使用箭头函数，又将怎么改造呢？修改 wrapper 函数如下：

```js
const wrapper = (type) => {
  const orig = history[type];
  return (...args) => {
    const rv = orig(args);
    const e = new Event(type);
    e.arguments = args;
    window.dispatchEvent(e);
    return rv;
  };
};
```

很遗憾，结果是虽然能够捕捉到路由事件，但是无法完成页面跳转，问题显然出在 `orig(args)` 上，那么和 `orig.apply(this, arguments)` 相比，区别在哪儿呢？**大体推测是作用域的影响，更多的原因尚须探索**。

为了更优雅的实现监听功能，最终使用了 Proxy 来改造：

```js
const routeEventList = ["pushState", "replaceState"];

const createPopStateEvent = state => {
  try {
    return new PopStateEvent("popstate", { state });
  } catch (err) {
    // IE 11 compatibility
    const evt = document.createEvent("PopStateEvent");
    evt.initPopStateEvent("popstate", false, false, state);
    return evt;
  }
};

const handler = {
  apply: (target, ctx, args) => {
    const e = createPopStateEvent(args);
    window.dispatchEvent(e);
    return target.apply(ctx, args);
  }
};

const wrapRouteEventFactory = () => {
  routeEventList.map(routeEventName => {
    window.history[routeEventName] = new Proxy(
      window.history[routeEventName],
      handler
    );
  });
};

wrapRouteEventFactory();
```

handler 中的 `target.apply(ctx, args)` 成功触发了路由的跳转，而改为 `target(args)` 则会失败！