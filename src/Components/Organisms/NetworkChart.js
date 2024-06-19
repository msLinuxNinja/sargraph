import { useMemo, useRef, useEffect, useState } from "react";
import { useDataContext } from "../Contexts/DataContext";

// antd imports
import { Flex, Typography } from "antd";

// chart.js imports
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

export default function NetworkChart() {
  const { netData, selectedInterface, setSelectedInterface } = useDataContext();
  const chartRef = useRef();

  const [zoomLevel, setZoomLevel] = useState(1);

  // Metric states for selected period average calculation
  const [rxpckAvg, setRxpckAvg] = useState(0);
  const [txpckAvg, setTxpckAvg] = useState(0);
  const [rxkBpsAvg, setRxkBpsAvg] = useState(0);
  const [txkBpsAvg, setTxkBpsAvg] = useState(0);


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

    setRxpckAvg(dataAvgs[0]);
    setTxpckAvg(dataAvgs[1]);
    setRxkBpsAvg(dataAvgs[2]);
    setTxkBpsAvg(dataAvgs[3]);
  }

  function createChartData() {
    return {
      datasets: [
        {
          label: "Receive packets per second",
          data: netData.netArray[selectedInterface].rxpck,
          backgroundColor: colorConfig.chartColors.color1.background,
          borderColor: colorConfig.chartColors.color1.border,
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Transmit packets per second",
          data: netData.netArray[selectedInterface].txpck,
          backgroundColor: colorConfig.chartColors.color2.background,
          borderColor: colorConfig.chartColors.color2.border,
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Receive Megabytes per second (MB/s)",
          data: netData.netArray[selectedInterface].rxkB,
          backgroundColor: colorConfig.chartColors.color3.background,
          borderColor: colorConfig.chartColors.color3.border,
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Transmit Megabytes per second (MB/s)",
          data: netData.netArray[selectedInterface].txkB,
          backgroundColor: colorConfig.chartColors.color4.background,
          borderColor: colorConfig.chartColors.color4.border,
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
      animation: true,
      normalized: true,
      matainAspectRatio: false,
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

  const chartData = useMemo(() => createChartData(), [selectedInterface]);
  const chartOptions = useMemo(() => createChartOptions(), [netData]);

  useEffect(() => {
    if (chartRef.current.scales) {
      // Update cpu data when selected CPU changes
      const xMin = chartRef.current.scales.x.min;
      const xMax = chartRef.current.scales.x.max;
      fetchData(xMin, xMax, chartRef.current);
    }
    chartRef.current.update();
  }, [selectedInterface]);

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
            items={netData.uniqIFACE}
            placeHolderText={`Select Interface (Selected ${netData.uniqIFACE[0]})`}
            setValue={setSelectedInterface}
            showSearch={true}
          />
          <ResetButton chartRef={chartRef} />
          <CopyClipboardButton chartRef={chartRef}/>
          <Typography.Text type="primary">
            Current level zoom: {zoomLevel}
          </Typography.Text>
          <Typography.Text type="primary">
            Averages for selected period:
          </Typography.Text>
          <Typography.Text type="primary">
            Receive pckts/s: <b className="text-sky-600">{rxpckAvg}/s</b>, 
            Transmit pckts/s: <b className="text-amber-500">{txpckAvg}/s</b>, 
            Receive MB/s: <b className="text-green-500">{rxkBpsAvg}MB/s</b>,
            Transmit MB/s: <b className="text-red-600">{txkBpsAvg}MB/s</b>,
          </Typography.Text>
        </Flex>
      ) : (
        <></>
      )}
    </>
  );
}
