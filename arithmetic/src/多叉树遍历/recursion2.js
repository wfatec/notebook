/* 递归算法实现2
 * 将result变量置于函数内部
 */

const data = require('./cityData');
const cityData = data.cityData;

const recursion2 = function(data,id){
    
    const rawData = data || [];
    const len = rawData.length;
    recursion2.result = recursion2.result || '';
    recursion2.id = recursion2.id || '';

    if (recursion2.id === id) {
        return recursion2.result;
    } else {
        recursion2.result = '';
        recursion2.id = '';
    }

    if (len === 0 || recursion2.result) {
        return recursion2.result;
    }

    for(let i = 0; i < len; i++ ){
        if (rawData[i].id === id ) {
            recursion2.result = rawData[i].name;
            recursion2.id = id;
            return recursion2.result; 
        } else {
            const children = rawData[i].children || [];
            recursion2.result = recursion2(children, id);
        }
    }

    return recursion2.result;
}

console.log(recursion2(cityData,122))
console.log(recursion2(cityData,12))
