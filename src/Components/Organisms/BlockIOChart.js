import { useMemo, useRef, useEffect } from "react";

import { useDataContext } from "../Contexts/DataContext";
import ItemList from "../Atoms/List";

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
import ResetButton from "../Atoms/ResetButton";
import { Flex } from "antd";

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

  function changeDatasetData(chart) {
    chart.data.datasets[0].data = blockData.diskArray[selectedBlock].tps;
    chart.data.datasets[1].data = blockData.diskArray[selectedBlock].readSec;
    chart.data.datasets[2].data = blockData.diskArray[selectedBlock].writeSec;
    chart.data.datasets[3].data = blockData.diskArray[selectedBlock].avgRQz;
    chart.data.datasets[4].data = blockData.diskArray[selectedBlock].avgQz;
    chart.data.datasets[5].data = blockData.diskArray[selectedBlock].awaitMS;
    chart.update();
  }

  function createChartData() {
    return {
      datasets: [
        {
          label: "Transfers per second",
          data: blockData.diskArray[0].tps,
          backgroundColor: "rgba(0, 132, 195, 0.1)",
          borderColor: "rgba(0, 132, 195, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Read MB/s",
          data: blockData.diskArray[0].readSec,
          backgroundColor: "rgba(254, 140, 0, 0.1)",
          borderColor: "rgba(254, 140, 0, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Write MB/s",
          data: blockData.diskArray[0].writeSec,
          backgroundColor: "rgba(58, 245, 39, 0.1)",
          borderColor: "rgba(58, 245, 39, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Average Request Size (KB)",
          data: blockData.diskArray[0].avgRQz,
          backgroundColor: "rgba(255, 0, 0, 0.1)",
          borderColor: "rgba(255, 0, 0, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Average Queue Size",
          data: blockData.diskArray[0].avgQz,
          backgroundColor: "rgba(95, 17, 177, 0.1)",
          borderColor: "rgba(95, 17, 177, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Latency in MS",
          data: blockData.diskArray[0].awaitMS,
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
          },
          pan: {
            enabled: true,
            mode: "x",
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
  }, []);

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
    const chart = chartRef.current;
    changeDatasetData(chart);
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
        </Flex>
      ) : (
        <></>
      )}
    </>
  );
}
