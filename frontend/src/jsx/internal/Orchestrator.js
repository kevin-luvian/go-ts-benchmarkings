import { RequestsState } from "./Entities";
import EventEmitter from "events";

class Orchestrator {
  constructor() {
    this.RequestsState = new RequestsState({});
    this.onFetch = async (arg0) => {};
    this.Emitter = new EventEmitter();
  }

  /**
   * @param {RequestsState} RequestsState
   * @param {function(string):Promise<void>} onFetch
   */
  init(RequestsState, onFetch) {
    this.RequestsState = RequestsState;
    this.onFetch = onFetch;
    this.Emitter = new EventEmitter();
    return this.Emitter;
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
        this.Emitter.emit("updoods");
        return;
      }

      if (totalLen >= this.RequestsState.numOfRequests) {
        return;
      }

      reqID = this.RequestsState.addRequest(reqID);
      console.log("Doing fetch with request id: ", reqID);
      await this.onFetch(reqID);
      this.Emitter.emit("updoods");
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

    const [isAbleToFetch, wasChanged] = this.RequestsState.ingestRequest(obj);
    if (isAbleToFetch) {
      this.doFetch();
    }

    if (wasChanged) {
      this.Emitter.emit("updoods");
    }
  }

  async start() {
    console.log("Starting Orchestrator", this.RequestsState.concurrency);
    for (let i = 0; i < this.RequestsState.concurrency; i++) {
      this.doFetch();
      await sleep(500);
    }

    // this.ticker = setInterval(() => {
    //   const ts = Date.now();
    //   const invalidatedCount = this.RequestsState.invalidateTimeouts(ts);
    //   for (let i = 0; i < invalidatedCount; i++) {
    //     this.doFetch();
    //   }
    // }, 30000);
  }

  stop() {
    // clearInterval(this.ticker);
    this.RequestsState.clearRunningRequests();
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const OrchestratorSingleton = new Orchestrator();

export { OrchestratorSingleton, Orchestrator };
