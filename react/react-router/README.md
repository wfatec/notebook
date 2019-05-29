<!-- TOC -->

- [react-router](#react-router)
    - [`<Route>`是如何渲染的？](#route是如何渲染的)
    - [`Router`只能有一个子节点](#router只能有一个子节点)
    - [参考](#参考)

<!-- /TOC -->

# react-router

## `<Route>`是如何渲染的？

当一个路由的`path`匹配成功后，路由用来确定渲染结果的参数有三种：

- `component`：一个`React`组件。当带有`component`参数的`route`匹配成功后，`route`会返回一个新的元素，其为`component`参数所对应的`React`组件（使用`React.createElement`创建）。
- `render`： 一个返回`React element`的函数。当匹配成功后调用该函数。该过程与传入`component`参数类似，并且对于行级渲染与需要向元素传入额外参数的操作会更有用。
- `children`： 一个返回`React element`的函数。与上述两个参数不同，无论`route`是否匹配当前`location`，其都会被渲染

```js
<Route path='/page' component={Page} />
const extraProps = { color: 'red' }
<Route path='/page' render={(props) => (
  <Page {...props} data={extraProps}/>
)}/>
<Route path='/page' children={(props) => (
  props.match
    ? <Page {...props}/>
    : <EmptyPage {...props}/>
)}/>
```

通常`component`参数与`render`参数被更经常地使用。`children`参数偶尔会被使用，它更常用在`path`无法匹配时呈现的’空’状态。

**注意**：虽然`component`也能够传入参数，例如：

```js
// generatePage.js
import Page from "./Page"

export default props => <page />
```

此时如果我们直接使用`component`方式进行渲染：

```js
<Route path='/page' component={generatePage(props)} />
```

这种方式虽然能够生效，但会导致每次路由匹配时，都重新生成一个新的`<Page>`，而此前的`<Page>`也不会立刻回收，导致内存泄漏的风险。

## `Router`只能有一个子节点

 `<Router>`(包括其衍生，如<BroserRouter>)只能有一个子节点,所以官网建议的是使用`<Switch>`进行包裹，如：

```js
 //v2
 <Router history={hashHistory}>
  <Route path="/" component={PCIndex}></Route>
  <Route path="/details/:uniqueky" component={PCNewsDetails}></Route>
  <Route path="/usercenter" component={PCUserCenter}></Route>
 </Router>
```

 修改为：

```js
//v4
<BrowserRouter>
  <Switch>
   <Route exact path="/" component={MobileIndex}></Route>
   <Route path="/details/:uniqueky" component={MobileNewsDetails}></Route>
   <Route path="/usercenter" component={MobileUserCenter}></Route>
  </Switch>
 </BrowserRouter>
```

 不过通常我们会创建一个`<App>`组件来作为根组件，用于渲染其余部分：

```js
import { BrowserRouter } from 'react-router-dom'

ReactDOM.render((
  <BrowserRouter>
    <App />
  </BrowserRouter>
), document.getElementById('root'))
```

## 参考

- [A Simple React Router v4 Tutorial](https://blog.pshrmn.com/simple-react-router-v4-tutorial/)

- [React之React Router 4（十一）](https://blog.poetries.top/2017/11/19/react-study-router-4-xx/)