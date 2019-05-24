<!-- TOC -->

- [代码优化](#代码优化)
    - [API 管理](#api-管理)
    - [巧用concat](#巧用concat)
    - [利用 bind 实现柯里化](#利用-bind-实现柯里化)

<!-- /TOC -->

# 代码优化

## API 管理
我们日常的工作中离不开`api`的对接等异步请求，这些`api`请求不但数量众多，而且极易发生异常或错误，因此对`api`的统一管理就显得尤为重要。

首先我们需要将`api`提取到统一的文件夹下，可以将其命名为`API`，然后将不同模块的`api`请求逻辑放到不同的文件下，具体颗粒度由实际情况而定。我们以用户管理模块为例，共有两个接口`login`和`logout`，实际还可能包括用户信息查询等接口，这里不再赘述。由于这些接口具有一定的关联性，我们可以将其放到同一个类`User`中(为什么不用对象的方式我们待会再说)。这样我们就能将`login`和`logout`作为类的静态方法存储于类中，之所以用静态方法是为了避免实例化。具体如下：
```js
export class User {
	static async login(param) {
		return await axios.post("/user/login", param);
	}

	static async logout() {
		return await axios.post("/user/logout");
	}
}
```
看起来似乎还不错，但是事实上异步请求必然存在很多异常和错误的情况，在每个方法中加入错误处理逻辑显然不是我们所希望的，因为这样不但增加了工作量，而且使业务逻辑不够纯粹，难于维护。那么如何引入异常处理逻辑又能和业务逻辑不耦合在一起呢？答案是 --- **修饰器**(decorator)。这也是我不将模块方法以`key: value`的形式保存在对象或函数方法中的原因：**修饰器只能用于类和类的方法，不能用于函数，因为存在函数提升**。

接下来我们来实现修饰器方法`errorCatch`:
```js
function errorCatch(target, key, descriptor) {
	console.log("Decorators errorCatch:", { target, key, descriptor });
	let rawFunc = descriptor.value;
	descriptor.value = async function() {
		let re;
		try {
			re = await rawFunc.apply(this, arguments);
			// 登录失效判断
			if (re && re.data && re.data.code == "LOGIN_NOT") {
				Notification.error({
					title: "登录失效，即将返回登录页"
				});
				setTimeout(() => {
					Notification.closeAll();
					localStorage.clear();
					VUE.$router.push("/login");
				}, 1000);
			}
		} catch (e) {
			let errorTitle, errorMsg;

			if (e.response) {
				//请求已发出
				if (e.response.status)
					errorTitle = `错误代码：${e.response.status}`;
				if (e.response.statusText)
					errorMsg = "错误信息：" + e.response.statusText;
				if (e.response.data.path)
					errorMsg += `<br/>请求地址：${e.response.data.path}`;
			} else if (e.message && e.message.indexOf("timeout") > -1) {
				errorTitle = "请求超时";
			} else {
				errorTitle = "未知错误";
			}
            
            // 错误提示
			Notification.error({
				duration: 0,
				title: errorTitle,
				dangerouslyUseHTMLString: true,
				message: errorMsg ? errorMsg : ""
			});
            
            // 进一步处理逻辑，可省略...
			ErrorCatch(e, { target, key, arguments: arguments });
		}
		return re;
	};

	return descriptor;
}
```
修改`User`类：
```js
export class User {
	@errorCatch
	static async login(param) {
		return await axios.post("/vk/user/login", param);
	}

	@errorCatch
	static async logout() {
		return await axios.post("/vk/user/logout");
	}
}
```

大功告成！大体思路就是这样～

## 巧用concat

在ES6解构赋值大行其道的今天，`concat`的地位越发尴尬，但有时候，灵活的`concat`还是有着不可替代的作用。

**问题描述**:后台在向前端发送相应数据时都常会在只有一条数据时返回一个字典，而有多条数据时返回列表，这就不可避免的需要前端或后台对数据类型进行判断，那么如何避免这样的繁琐处理呢？有没有什么方法能够将数据统一转化为数组而不使用`if`语句呢？

**问题解答**:我们可以使用`concat`将返回的对象或数组传递进来，例如：
```js
const handledArray = [].concat(rowData)
```
此时无论我们的`rowData`是对象还是数组，最终都将统一转化为数组，这样我们就能统一进行处理了，是不是很简洁呢？:)

## 利用 bind 实现柯里化

首先引用`wiki`上对柯里化的解释：**柯里化（英语：Currying），是把接受多个参数的函数变换成接受一个单一参数（最初函数的第一个参数）的函数，并且返回接受余下的参数而且返回结果的新函数的技术**。

而平时我们在使用`bind`方法时，更多的是用来绑定函数的上下文，或者说用来绑定`this`。那么柯里化和`bind`有什么关系呢？

首先我们来看一下`mdn`上对`bind`的语法描述：

> function.bind(thisArg[, arg1[, arg2[, ...]]])

- `thisArg`：这个我们很熟悉，用于绑定`this`

- `arg1, arg2, ...`：在函数调用时，依次传入的参数

显然`arg1, arg2, ...`就是实现柯里化的关键！

举个例子（来自`mdn`）:

```js
function list() {
  return Array.prototype.slice.call(arguments);
}

function addArguments(arg1, arg2) {
    return arg1 + arg2
}

var list1 = list(1, 2, 3); // [1, 2, 3]

var result1 = addArguments(1, 2); // 3

// Create a function with a preset leading argument
var leadingThirtysevenList = list.bind(null, 37);

// Create a function with a preset first argument.
var addThirtySeven = addArguments.bind(null, 37); 

var list2 = leadingThirtysevenList(); 
// [37]

var list3 = leadingThirtysevenList(1, 2, 3); 
// [37, 1, 2, 3]

var result2 = addThirtySeven(5); 
// 37 + 5 = 42 

var result3 = addThirtySeven(5, 10);
// 37 + 5 = 42 , second argument is ignored
```

从上述例子可以看出，`leadingThirtysevenList`和`addThirtySeven`都实现了柯里化的效果，我们在编写代码时，活用`bind`的这一特性，可以让我们的代码更加**优雅**。