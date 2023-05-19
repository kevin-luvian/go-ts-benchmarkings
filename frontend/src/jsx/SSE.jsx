import { Fragment } from "react";
import { Button } from "antd";

const APPSSE = () => {
  const handleClick = () => {
    isSSERunning ? startSSE() : stopSSE();
  };
  return (
    <Fragment>
      <p>SSE</p>
      <Button onClick={handleClick}>
        {isSSERunning ? "Close SSE Listeners" : "Start Listening SSE"}
      </Button>
      <p>ll</p>
    </Fragment>
  );
};

export default APPSSE;
