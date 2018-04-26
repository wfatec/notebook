/* 递归算法实现3
 * 将result变量置于函数内部
 * 将函数名与递归调用解耦
 */

const data = require('./cityData');
const cityData = data.cityData;

const recursion3 = function(data,id){
    
    const rawData = data || [];
    const len = rawData.length;
    arguments.callee.result = arguments.callee.result || '';
    arguments.callee.id = arguments.callee.id || '';

    if (arguments.callee.id === id) {
        return arguments.callee.result;
    } else {
        arguments.callee.result = '';
        arguments.callee.id = '';
    }

    if (len === 0 || arguments.callee.result) {
        return arguments.callee.result;
    }

    for(let i = 0; i < len; i++ ){
        if (rawData[i].id === id ) {
            arguments.callee.result = rawData[i].name;
            arguments.callee.id = id;
            return arguments.callee.result; 
        } else {
            const children = rawData[i].children || [];
            arguments.callee.result = arguments.callee(children, id);
        }
    }

    return arguments.callee.result;
}

console.log(recursion3(cityData,122))
console.log(recursion3(cityData,12))
