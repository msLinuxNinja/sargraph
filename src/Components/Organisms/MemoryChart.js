import { useEffect, useMemo, useRef, useState } from "react";
import { useDataContext } from "../Contexts/DataContext";

//antd imports

import { Flex, Typography } from "antd";

//chart.js imports
import "chartjs-adapter-date-fns";
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
  Decimation,
} from "chart.js";
import { Line } from "react-chartjs-2";

//Custom components
import ResetButton from "../Atoms/ResetButton";
import CopyClipboardButton from "../Atoms/CopyClipButton";

// Colors
import { colorConfig } from "../../Utils/colors";

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
);

export default function MemoryChart() {
  const { memoryData, swapData } = useDataContext();
  const chartRef = useRef();

  const [zoomLevel, setZoomLevel] = useState(1);

  // Metric states for selected period average calculation
  const [kbMemFreeAvg, setKbMemFreeAvg] = useState(0);
  const [kbSwapFreeAvg, setKbSwapFreeAvg] = useState(0);
  const [kbMemUsedAvg, setKbMemUsedAvg] = useState(0);
  const [kbSwapUsedAvg, setKbSwapUsedAvg] = useState(0);
  const [kbBuffersAvg, setKbBuffersAvg] = useState(0);
  const [kbCachedAvg, setKbCachedAvg] = useState(0);
  const [kbCommitAvg, setKbCommitAvg] = useState(0);

  function fetchData(min, max, chart) {
    const dataAvgs = [];

    chart.data.datasets.forEach((dataset) => {
      // Iterates over the datasets of the current chart
      const currentData = [];
      dataset.data.forEach((data) => {
        // Extracts the data based on the min/max x time values
        if (data.x >= min && data.x <= max) {
          currentData.push(data.y);
        }
      });
      const avg =
        Math.round(
          (currentData.reduce((acc, curr) => acc + curr, 0) /
            currentData.length) *
            100
        ) / 100; // Calculates the average of the data and round to two decimal places

      dataAvgs.push(avg);
    });

    setKbMemFreeAvg(dataAvgs[0]);
    setKbSwapFreeAvg(dataAvgs[1]);
    setKbMemUsedAvg(dataAvgs[2]);
    setKbSwapUsedAvg(dataAvgs[3]);
    setKbBuffersAvg(dataAvgs[4]);
    setKbCachedAvg(dataAvgs[5]);
    setKbCommitAvg(dataAvgs[6]);
  }

  function createChartData() {
    return {
      datasets: [
        {
          label: "Memory Free GB",
          data: memoryData.kbMemFree,
          backgroundColor: colorConfig.chartColors.color1.background,
          borderColor: colorConfig.chartColors.color1.border,
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Swap Free GB",
          data: swapData.kbSwapFree,
          backgroundColor: colorConfig.chartColors.color1a.background,
          borderColor: colorConfig.chartColors.color1a.border,
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Memory Used GB",
          data: memoryData.kbMemUsed,
          backgroundColor: colorConfig.chartColors.color2.background,
          borderColor: colorConfig.chartColors.color2.border,
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Swap Used GB",
          data: swapData.kbSwapUsed,
          backgroundColor: colorConfig.chartColors.color5.background,
          borderColor: colorConfig.chartColors.color5.border,
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Memory Buffers GB",
          data: memoryData.kbBuffers,
          backgroundColor: colorConfig.chartColors.color3.background,
          borderColor: colorConfig.chartColors.color3.border,
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Memory Cache GB",
          data: memoryData.kbCached,
          backgroundColor: colorConfig.chartColors.color4.background,
          borderColor: colorConfig.chartColors.color4.border,
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Memory Commit GB",
          data: memoryData.kbCommit,
          backgroundColor: colorConfig.chartColors.color6.background,
          borderColor: colorConfig.chartColors.color6.border,
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Total Memory",
          data: memoryData.totalMemory,
          backgroundColor: colorConfig.chartColors.color7.background,
          borderColor: colorConfig.chartColors.color7.border,
          borderWidth: 2,
          fill: false,
          tension: 0.2,
        },
        {
          label: "Total Swap",
          data: swapData.totalSwap,
          backgroundColor: colorConfig.chartColors.color7.background,
          borderColor: colorConfig.chartColors.color7.border,
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
            font: {
              size: 16,
            },
          },
        },
        zoom: {
          // logic to enable zoom chart
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
            onZoomComplete: function ({ chart }) {
              setZoomLevel(chart.getZoomLevel()); // Updates zoom level when zoom completes
              const xAxis = chart.scales.x;
              const xMin = xAxis.min;
              const xMax = xAxis.max;
              fetchData(xMin, xMax, chart);
            },
          },
          pan: {
            enabled: true,
            mode: "x",
            onPanComplete: function ({ chart }) {
              const xAxis = chart.scales.x;
              const xMin = xAxis.min;
              const xMax = xAxis.max;
              fetchData(xMin, xMax, chart);
            },
          },
          limits: {
            x: {
              min: memoryData.kbMemFree[0].x,
              max: memoryData.kbMemFree[memoryData.kbMemFree.length - 1].x,
            },
          },
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

  useEffect(() => {
    if (chartRef.current.scales) {
      // Update memory data when component mounts
      const xMin = chartRef.current.scales.x.min;
      const xMax = chartRef.current.scales.x.max;
      fetchData(xMin, xMax, chartRef.current);
    }
  }, []);


  return (
    <>
      <Line ref={chartRef} options={chartOptions} data={chartData} />
      <Flex className="flex-col items-start gap-2 lg:flex-row lg:items-center">
        <ResetButton chartRef={chartRef} />
        <CopyClipboardButton chartRef={chartRef} />
        <Typography.Text type="primary">
          Current level zoom: {zoomLevel}
        </Typography.Text>
        <Typography.Text type="primary">
          Averages for selected period:
        </Typography.Text>
        <Typography.Text type="primary">
          Memory Free: <b className="text-sky-600">{kbMemFreeAvg}GB</b>, 
          Swap Free: <b className="text-teal-700">{kbSwapFreeAvg}GB</b>, 
          Memory Used: <b className="text-amber-500">{kbMemUsedAvg}GB</b>,
          Swap Used: <b className="text-pink-600">{kbSwapUsedAvg}GB</b>,
          Memory Buffers: <b className="text-green-500">{kbBuffersAvg}GB</b>,
          Memory Cache: <b className="text-red-600">{kbCachedAvg}GB</b>,
          Memory Commit: <b className="text-violet-400">{kbCommitAvg}GB</b>,
        </Typography.Text>
      </Flex>
    </>
  );
}
