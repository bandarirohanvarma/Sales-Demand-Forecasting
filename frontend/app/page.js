"use client";

import { useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

export default function Home() {
  const [months, setMonths] = useState(2);
  const [forecastData, setForecastData] = useState([]);
  const [totalSales, setTotalSales] = useState(null);
  const [loading, setLoading] = useState(false);

  const getForecast = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `https://sales-demand-forecasting.onrender.com/forecast?months=${months}`
      );

      const data = response.data;

      setForecastData(data);

      const total = data.reduce((sum, item) => sum + item.yhat, 0);
      setTotalSales(total.toFixed(2));

      setLoading(false);
    } catch (error) {
      console.error("Error fetching forecast:", error);
      setLoading(false);
      alert("Backend is waking up. Please wait 20–30 seconds and try again.");
    }
  };

  const chartData = {
    labels: forecastData.map((item) =>
      new Date(item.ds).toLocaleDateString()
    ),
    datasets: [
      {
        label: "Predicted Sales",
        data: forecastData.map((item) => item.yhat),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">
          📊 Sales Demand Forecast Dashboard
        </h1>

        <div className="flex gap-4 items-center mb-6">
          <label className="font-semibold">Select Months:</label>
          <input
            type="number"
            min="1"
            max="12"
            value={months}
            onChange={(e) => setMonths(e.target.value)}
            className="border p-2 rounded w-24"
          />
          <button
            onClick={getForecast}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Predict
          </button>
        </div>

        {loading && <p>Loading forecast...</p>}

        {totalSales && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              Total Predicted Sales:
            </h2>
            <p className="text-2xl text-green-600 font-bold">
              {totalSales}
            </p>
          </div>
        )}

        {forecastData.length > 0 && <Line data={chartData} />}
      </div>
    </div>
  );
}