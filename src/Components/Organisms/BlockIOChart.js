import { useMemo, useRef, useEffect, useState } from "react";
import { useDataContext } from "../Contexts/DataContext";

// antd imports
import { Flex, Typography } from "antd";

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

// Custom components
import ResetButton from "../Atoms/ResetButton";
import ItemList from "../Atoms/List";
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
);

export default function BlockIOChart() {
  const { blockData, selectedBlock, setSelectedBlock } = useDataContext();
  const chartRef = useRef();
  let perfOptions = true;

  const [zoomLevel, setZoomLevel] = useState(1);

  // Metric states for selected period average calculation
  const [tpsAvg, setTpsAvg] = useState(0);
  const [readSecAvg, setReadSecAvg] = useState(0);
  const [writeSecAvg, setWriteSecAvg] = useState(0);
  const [avgRQzAvg, setAvgRQzAvg] = useState(0);
  const [avgQzAvg, setAvgQzAvg] = useState(0);
  const [awaitMSAvg, setAwaitMSAvg] = useState(0);


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

    setTpsAvg(dataAvgs[0]);
    setReadSecAvg(dataAvgs[1]);
    setWriteSecAvg(dataAvgs[2]);
    setAvgRQzAvg(dataAvgs[3]);
    setAvgQzAvg(dataAvgs[4]);
    setAwaitMSAvg(dataAvgs[5]);
  }

  function createChartData() {
    return {
      datasets: [
        {
          label: "Transfers per second",
          data: blockData.diskArray[selectedBlock].tps,
          backgroundColor: "rgba(0, 132, 195, 0.1)",
          borderColor: "rgba(0, 132, 195, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Read MB/s",
          data: blockData.diskArray[selectedBlock].readSec,
          backgroundColor: "rgba(254, 140, 0, 0.1)",
          borderColor: "rgba(254, 140, 0, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Write MB/s",
          data: blockData.diskArray[selectedBlock].writeSec,
          backgroundColor: "rgba(58, 245, 39, 0.1)",
          borderColor: "rgba(58, 245, 39, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Average Request Size (KB)",
          data: blockData.diskArray[selectedBlock].avgRQz,
          backgroundColor: "rgba(255, 0, 0, 0.1)",
          borderColor: "rgba(255, 0, 0, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Average Queue Size",
          data: blockData.diskArray[selectedBlock].avgQz,
          backgroundColor: "rgba(95, 17, 177, 0.1)",
          borderColor: "rgba(95, 17, 177, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Latency in MS",
          data: blockData.diskArray[selectedBlock].awaitMS,
          backgroundColor: "rgba(0, 175, 218, 0.1)",
          borderColor: "rgba(0, 175, 218, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
      ],
    };
  }

  function createChartOptions() {
    if (blockData.diskArray[0].tps.length > 1800) {
      perfOptions = false;
    }
    return {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
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
      animation: perfOptions,
      normalized: true,
      matainAspectRatio: false,
      parsing: false,
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: "rgba(180, 180, 180, 1)",
            font: {
              size:16
            }
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
              min: blockData.diskArray[0].tps[0].x,
              max: blockData.diskArray[0].tps[
                blockData.diskArray[0].tps.length - 1
              ].x,
            },
          },
        },
        decimation: {
          enabled: true,
          algorithm: "lttb",
          samples: 100,
          threshold: 1000,
        },
      },
    };
  }

  const chartData = useMemo(() => {
    if (blockData.diskArray.length === 0) {
      return false;
    }
    return createChartData();
  }, [selectedBlock]);

  const chartOptions = useMemo(() => {
    if (blockData.diskArray.length === 0) {
      return false;
    }
    return createChartOptions();
  }, []);

  useEffect(() => {
    if (blockData.diskArray.length === 0) {
      return;
    }

    if (chartRef.current.scales) {
      // Update cpu data when selected CPU changes
      const xMin = chartRef.current.scales.x.min;
      const xMax = chartRef.current.scales.x.max;
      fetchData(xMin, xMax, chartRef.current);
    }

    chartRef.current.update();

  }, [selectedBlock]);

  return (
    <>
      {chartData ? (
        <Line ref={chartRef} options={chartOptions} data={chartData} />
      ) : (
        <>
          <h1>No data found</h1>
        </>
      )}
      {chartData ? (
        <Flex className="gap-2 items-center">
          <ItemList
            items={blockData.uniqDev}
            placeHolderText={`Select Block Device (Selected ${blockData.uniqDev[0]})`}
            setValue={setSelectedBlock}
            showSearch={true}
          />
          <ResetButton chartRef={chartRef}/>
          <CopyClipboardButton chartRef={chartRef}/>
          <Typography.Text type="primary">
            Current level zoom: {zoomLevel}
          </Typography.Text>
          <Typography.Text type="primary">
            Averages for selected period:
          </Typography.Text>
          <Typography.Text type="primary">
            Transfers per second: <b className="text-sky-600">{tpsAvg}/s</b>, 
            Read MB per second: <b className="text-amber-500">{readSecAvg}MB/s</b>, 
            Write MB per second: <b className="text-green-500">{writeSecAvg}MB/s</b>,
            Avg Request Size: <b className="text-red-600">{avgRQzAvg}KB</b>,
            Avg Queue Size: <b className="text-violet-400">{avgQzAvg}</b>, 
            Latency: <b className="text-cyan-400">{awaitMSAvg}ms</b>,
          </Typography.Text>
        </Flex>
      ) : (
        <></>
      )}
    </>
  );
}
