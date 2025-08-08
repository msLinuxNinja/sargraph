import { useEffect, useMemo, useRef, useState } from "react";
import { useDataContext } from "../Contexts/DataContext";

// antd imports

import { Flex, Typography } from "antd";

// chart.js imports
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

// Custom components
import ResetButton from "../Atoms/ResetButton";
import CopyClipboardButton from "../Atoms/CopyClipButton";

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

export default function MemoryPercntChart() {
  const { memoryData, swapData } = useDataContext();
  const chartRef = useRef();

  const [zoomLevel, setZoomLevel] = useState(1);
  const [memUsedPrcntAvg, setMemUsedPrcntAvg] = useState(0);
  const [commitPrcntAvg, setCommitPrcntAvg] = useState(0);
  const [swapUsedPrcntAvg, setSwapUsedPrcntAvg] = useState(0);

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

    setMemUsedPrcntAvg(dataAvgs[0]);
    setCommitPrcntAvg(dataAvgs[1]);
    setSwapUsedPrcntAvg(dataAvgs[2]);
  }

  function createChartData() {
    return {
      datasets: [
        {
          label: "Memory Used %",
          data: memoryData.memUsedPrcnt,
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            let yAxis = context.chart.scales.y.height; // Get chart height to make it responsive
            if (yAxis === undefined) {
              yAxis = 400;
            } else {
              yAxis = context.chart.scales.y.height;
            }

            const gradient = ctx.createLinearGradient(0, 0, 0, yAxis); // pass the height of the chart
            gradient.addColorStop(0, "rgba(0, 132, 195, 0.20)");
            gradient.addColorStop(0.25, "rgba(0, 132, 195, 0.15)"); // Stops for gradient
            gradient.addColorStop(0.5, "rgba(0, 132, 195, 0.10)");
            gradient.addColorStop(0.75, "rgba(0, 132, 195, 0.05)");
            gradient.addColorStop(1, "rgba(0, 132, 195, 0.005)");
            return gradient;
          },
          borderColor: "rgba(0, 132, 195, 1)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Memory Commit %",
          data: memoryData.commitPrcnt,
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            let yAxis = context.chart.scales.y.height; // Get chart height to make it responsive
            if (yAxis === undefined) {
              // scales.y.height is undefined when starting ideally should use isMounted? but for now an if to check if undefined assign an arbitrary number.
              yAxis = 400;
            } else {
              yAxis = context.chart.scales.y.height;
            }
        
            const gradient = ctx.createLinearGradient(0, 0, 0, yAxis); // pass the height of the chart
            gradient.addColorStop(0, "rgba(254, 140, 0, 0.20)");
            gradient.addColorStop(0.25, "rgba(254, 140, 0, 0.15)"); // Stops for gradient
            gradient.addColorStop(0.5, "rgba(254, 140, 0, 0.10)");
            gradient.addColorStop(0.75, "rgba(254, 140, 0, 0.05)");
            gradient.addColorStop(1, "rgba(254, 140, 0, 0.005)");
            return gradient;
          },
          borderColor: "rgba(254, 140, 0, 1)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Swap Used %",
          data: swapData.swapUsedPrcnt,
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            let yAxis = context.chart.scales.y.height; // Get chart height to make it responsive
            if (yAxis === undefined) {
              // scales.y.height is undefined when starting ideally should use isMounted? but for now an if to check if undefined assign an arbitrary number.
              yAxis = 400;
            } else {
              yAxis = context.chart.scales.y.height;
            }
        
            const gradient = ctx.createLinearGradient(0, 0, 0, yAxis); // pass the height of the chart
            gradient.addColorStop(0, "rgba(0, 128, 128, 0.20)");
            gradient.addColorStop(0.25, "rgba(0, 128, 128, 0.15)"); // Stops for gradient
            gradient.addColorStop(0.5, "rgba(0, 128, 128, 0.10)");
            gradient.addColorStop(0.75, "rgba(0, 128, 128, 0.05)");
            gradient.addColorStop(1, "rgba(0, 128, 128, 0.005)");
            return gradient;
          },
          borderColor: "rgba(0, 128, 128, 1)",
          borderWidth: 2,
          fill: true,
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
              return value + "%";
            },
            color: "rgba(180, 180, 180, 1)",
          },

          grid: {
            color: "rgba(0, 0, 0, 0.2)",
          },
          min: 0,
          max: 100,
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
            }
          },
        },
        verticalHoverLine: {
          lineWidth: 1,
          color: "rgba(148,163,184,0.45)",
          dash: [4, 4],
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
              min: memoryData.memUsedPrcnt[0].x,
              max: memoryData.memUsedPrcnt[memoryData.memUsedPrcnt.length - 1].x,
            },
          },
        },
        decimation: {
          enabled: true,
          algorithm: "lttb",
          samples: 150,
          threshold: 1000,
        },
      },
    };
  }

  const chartData = useMemo(() => {
    return createChartData();
  }, []);

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
          Memory Free: <b className="text-sky-600">{memUsedPrcntAvg}%</b>, 
          Swap Free: <b className="text-teal-700">{commitPrcntAvg}%</b>, 
          Memory Used: <b className="text-amber-500">{swapUsedPrcntAvg}%</b>,
        </Typography.Text>
      </Flex>
    </>
  );
}
