import { useState } from "react";
import { RequestObject } from "../internal/entities/Request";
import { RequestsState } from "../internal/entities/RequestState";
import { OrchestratorSingleton } from "../internal/Orchestrator";
import { SSEControllerSingleton } from "../internal/SSEController";
import _ from "lodash";
import { HistoriesControllerSingleton } from "../internal/HistoriesController";
import { useInterval } from "./useInterval";
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

  const [runState, setRunState] = useState({
    url: "",
  });

  const start = ({
    numOfRequests,
    concurrency,
    prefix,
    url,
    sseURL,
    limit,
  }) => {
    const rState = new RequestsState({
      numOfRequests,
      concurrency,
      prefix,
      requestTimeout: 600 * 1000,
    });
    const onFetch = async (requestID) => {
      await fetch(`${url}?id=${requestID}&limit=${limit}`, {
        method: "GET",
      });
    };
    OrchestratorSingleton.init(rState, onFetch);

    setRunState({ url });
    setIsDone(false);
    OrchestratorSingleton.start();
    HistoriesControllerSingleton.init({
      url,
      concurrency,
      limit,
      emitter: OrchestratorSingleton.getEmitter(),
    });
    startSSE(sseURL);
    addUpdoodsListeners({ url, limit, concurrency });
  };

  const panic = async () => {
    if (!runState.url) {
      return;
    }

    try {
      const oURL = new URL(runState.url);
      await fetch(`${oURL.origin}/panic`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "panic-code": "owo-benchmarker-panic",
        }),
      });
      OrchestratorSingleton.flagPanic();
    } catch (err) {
      alert("failed to panic, start panicking more!!", err);
    }
  };

  const stop = () => {
    OrchestratorSingleton.stop();
    stopSSE();
    removeUpdoodsListeners();
  };

  const startSSE = (sseURL) => {
    SSEControllerSingleton.close();
    SSEControllerSingleton.listen(sseURL);
    const emitter = SSEControllerSingleton.getEmitter();
    const orcEmitter = OrchestratorSingleton.getEmitter();

    emitter.on("data", (rawString) =>
      OrchestratorSingleton.onResponse(rawString)
    );
    emitter.on("error", (err) => console.error(err));
    emitter.on("metrics", (data) => orcEmitter.emit("metrics", data));
  };

  const stopSSE = () => {
    SSEControllerSingleton.close();
  };

  useInterval(() => {
    updoodRRequests();
    updoodHistories();
  }, 200);

  const addUpdoodsListeners = () => {
    const emitter = OrchestratorSingleton.getEmitter();
    emitter.addListener("benchmark_done", () => {
      setIsDone(true);
      stop();
    });
  };

  const updoodRRequests = () => {
    if (
      _.isEqual(requests, OrchestratorSingleton.RequestsState.RunningRequests)
    ) {
      return;
    }
    setRequests(
      _.cloneDeep(OrchestratorSingleton.RequestsState.RunningRequests)
    );
  };

  const updoodHistories = () => {
    if (
      _.isEqual(histories, OrchestratorSingleton.RequestsState.HistoryRequests)
    ) {
      return;
    }
    setHistories(
      _.cloneDeep(OrchestratorSingleton.RequestsState.HistoryRequests)
    );
  };

  const removeUpdoodsListeners = () => {
    const emitter = OrchestratorSingleton.getEmitter();
    emitter.removeAllListeners("benchmark_done");
  };

  return { start, panic, isDone, requests, histories };
};

export default useOrchestrator;
