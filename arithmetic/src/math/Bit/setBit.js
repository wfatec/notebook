/**
 * @param {number} number 
 * @param {number} bitPosition 
 * @param {number} setValue 
 */

var setBit = function(number,bitPosition,setValue){
    if (setValue===0) {
        return number & ~(1<<bitPosition)
    } else {
        return number | (1<<bitPosition)
    }
}

export default setBit;