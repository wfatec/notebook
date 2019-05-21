# `CSS`拾遗

## 选择器

### 选中带有`class`或`id`的元素

```css
p.dog {
    color: yellow;
}
```
或者
```css
p#dog {
    color: yellow;
}
```

思考一下，当我们已经可以通过`class`或`id`锁定目标时，为什么还要加上元素标签`p`呢？

### 选中多个`class`

```css
.dog.cat {
    color: yellow;
}
```

此时元素必须同时拥有`dog`和`cat`类。

同理，同时包含某个`class`和`id`，可以写为：

```css
.dog#john {
    color: yellow;
}
```

### 选择器组合

```css
p, .dog {
    color: yellow;
}
```

### 使用`dom`结构作为选择器

```html
<spqn>
    hello
</span>

<p>
    My dog's name is:
    <spqn class="name">
        John
    </span>
</p>
```

```css
p span{
    color: yellow;
}
```

注意：即使右边元素在更深的层级，选择器也会生效。如果想让右边元素只能在第一个层级，可以使用`>`：

```css
p > span{
    color: yellow;
}
```

此外，使用`+`可以让我们选择在指定的元素后出现的目标元素：

```css
p + span {
    color: yellow;
}
```

这时，`html`结构为：

```html
<p>this is p</p>
<span>this is color span</span>
```

