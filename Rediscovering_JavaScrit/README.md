[TOC]

# 重新认识JavaScript

不知不觉从事前端工作学习两年多了，对前端也从原来的一无所知走到现在的上下求索，不经有些感慨。短短的两年时间里，似乎自己完整的经历了前端技术大发展的浪潮，从开始的Jquery到部分引入vue，又到现在的React和工程化构建，开发模式一变再变，固然期间增加了很多学习成本，但仍感幸甚至哉，为自己没有错过这些精彩而痛并快乐着。而在这些发展的背后，不知不觉经历了从ES5到ES6的变迁，对于JS的认识却还没有一个系统梳理，还是停留在ES5时代，有幸读到一本书`Rediscovering JavaScript`，恰好弥补了这方面的不足，在此分享一些收获和体会，与君共勉！

## Javascript陷阱

JS非常强大，但有时候也会给我们带来一些小惊喜，ES6本质上还是基于ES5实现的，因此一些历史残留问题依然存在，下面对这些"惊喜"进行一些梳理，让大家有一个清晰的认识，避免一些意外的问题。

### 换行需谨慎

事实上，绝大多数动态语言对于分号的使用都是一个可选项，但JS却不是这样，并且对于JS来说，有些地方的分号是建议省略，而有些地方却是必须的，而这些必须加入分号的地方若是没有出现分号，JS也不会报错。

为了避免这些问题，我们首先需要理解JS的**自动分号插入(ASI)**规则。

一个有效的程序以一个`;`结尾，如果给定的脚本最后没有`;`，则JS会自动插入一个`;`。

由于是从左向右解析，如果遇到一个意料之外的符号，且一个换行符将其与之前的符号分割开，这时就会自动在这个意外的符号之前插入`;`。举个例子：
```js
//BROKEN CODE
const unexpected = function() {
    let first
    second = 1;
    console.log(first);
    console.log(second);
}
unexpected();
console.log(second);
```
代码中符号`second`不应该出现在`first`之后，因此当出现换行时，JS自动在`first`之后插入了`;`。这时`second`就成了全局变量，结果输出为:
```
undefined
1
1
```

如果候选符号是`break,continue,return,throw,yield`，并且在候选符号和后续符号之间有一个换行符，这是JS也会自动在候选符号后插入`;`。举个例子：
```js
//BROKEN CODE
const compute = function(number) {
    if(number > 5) {
        return number
        + 2;
    }

    if(number > 2) {
        return
        number * 2; 
    }
};

console.log(compute(6));
console.log(compute(3));
```
由于第二个`return`后面跟着的是换行符，JS会在其后面自动插入`;`，因此最终返回结果为：
```
8
undefined
```
再来看一下第一个`return`，尽管这一行也没有`;`，但是`+`跟在`number`后面是合法的，因此不会自动在`number`之后插入`;`。如果将`+ 2`改为`2`，那么`2`在`number`之后就是不合法的，JS就会自动插入`;`，结果为`6`而不是抛出错误。