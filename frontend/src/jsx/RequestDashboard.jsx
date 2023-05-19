import { Fragment } from "react";
import { Divider, List, Row, Col, Progress, Statistic } from "antd";
import { RequestObject } from "./internal/Entities";

// const makeRequests = (num, status) => {
//   const arr = [];
//   for (let i = 0; i < num; i++) {
//     const obj = new RequestObject({
//       ID: `reqid-${i}`,
//       Status: status,
//     });
//     obj.TS = [100000, 100500, 101000, 101500];
//     obj.Total = [1000, 2000, 3000, 4000];
//     arr.push(obj);
//   }
//   return arr;
// };

// const running = makeRequests(5, "running");
// const histories = makeRequests(10, "done");

/**
 * get differences between incremental array
 * @param {[number]} arrTS
 */
const calcDiff = (arr) => {
  if (arr.length <= 1) {
    return [0];
  }

  const diff = [];
  for (let i = 0; i < arr.length - 1; i++) {
    diff.push(arr[i + 1] - arr[i]);
  }

  return diff;
};

const calcAverage = (arr) => {
  if (arr.length === 0) {
    return 0;
  }
  return Math.floor(arr.reduce((a, b) => a + b, 0) / arr.length);
};

/**
 * @param {Object} param0
 * @param {RequestObject[]} param0.running
 * @param {RequestObject[]} param0.histories
 */
const Dashboard = ({ running, histories }) => {
  return (
    <Fragment>
      <Divider orientation="left" />

      <List
        size="large"
        header={
          <div>
            {"ʕっ•ᴥ•ʔっ  "} <b>Running Requests</b>
          </div>
        }
        footer={<div>=== :OwO: ===</div>}
        bordered
        dataSource={running}
        renderItem={(item) => {
          const latency = item.getLatency();
          const avg = item.getAvg();
          const total = item.getTotal();
          const lastTs = formatDate(item.getLastTS());

          return (
            <List.Item>
              <Row style={{ width: "100%" }}>
                <Col span={10}>
                  <Statistic title="ID" value={item.ID} />
                </Col>
                <Col span={7}>
                  <Statistic title="Average Latency" value={avg + "ms"} />
                </Col>
                <Col span={7}>
                  <Statistic title="Total Processed" value={total} />
                </Col>
                <Col span={10} />
                <Col span={7}>
                  <Statistic title="Update Latency" value={latency + "ms"} />
                </Col>
                <Col span={7}>
                  <Statistic title="Last Ts" value={lastTs} />
                </Col>
                <Col span={24}>
                  <Progress percent={100} status="active" showInfo={false} />
                </Col>
              </Row>
            </List.Item>
          );
        }}
      />

      <Divider orientation="left" />
      <Divider orientation="left" />

      <List
        size="default"
        header={
          <div>
            {"[¬º-°]¬  "} <b>Histories Requests</b>
          </div>
        }
        footer={<div>=== :OwO: ===</div>}
        bordered
        dataSource={histories}
        renderItem={(item) => {
          const avgLatency = item.getAvg();
          const firstTs = item.getFirstTS();
          const lastTs = item.getLastTS();
          const total = item.getTotal();

          const timeTookSeconds = Math.floor(
            (this.lastTs - this.firstTs) / 1000
          );
          const wps = total / timeTookSeconds;

          return (
            <List.Item>
              <Row style={{ width: "100%" }}>
                <Col span={6}>
                  <Statistic title="ID" value={item.ID} />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Average Latency"
                    value={avgLatency + "ms"}
                  />
                </Col>
                <Col span={6}>
                  <Statistic title="Writes Per Seconds" value={`${wps}/s`} />
                </Col>
                <Col span={6}>
                  <Statistic title="Total Processed" value={total} />
                </Col>
                <Col span={6} />
                <Col span={6}>
                  <Statistic title="Started At" value={formatDate(firstTs)} />
                </Col>
                <Col span={6}>
                  <Statistic title="Finished At" value={formatDate(lastTs)} />
                </Col>
                <Col span={6}>
                  <Statistic title="Time" value={timeTookSeconds} />
                </Col>
                <Col span={24}>
                  <Statistic
                    style={{ color: "red!important" }}
                    title="Error Message"
                    value={item.Message}
                  />
                </Col>
                {/* <Col span={24}>{JSON.stringify(item)}</Col> */}
              </Row>
            </List.Item>
          );
        }}
      />
    </Fragment>
  );
};

const formatDate = (ts) => {
  if (ts <= 0) {
    return "invalid date";
  }
  const ndate = new Date(ts);
  return ndate.getHours() + ":" + ndate.getMinutes() + ":" + ndate.getSeconds();
};

export default Dashboard;
