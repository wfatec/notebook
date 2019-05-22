# 常用的注解

其实单纯说注解，注解本身没有任何的作用。简单说和注释没啥区别，而它有作用的原因是：注解解释类，也就是相关对代码进行解释的特定类。一般这些类使用反射是可以拿到的。

因此，通过注解和反射这两者的结合使用，是可以做到很多功能的。现在很多框架尤其是`Spring`都是使用了注解。如果再深入的看一看源码就会发现，很多注解是和反射一起使用的。下面我们将对`Spring`当中常用的注解进行归纳，从而有一个直观的认识。

<!-- TOC -->

- [常用的注解](#常用的注解)
    - [Java Config 相关注解](#java-config-相关注解)
    - [与`Bean`定义相关的注解](#与bean定义相关的注解)
    - [注入相关注解](#注入相关注解)

<!-- /TOC -->

## Java Config 相关注解

- **@Configuration**: 用于定义配置类，可替换xml配置文件，被注解的类内部包含有一个或多个被`@Bean`注解的方法，这些方法将会被`AnnotationConfigApplicationContext`或`AnnotationConfigWebApplicationContext`类进行扫描，并用于构建`bean`定义，初始化`Spring`容器。[参考](https://www.cnblogs.com/duanxz/p/7493276.html)

- **@ImportResource**: 在`spring`里是用在`@configuration`注解的配置类里，读取应用的`xml`配置信息加载进上下文，所有的`bean`和其他属性中定义的应用程序的`xml`都可以导入。

- **@ComponentScan**: 定义扫描的路径从中找出标识了需要装配的类自动装配到`spring`的`bean`容器中

- **@Bean**: 被`@Configuration`注解的类内部包含有一个或多个被`@Bean`注解的方法，这些方法将会被`AnnotationConfigApplicationContext`或`AnnotationConfigWebApplicationContext`类进行扫描，并用于构建`bean`定义，初始化`Spring`容器。

- **@ConfigurationProperties**: 是`spring`里用来读取`properties`文件的数据并自动配置该注解类的属性。

## 与`Bean`定义相关的注解

- **@Component**: 最普通的组件，可以被注入到`spring`容器进行管理

- **@Repository**: 作用于持久层

- **@Service**: 作用于业务逻辑层

- **@Controller**: 作用于表现层

- **@RestController**: 将方法返回的对象直接在浏览器上展示成`json`格式，而如果单单使用`@Controller`会报错，需要`ResponseBody`配合使用

- **@RequestMapping**: 将 `HTTP` 请求映射到 `MVC` 和 `REST` 控制器的处理方法上


## 注入相关注解

- **@Autowired**: 可以用来装配`bean`. 可以写在字段上,或写在`setter`方法上。默认按类型装配，默认情况下必须要求依赖对象必须存在，如果要允许null值，可以设置它的required属性为false，如：`@Autowired(required=false)` ，如果我们想使用名称装配可以结合`@Qualifier`注解进行使用

- **@Qualifier**: 当你创建多个具有相同类型的 `bean` 时，并且想要用一个属性只为它们其中的一个进行装配，在这种情况下，你可以使用 `@Qualifier` 注释和 `@Autowired` 注释通过指定哪一个真正的 `bean` 将会被装配来消除混乱

- **@Resource**: 可以用来装配`bean`. 可以写在字段上,或写在`setter`方法上，默认按照名称进行装配，名称可以通过name属性进行指定，如果没有指定name属性，当注解写在字段上时，默认取字段名，按照名称查找，如果注解写在setter方法上默认取属性名进行装配。当找不到与名称匹配的bean时才按照类型进行装配。但是需要注意的是，如果name属性一旦指定，就只会按照名称进行装配。

- **@Value**: 将外部的值动态注入到`Bean`中，例如：
    - 注入普通字符串
    - 注入操作系统属性
    - 注入表达式结果
    - 注入其他Bean属性：注入beanInject对象的属性another
    - 注入文件资源
    - 注入URL资源

