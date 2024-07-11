// src/app/components/WebSocketControl.js
"use client";

import React, { useState, useEffect } from "react";

const BITQUERY_WS_URL = "wss://streaming.bitquery.io/eap?token=ory_at_GRtFzlt0Q7a08DOcGBUcGlTHDv4BC5NwY6hxA1I4X-Q.p-GUFa-_LV5kbf0o2N6c6wPX5HMtNT2zltPAuKFU6Ig";

const WebSocketControl = () => {
  const [status, setStatus] = useState("Stopped");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (status === "Started") {
      const ws = new WebSocket(BITQUERY_WS_URL, "graphql-ws");

      ws.onopen = () => {
        console.log("Connected to Bitquery.");
        const initMessage = JSON.stringify({ type: "connection_init" });
        ws.send(initMessage);

        setTimeout(() => {
          const message = JSON.stringify({
            type: "start",
            id: "1",
            payload: {
              query: `
              subscription MyQuery {
                Solana {
                  DEXTradeByTokens(
                    where: {Trade: {Dex: {ProgramAddress: {is: "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"}}, Side: {Currency: {MintAddress: {is: "So11111111111111111111111111111111111111112"}}}}, Block: {Time: {since: "2024-07-10T05:31:00Z"}}, Transaction: {Result: {Success: true}}}
                  ) {
                    Trade {
                      Dex {
                        ProtocolName
                        ProtocolFamily
                        ProgramAddress
                      }
                    }
                    TotalVolume: sum(of: Trade_Side_AmountInUSD)
                    count
                  }
                }
              }
              `
            }
          });
          ws.send(message);
        }, 1000);
      };

      ws.onmessage = (event) => {
        const response = JSON.parse(event.data);
        if (response.type === "data") {
          console.log("Received data from Bitquery: ", response.payload.data);
        }
      };

      ws.onclose = () => {
        console.log("Disconnected from Bitquery.");
        setStatus("Stopped");
        setSocket(null);
      };

      ws.onerror = (error) => {
        console.error("WebSocket Error:", error);
      };

      setSocket(ws);
    } else if (socket) {
      socket.close();
    }
  }, [status]);

  const handleButtonClick = () => {
    setStatus((prevStatus) => (prevStatus === "Stopped" ? "Started" : "Stopped"));
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f8f9fa" }}>
      <button
        onClick={handleButtonClick}
        style={{ padding: "10px 20px", fontSize: "16px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
      >
        {status === "Stopped" ? "Start" : "Stop"}
      </button>
    </div>
  );
};

export default WebSocketControl;
