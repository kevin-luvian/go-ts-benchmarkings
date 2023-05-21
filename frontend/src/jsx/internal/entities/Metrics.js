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
    const result = new MetricTick({});
    for (const tick of ticks) {
      result.cpu_usage += tick.cpu_usage ?? 0;
      result.memory_usage += tick.memory_usage ?? 0;
      result.ts += tick.ts ?? 0;
    }
    return new MetricTick({
      cpu_usage: Math.floor(result.cpu_usage / ticks.length),
      memory_usage: Math.floor(result.memory_usage / ticks.length),
      ts: Math.floor(result.ts / ticks.length),
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
