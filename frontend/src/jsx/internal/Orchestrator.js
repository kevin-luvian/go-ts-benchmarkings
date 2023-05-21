import { RequestsState } from "./entities/RequestState";
import EventEmitter from "events";

class Orchestrator {
  constructor() {
    this.RequestsState = new RequestsState({});
    this.onFetch = async (arg0) => {};
    this.Emitter = new EventEmitter();
    this.isPanicked = false;
  }

  /**
   * @param {RequestsState} RequestsState
   * @param {function(string):Promise<void>} onFetch
   */
  init(RequestsState, onFetch) {
    this.RequestsState = RequestsState;
    this.onFetch = onFetch;
  }

  flagPanic() {
    this.isPanicked = true;
  }

  getEmitter() {
    return this.Emitter;
  }

  async doFetch() {
    let reqID;
    try {
      const historyLen = this.RequestsState.HistoryRequests.length;
      const totalLen = this.RequestsState.RunningRequests.length + historyLen;
      if (historyLen >= this.RequestsState.numOfRequests) {
        return;
      }

      if (totalLen >= this.RequestsState.numOfRequests) {
        return;
      }

      reqID = this.RequestsState.addRequest(reqID);
      await this.onFetch(reqID);
    } catch (error) {
      console.error(error);
      if (!reqID) {
        return;
      }
      this.RequestsState.completeRequest(reqID, error);
    }
  }

  /**
   * @param {string} rawString
   */
  onResponse(rawString) {
    let obj;
    try {
      obj = JSON.parse(`${rawString}`);
    } catch (error) {
      console.error(error);
      return;
    }

    const [isAbleToFetch, wasChanged, doneRequest] =
      this.RequestsState.ingestRequest(obj);
    if (isAbleToFetch && !this.isPanicked) {
      this.doFetch();
    }

    if (doneRequest) {
      this.Emitter.emit("request_done", doneRequest);
    }

    if (wasChanged) {
      if (this.RequestsState.isDone()) {
        this.Emitter.emit("benchmark_done", true);
      }
    }
  }

  async start() {
    for (let i = 0; i < this.RequestsState.concurrency; i++) {
      this.doFetch();
      await sleep(500);
    }
  }

  stop() {
    this.RequestsState.clearRunningRequests();
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const OrchestratorSingleton = new Orchestrator();

export { OrchestratorSingleton, Orchestrator };
