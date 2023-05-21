/**
 * @function
 * @template T
 * @param {T[]} data
 * @param {number} len
 * @param {function(T[]):T} getAverage
 * @return {T[]}
 */
export const averageDownsample = (data, len, getAverage) => {
  const originalLength = data.length;
  const interpolationStep = Math.floor(originalLength / len);
  const avgData = new Array(len);

  if (originalLength <= len) {
    return data;
  }

  for (let i = 0; i < len; i++) {
    const firstI = i * interpolationStep;
    let lastI = (i + 1) * interpolationStep - 1;

    if (lastI > originalLength) {
      lastI = originalLength;
    }

    avgData[i] = getAverage(data.slice(firstI, lastI));
  }

  return avgData;
};
