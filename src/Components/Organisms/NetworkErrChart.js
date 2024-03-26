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

export default function NetworkErrChart() {
  const { netErrData, selectedInterface, setSelectedInterface } = useDataContext();
  const chartRef = useRef();
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
        </Flex>
      ) : (
        <></>
      )}
    </>
  );
}
