export const toPercent1 = (point = 0, accuracy = 2) => {
  let str =
    Math.floor(
      Number(point * 100 * Math.pow(10, accuracy)).toFixed(accuracy + 2)
    ) /
      Math.pow(10, accuracy) +
    "";
  let [intPart, decPart = ""] = str.split(".");
  let len = decPart.length;
  for (len; len < accuracy; len++) {
    decPart += "0";
  }
  return intPart + "." + decPart + "%";
};

export const toPercent = (point = 0, accuracy = 2) => {
  const pointStr = point + "";
  const [intPart, decimalPart = ""] = pointStr.split(".");
  const intPartArray = intPart.split("");
  const dcimalPartArray = decimalPart.split("");

  for (let index = 0; index < 2; index++) {
    intPartArray.push(dcimalPartArray.shift() || "0");
  }

  let len = dcimalPartArray.length;
  for (len; len < accuracy; len++) {
    dcimalPartArray.push("0");
  }
  dcimalPartArray.splice(accuracy);

  const intPartFinal = +intPartArray.join("");
  const dcimalPartFinal = dcimalPartArray.join("");
  return intPartFinal + "." + dcimalPartFinal + "%";
};
