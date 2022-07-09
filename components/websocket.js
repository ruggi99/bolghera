import { useCallback, useEffect, useState } from "react";

export default function useWebsocket() {
  const [, setWs] = useState(null);
  const [error, setError] = useState(false);
  const [data, setData] = useState(null);
  const onMessage = useCallback(
    (ev) => {
      setData(JSON.parse(ev.data));
    },
    [setData]
  );
  const onError = useCallback(() => {
    setError(true);
    console.error("C'è stato un errore");
  }, []);
  const openWs = useCallback(() => {
    setError(false);
    const _ws = new WebSocket(`ws://${location.hostname}:8500`);
    _ws.addEventListener("message", onMessage);
    _ws.addEventListener("open", () => console.log("Websocket aperto"));
    _ws.addEventListener("close", onError);
    _ws.addEventListener("error", onError);
    setWs(_ws);
  }, [setWs, onMessage, onError]);
  useEffect(() => {
    if (error) {
      setTimeout(openWs, 10000);
    }
  }, [openWs, error]);
  useEffect(openWs, [openWs]);
  return data;
}
