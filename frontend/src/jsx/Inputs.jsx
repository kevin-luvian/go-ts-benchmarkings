import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  Col,
  InputNumber,
  Row,
  Slider,
  Form,
  Input,
  Radio,
  Typography,
} from "antd";
const { Text } = Typography;

/**
 * @typedef {import('./types').InputState} InputState
 */

/**
 * @param {object} props
 * @param {InputState} props.data
 * @param {function(InputState): void} props.onStateChange 
 */
const Inputs = ({data, onStateChange}) => {
  const onChange = (obj) => {
    onStateChange({ ...data, ...obj });
  };

  const formItemLayout = {
    labelCol: {
      span: 6,
    },
    wrapperCol: {
      span: 18,
    },
  };

  return (
    <Form labelCol={{ span: 8, lg: 4 }} wrapperCol={{ span: 16, lg: 20 }}>
      <Form.Item label="Field A">
        <Input placeholder="input placeholder" />
      </Form.Item>
      <Form.Item label="Field B">
        <Input placeholder="input placeholder" />
      </Form.Item>
      <Form.Item label="Num of Requests:">
        <Row>
          <Col span={16} md={20}>
            <Slider
              min={1}
              max={10000}
              value={data.numOfRequests}
              onChange={(val) => onChange({ numOfRequests: val })}
            />
          </Col>
          <Col span={8} md={4}>
            <InputNumber
              min={1}
              max={10000}
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
              max={100}
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
    // <Row>
    //   <Col span={5}>
    //     <Text style={{ margin: 0 }}>Num of Requests:</Text>
    //   </Col>
    //   <Col span={17}>
    //   </Col>
    // </Row>
  );
};

export default Inputs;
