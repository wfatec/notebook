/**
 * @param {number} number 
 * @param {number} bitPosition 
 */

var getBit = function(number,bitPosition){
    var shiftRight =  number >> bitPosition;
    return shiftRight & 1;
}

export default getBit;