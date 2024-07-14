"use client";

import React, { useState } from "react";
import { ClipLoader } from "react-spinners";

const BITQUERY_WS_URL =
  "wss://streaming.bitquery.io/eap?token=ory_at_GRtFzlt0Q7a08DOcGBUcGlTHDv4BC5NwY6hxA1I4X-Q.p-GUFa-_LV5kbf0o2N6c6wPX5HMtNT2zltPAuKFU6Ig";

const WebSocketControl = () => {
  const [status, setStatus] = useState("Stopped");
  const [socket, setSocket] = useState(null);
  const [tradeData, setTradeData] = useState([]);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);

  const fetchTrades = () => {
    setLoading(true);
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
              query MyQuery {
                Solana {
                  DEXTradeByTokens(
                    limit: {count: ${limit}}
                    orderBy: {descendingByField: "volume"}
                    where: {
                      Trade: {
                        Dex: {
                          ProgramAddress: {is: "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"}
                        },
                        Side: {
                          Currency: {MintAddress: {is: "So11111111111111111111111111111111111111112"}}
                        }
                      },
                      Transaction: {Result: {Success: true}}
                    }
                  ) {
                    Trade {
                      Currency {
                        Name
                        MintAddress
                        Symbol
                      }
                      Side {
                        Currency {
                          Name
                          MintAddress
                          Symbol
                        }
                      }
                      Market {
                        MarketAddress
                      }
                      Dex {
                        ProtocolName
                        ProtocolFamily
                        ProgramAddress
                      }
                    }
                    volume: sum(of: Trade_Side_AmountInUSD)
                  }
                }
              }
            `,
          },
        });
        ws.send(message);
      }, 1000);
    };

    ws.onmessage = (event) => {
      const response = JSON.parse(event.data);
      if (response.type === "data") {
        console.log("Received data from Bitquery: ", response.payload.data);
        const trades = response.payload.data.Solana.DEXTradeByTokens;
        if (trades) {
          setTradeData(trades);
        }
        setLoading(false);
        ws.close();
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from Bitquery.");
      setStatus("Stopped");
      setSocket(null);
    };

    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
      setLoading(false);
    };

    setSocket(ws);
  };

  const handleButtonClick = () => {
    setStatus("Started");
    fetchTrades();
  };

  const handleLimitChange = (e) => {
    setLimit(e.target.value);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="mb-4 flex items-center">
        <label className="ml-4">
          Limit:
          <input
            type="number"
            value={limit}
            onChange={handleLimitChange}
            min="1"
            max="100"
            className="ml-2 p-1 border rounded text-black"
          />
        </label>
      </div>
      <button
        onClick={handleButtonClick}
        className="px-4 py-2 mb-4 text-white bg-blue-500 rounded"
        disabled={loading}
      >
        {loading ? <ClipLoader size={24} color="#ffffff" /> : "Fetch"}
      </button>
      <div className="overflow-x-auto w-full max-w-7xl mx-auto p-4" style={{ scrollbarColor: "white" }}>
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-white">
              <th className="px-4 py-2 border">Protocol Name</th>
              <th className="px-4 py-2 border">Volume (USD)</th>
              <th className="px-4 py-2 border">Market Address</th>
              <th className="px-4 py-2 border">Currency</th>
              <th className="px-4 py-2 border">Currency Symbol</th>
              <th className="px-4 py-2 border">Currency Mint Address</th>
              <th className="px-4 py-2 border">Side Currency</th>
              <th className="px-4 py-2 border">Side Currency Symbol</th>
              <th className="px-4 py-2 border">Side Currency Mint Address</th>
            </tr>
          </thead>
          <tbody>
            {tradeData.map((trade, index) => (
              <tr key={index} className="text-white">
                <td className="px-4 py-2 border">{trade.Trade.Dex.ProtocolName}</td>
                <td className="px-4 py-2 border">{trade.volume}</td>
                <td className="px-4 py-2 border">{trade.Trade.Market.MarketAddress}</td>
                <td className="px-4 py-2 border">{trade.Trade.Currency.Name}</td>
                <td className="px-4 py-2 border">{trade.Trade.Currency.Symbol}</td>
                <td className="px-4 py-2 border">{trade.Trade.Currency.MintAddress}</td>
                <td className="px-4 py-2 border">{trade.Trade.Side.Currency.Name}</td>
                <td className="px-4 py-2 border">{trade.Trade.Side.Currency.Symbol}</td>
                <td className="px-4 py-2 border">{trade.Trade.Side.Currency.MintAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WebSocketControl;
