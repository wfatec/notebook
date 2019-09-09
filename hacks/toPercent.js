export const toPercent = (point = 0, accuracy = 2) => {
  let str =
    Math.floor(Number(point * 100 * Math.pow(10, accuracy))) /
      Math.pow(10, accuracy) +
    "";
  let [intPart, decPart = ""] = str.split(".");
  let len = decPart.length;
  for (len; len < accuracy; len++) {
    decPart += "0";
  }
  return intPart + "." + decPart + "%";
};
