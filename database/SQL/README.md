<!-- TOC -->

- [SQL 语法基础](#sql-语法基础)
    - [简单查询](#简单查询)
        - [SELECT 语法规则](#select-语法规则)
        - [去重复行](#去重复行)
        - [排序](#排序)
    - [如何获取更多信息](#如何获取更多信息)
        - [什么是表达式 -- Expression](#什么是表达式----expression)
        - [数据库中的数据类型](#数据库中的数据类型)
        - [修改数据类型：CAST 函数](#修改数据类型cast-函数)
        - [字面量](#字面量)
            - [字符串字面量](#字符串字面量)
            - [数字字面量](#数字字面量)
            - [日期时间字面量](#日期时间字面量)
        - [SQL 表达式](#sql-表达式)
            - [Concatenation 表达式](#concatenation-表达式)
            - [表达式命名](#表达式命名)
            - [Mathematical 表达式](#mathematical-表达式)
            - [Date/Time 表达式](#datetime-表达式)
        - [Null](#null)
    - [参考](#参考)

<!-- /TOC -->

# SQL 语法基础

> 本文是笔者阅读《SQL Queries for Mere Mortals, 4th Edition》之后的一些总结和体会，用于做减法，便于平时查阅，如果对于 SQL 语法还不是很熟悉，那么建议大家读一下本书，相信会有所进益。

## 简单查询

### SELECT 语法规则

```sql
SELECT column_name FROM table_name WHERE SearchCondition GROUP BY column_name HAVING SearchCondition
```

其中 column_name 可以通过逗号隔开，从而匹配多个字段。

### 去重复行

```sql
SELECT DISTINCT column_name FROM table_name
```

### 排序

```sql
SELECT Statement ORDER BY column_name ASC/DESC
```

ASC 为从小到大排序， DESC 为从大到小排序，且 ORDER BY 语法不会改变 table 原本的顺序。

## 如何获取更多信息

### 什么是表达式 -- Expression

> 如果不仅仅要获取简单的列信息，那么你将需要使用表达式。

在很多时候，我们不仅仅只是需要将列的值筛选出来，有时候我们可能需要知道一些额外的信息，例如：

- 数据的总数

- 通过开始时间和结束时间获取时间间隔

- 根据订单估算每小时的成交率

### 数据库中的数据类型

数据库中的数据类型主要有 7 大类：

- **character**: 分为固定长度（`CHARACTER`/`CHAR`）和可变长度（`CHARACTER VARYING`/`CHAR VARYING`/`VARCHAR`），最大字符长度由数据库决定。当字符长度超出系统定义的最大长度时（通常是 255 或者 1,024 个字符），我们需要使用 `CHARACTER LARGE OBJECT`,  `CHAR LARGE OBJECT` 或者是 `CLOB`，在许多系统中，`CLOB` 的别名为 `TEXT` 或 `MEMO`。

- **national character**: 大多数特性与 `character` 类似，主要作用是为了增强 oracle 的字符处理能力，因为 `NCHAR` 数据类型可以提供对亚洲使用定长多字节编码的支持，而数据库字符集则不能。包括 `NCHAR`, `NVARCHAR2`, `NCLOB`。

- **binary**: 使用 `BINARY LARGE OBJECT` 或 `BLOB` 来存储二进制数据，例如图片，音频，视频，或是复杂的嵌入式文件，如 word 等

- **exact numeric**: 确数集合，包括 `NUMERIC`, `DECIMAL`, `DEC`, `SMALLINT`, `INTEGER`, `INT`, 和 `BIGINT`。

- **approximate numeric**: 约数集合，包括 `FLOAT`, `REAL`, and `DOUBLE PRECISION`

- **Boolean**: `true` or `false`

- **datetime**: 保存日期，时间，或是两者的组合类型，包括 `DATE`, `TIME`, 和 `TIMESTAMP` 。

- **interval**: 用于存储时间间隔，如 year, month, day, time，包括 `INTERVAL`。

许多数据库也会提供一些扩展数据类型，例如 `MONEY/CURRENCY` 和 `SERIAL/ROWID/AUTOINCREMENT/IDENTITY` 等

### 修改数据类型：CAST 函数

CAST 函数用于将字面量或列中的值转化为特定的数据类型。语法为：

```sql
CAST (expression AS data_type)
```

- expression: SQLServer 表达式；
- AS：用于分割待处理的数据和要转换的数据类型；
- data_type: 要转换的数据类型

举个栗子：

```sql
SELECT CAST('3.141' AS DECIMAL(10,2))
```

结果为：3.14
> 注意：原来的 '3.141' 会对第三个小数位进行四舍五入。

### 字面量

#### 字符串字面量

用**单引号**包裹的字符序列，下面我们来感受一下具体的应用。

当执行

```sql
SELECT VendWebPage, VendName FROM Vendors
```

时，我们的结果是这样的：

![img](./assets/sql1.jpg)

我们可以增加说明字符串：

```sql
SELECT VendWebPage, 'is the Web site for', VendName FROM Vendors
```

结果为：

![img](./assets/sql2.jpg)

显然，对于含义不是很清晰的查询结果，增加字符串描述能够有效的提高 SQL 结果的可读性。

#### 数字字面量

```
427
-11.252
.532 0.3E-3
```

#### 日期时间字面量

- DATE: YY-MM-DD，有些数据库也会使用 MM/DD/YY 的形式，具体需要根据数据库文档来确定

- TIME: hh:mm:ss

- TIMESTAMP: 时间戳

### SQL 表达式

#### Concatenation 表达式

由于笔者使用的是 MySQL 数据库，因此这里的 Concatenation 表达式需要借助函数 CONCAT 来实现，

```sql
SELECT CONCAT(EmpFirstName, ' ', EmpLastName) , CONCAT('Phone Number: ', EmpPhoneNumber) FROM Employees
```

结果为：

![img](./assets/sql3.jpg)

#### 表达式命名

范式：`SELECT expression AS column_name ->`

此前的 sql 语句可以修改为：

```sql
SELECT CONCAT(EmpFirstName, ' ', EmpLastName) AS EmployeeName , CONCAT('Phone Number: ', EmpPhoneNumber) AS EmpPhoneNumber FROM Employees
```

![img](./assets/sql4.jpg)

#### Mathematical 表达式

```sql
SELECT CONCAT(AgtFirstName, ' ', AgtLastName) AS AgentName, Salary + (50000 * CommissionRate)  AS ProjectedIncome FROM Agents
```

![img](./assets/sql5.jpg)

#### Date/Time 表达式

```sql
SELECT OrderNumber, DATEDIFF(ShipDate,OrderDate) AS DaysToShip FROM Orders
```

这里我们使用了 MySQL 提供的 `DATEDIFF` 函数来计算时间间隔，事实上不同的数据库都提供了各自的日期函数，非常便捷。

![img](./assets/sql6.jpg)

### Null

Null 在数据库中表示没有值，或者未知数据


## 参考
