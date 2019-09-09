export const toPercent = point => {
  if (!point) {
    return "0.00%";
  }
  let str = Math.floor(Number(point * 10000)) / 100 + "";
  let [intPart, decPart = "00"] = str.split(".");
  let len = decPart.length;
  for (len; len < 2; len++) {
    decPart += "0";
  }
  return intPart + "." + decPart + "%";
}
