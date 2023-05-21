import { RequestObject } from "./Request";
import { RequestStatus } from "./Consts";
import _ from "lodash";

let globalCounter = Math.floor(Math.random() * 100);
const generateID = (prefix) => {
  globalCounter++;
  return `${prefix}-${globalCounter}`;
};

export class RequestsState {
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
    this.requestTimeout = requestTimeout ?? 90000;
    this.numOfRequests = numOfRequests ?? 0;
    this.concurrency = concurrency ?? 0;
    this.requestIDPrefix = prefix ?? "request-";
  }

  isDone() {
    return this.HistoryRequests.length >= this.numOfRequests;
  }

  invalidateTimeouts() {
    const now = Date.now();
    for (let i = 0; i < this.RunningRequests.length; i++) {
      const request = this.RunningRequests[i];
      if (request.lastTs < 1000) {
        continue;
      }

      if (now - request.lastTs > this.requestTimeout) {
        request.Message = "Request timed out";
        this.completeRequest(request.ID, "Request timed out");
      }
    }
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
    if (runningCount > this.concurrency) {
      throw new Error(
        `Too many requests running: ${runningCount} expected: ${this.concurrency}`
      );
    }

    if (this.HistoryRequests.length > this.numOfRequests) {
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

    this.RunningRequests.splice(rIndex, 1);
    this.HistoryRequests.push(request);
    return _.cloneDeep(request);
  }

  ingestRequest({ id, ts, total, done, error }) {
    id = id.trim();
    const rIndex = this.RunningRequests.findIndex((r) => r.ID === id);
    if (rIndex < 0) {
      return [false, false, null];
    }

    this.RunningRequests[rIndex].update(ts, total);

    let doneRequest = null;
    if (done) {
      doneRequest = this.completeRequest(id, error);
    }

    // if running requests is less than concurrency, then we can start a new request
    if (this.RunningRequests.length < this.concurrency) {
      return [true, true, doneRequest];
    }

    return [false, true, doneRequest];
  }
}
