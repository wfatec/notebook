const format = data => {
  if (data.length === 2) {
    return data;
  } else {
    return "0" + data;
  }
};

// 根据月份生成当月起止日期
export const getMonthRange = date => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const dateCount = new Date(year, month + 1, 0).getDate();
  const monthStr = format(month + 1 + "");
  const startDate = `${year}-${monthStr}-01`;
  const endDate = `${year}-${monthStr}-${format(dateCount + "")}`;
  return {
    startDate,
    endDate
  };
};
