<!-- TOC -->

- [redux](#redux)
    - [store 的动态更新](#store-的动态更新)
        - [dva/dynamic](#dvadynamic)
        - [`start()`之前的`model()`方法](#start之前的model方法)
        - [`start()`之后的`model()`方法](#start之后的model方法)
        - [`unmodel`方法](#unmodel方法)

<!-- /TOC -->

# redux

## store 的动态更新

一般我们提到`store`的更新都是指的`state`的更新，即通过`dispach`发送一个`action`，再由`reducer`进行处理并返回一个新的`state`。

但是，当我们需要在运行时动态修改`state`的数据结构，以及动态修改`reducer`时，应该怎么办呢？

事实上这样的场景并不少见，例如：在[代码分离](https://github.com/wfatec/notebook/tree/master/react/code-split)的场景下，如果需要在懒加载时更新`store`，就会涉及到上述问题。下面将结合`dva`的实现方式进行一番阐述。

### dva/dynamic

`dva`通过`dynamic`方法实现懒加载，使用方法如下：

```js
import dynamic from 'dva/dynamic';

const UserPageComponent = dynamic({
  app,
  models: () => [
    import('./models/users'),
  ],
  component: () => import('./routes/UserPage'),
});
```

内部实现原理就不细说了，可以跟[代码分离](https://github.com/wfatec/notebook/tree/master/react/code-split)中所述实现方式类似。主要关注其中的`models`字段，该字段即运行时需要动态注入`store`的`model`模块。`dva`实例是通过`model()`来实现`state`、`reducer`的注入，而`dva`实例在`start()`执行前后，其`model`方法大的实现是不同的.

### `start()`之前的`model()`方法

这时，由于store还未初始化，因此`model()`所做的仅仅只是将传入的参数`push`到`app._models`中，其中`app`即`dva`实例，而`_model`则是存储各模块`model`的列表。具体实现如下：

```js
function model(m) {
    if (process.env.NODE_ENV !== 'production') {
      checkModel(m, app._models); // 对传入的model进行校验
    }
    const prefixedModel = prefixNamespace({ ...m }); // 将reducer，effect等方法重命名到对应namespace下
    app._models.push(prefixedModel);
    return prefixedModel;
}
```

### `start()`之后的`model()`方法

在`start()`中有如下一段代码：

```js
app.model = injectModel.bind(app, createReducer, onError, unlisteners);
```

即对`model`方法进行替换，再看一下`injectModel`的实现：

```js
function injectModel(createReducer, onError, unlisteners, m) {
    m = model(m);  // 执行此前的mode方法，将新的model参数push到__models中

    const store = app._store;
    store.asyncReducers[m.namespace] = getReducer(
      m.reducers,
      m.state,
      plugin._handleActions
    );
    store.replaceReducer(createReducer());
    if (m.effects) {
      store.runSaga(
        app._getSaga(m.effects, m, onError, plugin.get('onEffect'))
      );
    }
    if (m.subscriptions) {
      unlisteners[m.namespace] = runSubscription(
        m.subscriptions,
        m,
        app,
        onError
      );
    }
}
```

那么我们新创建的`reducer`在哪儿呢？如何将其添加到`reducers`中呢？最后如何用新的`new reducer`替换原有的`store`中的`old reducer`呢？

首先，通过`getReducer`创建新的`reducer`并保存到`store.asyncReducers`对应的`namespace`下：

```js
store.asyncReducers[m.namespace] = getReducer(
    m.reducers,
    m.state,
    plugin._handleActions
);
```

然后通过`createReducer()`获取最新的`reducers`，具体实现为：

```js
function createReducer() {
    return reducerEnhancer(
        combineReducers({
            ...reducers,
            ...extraReducers,
            ...(app._store ? app._store.asyncReducers : {}), // 这里！！！
        })
    );
}
```

最后通过`store.replaceReducer(createReducer())`实现`reducer`的动态替换。至此，基本的`model`动态注入就完成了。

### `unmodel`方法

我们观察源码时还会发现`start()`中还为`app`增加了`unmodel()`方法。具体实现如下：

```js
function unmodel(createReducer, reducers, unlisteners, namespace) {
    const store = app._store;

    // Delete reducers
    delete store.asyncReducers[namespace];
    delete reducers[namespace];
    store.replaceReducer(createReducer());
    store.dispatch({ type: '@@dva/UPDATE' });

    // Cancel effects
    store.dispatch({ type: `${namespace}/@@CANCEL_EFFECTS` });

    // Unlisten subscrioptions
    unlistenSubscription(unlisteners, namespace);

    // Delete model from app._models
    app._models = app._models.filter(model => model.namespace !== namespace);
}
```

首先通过`delete`直接进行删除`store.asyncReducers`和`store.asyncReducers`下对应`namespace`的`key`，然后通过`replaceReducer`更新`reducer`。

**接下来比较巧妙**，通过`store.dispatch({ type: '@@dva/UPDATE' });`实现整个`state`的更新。事实上`dva`在初始化时，默认会传入一个`model`:

```js
const dvaModel = {
  namespace: '@@dva',
  state: 0,
  reducers: {
    UPDATE(state) {
      return state + 1;
    },
  },
};
```

这里只是简单的对`@@dva`下的`state`加一处理，但由于`dispatch(action)`时，该`action`会在新的`reducer`中依次执行，从而实现整个`store`中的`state`树实现自动更新，是不是非常精巧呢～

最后别忘了将`app._models`下对应的`model`删除，大功告成！

