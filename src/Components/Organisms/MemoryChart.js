import { useEffect, useMemo, useRef } from "react";
import { useDataContext } from "../Contexts/DataContext";

import 'chartjs-adapter-date-fns';
import zoomPlugin from "chartjs-plugin-zoom"; // import zoom plugin
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler,
  Decimation
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import ResetButton from "../Atoms/ResetButton";



ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler,
  zoomPlugin, // register zoom plugin
  Decimation
)


export default function MemoryChart() {
  const { memoryData } = useDataContext();
  const chartRef = useRef();

  function createChartData() {
    return {
      datasets: [
        {
          label: "Memory Free GB",
          data: memoryData.kbMemFree,
          backgroundColor: "rgba(0, 132, 195, 0.1)",
          borderColor: "rgba(0, 132, 195, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Memory Used GB",
          data: memoryData.kbMemUsed,
          backgroundColor: "rgba(254, 140, 0, 0.1)",
          borderColor: "rgba(254, 140, 0, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Memory Buffers GB",
          data: memoryData.kbBuffers,
          backgroundColor: "rgba(58, 245, 39, 0.1)",
          borderColor: "rgba(58, 245, 39, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Memory Cache GB",
          data: memoryData.kbCached,
          backgroundColor: "rgba(255, 0, 0, 0.1)",
          borderColor: "rgba(255, 0, 0, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Memory Commit GB",
          data: memoryData.kbCommit,
          backgroundColor: "rgba(95, 17, 177, 0.1)",
          borderColor: "rgba(95, 17, 177, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Total Memory",
          data: memoryData.totalMemory,
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
          type: "linear",
        },

        x: {
          ticks: {
            color: "rgba(180, 180, 180, 1)",
            source: "auto",
            autoSkip: true,
            maxRotation: 0,
          },

          grid: {
            color: "rgba(0, 0, 0, 0.05)",
          },
          type: "time",
        },
      },
      normalized: true,
      mantainAspectRatio: false,
      parsing: false,
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: "rgba(180, 180, 180, 1)",
          },
        },
        zoom: { // logic to enable zoom chart
          zoom: {
            wheel: {
              enabled: true,
            },
            drag: {
              enabled: true,
              modifierKey: "ctrl",
            },
            mode: "x",
            speed: 0.05,
          },
          pan: {
            enabled: true,
            mode: "x",
          },
          limits: {
            x: {
              min: memoryData.kbMemFree[0].x,
              max: memoryData.kbMemFree[memoryData.kbMemFree.length - 1].x,
            }
          }
        },
        decimation: {
          enabled: true,
          algorithm: "lttb",
          samples: 200,
          threshold: 1100,
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
      <Line ref={chartRef} options={chartOptions} data={chartData} />
      <ResetButton chartRef={chartRef} />
    </>
  );
}
