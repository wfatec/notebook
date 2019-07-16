# supervisor

有时我们的 web 应用可能会随着操作系统的重启或程序崩溃而意外停止，这时如果始终由运维人员手动重启会造成严重的滞后问题，进而影响公司的正常运营，带来严重的经济损失。**supervisor** 就是为了解决这一痛点而存在的，即使系统进行了重启，一旦 web 服务被终止，它将自动重启服务。

## 安装

- mac 系统：

```
brew install supervisor
```

- Ubuntu 16.04:

```
sudo apt-get install -y supervisor
```

其它系统请自行查阅[官网教程](http://supervisord.org/)。

> 由于本人使用的是 mac ，因此将以此环境为例进行介绍。

## 配置

为了便于说明，这里简单用 go 实现了一个 web 服务，并已经进行了 `install` 我们可以直接在 `$GOPATH` 下的 bin 文件夹下找到编译后的可执行文件 `romanserver`。

- 创建配置文件 `/etc/supervisor/conf.d/goproject.conf`

- 在配置文件中增加配置项：

```conf
[supervisord]
logfile = /tmp/supervisord.log

[program:myserver]              # myserver 是需要管理的进程的名字
command=/[$GOPATH]/bin/romanserver # 需要执行的命令
autostart=true                  # 设置自动开启,开启supervisor时进程就开启了
autorestart=true                # 设置自动重启,进程终止后自动重启
```

其中 `[supervisord]` 区块定义 log 文件的地址，`[program:myserver]` 则是 task 区块，将转移到指定的目录去执行给定的命令。

**注意**：要使配置文件生效,需要将自己的配置文件路径包含到 supervisor 的配置当中。这个配置在不同系统下位置有所区别，在 mac 下为 `/usr/local/etc/supervisord.ini`。

修改 `supervisord.ini` 将最下方 `[include]` 字段修改为:

```conf
[include]
files = /etc/supervisor/conf.d/*.conf
```

## 执行

通过 `supervisorctl` 重新读取配置文件并重启 tasks(proccess)。

- supervisorctl reload
- supervisorctl update

最后执行：

- supervisorctl

结果如下：

![image](./assets/supervisorctl.png)

## 常用命令

```conf
supervisorctl status #查看所管理的进程状态
# 在修改好配置文件之后使用下面两个命令进行更新
supervisorctl reread  
supervisorctl update
#重新启动配置中的所有程序
supervisorctl reload  
启动某个进程(program_name=你配置中写的程序名称)
supervisorctl start program_name  
查看正在管理的进程
supervisorctl  
# 停止某一进程 (program_name=你配置中写的程序名称)
supervisorctl stop program_name  
# 停止全部进程
supervisorctl stop all  
```

## 常见的错误

请参考 [supervisor常见报错](https://blog.csdn.net/kkevinyang/article/details/80539940)

基本解决了我所遇到的问题～
