"use client";

import React from "react";

const TopVolumeList = ({ data }) => {
  return (
    <div className="w-full max-w-2xl p-4 bg-white rounded shadow-lg">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">Top 10 Volume Trades</h2>
      <ul className="divide-y divide-gray-200">
        {data.map((trade, index) => (
          <li key={index} className="py-4">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Currency: {trade.Trade.Currency.Name} ({trade.Trade.Currency.Symbol})</p>
                <p className="text-sm text-gray-500">Mint Address: {trade.Trade.Currency.MintAddress}</p>
                <p className="text-sm text-gray-500">Dex Protocol: {trade.Trade.Dex.ProtocolName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">Volume: ${trade.volume}</p>
                <p className="text-sm text-gray-500">Count: {trade.count}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopVolumeList;
