/**
 * @param {number} num1 
 * @param {number} num2
 */

var multiply2Numbers = function(num1,num2){
    var multiplyer = num2,result=0,position=0;
    while(multiplyer){
        if (multiplyer & 1) {
            result += num1<<position;
        }
        multiplyer >>= 1;
        position += 1;
    }
    return result;
}