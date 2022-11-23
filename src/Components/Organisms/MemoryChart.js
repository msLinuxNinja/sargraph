import { useContext, useMemo } from "react";
import LineChart from "../Molecules/LineChart";
import { useDataContext } from "../Contexts/DataContext";

export default function MemoryChart(props) {
  const { memoryData } = useDataContext();

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
    const maxMemory = parseInt(memoryData.ytotalMemory[0] * 1.05);

    return {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value, index, ticks) {
              return value + "GB";
            },
          },
          responsive: true,
          min: 0,
          max: maxMemory,
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
    if (memoryData) {
      return createChartOptions();
    }
  }, [memoryData]);

  return (
    <>
      {memoryData ? (
        <LineChart options={chartOptions} data={chartData} />
      ) : null}
    </>
  );
}
