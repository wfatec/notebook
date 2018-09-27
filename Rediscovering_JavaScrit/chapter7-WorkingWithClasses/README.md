# 使用Classes

在过去，JS也存在面向对象的用法，但却由于其基于原型链的实现且没有明确的类的声明，导致一直以来其面向对象的特性不被大多数人所认可。ES6新增的class语法弥补了这一缺憾，为我们提供了更好的开发体验，且语义上也更为清晰。

## 创建一个类

### 旧方法

通过构造函数实现，通常首字母大写来区分普通函数和构造函数：

```js
function Car() {
    this.turn = function(direction) { console.log('...turning...'); }
}
```

或者：

```js
function Car() {}

Car.prototype.turn = function(direction) { console.log('...turning...'); }
```

或者：

```js
function Car() {}

Car.turn = function(direction) { console.log('...turning...'); }
```

每种方法都有各自的问题，并且有多种途径定义函数给开发者带来了额外的负担，且容易产生错误。

另一个问题是，没有什么办法能阻止将`new`放到一个函数前的行为，例如：`new car()`，或者将构造函数当成普通函数触发，例如：`Car()`。目前通常的做法是通过写入额外的判断逻辑来解决这些问题，额不是JS本身会抛出错误。

那么继承呢？我们如何来重写方法？我们是否使用

```js
this.__proto__.foo.apply(this, arguments);
```

方法来调用基类的方法？编写这样的代码语义不清且易出错。

### 使用新语法

定义一个`Car`类：

```js
class Car {}

console.log(Car);
```

看起来非常简洁且语义清晰。但是尽管使用`class`语法，我们实际上还是创建了一个函数，一个只能用`new`调用的函数。输出结果为：

```
[Function: Car]
```

虽然`class`语法实际上还是定义了一个函数，但如果我们像普通函数那样调用，则会得到一个错误：

```js
Car(); //BROKEN CODE
^

TypeError: Class constructor Car cannot be invoked without 'new'
```

此外，不像`function Car()`语法，`class Car`不会导致声明提升，即类的定义不会移动到文件或函数的最上放。因此，下面的代码是无效的：

```js
new Car(); //BROKEN CODE

class Car {}
```

抛出错误：

```
ReferenceError: Car is not defined
```

但是，如果类的定义出现在具体执行流之前，则不会出错：

```js
const createCar = function() {
    return new Car();
};

class Car {}

console.log(createCar());
```

## 执行Constructor

如果想在实例化时执行一些操作，则需要定义一个明确的构造器。

让我们检查一下默认构造器：

```js
class Car {}

console.log(Reflect.ownKeys(Car.prototype));
```

我们使用了`Reflect`类的`ownKeys()`方法来检查`Car`类原型对象的属性，结果为：

`[ 'constructor' ]`

我们可以为构造器提供具体的执行过程：

```js
class Car {
    constructor(year) {
        this.year = year;
    }
}

console.log(new Car(2018));
```

输出为：

```
Car { year: 2018 }
```

注意，只有在初始化时需要执行具体操作时，才需要定义构造函数，否则使用默认构造函数即可。

## 定义一个方法

定义一个方法时，函数体需要用`{}`包裹，但是不需要加上`function`关键字。

```js
class Car {
    constructor(year) {
        this.year = year;
        this.miles = 0;
    }

    drive(distance) {
        this.miles += distance;
    }
}
```

## 定义计算成员

有时候我们需要为类的成员赋予动态名称，例如属性名和方法名。

```js
const NYD = `New Year's Day`;

class Holidays {
    constructor() {
        this[NYD] = 'January 1';
        this["Valentine's Day"] = 'February 14';
    }
    
    [
        'list holidays']() {
            return Object.keys(this);
    }
}
```

除了在类的内部定义方法或属性，我们还可以在实例上进行添加：

```js
const usHolidays = new Holidays();
usHolidays['4th of July'] = 'July 4';
```

## 新建属性

假设我们想知道车的使用年数，其生产日期早初始化时获取，我们通过`getAge()`方法来获取具体使用时间：

```js
getAge() {
    return new Date().getFullYear() - this.year;
}
```

调用方法为：

```js
const car = new Car(2007);

console.log(car.getAge());
```

这样的代码可以生效，但是`getAge()`是Java风格的`getter`，C#开发者写属性而不是`getter`方法。JS现在提供了同样的能力。一个属性可以有一个`getter`，一个`setter`，或者两者都有。如果一个属性是有`getter`，则它是一个只读属性，现在我们将注意力先放到`getter`上。

如果一个方法仅仅只有类似`getter`的行为，那么将它作为一个只读属性而不是一个方法。现在让我们把`getAge()`转化为一个属性：

```js
get age() {
    return new Date().getFullYear() - this.year;
}
```

这个`getter`属性使用`get`关键字，后接属性名称`name`。如果忽略`get`关键字，则和普通的类方法`age()`没什么区别。注意，此时我们不能调用`age()`，因为它不是一个方法，我们必须直接使用这个属性名，像这样：

```js
console.log(car.age);
car.age = 7;
```

当`car.age`被用于表达式中时，JS将会调用函数体中的`get age()`。

如果将`car.age`放到赋值语句的左边，JS会寻找`set age(value)`。由于这个属性没有`setter`，JS会忽略该赋值语句。如果我们使用`'use strict';`-- 则会抛出错误：`Cannot set property age
of #<Car> which has only a getter`。

让我们在`Car`中创建一个读写属性：

```js
get distanceTraveled() { return this.miles; }

set distanceTraveled(value) {
    if(value < this.miles) {
        throw new Error(
        `Sorry, can't set value to less than current distance traveled.`);
    }

    this.miles = value;
}
```

接下来测试一下我们的代码：

```js
const car = new Car(2007);
car.drive(10);

console.log(car.distanceTraveled);

car.distanceTraveled = 14;
console.log(car.distanceTraveled);

try {
    car.distanceTraveled = 1;
} catch(ex) {
    console.log(ex.message);
}
```

结果为：

```
10
14
Sorry, can't set value to less than current distance traveled.
```

setter属性主要用于一些属性更改前的检验和认证。

## 定义类方法

当创建一个抽象时，我们经常需要使用一些方法，而这些方法可能与具体实例无关。类方法，而非实例方法，就是用于这个时候。

JS通过`static`关键字，让一切变得很简单。

首先我们在类中增加一个属性：

```js
Car.distanceFactor = 0.01; //This goes outside class Car {...}
```

我们也可以定义一个属性`getter`：

```js
static get ageFactor() { return 0.1; }
```

静态`getter`，静态`setter`或静态方法中的`this`是动态的，它不指向类的实例。当类中的静态成员在类上被调用时，`this`指向这个类，当时当`this`绑定到其他对象时，就不再指向这个类了。

最后，定义一个`static`方法：

```js
static pickBetter(carA, carB) {
    const computeScore = car =>
        car.age * Car.ageFactor + car.distanceTraveled * Car.distanceFactor;

    return computeScore(carA) < computeScore(carB) ? carA : carB;
}
```

测试一下：

```js
const car1 = new Car(2007);
car1.drive(150000);

const car2 = new Car(2010);
car2.drive(175000);

console.log(Car.pickBetter(car1, car2));
```

注意，金泰方法不能通过实例对象调用。

## 类表达式

类表达式在运行时动态创建类时非常有效。类表达式和类声明的主要区别有两个：

1. 类的名称对于类表达式来说是可选项，而对于类声明确实必要的

2. 类表达式应该被看作一个表达式，也就是说它应该被返回，并传递给另一个函数，或者存到一个变量中

来看一个例子：

```js
const createClass = function(...fields) {
    return class {
        constructor(...values) {
            fields.forEach((field, index) => this[field] = values[index]);
        }
    };
};
```

`createClass()`类似一个工厂函数，用于动态创建一个类。

我们可以在接收端赋任何的名称：

```js
const Book = createClass('title', 'subtitle', 'pages');
const Actor = createClass('firstName', 'lastName', 'yearStarted');
```

当获取到类创建后的引用之后，我们就可以像类声明定义的类一样进行使用：

```js
const fisher = new Actor('Carrie', 'Fisher', 1969);
console.log(fisher);
```

输出：

```
{ firstName: 'Carrie', lastName: 'Fisher', yearStarted: 1969 }
```

由于我们的类在创建时没有给予名称，因此实例的输出看起来像是一个JS对象。

在很少的情况下，你可能发现对类表达式定义的类命名是有意义的，比如下面的情况：

```js
const Movie = class Show {
    constructor() {
        console.log('creating instance...');
        console.log(Show);
    }
};

console.log('Movie is the class name');
console.log(Movie);
const classic = new Movie('Gone with the Wind');

try {
    console.log('however...');
    console.log(Show);
} catch(ex) {
    console.log(ex.message);
}
```

名称`show`只在类内部可见，在外部只能通过`Movie`来找到累的引用。输出：

```
Movie is the class name
[Function: Show]
creating instance...
[Function: Show]
however...
Show is not defined
```

## 内置类:Set,Map,WeakSet,和WeakMap

