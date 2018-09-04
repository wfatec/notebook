对于Promise用法就还不是很清楚的同学可以先看一下[这里](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)，此外官方给出的[Promise/A+规范](https://promisesaplus.com/)，[中文版](https://segmentfault.com/a/1190000002452115)也需要事先进行了解。事实上在Promise/A+规范推行之前，社区已经有了实际使用的Promise类库，[Q](https://github.com/kriskowal/q/tree/v1)就是其中使用最广泛的类库之一，本文也着重对Q作者的[设计思路](https://github.com/kriskowal/q/tree/v1/design)做一些翻译和补充，供大家共同学习。
***
本文旨在渐进的对Promise的设计思路进行阐述，从而帮助读者更深刻的理解promise的原理和使用，并从中得到启发。
***
# Step1
想象一下，当你需要实现一个不需要立即返回结果的函数时，一个最为自然的想法就是使用回掉函数，这也是JS事件轮询机制的精髓。具体实现可能会是下面的形式：
```javascript
var oneOneSecondLater = function (callback) {
    setTimeout(function () {
        callback(1);
    }, 1000);
};
```
这是解决以上问题的一个简单方法，但是我们还有很多的改进空间。更加通用的方案是加入异常校验，同时提供callback和errback.
```javascript
var maybeOneOneSecondLater = function (callback, errback) {
    setTimeout(function () {
        if (Math.random() < .5) {
            callback(1);
        } else {
            errback(new Error("Can't provide one."));
        }
    }, 1000);
};
```
以上方法通过显式的错误处理逻辑`new Error()`来实现异常处理，但是这种错误处理方式太过机械化，同时也很难灵活的对错误信息进行处理。

## Promise
下面我们来思考一个更为一般的解决方案，让函数本身返回一个对象来表示最终的结果（successful或failed），而非之前的返回values或是直接抛出异常。这个返回的结果就是`Promise`，正如其名字（承诺）显示的那样，最终需要被resolve（执行）。我们需要可以通过调用promise上的一个函数来观察其处于完成态(fulfillment)还是拒绝态(rejection)。如果一个promise被rejected，并且此rejection未能被明确的观察，则所有衍生出来的promises将隐式的执行相同原因的reject。

接下来我们构建一个简单的‘promise’，其实就是一个包含key为then的一个对象，且在then上挂载了callback：
```javascript
var maybeOneOneSecondLater(){
    var callback;
    setTimeout(function(){
        callback(1);
    },1000);
    return {
        then : function(_callback){
            callback = _callback;
        }
    }
}

maybeOneOneSecondLater().then(callback);
```
该版本有两个缺点：
1. then方法只有最后挂载的callback生效，如果我们能够将所有的callback保存下来，并依次调用也许会更加实用；
2. 如果我们的callback注册时间超过1秒，此时promise已经构建完毕，那么这个callback也永远不会调用。

一个更通用的解决方案需要能够接收任意数量的callback，并且能够保证其能够在任何情况下注册成功。我们将通过构建一个包含两种状态(two-state)的对象来实现promise。

一个promise的初始状态为unresolved，并且此时所有callbacks均被添加到一个名为pending的观察者（observer）数组中。当该promise执行resolve时，所有的observers被唤醒并执行。当promise处于resolved状态后，新注册的callbacks将立即被调用。我们通过pending数组中的callbacks是否存在来判断state的变化，并且在resolution之后将所有callbacks清空。
```javascript
var maybeOneOneSecondLater = function () {
    var pending = [], value;
    setTimeout(function () {
        value = 1;
        for (var i = 0, ii = pending.length; i < ii; i++) {
            var callback = pending[i];
            callback(value);
        }
        pending = undefined;
    }, 1000);
    return {
        then: function (callback) {
            if (pending) {
                pending.push(callback);
            } else {
                callback(value);
            }
        }
    };
};
```
这个函数已经很好的解决了问题，下面我们将其改写为工具函数使其更便于使用。定义一个deferred对象，主要包含两个部分：
1. 注册观察者队列（observers）
2. 通知observers并执行
```javascript
var defer = function(){
    var pending = [], value;
    return{
        resolve: function(_value){
            value = _value;
            var len = pending.length
            for (var i = 0; i < len; i++){
                pending[i](value);
            }
            pending = undefined;
        },
        then: function(callback){
            if(pending){
                pending.push(callback);
            } else {
                callback(value)
            }
        }
    }
};

var oneOneSecondLater = function(){
    var result = defer();
    setTimeout(function(){
        result.resolve(1)
    },1000);
};

oneOneSecondLater().then(callback);
```
这里resolve函数有一个缺陷：可以被多次调用，并不断改变result的值。因此我们需要保护value值不被意外或恶意篡改，解决方案就是只允许resolve执行一次。
```javascript
var defer = function(){
    var pending = [], value;
    return{
        resolve: function(_value){
            if(pending){
                value = _value;
                var len = pending.length
                for (var i = 0; i < len; i++){
                    pending[i](value);
                }
                pending = undefined;
            } else {
                throw new Error("A promise can only be resolved once.")
            }            
        },
        then: function(callback){
            if(pending){
                pending.push(callback);
            } else {
                callback(value);
            }
        }
    }
};

var oneOneSecondLater = function(){
    var result = defer();
    setTimeout(function(){
        result.resolve(1)
    },1000);
    return result;
};

oneOneSecondLater().then(callback);
```
发散一下思维，我们除了以上功能外，还可以定制一些特有的处理逻辑，例如：
1. 传递一个参数来作为抛出的错误信息或者忽略后续callback的执行；
2. 可以在resolve时，实现callbacks的竞争（race）机制，忽略之后的resolutions；
当然可能还有很多的场景可以思考，这些就留给读者自行发散思维吧；
***

# Step2
基于之前的设计，我们再进一步思考，主要分为两个层面：
1. 如果能够将defferd函数中的promise和resolver部分进行分割和组合，那将大大提高其灵活性；
2. 是否可以通过某些方法来将promises和其他类型的数值进行区分，以便于维护。

- 将promise部分从resolver中分离出来可以让我们的代码更好的践行最小权限原则(the principle of least authority)。promise对象给使用者的权限主要有两个：
1. 观察（observer）promise的resolution
2. resolver接口，仅用于决定何时触发resolution
权限不能隐式的传递，实践证明，过多的权限必然会导致其滥用并最终使得代码难以维护

然而这种分离当然也存在缺点，那就是使用promise对象会增加垃圾回收处理的负担(主要是由于大量闭包的使用)

- 当然，我们也有很多的方法来对promise对象进行判别。其中最为直观和显著的方式就是通过原型继承(prototypical inheritance)
```javascript
var Promise = function(){};

var isPromise = function(value){
    return value instanceof Promise;
};

var defer = function(){
    var pending = [], value;
    var promise = new Promise();
    promise.then = function(callback){
        if(pending){
            pending.push(callback);
        }else{
            callback(value)
        }
    };
    return {
        resolve: function(_value){
            if(pending){
                value = _value;
                for(var i = 0, len = pending.length; i < len; i++){
                    pending[i](value);
                }
                pending = undefined;
            }
        },
        promise: promise
    };
};
```
使用原型继承有一个缺点，那就是能且只能是promise的实例才能在程序中起作用，这就导致一个代码耦合性的问题，使得实际使用起来不够灵活且难以维护。

另外一中实现思路就是使用“[鸭子类型（duck-typing）](https://en.wikipedia.org/wiki/Duck_typing)”，通过是否实现了约定的方法来判断是否是promise（类似于接口，约定）。在 CommonJS/Promises/A中，使用“then”来区分promise。这也会有一些缺点，例如当一个对象恰好有一个then方法时，也会被误判为promise。但在实际使用中这却不够构成困扰，毕竟这种情况出现并造成影响的概率很小。
```javascript
var isPromise = function(value){
    return value&& (typeof value.then === "function");
};

var defer = function(){
    var pending = [], value;
    return {
        resolve: function(_value){
            if(pending){
                value = _value;
                for(var i=0, len=pending.length; i<len; i++){
                    pending[i](value);
                }
                pending = undefined;
            }
        },
        promise: {
            then: function(callback){
                if(pending){
                    pending.push(callback);
                }else{
                    callback(value);
                }
            }
        }
    };
};
```

# Step3
接下来的重点就是让promises更易于组合，让新的promise可以从旧的promise中获取value值并使用。我们来看一下下面的例子：
```javascript
var twoOneSecondLater = function (callback) {
    var a, b;
    var consider = function () {
        if (a === undefined || b === undefined)
            return;
        callback(a + b);
    };
    oneOneSecondLater(function (_a) {
        a = _a;
        consider();
    });
    oneOneSecondLater(function (_b) {
        b = _b;
        consider();
    });
};

twoOneSecondLater(function (c) {
    // c === 2
});
```
这段代码显得非常的琐碎，尤其是这里需要一个哨兵值去判断是否需要调用callback。接下来我们将通过promise用更少的代码来解决上述问题，并且隐式的处理error传播，使用形式如下：
```javascript
var a = oneOneSecondLater();
var b = oneOneSecondLater();
var c = a.then(function (a) {
    return b.then(function (b) {
        return a + b;
    });
});
```
为了实现上述效果，我们需要解决一下问题：
1. “then”方法必须返回一个promise对象；
2. 返回的promise对象必须最终resolve一个callback函数的返回值；
3. callback函数的返回值必须是一个fulfilled值或者一个promise对象

将value值转成fulfilled状态的promise方法非常直接，下面的方法可以将任何value转成fulfilled状态的observers：
```javascript
var ref = function(value){
    return {
        then: function(callback){
            callback(value);
        }
    };
};
```
这里又有一个新的思考，如果入参value本身就是promise对象呢？这时我们回到问题的初衷，将value转换为promise，很显然如果value本身符合promise规范，那么直接返回value即可，改造如下：
```javascript
var ref = function(value){
    if(value && typeof value.then === "function"){ return value };
    return {
        then: function(callback){
            callback(value);
        }
    };
};
```
现在我们进一步改造一下then函数，将callback的返回值包装为promise并返回，方法如下：
```javascript
var ref = function(value){
    if(value && typeof value.then === "function"){ return value };
    return {
        then: function(callback){
            return ref(callback(value));
        }
    };
};
```
现在我们考虑一个更加复杂的情况，我们希望callback函数能够在未来的某个时间点被调用而非立即执行。让我们回到“defer”函数，并且将其中的callback包裹起来，callback的返回值将会resolve  then返回的promise。可能听起来有点拗口，其实简单说来就是我们的then函数最终会返回一个promise，这个新的promise在resolve时，传给resolve的参数就是这个callback的返回值，这也是能够实现链式调用的精髓。

此外，当resolution本身就是一个需要延时resolve的promise对象时，在何处执行resolve也是resolve方法需要处理的问题。最终需要实现的效果是：无论“defer”还是“ref”返回的promise，都能够执行then方法。如果是“ref”型promise，则行为表现和之前相同：callback将会被“then(callback)”立即调用。如果是“defer”型promise，则调用“then(callback)”时，会把callback传递给一个新的promise。因此，现在的callback将观察（observe）一个新的promise，并在执行完成后，将返回结果作为参数来执行新promise的resolve方法。
```javascript
var defer = function(){
    var pending = [], value;
    return{
        resolve: function(_value){
            if(pending){
                // 将value值封装为promise
                value = ref(_value);
                for(var i=0, len=pending.length; i<len; i++){
                    value.then(pending[i]);
                }
                pending = undefined;
            }
        },
        promise: {
            then: function(_callback){
                var result = defer();
                // 将callback封装起来以获取到其返回值，
                // 并用这个返回值来resolve “then”函数返回的promise
                var callback = function(value){
                    result.resolve(_callback(value))
                };
                if(pending){
                    pending.push(callback);
                } else {
                    value.then(callback);
                }
                return result.promise;
            }
        }
    };
};
```
这里我们使用了“thenable”类型的promise，并通过一个defer函数将“promise”和“resolve”分离开来，实现了我们最初的设想。

# Step4 -- 错误传递(Error Propagation)
为了实现错误传递，我们再引入errback参数。我们首先使用一个新的promise类型，与之前实现的“ref”型promise非常类似，区别只是这里调用的是errback并传入错误信息，而不是调用callback。
```javascript
var reject = function(reason){
    return {
        then: function(callback, errback){
            return ref(errback(reason));
        }
    }
}
```
我们通过下面一个简单的例子来观察一下reject方法的使用：
```javascript
reject("Error!").then(function(value){
    // 不会执行
}, function(reason){
    // resoon === "Error!"
})
```
现在我们来对之前调用promise接口的一个用例进行修改，主要针对错误处理部分：
```javascript
var maybeOneOneSecondLater = function(){
    var result = defer();
    setTimeout(function(){
        if(Math.random() < .5){
            result.resolve(1);
        } else {
            result.resolve(reject("Can't provide one"));
        }
    }, 1000);
    return result.promise;
};
```
为了让上述代码生效，我们需要继续对defer进行改造，pending数组的callback要被换成[callback,errback]：
```javascript
var defer = function(){
    var pending = [], value;
    return {
        resolve: function(_value){
            if(pending){
                value = ref(_value);
                for(var i=0, len=pending.length; i < len; i++){
                    // value.then(pending[i][0],pending[i][1]), 不够优雅
                    // 此时pending[i]是[callback,errback]形式的数组，
                    // 故可用apply直接将pending作为参数传入then方法
                    value.then.apply(value, pending[i]);
                }
                pending = undefined;
            }
        },
        promise: {
            then: function(_callback, _errback){
                var result = defer();
                var callback = function(value){
                    result.resolve(_callback(value));
                };
                var errback = function(reason){
                    result.resolve(_errback(reason));
                };
                if(pending){
                    pending.push([callback,errback]);
                } else {
                    value.then(callback, errback);
                }
                return result.promise;
            }
        }
    };
};
```

现在我们的"defer"还有一个值得注意的问题：所有的"then"方法必须传入errback，否则当调用一个不存在的函数时就会抛出异常。有一个最简单的解决方式，就是传入默认的errback来处理rejection的情况。同样的道理，我们也可以传入一个默认的callback方法来处理fulfilled的value值。
```js
var defer = function () {
    var pending = [], value;
    return {
        resolve: function (_value) {
            if (pending) {
                value = ref(_value);
                for (var i = 0, ii = pending.length; i < ii; i++) {
                    value.then.apply(value, pending[i]);
                }
                pending = undefined;
            }
        },
        promise: {
            then: function (_callback, _errback) {
                var result = defer();
                // provide default callbacks and errbacks
                _callback = _callback || function (value) {
                    // by default, forward fulfillment
                    return value;
                };
                _errback = _errback || function (reason) {
                    // by default, forward rejection
                    return reject(reason);
                };
                var callback = function (value) {
                    result.resolve(_callback(value));
                };
                var errback = function (reason) {
                    result.resolve(_errback(reason));
                };
                if (pending) {
                    pending.push([callback, errback]);
                } else {
                    value.then(callback, errback);
                }
                return result.promise;
            }
        }
    };
};
```

现在，我们已经实现了完整的错误传递机制。同时无论是串行方式或是并行方式，我们都能够轻松的从其他promise对象中生成新的promise。再次回到之前的问题，通过promise实现分布式求和：
```javascript
promises.reduce(function(accumulating, promise){
    return accumulating.then(function(accumulated){
        return promise.then(function(value){
            retuen accumulated + value;
        });
    });
}, ref(0)) // 从resolve结果为0的promise开始计算，这样我们可以像其他组合的promise一样调用then方法
            // 有利于代码的一致性
.then(function(sum){
    // sum即为最终的求和结果
})
```
# Step5 -- Safety and Invariants(安全和不可变性)
promise另一个至关重要的改进是确保callbacks和errbacks能够在将来的事件循环中被调用。这将极大的降低异步编程给控制流（control-flow）带来的风险。我们回顾之前的maybeOneOneSecondLater：
```js
var maybeOneOneSecondLater = function (callback, errback) {
    var result = defer();
    setTimeout(function () {
        if (Math.random() < .5) {
            result.resolve(1);
        } else {
            result.resolve(reject("Can't provide one."));
        }
    }, 1000);
    return result.promise;
};
```
可以看到必须将***result.resolve()***的调用放到setTimeout中，实际上就是为了确保resolve调用时，then所传入的callback和errback方法已经注册成功。让我们来再看一个简单的例子：
```js
var blah = function(){
    var result = foob().then(function(){
        return barf();
    });
    var barf = function(){
        return 10;
    };
    return result;
};
```
这个函数最终会抛出一个异常还是返回一个立即为完成状态且值为10的promise，完全取决于foob()函数的是在同一轮事件循环(event loop)中resolve，还是会在下一轮才执行resolve。在前一种情况下resolve时，其then方法还没有注册相应的回调函数，因此会抛出异常；后一种情况时，则会正常执行。如何才能避免出现这类异常呢？我们可以想办法将回调函数(callback)自动延时到下一轮事件循环才执行，此时我们就不必显式的将resove方法的执行放到setTimeout中了。
```js
var enqueue = function (callback) {
    //process.nextTick(callback); // NodeJS
    setTimeout(callback, 1); // Naïve browser solution
};

var defer = function () {
    var pending = [], value;
    return {
        resolve: function (_value) {
            if (pending) {
                value = ref(_value);
                for (var i = 0, ii = pending.length; i < ii; i++) {
                    // XXX
                    enqueue(function () {
                        value.then.apply(value, pending[i]);
                    });
                }
                pending = undefined;
            }
        },
        promise: {
            then: function (_callback, _errback) {
                var result = defer();
                _callback = _callback || function (value) {
                    return value;
                };
                _errback = _errback || function (reason) {
                    return reject(reason);
                };
                var callback = function (value) {
                    result.resolve(_callback(value));
                };
                var errback = function (reason) {
                    result.resolve(_errback(reason));
                };
                if (pending) {
                    pending.push([callback, errback]);
                } else {
                    // XXX
                    enqueue(function () {
                        value.then(callback, errback);
                    });
                }
                return result.promise;
            }
        }
    };
};

var ref = function (value) {
    if (value && value.then)
        return value;
    return {
        then: function (callback) {
            var result = defer();
            // XXX
            enqueue(function () {
                result.resolve(callback(value));
            });
            return result.promise;
        }
    };
};

var reject = function (reason) {
    return {
        then: function (callback, errback) {
            var result = defer();
            // XXX
            enqueue(function () {
                result.resolve(errback(reason));
            });
            return result.promise;
        }
    };
};
```
尽管我们做出了修改，这里还有一个安全问题---任意可以执行'then'方法的对象都被看作是一个promise对象，这会让直接调用'then'方法出现一些意外的情况：
- callback和errback方法可能在同一个循环中被调用
- callback和errback方法可能同时被调用
- callback或者errback方法可能会被多次调用

我们通过'when'方法来包裹一个promise对象，并且阻止上述意外情况的发生。此外我们也可以就此对callback和errback进行封装来使得异常情况的抛出被转移到rejection中：

```js
var when = function (value, _callback, _errback) {
    var result = defer();
    var done;

    _callback = _callback || function (value) {
        return value;
    };
    _errback = _errback || function (reason) {
        return reject(reason);
    };

    var callback = function (value) {
        try {
            return _callback(value);
        } catch (reason) {
            return reject(reason);
        }
    };
    var errback = function (reason) {
        try {
            return _errback(reason);
        } catch (reason) {
            return reject(reason);
        }
    };

    enqueue(function () {
        ref(value).then(function (value) {
            if (done)
                return;
            done = true;
            result.resolve(ref(value).then(callback, errback));
        }, function (reason) {
            if (done)
                return;
            done = true;
            result.resolve(errback(reason));
        });
    });

    return result.promise;
};
```
这样我们就成功阻止了上述意外情况的发生，提高了promise的安全性和不可变性。


