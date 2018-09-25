# Iterators和Symbols

一个数值集合的迭代是一个老生常谈的问题，但在过去我们在程序中遍历元素是非常累赘的。本章将学习新的循环方法，使迭代变得简洁和愉悦。

我们还会学习到`Symbols`，一个新加入的基础数据类型，并看一看它是如何弥补过去JS中的一些空白的。最后我们将使用`generators`并看到其是如何创建一个无限序列的，

## 增强了的`for`

过去我们要循环一个数组可能会像这样写：
```js
const names = ['Sara', 'Jake', 'Pete', 'Mark', 'Jill'];
for(let i = 0; i < names.length; i++) {
    console.log(names[i]);
}
```
返回同样是：
```
Sara
Jake
Pete
Mark
Jill
```
毫无疑问，`for`循环是无比强大的。我们可以用它实现向前和向后迭代，并在任意时间退出循环，甚至可以将步长设置为2，等等。但在大多数情况下我们只需要实现简单的向前迭代，这是就显得比较繁琐了。

### 简单遍历元素

若只是简单遍历元素，可以用如下方式：
```js
const names = ['Sara', 'Jake', 'Pete', 'Mark', 'Jill'];
for(const name of names) {
    console.log(name);
}
```
以上代码和之前实现效果相同，但明显更加简洁。注意，任何可迭代(`iterable`)的对象都可以使用`for...of`。

### 获取Index

传统的`for`循环强制我们使用index变量，尽管我们并不关心这个值。增强`for`循环直接让我们在每一个迭代获取到元素值，但是它并不阻止我们获取index。Array的`entries()`函数返回一个迭代器，该迭代器为索引值和元素值的集合：
```js
const names = ['Sara', 'Jake', 'Pete', 'Mark', 'Jill'];
for(const entry of names.entries()) {
    console.log(entry);
}
```
返回值为:
```
[ 0, 'Sara' ]
[ 1, 'Jake' ]
[ 2, 'Pete' ]
[ 3, 'Mark' ]
[ 4, 'Jill' ]
```
我们可以通过结合解构赋值来更加简洁获取索引和元素值:
```js
const names = ['Sara', 'Jake', 'Pete', 'Mark', 'Jill'];
for(const [i, name] of names.entries()) {
    console.log(i + '--' + name);
}
```
结果为:
```
0--Sara
1--Jake
2--Pete
3--Mark
4--Jill
```
这里不强迫我们处理index，且由于这里使用const，避免了i被更改的风险。

`entries()`方法返回一个迭代器，但是JS依赖`Symbols`的特殊方法实现迭代。接下来我们将深入了解这个新的基本类型。

## Symbol--一个新的基本类型

JS此前的基本类型包括:`number`,`string`,`boolean`,`null`以及`undefined`；现在又多了个`Symbol`。`Symbols`可以用在以下三个用途:

- 为对象定义属性，这些属性不在普通的迭代中出现---这些属性不是私有的，仅仅只是不想其他那些属性一样可以轻易被发现。

- 轻松定义一个全局注册值或字典对象。

- 用于定义对象中一些特殊且众所周知的对象；这个特性填补了JS接口的空白，这也是`Symbol`最重要的一个意图。

### 隐藏属性

直到`Symbol`出现以前，使用`for...in`，遍历对象时所有属性都是可见的。`Symbol`改变了这一状况，`Symbol`属性在迭代时是不可见的。举个例子：
```js
const age = Symbol('ageValue');
const email = 'emailValue';
const sam = {
    first: 'Sam',
    [email]: 'sam@example.com',
    [age]: 2
};

console.log('iterating over properties:');
for(const property in sam) {
    console.log(property + ' : ' + sam[property]);
}
console.log('list of property names:');
console.log(Object.getOwnPropertyNames(sam));
```
输出为：
```
iterating over properties:
first : Sam
emailValue : sam@example.com
list of property names:
[ 'first', 'emailValue' ]
```

尽管`Symbol`属性在普通迭代中是隐藏的，但是它却不是私有的，我们可以通过`Object's getOwnPropertySymbols()`方法来获取所有`Symbol`属性：
```js
console.log('list of symbol properties');
console.log(Object.getOwnPropertySymbols(sam));

console.log('accessing a symbol property:');
console.log(sam[age]);

console.log('changing value...');
sam[age] = 3;
console.log(sam[age]);
```
结果为:
```
list of symbol properties
[ Symbol(ageValue) ]
accessing a symbol property:
2
changing value...
3
```
`getOwnPropertySymbols()`方法将返回`Symbols`数组。

接下来试验一下使用`Symbols`构建对象:

```js
const regex = /cool/;

process.stdout.write('regex is of type RegExp: ');
console.log(regex instanceof RegExp);

process.stdout.write('Properties of regex: ');
console.log(Object.getOwnPropertyNames(regex));

process.stdout.write('Symbol properties of regex: ');
console.log(Object.getOwnPropertySymbols(regex));

console.log("Symbol properties of regex's prototype: ");
console.log(Object.getOwnPropertySymbols(Object.getPrototypeOf(regex)));
```
结果为:
```
regex is of type RegExp: true
Properties of regex: [ 'lastIndex' ]
Symbol properties of regex: []
Symbol properties of regex's prototype:
[ Symbol(Symbol.match),
    Symbol(Symbol.replace),
    Symbol(Symbol.search),
    Symbol(Symbol.split) ]
```
这个小实验我们发现`RegExp`有一些`Symbol`属性。这些属性就是一些特殊方法，我们接下来将了解怎样运用这些方法来解决具体问题。

### 全局注册

我们使用`Symbol()`函数来创建一个`Symbol`，看下面的例子:

```js
const name = 'Tom';
const tom = Symbol(name);
const jerry = Symbol('Jerry');
const anotherTom = Symbol(name);

console.log(tom);
console.log(typeof(tom));
console.log(tom === jerry);
console.log(tom === anotherTom);
```
输出：
```
Symbol(Tom)
symbol
false
false
```
可以看出，所有的`Symbol`都是独一无二的。

当使用`Symbol.for()`创建一个`Symbol`时情况会有一些不同。`for()`方法使用一个`key`作为参数，如果已存在，则创建一个`Symbol`，若已存在，则返回原有的`Symbol`，举个例子:
```js
const masterWizard = Symbol.for('Dumbledore');
const topWizard = Symbol.for('Dumbledore');

console.log(typeof(masterWizard));
console.log(masterWizard);
console.log(masterWizard === topWizard);

console.log('Dumbledore' === Symbol.keyFor(topWizard));
```
第一个使用了`Symbol.for()`创建一个`Symbol`，并赋值给常量`masterWizard`。接下来重复同样过程，但赋值给里一个变量`topWizard`。最后一行使用`keyFor()`，并传入`topWizard`。与`Symbol()`函数不同，传入`for()`的参数代表一个独一无二的`key`，对应于已创建或全局注册的`Symbol`。在本例中，第一个`for()`创建了一个新的`Symbol`实例，而第二个则是获取的第一次调用时全局注册的`Symbol`。`keyFor()`的调用则返回关联注册表中`Symbol`的实例。由以下输出结果可以论证上述文字:
```
symbol
Symbol(Dumbledore)
true
true
```

### 特定的众所周知的Symbols

在像Java和C#这样的语言中，我们希望不同的类可以通过接口(interfaces)来相互协作使用。JS没有遵从在这些传统，它的约定更加的松散和随意。如果一个类希望其他类有某个方法，它将简单的希望找到这个方法。但这样简单的机制容易导致错误，例如当这个方法不存在时，或这个方法名写法有出入，等等。


由于`Symbol`是独一无二的，与其希望一个类实现`myWonderfulMethod`，不如希望其实现`[Symbol.for('myappname.myWonderfulMethod')] `，这是不会出现含糊不清的问题。

JS已经存在很多众所周知的`Symbols`，例如`Symbol.iterator`, `Symbol.match`, `Symbol.replace` 和 `Symbol.search`。一些函数或方法希望类能够实现这些方法，并将其实例作为参数传递进来。

其中一个例子就是字符串的`search()`方法。如果传入的参数不是`RegExp`的实例，它将使用传入的参数作为构造函数的参数，并创建一个`RegExp`。然而只有当传入的参数没有提供名为`Symbol.search`的方法时，上述文字才是正确的。如果实现了该方法，这个方法将被用于进行查询。举个例子来证明:
```js
class SuperHero {
    constructor(name, realName) {
        this.name = name;
        this.realName = realName;
    }
    toString() { return this.name; }
    [Symbol.search](value) {
        console.info('this: ' + this + ', value: ' + value);
        return value.search(this.realName);
    }
}
```
接下来我们写下调用部分:
```js
const superHeroes = [
    new SuperHero('Superman', 'Clark Kent'),
    new SuperHero('Batman', 'Bruce Wayne'),
    new SuperHero('Ironman', 'Tony Stark'),
    new SuperHero('Spiderman', 'Peter Parker') ];

const names = 'Peter Parker, Clark Kent, Bruce Wayne';
for(const superHero of superHeroes) {
    console.log(`Result of search: ${names.search(superHero)}`);
}
```
输出结果表明，`SuperHero`类中定义的特殊方法在执行`names`的`search()`时被调用：
```
this: Superman, value: Peter Parker, Clark Kent, Bruce Wayne
Result of search: 14
this: Batman, value: Peter Parker, Clark Kent, Bruce Wayne
Result of search: 26
this: Ironman, value: Peter Parker, Clark Kent, Bruce Wayne
Result of search: -1
this: Spiderman, value: Peter Parker, Clark Kent, Bruce Wayne
Result of search: 0
```
此外，这里的`this`在`console.info('this: ' + this + ', value: ' + value);`中的`this`默认会调用`toString()`方法，因此这里返回为`this.name`。

## 使用自定义迭代器和生成器

JS中的内置集合，例如:`Array`,`Set`和`Map`，都是迭代器，我们可以通过`for`循环进行遍历。但是队医用户自定义的类呢？比如我们创建一个`Car`类，并且希望用户能够迭代他的轮子，门，等等。现在，JS让这些都变得不再是问题。

我们不能在一个实例中迭代，例如：
```js
class CardDeck {
    constructor() {
        this.suitShapes = ['Clubs', 'Diamonds', 'Hearts', 'Spaces'];
    }
}

const deck = new CardDeck();

for(const suit of deck) {
    console.log(suit);
}
```
`CardDeck`类中有一个属性命名为`suitShapes`，存储了字符串数组对象。结果不出意外:
```
for(const suit of deck) {
                    ^
TypeError: deck is not iterable
```
错误明确的告诉我们deck不可迭代。

### 执行一个迭代器

为了让`CardDeck`的实例能够迭代，我们需要创建一个方法提供迭代器服务。举个例子：
```js
class CardDeck {
    constructor() {
        this.suitShapes = ['Clubs', 'Diamonds', 'Hearts', 'Spaces'];
    }

    [Symbol.iterator]() {
        let index = -1;
        const self = this;
        return {
            next() {
                index++;
                return {
                    done: index >= self.suitShapes.length,
                    value: self.suitShapes[index]
                };
            }
        };
    }
}
```
通过执行名为`[Symbol.iterator]`的特殊的方法，我们实现了一个迭代器。JS在使用实例作为迭代器时，会在该实例中寻找此方法。但这份代码还是太冗长了，包含了过多的嵌套。有没有什么方法能将其变得简洁呢？答案是`generators`，这在时候将会讨论。

现在，让我们先深入理解`[Symbol.iterator]`方法。

首先，写下两行代码：
```js
let index = -1;
const self = this;
```
这里只是简单定义了两个初始值。返回值是一个对象，迭代器方法`for...of`将会检查返回值对象，并找到其中的`next()`

