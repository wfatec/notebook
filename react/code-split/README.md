<!-- TOC -->

- [代码分离](#代码分离)
    - [入口起点](#入口起点)
    - [动态导入及懒加载](#动态导入及懒加载)
        - [路由的一般写法](#路由的一般写法)
        - [实现异步懒加载](#实现异步懒加载)
    - [参考](#参考)

<!-- /TOC -->

# 代码分离

根据`webpack`[官网介绍](https://webpack.docschina.org/guides/code-splitting/)，常用的代码分离方法有三种：

- 入口起点：使用 `entry` 配置手动地分离代码。
- 防止重复：使用 `SplitChunksPlugin` 去重和分离 `chunk。`
- 动态导入：通过模块中的内联函数调用来分离代码。

## 入口起点

**入口起点**的方式较为简单，但会导致依赖包被重复加载的问题，这时我们可以使用`SplitChunksPlugin`插件将公共的依赖模块提取到已有的 `entry chunk` 中，或者提取到一个新生成的 `chunk`。我们来看一个官网提供的典型案例就能明白：

```js
const path = require('path');

  module.exports = {
    mode: 'development',
    entry: {
      index: './src/index.js',
      another: './src/another-module.js'
    },
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist')
    },
+   optimization: {
+     splitChunks: {
+       chunks: 'all'
+     }
+   }
  };
```
使用 `optimization.splitChunks` 配置选项，现在可以看到已经从 `index.bundle.js` 和 `another.bundle.j`s 中删除了重复的依赖项。需要注意的是，此插件将 `lodash` 这个沉重负担从主 `bundle` 中移除，然后分离到一个单独的 `chunk` 中。

此外，以下`plugin`和`loader`也对于代码分离非常有效：

- `mini-css-extract-plugin`：用于将 `CSS` 从主应用程序中分离。
- `bundle-loader`：用于分离代码和延迟加载生成的 `bundle。`
- `promise-loader`：类似于 `bundle-loader` ，但是使用了 `promise API`。

## 动态导入及懒加载

打包成单文件对于简单的项目来说没有问题。但如果项目越来越大，我们首次加载时都需要加载完所有资源才能进行渲染，必然导致首屏加载过慢的问题，严重影响用户体验！因此我们一般会对页面级别的组件使用懒加载的方式进行加载，从而将代码分割成多个较小的资源包。

懒加载即**按需加载**，而`webpack`的动态导入功能是我们实现懒加载的核心和基础。`webpack`实现代码分离实际上是通过一个个**分离点**来判断的，之前的`entry`是一种，处理之外，还包括`import()`以及`require.ensure`。其中`require.ensure`主要在`webpack1`中使用，此后的版本主要还是使用`import()`。

接下来，我们将手动实现路由级别的懒加载功能。

### 路由的一般写法

```js
import React from 'react'
import { Route } from '@apollo/router'
import Home from '../pages/Home'
import About from '../pages/About'
import Topics from '../pages/Topics'

export default () => {
    return (
        <div>
            <Route exact path="/" component={Home} />
            <Route path="/about" component={About} />
            <Route path="/topics" component={Topics} />
        </div>
    )
}
```

### 实现异步懒加载

实际上，我们的需求已经很明确了，希望通过`import()`来实现组件的异步加载，但由于`import()`的返回值是一个`Promise`对象，因此不能直接将其赋值给`<Router />`组件。因此我们自然会想到通过高阶组件将`()=>import("./xxx")`以参数的方式传入，并使其在高阶组件被渲染时才执行，这样就能实现懒加载的功能了。

```js
import React from 'react';



export const lazyLoad = ({
  component,
  LoadingComponent = () => null
}) => (

  class AsyncComponent extends React.Component {
    constructor(...args){
      super(...args);

      this.LoadingComponent = LoadingComponent;

      this.state = {
          Component: null,
      };

      this.hasLoadedComponent = this.hasLoadedComponent.bind(this);
    }
    componentWillMount() {
      if(this.hasLoadedComponent()){
          return;
      }

      component()
        .then(module => module.default ? module.default : module)
        .then(Component => {
          this.setState({
              Component
          });
        })
        .catch(error => {
          /*eslint-disable*/
          console.error('cannot load Component in <AsyncComponent>');
          /*eslint-enable*/
          throw error;
        })
    }
    hasLoadedComponent() {
      return this.state.Component !== null;
    }
    render(){
      const {
        Component
      } = this.state;
      const LoadingComponent = this.LoadingComponent;

      return (Component) ? <Component {...this.props} /> : 
        <LoadingComponent    {...this.props} />;
    }
  }
);
```

这样，我们的路由就可以改为：

```js
export default () => {
    return (
        <div>
            <Route exact path="/" render={() => lazyLoad({
              component: () => import('../pages/Home'),
            })} />
            <Route path="/about" render={() => lazyLoad({
              component: () => import('../pages/About'),
            })} />
            <Route path="/topics" render={() => lazyLoad({
              component: () => import('../pages/Topics'),
            })} />
        </div>
    )
}
```

**注意**：此时尽管我们已经在业务层面实现了路由组件的懒加载，但是，由于这时我们的分离文件为非入口`chunk`，因此需要在`output`中增加[chunkFilename](https://webpack.docschina.org/configuration/output/#output-chunkfilename)配置：

```js
  const path = require('path');

  module.exports = {
    mode: 'development',
    entry: {
+     index: './src/index.js'
-     index: './src/index.js',
-     another: './src/another-module.js'
    },
    output: {
      filename: '[name].bundle.js',
+     chunkFilename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist')
    },
-   optimization: {
-     splitChunks: {
-       chunks: 'all'
-     }
-   }
  };
```

## 参考

- [React router动态加载组件-适配器模式的应用](https://www.cnblogs.com/walls/p/9632541.html)
 
- [代码分离](https://webpack.docschina.org/guides/code-splitting/)

- [dva/dynamic](https://dvajs.com/api/#dva-dynamic)
