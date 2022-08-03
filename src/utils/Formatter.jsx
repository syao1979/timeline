import React from "react";

/**
 * convert a numeric value into another short number by factor (divided by the factor),
 * and optionally with non-zero fraction to "fix" positions
 * @param {*} val
 * @param {*} factor
 * @param {*} fix
 * @returns
 */
const shortNumber = (val, factor, fix = 0) => {
  let num = (val / factor).toFixed(0);
  if (fix > 0) {
    const num2 = (val / factor).toFixed(fix);
    num = num2 - num > 0 ? num2 : num;
  }
  return num;
};

/**
 * convert year into "亿年","千万年","百万年","万年",
 * @param {*} year
 * @param {*} numOnly
 * @returns
 */
const normalizeYear = (year, numOnly = false) => {
  if (isNaN(year)) return "?";

  const WAN = 10000;
  const BAIWAN = 1000000;
  const QIANWAN = 10000000;
  const YI = 100000000;

  let value = parseInt(Math.abs(year));
  const pre = !numOnly && year < 0 && value < WAN ? "前" : "";
  const post = !numOnly && year < 0 && value >= WAN ? "前" : "";
  let unit = "年";

  if (value >= YI) {
    value = shortNumber(value, YI, 1);
    unit = "亿年";
  } else if (value >= QIANWAN) {
    value = shortNumber(value, QIANWAN, 1);
    unit = "千万年";
  } else if (value >= BAIWAN) {
    value = shortNumber(value, BAIWAN, 1);
    unit = "百万年";
  } else if (value >= WAN) {
    value = shortNumber(value, WAN, 1);
    unit = "万年";
  }

  return `${pre}${value}${unit}${post}`;
};

const cleanNameString = (name) => {
  return name.replace("/", ""); // can replace more here
};

// not undefined, null or ""; 0 is not null
const notNull = (value) =>
  !(value === null || value === undefined || !`${value}`);

export { normalizeYear, cleanNameString, notNull };
