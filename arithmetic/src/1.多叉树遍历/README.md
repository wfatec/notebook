## 题目要求：根据给定id获取对应name属性
数据结构如下
```
let cityData = [
      {
        id: 1,
        name: '广东省',
        children: [
          {
            id: 11,
            name: '深圳',
            children: [
              {
                id: 111,
                name: '宝安',
                children: [
                  {
                    id: 1111,
                    name: '西乡',
                    children:[
                      {
                        id: 11111,
                        name: '坪洲',
                        children:[]
                      },
                      {
                        id: 11112,
                        name: '灵芝',
                        children:[]
                      }
                    ]
                  },
                  {
                    id: 1112,
                    name: '南山',
                    children:[
                      {
                        id: 11121,
                        name: '科技园',
                        children:[]
                      }
                    ]
                  }
                ]
              },
              {
                id: 112,
                name: '福田',
                children: []
              }
            ]
          },
          {
            id: 12,
            name: '广州',
            children: [
              {
                id: 122,
                name: '白云区',
                children: [
                  {
                    id: 1222,
                    name: '白云区',
                    children: []
                  }
                ]
              },
              {
                id: 122,
                name: '珠海区',
                children: []
              }
            ]
          }
        ]
      },
      {
        id: 2,
        name: '湖南省',
        children: []
      }
    ];
```

### 1. 递归算法
```
  const data = require('./cityData');
  const cityData = data.cityData;
  let result = '';

  const recursion1 = function(data,id){
    const rawData = data || [];
    const len = rawData.length;

    if (len === 0) {
        return ;
    }

    for(let i = 0; i < len; i++ ){
        if (rawData[i].id === id ) {
            result = rawData[i].name;
        } else {
            const children = rawData[i].children || [];
            arguments.callee(children, id);
        }
    }

    return result;
}

```