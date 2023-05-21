import { RequestStatus } from "./Consts";

export class RequestObject {
  ID = "request-00";
  Status = RequestStatus.Done;
  Message = "";

  latencies = [];
  total = 0;
  firstTs = -1;
  lastTs = -1;

  stats = {
    latency: 0,
  };

  constructor({ ID, Status }) {
    this.ID = ID;
    this.Status = Status;
    this.Message = "";
  }

  equals(other) {
    return (
      this.ID === other.ID &&
      this.Status === other.Status &&
      this.firstTs === other.firstTs &&
      this.lastTs === other.lastTs &&
      this.total === other.total
    );
  }

  update(ts, total) {
    const prevTs = this.lastTs;

    if (this.firstTs <= 0) {
      this.firstTs = ts;
    }

    this.lastTs = ts;
    this.total = total;

    this._collectStats({ prevTs: prevTs });
  }

  _collectStats({ prevTs }) {
    if (prevTs <= 0) {
      return;
    }

    const currLatency = this.lastTs - prevTs;
    this.latencies.push(currLatency);

    this.stats = {
      ...this.stats,
      latency: currLatency,
    };
  }

  getLastTS() {
    return this.lastTs;
  }

  getLatency() {
    if (this.latencies.length <= 0) {
      return 0;
    }

    return this.latencies[this.latencies.length - 1];
  }

  getAvg() {
    if (this.latencies.length <= 0) {
      return 0;
    }

    return Math.floor(
      this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length
    );
  }

  getTimeTookSeconds() {
    if (this.firstTs <= 0 || this.lastTs <= 0) {
      return 0;
    }

    return Math.floor((this.lastTs - this.firstTs) / 1000);
  }

  getWritesPerSeconds() {
    const timeTook = this.getTimeTookSeconds();
    if (timeTook <= 0) {
      return 0;
    }

    return Math.floor(this.total / timeTook);
  }

  getTotal() {
    return this.total;
  }

  getFirstTs() {
    return this.firstTs;
  }

  getLastTs() {
    return this.lastTs;
  }
}
