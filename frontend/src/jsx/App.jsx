import { Fragment, useEffect, useState } from "react";
import { Button, Layout, Typography, Progress, Divider } from "antd";
import { SendOutlined } from "@ant-design/icons";
import Inputs from "./Inputs";
import useOrchestrator from "./hooks/useOrchestrator";
import Dashboard from "./RequestDashboard";

const { Title } = Typography;
const { Header, Content } = Layout;

const App = () => {
  const {
    start: startOrc,
    stop: stopOrc,
    isDone: isOrcDone,
    requests,
    histories,
  } = useOrchestrator();

  const [isProcessing, setIsProcessing] = useState(false);
  const [inpConfig, setInpConfig] = useState({
    url: "",
    sseurl: "",
    numOfRequests: 5,
    concurrency: 3,
  });

  const pp = Math.floor(
    ((requests.length / 2 + histories.length) / inpConfig.numOfRequests) * 100
  );

  useEffect(() => {
    if (isOrcDone) {
      setIsProcessing(false);
    }
  }, [isOrcDone]);

  const handleButtonClick = () => {
    if (!inpConfig.url || !inpConfig.sseurl) {
      alert("Please enter a valid URL");
      return;
    }

    setIsProcessing(true);
    startOrc({
      url: inpConfig.url,
      sseURL: inpConfig.sseurl,
      numOfRequests: inpConfig.numOfRequests,
      concurrency: inpConfig.concurrency,
      prefix: "owo-" + Math.random().toString(36).substring(2, 5),
    });
  };

  const handleAbort = () => {
    setIsProcessing(false);
    stopOrc();
  };

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
            OwO Benchmarker V0.4
          </Title>
        </Header>
        <Content style={{ padding: "2rem 3rem", height: "100%" }}>
          <Inputs data={inpConfig} onStateChange={setInpConfig} />
          <div style={{ margin: "auto", textAlign: "center" }}>
            <Button
              type="primary"
              shape="round"
              size="large"
              loading={isProcessing}
              onClick={() => handleButtonClick()}
            >
              Bench!! <SendOutlined />
            </Button>
            {isProcessing && (
              <Button
                danger
                style={{ marginLeft: "1rem" }}
                type="primary"
                shape="round"
                size="large"
                onClick={() => handleAbort()}
              >
                Panic!! <SendOutlined />
              </Button>
            )}
          </div>

          <Divider orientation="left" />

          <Progress
            percent={pp}
            strokeColor={{ "0%": "#108ee9", "100%": "#87d068" }}
          />

          <Dashboard running={requests} histories={histories} />
        </Content>
      </Layout>
    </Fragment>
  );
};

export default App;
