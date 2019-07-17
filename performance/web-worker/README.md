# Web Worker

JS 是一个单线程运行环境，如果遇到一些消耗 cpu 资源比较多的操作时，难免会对性能造成一定的影响，因此我们一般会使用 `setTimeout` 之类的方法实现、多线程的效果。但这种方式实际上是一种伪多线程。

实际上，我们现在有了一个更好的方式来实多线程运行，那就是 **Web Worker**。关于 Web Worker 的入门知识，可以参考阮老师的[Web Worker 使用教程](http://www.ruanyifeng.com/blog/2018/07/web-worker.html)。使用起来并不难，快试试吧～