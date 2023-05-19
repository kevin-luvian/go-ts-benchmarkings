import { useState } from "react";
import { RequestObject, RequestsState } from "../internal/Entities";
import { OrchestratorSingleton } from "../internal/Orchestrator";
import { SSEControllerSingleton } from "../internal/SSEController";
import _ from "lodash";

const useOrchestrator = () => {
  const [isDone, setIsDone] = useState(false);
  /**
   * @type {[RequestObject[], (requests: RequestObject[]) => void]}
   */
  const [requests, setRequests] = useState([]);
  /**
   * @type {[RequestObject[], (requests: RequestObject[]) => void]}
   */
  const [histories, setHistories] = useState([]);

  const start = ({ numOfRequests, concurrency, prefix, url, sseURL }) => {
    const rState = new RequestsState({
      numOfRequests,
      concurrency,
      prefix,
      requestTimeout: 600 * 1000,
    });
    const emitter = OrchestratorSingleton.init(rState, async (requestID) => {
      await fetch(`${url}?id=${requestID}`, {
        method: "GET",
      });
    });
    console.log("[useOrchestrator] Starting orchestrator");

    setIsDone(false);
    OrchestratorSingleton.start();
    startSSE(sseURL);
    addUpdoodsListeners(emitter);
  };

  const stop = () => {
    OrchestratorSingleton.stop();
    stopSSE();
    removeUpdoodsListeners(OrchestratorSingleton.getEmitter());
  };

  const startSSE = (sseURL) => {
    SSEControllerSingleton.close();
    SSEControllerSingleton.listen(sseURL);
    SSEControllerSingleton.getEmitter().on("data", (rawString) => {
      OrchestratorSingleton.onResponse(rawString);
    });
    SSEControllerSingleton.getEmitter().on("error", (err) => {
      console.error(err);
    });
  };

  const stopSSE = () => {
    SSEControllerSingleton.close();
  };

  /**
   * @param {import("events").EventEmitter} emitter
   * @param {() => void} cb
   */
  const addUpdoodsListeners = (emitter, cb) => {
    emitter.addListener("updoods", () => {
      if (OrchestratorSingleton.RequestsState.isDone()) {
        setIsDone(true);
        stop();
      }

      // copy requests list
      setRequests(
        _.cloneDeep(OrchestratorSingleton.RequestsState.RunningRequests)
      );
      setHistories(
        _.cloneDeep(OrchestratorSingleton.RequestsState.HistoryRequests)
      );
    });
  };

  /**
   * @param {import("events").EventEmitter} emitter
   */
  const removeUpdoodsListeners = (emitter) => {
    emitter.removeAllListeners("updoods");
  };

  return { start, stop, isDone, requests, histories };
};

export default useOrchestrator;
