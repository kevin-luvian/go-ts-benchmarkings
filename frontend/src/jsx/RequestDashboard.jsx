import { Fragment, useState } from "react";
import {
  Divider,
  List,
  Row,
  Col,
  Progress,
  Statistic,
  Tabs,
  Descriptions,
} from "antd";
import { RequestStatus } from "./internal/entities/Consts";
import { RequestObject } from "./internal/entities/Request";
import { SummaryObject } from "./internal/entities/Summary";
import useSummaries from "./hooks/useSummaries";
import ChartUsage from "./ChartUsage";

/**
 * @param {Object} param0
 * @param {RequestObject[]} param0.running
 * @param {RequestObject[]} param0.histories
 */
const Dashboard = ({ running, histories }) => {
  const [activeTab, setActiveTab] = useState("current_histories");

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

      <Tabs
        onChange={setActiveTab}
        activeKey={activeTab}
        items={[
          {
            label: `Current History`,
            key: "current_histories",
            children: <HistoriesTable histories={histories} />,
          },
          {
            label: `Summary`,
            key: "summary",
            children: <Summaries />,
          },
        ]}
      />
    </Fragment>
  );
};

/**
 *
 * @param {Object} param0
 * @param {RequestObject[]} param0.histories
 */
const HistoriesTable = ({ histories }) => (
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
      const firstTs = item.getFirstTs();
      const lastTs = item.getLastTS();
      const total = item.getTotal();
      const timeTookSeconds = item.getTimeTookSeconds();
      const wps = item.getWritesPerSeconds();

      return (
        <List.Item>
          <Row style={{ width: "100%" }}>
            <Col span={6}>
              <Statistic title="ID" value={item.ID} />
            </Col>
            <Col span={6}>
              <Statistic title="Average Latency" value={avgLatency + "ms"} />
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
              <Statistic title="Time" value={timeTookSeconds + "s"} />
            </Col>
            <Col span={24}>
              <Statistic
                style={{ color: "red!important" }}
                title={
                  item.Status === RequestStatus.Error ? "Error Message" : "Done"
                }
                value={item.Status + ":" + item.Message}
              />
            </Col>
          </Row>
        </List.Item>
      );
    }}
  />
);

/**
 * @param {Object} param0
 * @param {SummaryObject[]} param0.summaries
 */
const Summaries = () => {
  const [summaries] = useSummaries();

  return (
    <Fragment>
      <List
        size="default"
        header={
          <div>
            {"(づ｡◕‿‿◕｡)づ  "} <b>Summaries</b>
          </div>
        }
        footer={<div>=== :OwO: ===</div>}
        bordered
        dataSource={summaries}
        renderItem={(summary) => (
          <List.Item>
            <Row style={{ width: "100%" }}>
              <Col span={24}>
                <Descriptions title={summary.url}>
                  <Descriptions.Item label="Total Requests">
                    {summary.totalRequests}
                  </Descriptions.Item>
                  <Descriptions.Item label="Concurrent Requests">
                    {summary.targetConcurrency}
                  </Descriptions.Item>
                  <Descriptions.Item label="Limit">
                    {summary.targetLimit}
                  </Descriptions.Item>
                  <Descriptions.Item label="First Timestamp">
                    {formatDate(summary.firstTs)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Last Timestamp">
                    {formatDate(summary.lastTs)}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={8}>
                <Statistic
                  title="Average Writes Per Seconds"
                  value={summary.getAvgWPS() + "/s"}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Average Duration"
                  value={summary.getAvgTimeTook() + "s"}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Total Duration"
                  value={
                    Math.floor((summary.lastTs - summary.firstTs) / 1000) + "s"
                  }
                />
              </Col>
              <Col span={24}>
                <ChartUsage metrics={summary.metrics} />
              </Col>
            </Row>
          </List.Item>
        )}
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
