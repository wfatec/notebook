/**
 * @param {number} originalNumber
 * @return {number}
 */
export default function countSetBits(originalNumber) {
    let setBitsCount = 0;
    let number = originalNumber;
  
    while (number) {
      // 通过输入值和1进行与运算判断最后一位是否为1
      setBitsCount += number & 1;
  
      // 右移输入值.
      number >>= 1;
    }
  
    return setBitsCount;
  }