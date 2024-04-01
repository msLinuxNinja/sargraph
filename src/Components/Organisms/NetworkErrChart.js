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
import CopyClipboardButton from "../Atoms/CopyClipButton";
import ItemList from "../Atoms/List";


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

export default function NetworkErrChart() {
  const { netErrData, selectedInterface, setSelectedInterface } = useDataContext();
  const chartRef = useRef();

  const [zoomLevel, setZoomLevel] = useState(1);

  // Metric states for selected period average calculation
  const [rxerrAvg, setRxerrAvg] = useState(0);
  const [txerrAvg, setTxerrAvg] = useState(0);
  const [collAvg, setCollAvg] = useState(0);
  const [rxdropAvg, setRxdropAvg] = useState(0);
  const [txdropAvg, setTxdropAvg] = useState(0);

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

    setRxerrAvg(dataAvgs[0]);
    setTxerrAvg(dataAvgs[1]);
    setCollAvg(dataAvgs[2]);
    setRxdropAvg(dataAvgs[3]);
    setTxdropAvg(dataAvgs[4]);
  }

  function createChartData() {
    return {
      datasets: [
        {
          label: "Receive bad packets per second",
          data: netErrData.netErrArray[selectedInterface].rxerr,
          backgroundColor: "rgba(0, 132, 195, 0.1)",
          borderColor: "rgba(0, 132, 195, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Transmit bad packets per second",
          data: netErrData.netErrArray[selectedInterface].txerr,
          backgroundColor: "rgba(254, 140, 0, 0.1)",
          borderColor: "rgba(254, 140, 0, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Collisions per second",
          data: netErrData.netErrArray[selectedInterface].coll,
          backgroundColor: "rgba(58, 245, 39, 0.1)",
          borderColor: "rgba(58, 245, 39, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Receive drop packets per second",
          data: netErrData.netErrArray[selectedInterface].rxdrop,
          backgroundColor: "rgba(255, 0, 0, 0.1)",
          borderColor: "rgba(255, 0, 0, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Transmit drop packets per second",
          data: netErrData.netErrArray[selectedInterface].txdrop,
          backgroundColor: "rgba(95, 17, 177, 0.1)",
          borderColor: "rgba(95, 17, 177, 0.8)",
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
  const chartOptions = useMemo(() => createChartOptions(), [netErrData]);

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
            items={netErrData.uniqIFACE}
            placeHolderText={`Select Interface (Selected ${netErrData.uniqIFACE[0]})`}
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
            Receive pckts/s: <b className="text-sky-600">{rxerrAvg}/s</b>, 
            Receive MB/s: <b className="text-green-500">{txerrAvg}/s</b>,
            Transmit MB/s: <b className="text-red-600">{collAvg}/s</b>,
            Transmit pckts/s: <b className="text-amber-500">{rxdropAvg}/s</b>, 
            Transmit MB/s: <b className="text-violet-400">{txdropAvg}/s</b>,
          </Typography.Text>
        </Flex>
      ) : (
        <></>
      )}
    </>
  );
}
