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
  const avgData = [];

  if (originalLength <= len) {
    return data;
  }

  for (let i = 0; i < len; i++) {
    const firstI = i * interpolationStep;
    let lastI = (i + 1) * interpolationStep - 1;

    if (lastI >= originalLength) {
      lastI = originalLength - 1;
    }

    try {
      const avg = getAverage(data.slice(firstI, lastI));
      avgData.push(avg);
    } catch (_err) {}
  }

  if (avgData.length === 0) {
    return data;
  }

  return avgData;
};
