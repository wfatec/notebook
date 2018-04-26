/* 递归算法实现1
 * 直观写法
 */

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

console.log(recursion1(cityData,122))
console.log(recursion1(cityData,12))
