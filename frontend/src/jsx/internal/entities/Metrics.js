export class MetricTick {
  cpu_usage = 0;
  memory_usage = 0;
  ts = 0;
  hms = "";

  constructor({ cpu_usage, memory_usage, ts }) {
    this.cpu_usage = cpu_usage ?? 0;
    this.memory_usage = memory_usage ?? 0;
    this.ts = ts ?? 0;
    this.hms = formatDate(this.ts);
  }

  static fromJSON(jsonStr) {
    const obj = JSON.parse(jsonStr);
    return new MetricTick(obj);
  }

  /**
   * @param {MetricTick[]} ticks
   */
  static getAverage(ticks) {
    return new MetricTick({
      cpu_usage: calcAverage(ticks, (t) => t.cpu_usage),
      memory_usage: calcAverage(ticks, (t) => t.memory_usage),
      ts: calcAverage(ticks, (t) => t.ts),
    });
  }

  isValid() {
    return this.ts > 1000;
  }
}

const formatDate = (ts) => {
  if (ts <= 0) {
    return "invalid date";
  }

  const datetext = new Date(ts).toTimeString();
  return datetext.split(" ")[0];
};

/**
 * @function
 * @template T
 * @param {T[]} arr
 * @param {function(T):number} getVal
 */
const calcAverage = (arr, getVal) => {
  if (arr.length <= 0) {
    return 0;
  }
  return Math.floor(arr.reduce((a, o) => a + getVal(o), 0) / arr.length);
};

/**
 *
 * @param {[*]} arr
 * @param {number} len
 */
const dolerping = (arr, len) => {
  const newArr = [];
  const originalLen = arr.length;
  const step = Math.floor(arr.length / len);

  for (let i = 0; i < len; i++) {
    const firstI = i;
    const lastI = i * step;

    if (lastI >= originalLen - 1) {
      newArr.push(arr[originalLen - 1]);
    } else {
      const x = firstI;
      const x0 = dataPointIndex;
      const x1 = nextDataPointIndex;

      const interpolatedPercentage = linearInterpolation(
        x,
        x0,
        originalData[dataPointIndex].percentage,
        x1,
        originalData[nextDataPointIndex].percentage
      );

      const interpolatedDataPoint = {
        time: originalData[dataPointIndex].time,
        percentage: interpolatedPercentage,
      };

      interpolatedData.push(interpolatedDataPoint);
    }
  }
};

/**
 * do linear interpolation
 * @param {number} x
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 */
const lerp = (x, x0, y0, x1, y1) => {
  return y0 + ((x - x0) * (y1 - y0)) / (x1 - x0);
};
