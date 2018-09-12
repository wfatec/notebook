# Bit运算

## Get Bit

我们知道在计算机程序中，数字都是以二进制的形式来存储的，因此，位运算相对来说运行效率是最高的。
问题：实现一个函数getBit，输入数据number和位置bitPosition，返回二进制数在该位置上的值。
思路：将number右移到bitPosition所在位置，然后将此时的number与1进行与(&)运算，结果即为所求值
实现：

```js
/**
 * @param {number} number 
 * @param {number} bitPosition 
 */

var getBit = function(number,bitPosition){
    var shiftRight =  number >> bitPosition;
    return shiftRight & 1;
}
```

## Set Bit

问题：实现一个函数getBit，输入数据number，位置bitPosition，设定值setvalue，返回更新后的值。
实现:

```js
/**
 * @param {number} number 
 * @param {number} bitPosition 
 * @param {number} setValue 
 */

var setBit = function(number,bitPosition,setValue){
    if (setValue===0) {
        return number & ~(1<<bitPosition)
    } else {
        return number | (1<<bitPosition)
    }
}
```

## 乘2

```js
/**
 * @param {number} number 
 */

var multiplyBy2 = function(number){
    return number << 1
}
```

## 除2

```js
/**
 * @param {number} number 
 */

var divideBy2 = function(number){
    return number >> 1
}
```

## 取整

两次进行否运算得到数值本身，并且利用位运算对小数运算时，会自动转换为整数，两次取反即可得到整数，这是所有取整方法最快的一种。

```js
/**
 * 
 * @param {number} number 
 */

var integeral = function(number){
    return ~~number
}
```

或者

```js
/**
 * 下面三种方法都可以快速取整
 * @param {number} number 
 */

var integeral1 = function(number){
    return number^0
}
var integeral2 = function(number){
    return number<<0
}
var integeral2 = function(number){
    return number>>0
}
```

> [参考](https://www.jianshu.com/p/53ad79b0b6ee)

## 数值交换

```js
var num1=121;
var num2=232;
num1^=num2,num2^=num1,num1^=num2;//num1=232,num2=121
```

> [位运算](https://www.jianshu.com/p/53ad79b0b6ee)
> [2的补码](http://www.ruanyifeng.com/blog/2009/08/twos_complement.html)

## 符号切换

问题：输入一个整数，仅改变并输出该数的符号

```js
/**
 * @param {number} number 
 */

var switchSign = function(number){
    return ~number+1
}
```

## 两数相乘

问题：两数相乘时，我们可以将其中一个数分解为2的倍数相加，如：

```js
19 = 2^4 + 2^1 + 2^0
```

这时我们就可以运用位移运算的方式将乘法简化成多个位移结果的相加，提升计算效率。

## 计算set位的个数

问题：判断输入二进制数中set位的个数：

```js
Number: 5 = 0b0101
Count of set bits = 2
```

思路： 将输入值和1进行与运算，后依次右移输入值，直到输入值为0时退出

## 判断2的幂

思路：若输入值为number,number&(number-1)值为0，则number为2的幂。

```js
Number: 4 = 0b0100
Number: 3 = (4 - 1) = 0b0011
4 & 3 = 0b0100 & 0b0011 = 0b0000 <-- Equal to zero, is power of two.

Number: 10 = 0b01010
Number: 9 = (10 - 1) = 0b01001
10 & 9 = 0b01010 & 0b01001 = 0b01000 <-- Not equal to zero, not a power of two.
```