// 数字转金额
export const toMoney = (num, decimal = 2) => {
  let money = num.toFixed(decimal);
  money = parseFloat(money);
  money = money.toLocaleString();
  if (decimal === 0) {
    return money;
  }

  //判断是否有小数
  if (money.indexOf(".") == -1) {
    money = money + `.${generate0(decimal)}`;
  } else {
    const remain = decimal - money.split(".")[1].length;
    money = money + `${generate0(remain)}`;
  }
  return money;
};
