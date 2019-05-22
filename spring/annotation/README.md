# 常用的注解

其实单纯说注解，注解本身没有任何的作用。简单说和注释没啥区别，而它有作用的原因是：注解解释类，也就是相关对代码进行解释的特定类。一般这些类使用反射是可以拿到的。

因此，通过注解和反射这两者的结合使用，是可以做到很多功能的。现在很多框架尤其是`Spring`都是使用了注解。如果再深入的看一看源码就会发现，很多注解是和反射一起使用的。下面我们将对`Spring`当中常用的注解进行归纳，从而有一个直观的认识。

<!-- TOC -->

- [常用的注解](#常用的注解)
    - [Java Config 相关注解](#java-config-相关注解)
        - [@Configuration](#configuration)
        - [@ImportResource](#importresource)
        - [@ComponentScan](#componentscan)
        - [@Bean](#bean)
        - [@ConfigurationProperties](#configurationproperties)

<!-- /TOC -->

## Java Config 相关注解

### @Configuration

用于定义配置类，可替换xml配置文件，被注解的类内部包含有一个或多个被`@Bean`注解的方法，这些方法将会被`AnnotationConfigApplicationContext`或`AnnotationConfigWebApplicationContext`类进行扫描，并用于构建`bean`定义，初始化`Spring`容器。[参考](https://www.cnblogs.com/duanxz/p/7493276.html)

### @ImportResource

在`spring`里是用在`@configuration`注解的配置类里，读取应用的`xml`配置信息加载进上下文，所有的`bean`和其他属性中定义的应用程序的`xml`都可以导入。

### @ComponentScan

定义扫描的路径从中找出标识了需要装配的类自动装配到`spring`的`bean`容器中

### @Bean

被`@Configuration`注解的类内部包含有一个或多个被`@Bean`注解的方法，这些方法将会被`AnnotationConfigApplicationContext`或`AnnotationConfigWebApplicationContext`类进行扫描，并用于构建`bean`定义，初始化`Spring`容器。

### @ConfigurationProperties

是`spring`里用来读取`properties`文件的数据并自动配置该注解类的属性。