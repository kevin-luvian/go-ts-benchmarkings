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
        <CustomDropdown
          defaultItems={[
            "http://localhost:9001/ingest-57",
            "http://localhost:9002/ingest-57",
          ]}
          value={data.url}
          setValue={(val) => onChange({ url: val })}
        />
      </Form.Item>
      <Form.Item label="Target SSE URL">
        <CustomDropdown
          defaultItems={["http://localhost:9003/sse"]}
          value={data.sseurl}
          setValue={(val) => onChange({ sseurl: val })}
        />
      </Form.Item>
      <Form.Item label="Target File">
        <Input disabled placeholder="input placeholder" />
      </Form.Item>
      <Form.Item label="Total Requests:">
        <Row>
          <Col span={16} md={20}>
            <Slider
              min={1}
              max={50}
              value={data.numOfRequests}
              onChange={(val) => onChange({ numOfRequests: val })}
            />
          </Col>
          <Col span={8} md={4}>
            <InputNumber
              min={1}
              max={500}
              style={{ margin: "0 16px" }}
              value={data.numOfRequests}
              onChange={(val) => onChange({ numOfRequests: val })}
            />
          </Col>
        </Row>
      </Form.Item>
      <Form.Item label="Concurrent Requests:">
        <Row>
          <Col span={16} md={20}>
            <Slider
              min={1}
              max={10}
              onChange={(val) => onChange({ concurrency: val })}
              value={data.concurrency}
            />
          </Col>
          <Col span={8} md={4}>
            <InputNumber
              min={1}
              max={100}
              style={{ margin: "0 16px" }}
              value={data.concurrency}
              onChange={(val) => onChange({ concurrency: val })}
            />
          </Col>
        </Row>
      </Form.Item>
    </Form>
  );
};

export default Inputs;
