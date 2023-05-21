import { MetricTick } from "./entities/Metrics";
import { SummaryObject } from "./entities/Summary";
import _ from "lodash";

/**
 * @typedef {import('events').EventEmitter} EventEmitter
 * @typedef {import("./entities/Request").RequestObject} RequestObject
 */

class HistoriesController {
  /**
   * @type {SummaryObject[]}
   */
  SummaryHistories = [];
  SummaryState = new SummaryObject({});

  /**
   * @param {Object} param0
   * @param {EventEmitter} param0.emitter
   */
  init({ url, concurrency, limit, emitter }) {
    const sumObj = new SummaryObject({ url, concurrency, limit });
    this.SummaryHistories.push(sumObj);

    this.close();
    this._source = emitter;

    this.onBenchmarkDone = this.onBenchmarkDone.bind(this);
    this._source.on("benchmark_done", this.onBenchmarkDone);

    this.onCompletedRequest = this.onCompletedRequest.bind(this);
    this._source.on("request_done", this.onCompletedRequest);

    this.onNewMetrics = this.onNewMetrics.bind(this);
    this._source.on("metrics", this.onNewMetrics);
  }

  close() {
    if (!this._source) return;

    this._source.off("benchmark_done", this.onBenchmarkDone);
    this._source.off("request_done", this.onCompletedRequest);
    this._source.off("metrics", this.onNewMetrics);
    this._source = null;
  }

  onBenchmarkDone() {
    this.getCurrentState().onBenchmarkDone();
  }

  /**
   * @param {RequestObject} request
   */
  onCompletedRequest(request) {
    this.getCurrentState().pushRequestObject(request);
  }

  /**
   * @param {string} jsonStr
   */
  onNewMetrics(jsonStr) {
    const ticks = MetricTick.fromJSON(jsonStr);
    this.getCurrentState().ingestMetric(ticks);
  }

  getCurrentState() {
    return this.SummaryHistories[this.SummaryHistories.length - 1];
  }
}

const HistoriesControllerSingleton = new HistoriesController();

export { HistoriesControllerSingleton, HistoriesController };
