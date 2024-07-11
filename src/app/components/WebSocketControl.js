import React, { useState, useEffect } from "react";

const BITQUERY_WS_URL =
  "wss://streaming.bitquery.io/eap?token=ory_at_GRtFzlt0Q7a08DOcGBUcGlTHDv4BC5NwY6hxA1I4X-Q.p-GUFa-_LV5kbf0o2N6c6wPX5HMtNT2zltPAuKFU6Ig";

const WebSocketControl = () => {
  const [status, setStatus] = useState("Fetch");
  const [socket, setSocket] = useState(null);
  const [tradeData, setTradeData] = useState([]);
  const [hours, setHours] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ws;

    const connectWebSocket = () => {
      ws = new WebSocket(BITQUERY_WS_URL, "graphql-ws");

      ws.onopen = () => {
        console.log("Connected to Bitquery.");
        const initMessage = JSON.stringify({ type: "connection_init" });
        ws.send(initMessage);

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
                      Block: {Time: {since: "${new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()}"}},
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
      };

      ws.onmessage = (event) => {
        const response = JSON.parse(event.data);
        if (response.type === "data") {
          console.log("Received data from Bitquery: ", response.payload.data);
          const trades = response.payload.data.Solana.DEXTradeByTokens;
          if (trades) {
            setTradeData(trades);
            setLoading(false); // Stop loading once data is fetched
            setStatus("Fetch"); // Change status to Fetch to disconnect socket
          }
        }
      };

      ws.onclose = () => {
        console.log("Disconnected from Bitquery.");
        setStatus("Fetch"); // Change status to Fetch to disconnect socket
        setSocket(null);
      };

      ws.onerror = (error) => {
        console.error("WebSocket Error:", error);
      };

      setSocket(ws);
    };

    if (status === "Fetch") {
      connectWebSocket();
      setLoading(true); // Start loading when fetching data
    } else {
      if (ws) {
        ws.close();
        setSocket(null);
      }
    }

    return () => {
      if (ws) {
        ws.close();
        setSocket(null);
      }
    };
  }, [status, hours, limit]);

  const handleFetchClick = () => {
    setStatus("Started");
  };

  const handleHoursChange = (e) => {
    setHours(e.target.value);
  };

  const handleLimitChange = (e) => {
    setLimit(e.target.value);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="mb-4">
        <label htmlFor="hoursInput" className="mr-2 text-black">
         Past Hours:
        </label>
        <input
          id="hoursInput"
          type="number"
          value={hours}
          onChange={handleHoursChange}
          min="1"
          className="ml-2 p-1 border rounded text-black"
        />
        <label htmlFor="limitInput" className="ml-4 text-black">
          Limit:
        </label>
        <input
          id="limitInput"
          type="number"
          value={limit}
          onChange={handleLimitChange}
          min="1"
          max="100"
          className="ml-2 p-1 border rounded text-black"
        />
      </div>
      <button
        onClick={handleFetchClick}
        className={`px-4 py-2 text-white bg-blue-500 rounded cursor-pointer mb-4 ${
          loading ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {loading ? "Fetching..." : "Fetch"}
      </button>
      <div className="w-full bg-white rounded shadow-lg overflow-x-auto">
        <table className="w-full whitespace-nowrap divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Currency
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Currency Symbol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mint Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dex Protocol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Market Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Volume
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tradeData.map((trade, index) => (
              <tr key={index}>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {trade.Trade.Currency.Name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {trade.Trade.Currency.Symbol}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {trade.Trade.Currency.MintAddress}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {trade.Trade.Dex.ProtocolName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {trade.Trade.Market.MarketAddress}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {trade.volume} USD
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WebSocketControl;
