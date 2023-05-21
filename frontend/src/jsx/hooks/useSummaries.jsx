import { useEffect, useState } from "react";
import { HistoriesControllerSingleton } from "../internal/HistoriesController";
import { SummaryObject } from "../internal/entities/Summary";
import { useInterval } from "./useInterval";

const useSummaries = () => {
  /**
   * @type {[SummaryObject[], (requests: SummaryObject[]) => void]}
   */
  const [summaries, setSummaries] = useState([]);

  const cloneSummaries = () => {
    if (_.isEqual(summaries, HistoriesControllerSingleton.SummaryHistories)) {
      return;
    }
    setSummaries(_.cloneDeep(HistoriesControllerSingleton.SummaryHistories));
  };

  useInterval(() => {
    cloneSummaries();
  }, 500);

  useEffect(() => {
    cloneSummaries();
  }, []);

  return [summaries];
};

export default useSummaries;
