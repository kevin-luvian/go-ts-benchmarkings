import { Col, InputNumber, Row, Slider, Form, Input } from "antd";
import CustomDropdown from "./CustomDropdown";

/**
 * @typedef {import('./types').InputState} InputState
 */

/**
 * @param {object} props
 * @param {InputState} props.data
 * @param {function(InputState): void} props.onStateChange
 */
const Inputs = ({ data, onStateChange }) => {
  const onChange = (obj) => {
    onStateChange({ ...data, ...obj });
  };

  return (
    <Form labelCol={{ span: 8, lg: 4 }} wrapperCol={{ span: 16, lg: 20 }}>
      <Form.Item label="Target URL">
        <Row>
          <Col span={16} md={19}>
            <CustomDropdown
              defaultItems={[
                "http://localhost:9002/ingest-57",
                "http://localhost:9002/ingest-900-sq-bulk-create",
                "http://localhost:9002/ingest-900-sq-raw-query",
                "http://localhost:9002/ingest-900-sqbc-no-transaction",
                "http://localhost:9002/ingest-900-sqrc-no-transaction",
                "=====",
                "http://172.104.53.212:9002/ingest-57",
                "http://172.104.53.212:9002/ingest-900-sq-bulk-create",
                "http://172.104.53.212:9002/ingest-900-sq-raw-query",
                "http://172.104.53.212:9002/ingest-900-sqbc-no-transaction",
                "http://172.104.53.212:9002/ingest-900-sqrc-no-transaction",
              ]}
              value={data.url}
              setValue={(val) => onChange({ url: val })}
            />
          </Col>
          <Col span={8} md={4} offset={1}>
            <InputNumber
              prefix="limit:"
              min={0}
              max={500000}
              step={1000}
              style={{ width: "100%" }}
              value={data.limit}
              onChange={(val) => onChange({ limit: val })}
            />
          </Col>
        </Row>
      </Form.Item>
      <Form.Item label="Target SSE URL">
        <Row>
          <Col span={24}>
            <CustomDropdown
              defaultItems={["http://localhost:9003/sse", "=====", "http://172.104.53.212:9003/sse"]}
              value={data.sseurl}
              setValue={(val) => onChange({ sseurl: val })}
            />
          </Col>
        </Row>
      </Form.Item>
      <Form.Item label="Target File">
        <Row>
          <Input disabled placeholder="input placeholder" />
        </Row>
      </Form.Item>
      <Form.Item label="Total Requests:">
        <Row>
          <Col span={16} md={19}>
            <Slider min={1} max={50} value={data.numOfRequests} onChange={(val) => onChange({ numOfRequests: val })} />
          </Col>
          <Col span={8} md={4} offset={1}>
            <InputNumber
              min={1}
              max={500}
              style={{ width: "100%" }}
              value={data.numOfRequests}
              onChange={(val) => onChange({ numOfRequests: val })}
            />
          </Col>
        </Row>
      </Form.Item>
      <Form.Item label="Concurrent Requests:">
        <Row>
          <Col span={16} md={19}>
            <Slider min={1} max={10} onChange={(val) => onChange({ concurrency: val })} value={data.concurrency} />
          </Col>
          <Col span={8} md={4} offset={1}>
            <InputNumber min={1} max={100} style={{ width: "100%" }} value={data.concurrency} onChange={(val) => onChange({ concurrency: val })} />
          </Col>
        </Row>
      </Form.Item>
    </Form>
  );
};

export default Inputs;
