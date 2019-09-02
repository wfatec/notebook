<!-- TOC -->

- [SQL 语法基础](#sql-语法基础)
    - [SELECT](#select)
        - [SELECT 语法规则](#select-语法规则)
        - [去重复行](#去重复行)
        - [排序](#排序)
    - [参考](#参考)

<!-- /TOC -->

# SQL 语法基础

> 本文是笔者阅读《SQL Queries for Mere Mortals, 4th Edition》之后的一些总结和体会，用于做减法，便于平时查阅，如果对于 SQL 语法还不是很熟悉，那么建议大家读一下本书，相信会有所进益。

## SELECT

### SELECT 语法规则

```sql
SELECT column_name FROM table_name WHERE SearchCondition GROUP BY column_name HAVING SearchCondition
```

### 去重复行

```sql
SELECT DISTINCT column_name FROM table_name
```

### 排序

```sql
SELECT Statement ORDER BY column_name ASC/DESC
```

ASC 为从小到大排序， DESC 为从大到小排序，且 ORDER BY 语法不会改变 table 原本的顺序。

## 参考
