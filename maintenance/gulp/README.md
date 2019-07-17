# Gulp

Gulp 对于大前端领域来讲已经称得上是大名鼎鼎工作流管理工具了，虽然这几年由于 webpack 的兴起，有一定的下滑，但在特定的场景下仍是无可匹敌的。事实上，Gulp 并不仅仅可以管理 JS 或 NodeJS 项目，对于其它语言的项目同样可以使用 Gulp 来进行工作流的管理，下面我将以 Golang 项目为例进行简单的实践。

## 安装

安装 Gulp 主要有全局安装和局部安装两种方式，由于 npx 的出现，我们完全可以抛弃全局安装的方式，从而实现更好的依赖管理。在安装前需要确保本地安装了 node 环境，可以通过`node --version`进行查看，我当前的 node 版本为 `v10.8.0` 仅供参考。

在项目根目录下执行如下命令：

```
npm install gulp
```

安装完成后会在当前目录生成`package.json`文件以及`node_modules`文件夹，具体含义可以自行查阅，这里就不赘述了。

此外，由于我们需要执行 shell 来执行相关命令，因此还需要安装 `gulp-shell`：

```
npm install gulp-shell
```

## 配置

加下来我们就要编写 Gulp 的配置文件 `gulpfile.js` ：

```js
const gulp = require("gulp");
const shell = require("gulp-shell");

gulp.task("install-binary", shell.task([
    'go install github.com/wfatec/romanserver'
]));

gulp.task("restart-supervisor", gulp.series("install-binary", shell.task([
    'supervisorctl restart myserver'
])));

gulp.task("watch", () => {
    gulp.watch("./romanserver/*", gulp.series('install-binary', 'restart-supervisor'));
});

gulp.task('default', gulp.series('watch'));
```

**注意**：由于这里使用的是 `Gulp4` 以上的版本，该版本在书写任务队列时，与 `Gulp3` 存在较大差异，例如：

在 Gulp3 中，如果要依次执行一个任务 A，B，C 的任务队列，可以这样做：

```js
gulp.task('A', () => {
  // Do something.
});
gulp.task('B', ['A'], () => {
  // Do some stuff.
});
gulp.task('C', ['B'], () => {
    // Do some more stuff.
});
```

但在 Gulp4 中将会报错：

```
assert.js:85
  throw new assert.AssertionError({
  ^
AssertionError: Task function must be specified
```
在 `Gulp4`中 需要通过 `gulp.series` 和 `gulp.parallel` 来指定依赖任务：

- `gulp.series`：顺序执行
- `gulp.paralle`：并行执行

```js
gulp.task('series-task', gulp.series('A', 'B', 'C', () => {
  // 依次执行 A B C， 之后再进行操作
}));
```

```js
gulp.task('parallel-task', gulp.parallel('A', 'B', 'C', () => {
  // 同时执行 A B C ，之后再进行操作
}));
```

## 执行

在终端执行：

```
npx gulp
```

结果为：

![gulpresult.png](./assets/gulpresult.png)

可见，每次修改 `romanserver` 下的文件时，都会执行我们配置好的工作流，实现了开发过程中的自动化构建流程