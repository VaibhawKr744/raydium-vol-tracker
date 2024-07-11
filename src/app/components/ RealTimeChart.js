// src/app/components/RealTimeChart.js

import React, { useRef, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const RealTimeChart = ({ data }) => {
  const chartRef = useRef(null);

  const chartData = {
    labels: data.map((_, index) => index),
    datasets: [
      {
        label: 'Total Volume',
        data: data,
        fill: false,
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.1,
      },
    ],
  };

  useEffect(() => {
    if (chartRef.current && chartRef.current.chartInstance) {
      chartRef.current.chartInstance.update();
    }
  }, [data]);

  return (
    <div style={{ width: "100%", height: "600px" }}>
      <Line ref={chartRef} data={chartData} />
    </div>
  );
};

export default RealTimeChart;
