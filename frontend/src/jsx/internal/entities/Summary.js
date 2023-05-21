import { averageDownsample } from "../math/downsapling";
import { RequestStatus } from "./Consts";
import { MetricTick } from "./Metrics";

export class SummaryObject {
  done = false;
  totalRequests = 0;
  writesPerSeconds = [];
  timeTookSeconds = [];
  totalError = 0;
  firstTs = Number.MAX_SAFE_INTEGER;
  lastTs = Number.MIN_SAFE_INTEGER;
  /**
   * @type {MetricTick[]}
   */
  metrics = [];

  /**
   * @param {Object} param0
   * @param {string} param0.url
   * @param {number} param0.limit
   * @param {number} param0.concurrency
   */
  constructor({ url, limit, concurrency }) {
    this.url = url;
    this.targetLimit = limit;
    this.targetConcurrency = concurrency;
  }

  /**
   * @param {MetricTick} metric
   */
  ingestMetric(metric) {
    if (!metric.isValid()) {
      return;
    }

    if (this.metrics.length <= 0) {
      this.metrics.push(metric);
      return;
    }

    const latest = this.metrics[this.metrics.length - 1];
    if (metric.ts > latest.ts) {
      this.metrics.push(metric);
    }

    if (this.metrics.length > 70) {
      this._compactMetrics();
    }
  }

  onBenchmarkDone() {
    this._compactMetrics();
    this.done = true;
  }

  _compactMetrics() {
    if (this.metrics.length <= 0) {
      return;
    }

    let newMetrics = new Array(this.metrics.length);
    let counter = 0;
    for (let i = 0; i < this.metrics.length; i++) {
      const m = this.metrics[i];
      if (m.ts < this.firstTs || m.ts > this.lastTs) {
        continue;
      }

      newMetrics[counter++] = m;
    }

    this.metrics = averageDownsample(
      newMetrics.slice(0, counter),
      30,
      MetricTick.getAverage
    );
  }

  /**
   * @param {RequestObject} request
   */
  pushRequestObject(request) {
    this.totalRequests++;
    this.writesPerSeconds.push(request.getWritesPerSeconds());
    this.timeTookSeconds.push(request.getTimeTookSeconds());
    this.totalError += request.Status === RequestStatus.Error ? 1 : 0;
    this.firstTs = Math.min(this.firstTs, request.getFirstTs());
    this.lastTs = Math.max(this.lastTs, request.getLastTs());
  }

  getAvgTimeTook() {
    return calcAverages(this.timeTookSeconds);
  }

  getAvgWPS() {
    return calcAverages(this.writesPerSeconds);
  }
}

/**
 * @param {number[]} arr
 */
const calcAverages = (arr) => {
  if (arr.length <= 0) {
    return 0;
  }

  return Math.floor(arr.reduce((a, b) => a + b, 0) / arr.length);
};
