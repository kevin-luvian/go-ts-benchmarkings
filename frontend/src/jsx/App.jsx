import React, { Fragment, useEffect, useRef, useState } from "react";
import { Button, Layout, Menu, theme, Typography, Progress } from "antd";
import { SendOutlined } from "@ant-design/icons";
import Inputs from "./Inputs";
import useConcurrentFetch from "./hooks/useConcurrentFetch";
import { fetch } from "./http/mockFetch";

const { Title } = Typography;
const { Header, Content, Sider } = Layout;

const App = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [fetchConfig, setFetchConfig] = useState({
    url: "",
  });

  const [inpConfig, setInpConfig] = useState({
    numOfRequests: 100,
    concurrency: 10,
  });

  const { progress, result, launch } = useConcurrentFetch((n) =>
    fetch(fetchConfig.url, n)
  );

  const handleButtonClick = () => {
    setIsProcessing(true);
    const { numOfRequests, concurrency } = inpConfig;
    launch(numOfRequests, concurrency);
  };

  const pp = Math.floor((progress / inpConfig.numOfRequests) * 100);

  useEffect(() => {
    setIsProcessing(!result.done);
  }, [result]);

  return (
    <Fragment>
      <Layout style={{ minHeight: "100vh" }}>
        <Header
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <img src="/rocket.png" width="30px" height="30px" />
          <Title
            level={4}
            style={{ color: "white", margin: 0, marginLeft: "1rem" }}
          >
            OwO Benchmarker
          </Title>
        </Header>
        <Content style={{ padding: "2rem 3rem", height: "100%" }}>
          <Inputs data={inpConfig} onStateChange={setInpConfig} />
          <Button
            type="primary"
            shape="round"
            size="large"
            loading={isProcessing}
            onClick={() => handleButtonClick()}
          >
            Bench!! <SendOutlined />
          </Button>

          <Progress
            percent={pp}
            strokeColor={{ "0%": "#108ee9", "100%": "#87d068" }}
          />

          <p>
            Progress: {progress} {pp}
          </p>
          <p>Results: {JSON.stringify(result)}</p>
        </Content>
      </Layout>
    </Fragment>
  );
};

export default App;
