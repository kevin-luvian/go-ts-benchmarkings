import { useEffect, useState } from "react";

const useResizeBouncer = (callback, delay) => {
  const [resizeTimeout, setResizeTimeout] = useState(null);

  const handleResize = () => {
    clearTimeout(resizeTimeout);
    const newResizeTimeout = setTimeout(() => {
      callback();
    }, delay);
    setResizeTimeout(newResizeTimeout);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [callback, delay, resizeTimeout]);

  return resizeTimeout;
};

export default useResizeBouncer;
