import { Fragment } from "react";
import { MetricTick } from "./internal/entities/Metrics";
import { DualAxes } from "@ant-design/plots";

let rcount = 0;
/**
 * @param {Object} param0
 * @param {MetricTick[]} param0.metrics
 */
const ChartUsage = ({ metrics }) => {
  return (
    <Fragment>
      <DualAxes
        renderer="svg"
        data={[metrics, metrics]}
        height={170}
        xField="hms"
        yField={["cpu_usage", "memory_usage"]}
        geometryOptions={[
          {
            geometry: "line",
            color: "#5B8FF9",
          },
          {
            geometry: "line",
            color: "#5AD8A6",
          },
        ]}
        meta={{
          cpu_usage: {
            min: 0,
            max: 100,
            formatter: (v) => `${v}%`,
          },
          memory_usage: {
            min: 0,
            max: 100,
            formatter: (v) => `${v}%`,
          },
        }}
      />
    </Fragment>
  );
};

export default ChartUsage;
