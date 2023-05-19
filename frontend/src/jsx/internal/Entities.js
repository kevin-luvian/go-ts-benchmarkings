const RequestStatus = Object.freeze({
  Processing: "Processing",
  Done: "Done",
  Error: "Error",
});

let globalCounter = Math.floor(Math.random() * 100);
const generateID = (prefix) => {
  globalCounter++;
  return `${prefix}-${globalCounter}`;
};

class RequestsState {
  /**
   * @type {RequestObject[]} historical data
   */
  HistoryRequests = [];
  /**
   * @type {RequestObject[]}
   */
  RunningRequests = [];

  constructor({ numOfRequests, concurrency, prefix, requestTimeout }) {
    this.internalCounter = 0;
    this.requestTimeout = requestTimeout ?? 10000;
    this.numOfRequests = numOfRequests ?? 0;
    this.concurrency = concurrency ?? 0;
    this.requestIDPrefix = prefix ?? "request-";
  }

  isDone() {
    return this.HistoryRequests.length >= this.numOfRequests;
  }

  clearRunningRequests() {
    for (let i = 0; i < this.RunningRequests.length; i++) {
      this.RunningRequests[i].Message = "Request cancelled";
      this.RunningRequests[i].Status = RequestStatus.Error;
    }

    this.HistoryRequests.push(...this.RunningRequests);
    this.RunningRequests = [];
  }

  /**
   * creates a new request object and adds it to running requests
   * @returns {string} ID
   */
  addRequest() {
    const runningCount = this.RunningRequests.length;
    if (runningCount >= this.concurrency) {
      throw new Error(
        `Too many requests running: ${runningCount} expected: ${this.concurrency}`
      );
    }

    if (this.HistoryRequests.length >= this.numOfRequests) {
      throw new Error(
        `Too many requests made: ${this.HistoryRequests.length} expected: ${this.numOfRequests}`
      );
    }

    this.internalCounter++;
    const ID = this.internalCounter + "-" + generateID(this.requestIDPrefix);
    this.RunningRequests.push(
      new RequestObject({ ID, Status: RequestStatus.Processing })
    );
    return ID;
  }

  /**
   * removes from running requests and adds to history requests
   * @param {string} ID
   * @param {string} err
   */
  completeRequest(ID, err) {
    const rIndex = this.RunningRequests.findIndex((r) => r.ID === ID);
    if (rIndex < 0) {
      throw new Error(`Request not found: ${ID}`);
    }

    const request = this.RunningRequests[rIndex];
    if (err) {
      request.Message = err;
      request.Status = RequestStatus.Error;
    } else {
      request.Message = "";
      request.Status = RequestStatus.Done;
    }

    console.log(`[Complete-Reqeust] Request with id: ${ID} completed`, request);
    this.RunningRequests.splice(rIndex, 1);
    this.HistoryRequests.push(request);
  }

  ingestRequest({ id, ts, total, done, error }) {
    id = id.trim();
    console.log(`[Ingest-Reqeust] Ingesting request with id: ${id}, ts: ${ts}`);

    const rIndex = this.RunningRequests.findIndex((r) => r.ID === id);
    if (rIndex < 0) {
      return [false, false];
    }

    this.RunningRequests[rIndex].update(ts, total);

    if (done) {
      console.log(`[Ingest-Reqeust] Request with id: ${id} completed`);
      this.completeRequest(id, error);
    }

    // if running requests is less than concurrency, then we can start a new request
    if (this.RunningRequests.length < this.concurrency) {
      return [true, true];
    }

    return [false, true];
  }

  /**
   * removes requests from running requests if they have timed out
   * @param {number} currTs
   * @return {number} number of requests timed out
   */
  // invalidateTimeouts(currTs) {
  //   let reqIDsTimeouts = [];

  //   // cant invalidate in this loop, bcoz it will change the length of the array
  //   for (let i = 0; i < this.RunningRequests.length; i++) {
  //     const lastTs = this.RunningRequests[i].getLastTS();
  //     if (currTs - lastTs > this.requestTimeout) {
  //       reqIDsTimeouts.push(this.RunningRequests[i].ID);
  //     }
  //   }

  //   for (const id of reqIDsTimeouts) {
  //     this.completeRequest(id, "Request timed out");
  //   }

  //   return reqIDsTimeouts.length;
  // }
}

class RequestObject {
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

export { RequestStatus, RequestsState, RequestObject };
