import { useEffect, useMemo, useRef } from "react";
import { useDataContext } from "../Contexts/DataContext";


import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function MemoryChart() {
  const { memoryData } = useDataContext();
  const chartRef = useRef();

  function createChartData() {
    return {
      labels: memoryData.xlables,
      datasets: [
        {
          label: "Memory Free GB",
          data: memoryData.ykbmemFree,
          backgroundColor: "rgba(0, 132, 195, 0.1)",
          borderColor: "rgba(0, 132, 195, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Memory Used GB",
          data: memoryData.ykbMemUsed,
          backgroundColor: "rgba(254, 140, 0, 0.1)",
          borderColor: "rgba(254, 140, 0, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Memory Buffers GB",
          data: memoryData.ykbBuffers,
          backgroundColor: "rgba(58, 245, 39, 0.1)",
          borderColor: "rgba(58, 245, 39, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Memory Cache GB",
          data: memoryData.ykbCached,
          backgroundColor: "rgba(255, 0, 0, 0.1)",
          borderColor: "rgba(255, 0, 0, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Memory Commit GB",
          data: memoryData.ykbCommit,
          backgroundColor: "rgba(95, 17, 177, 0.1)",
          borderColor: "rgba(95, 17, 177, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Total Memory",
          data: memoryData.ytotalMemory,
          backgroundColor: "rgba(0, 175, 218, 0.1)",
          borderColor: "rgba(0, 175, 218, 0.8)",
          borderWidth: 2,
          fill: false,
          tension: 0.2,
        },
      ],
    };
  }

  function createChartOptions() {

    return {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value, index, ticks) {
              return value + "GB";
            },
            color: "rgba(180, 180, 180, 1)",
          },
          responsive: true,
          min: 0,

        },

        x: {
          ticks: {
            color: "rgba(180, 180, 180, 1)",
          },

          grid: {
            color: "rgba(0, 0, 0, 0.05)",
          }
        },
      },
      normalized: true,
      mantainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: "rgba(180, 180, 180, 1)",
          },
        },
      },
    };
  }

  const chartData = useMemo(() => {
    if (memoryData) {
      return createChartData();
    }
  }, [memoryData]);

  const chartOptions = useMemo(() => {
    return createChartOptions();
  }, []);


  return (
    <>
      <Chart ref={chartRef} type="line" options={chartOptions} data={chartData} />
    </>
  );
}
