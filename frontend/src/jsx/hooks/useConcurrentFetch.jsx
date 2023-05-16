import { useEffect, useState, useRef } from "react";
import EventEmitter from "events";

/**
 * @typedef {import('../http/types').FetchResult} FetchResult
 */

class ConcurrentFetcher extends EventEmitter {
  numOfRequests = 0;
  lock = 0;
  processed = 0;
  ok = 0;

  reset() {
    this.numOfRequests = 0;
    this.lock = 0;
    this.processed = 0;
    this.ok = 0;
  }

  /**
   * @param {function(number): Promise<FetchResult>} fetch
   */
  async doFetch(fetch) {
    try {
      this.lock++;
      const { ok } = await fetch(this.counter);
      this.processed++;
      if (ok) this.ok++;
    } finally {
      this.emit("ate");

      if (this.lock < this.numOfRequests) {
        this.doFetch(fetch);
      } else if (this.processed >= this.numOfRequests) {
        this.emit("full", {
          ok: this.ok,
        });
      }
    }
  }
}

const ConcurrentFetcherInstance = new ConcurrentFetcher();

/**
 * @param {function(number):Promise<FetchResult>} fetch
 */
const useConcurrentFetch = (fetch) => {
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState({
    ok: 0,
    done: false,
  });

  useEffect(() => {
    ConcurrentFetcherInstance.addListener("ate", () => {
      setProgress((p) => p + 1);
    });
    ConcurrentFetcherInstance.addListener("full", ({ ok }) => {
      setResult((state) => ({ ...state, ok, done: true }));
    });
    return () => {
      ConcurrentFetcherInstance.removeAllListeners("ate");
      ConcurrentFetcherInstance.removeAllListeners("full");
    };
  }, [fetch]);

  const reset = () => {
    setResult({ ok: 0, done: false });
    setProgress(0);
    ConcurrentFetcherInstance.reset();
  };

  const launch = async (numOfRequests, concurrency) => {
    if (numOfRequests <= 0 || concurrency <= 0) {
      throw new Error(
        `Invalid config: ${JSON.stringify({ numOfRequests, concurrency })}`
      );
    }

    reset();
    ConcurrentFetcherInstance.numOfRequests = numOfRequests;

    for (let i = 0; i < concurrency; i++) {
      ConcurrentFetcherInstance.doFetch(fetch);
    }
  };

  return { progress, result, launch };
};

export default useConcurrentFetch;
