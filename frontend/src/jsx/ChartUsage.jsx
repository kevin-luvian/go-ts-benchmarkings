import { Fragment } from "react";
import { MetricTick } from "./internal/entities/Metrics";
import { DualAxes } from "@ant-design/plots";
const metricsData = [
  { cpu_usage: 9, memory_usage: 43, ts: 1684654480435, hms: "14:34:40" },
  { cpu_usage: 9, memory_usage: 44, ts: 1684654480934, hms: "14:34:40" },
  { cpu_usage: 9, memory_usage: 43, ts: 1684654481434, hms: "14:34:41" },
  { cpu_usage: 9, memory_usage: 43, ts: 1684654481936, hms: "14:34:41" },
  { cpu_usage: 9, memory_usage: 43, ts: 1684654482434, hms: "14:34:42" },
  { cpu_usage: 9, memory_usage: 43, ts: 1684654482934, hms: "14:34:42" },
  { cpu_usage: 9, memory_usage: 44, ts: 1684654483435, hms: "14:34:43" },
  { cpu_usage: 9, memory_usage: 44, ts: 1684654483935, hms: "14:34:43" },
  { cpu_usage: 9, memory_usage: 43, ts: 1684654484435, hms: "14:34:44" },
  { cpu_usage: 9, memory_usage: 43, ts: 1684654484934, hms: "14:34:44" },
  { cpu_usage: 9, memory_usage: 43, ts: 1684654485434, hms: "14:34:45" },
  { cpu_usage: 9, memory_usage: 44, ts: 1684654485934, hms: "14:34:45" },
  { cpu_usage: 9, memory_usage: 44, ts: 1684654486434, hms: "14:34:46" },
  { cpu_usage: 9, memory_usage: 44, ts: 1684654486934, hms: "14:34:46" },
  { cpu_usage: 9, memory_usage: 44, ts: 1684654487435, hms: "14:34:47" },
  { cpu_usage: 9, memory_usage: 44, ts: 1684654487935, hms: "14:34:47" },
  { cpu_usage: 9, memory_usage: 44, ts: 1684654488434, hms: "14:34:48" },
  { cpu_usage: 9, memory_usage: 44, ts: 1684654488934, hms: "14:34:48" },
  { cpu_usage: 9, memory_usage: 44, ts: 1684654489434, hms: "14:34:49" },
  { cpu_usage: 9, memory_usage: 44, ts: 1684654489934, hms: "14:34:49" },
  { cpu_usage: 9, memory_usage: 44, ts: 1684654490435, hms: "14:34:50" },
  { cpu_usage: 9, memory_usage: 44, ts: 1684654490935, hms: "14:34:50" },
  { cpu_usage: 9, memory_usage: 44, ts: 1684654491435, hms: "14:34:51" },
  { cpu_usage: 9, memory_usage: 44, ts: 1684654491934, hms: "14:34:51" },
  { cpu_usage: 9, memory_usage: 44, ts: 1684654492435, hms: "14:34:52" },
  { cpu_usage: 9, memory_usage: 44, ts: 1684654492935, hms: "14:34:52" },
  { cpu_usage: 9, memory_usage: 44, ts: 1684654493435, hms: "14:34:53" },
  { cpu_usage: 9, memory_usage: 44, ts: 1684654493934, hms: "14:34:53" },
  { cpu_usage: 9, memory_usage: 44, ts: 1684654494435, hms: "14:34:54" },
  { cpu_usage: 9, memory_usage: 44, ts: 1684654494935, hms: "14:34:54" },
  { cpu_usage: 9, memory_usage: 44, ts: 1684654495434, hms: "14:34:55" },
  { cpu_usage: 9, memory_usage: 44, ts: 1684654495934, hms: "14:34:55" },
  { cpu_usage: 9, memory_usage: 44, ts: 1684654496434, hms: "14:34:56" },
  { cpu_usage: 9, memory_usage: 44, ts: 1684654496935, hms: "14:34:56" },
  { cpu_usage: 9, memory_usage: 44, ts: 1684654497434, hms: "14:34:57" },
  { cpu_usage: 9, memory_usage: 44, ts: 1684654497934, hms: "14:34:57" },
  { cpu_usage: 9, memory_usage: 44, ts: 1684654498434, hms: "14:34:58" },
  { cpu_usage: 9, memory_usage: 44, ts: 1684654498934, hms: "14:34:58" },
  { cpu_usage: 9, memory_usage: 44, ts: 1684654499435, hms: "14:34:59" },
  { cpu_usage: 9, memory_usage: 44, ts: 1684654499934, hms: "14:34:59" },
  { cpu_usage: 9, memory_usage: 43, ts: 1684654500435, hms: "14:35:00" },
  { cpu_usage: 9, memory_usage: 44, ts: 1684654500935, hms: "14:35:00" },
  { cpu_usage: 9, memory_usage: 44, ts: 1684654501435, hms: "14:35:01" },
  { cpu_usage: 9, memory_usage: 44, ts: 1684654501935, hms: "14:35:01" },
  { cpu_usage: 9, memory_usage: 44, ts: 1684654502435, hms: "14:35:02" },
];

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
