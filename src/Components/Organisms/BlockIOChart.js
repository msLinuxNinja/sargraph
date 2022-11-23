import React, { useContext, useMemo } from "react";
import LineChart from "../Molecules/LineChart";
import { DataContext } from "../Contexts/DataContext";
import ItemList from "../Atoms/List";

export default function BlockIOChart(props) {
  const { blockData } = useContext(DataContext);

  function createChartData() {
    return {
      labels: blockData.xlables,
      datasets: [
        {
          label: "Transfers per second",
          data: blockData.ytps,
          backgroundColor: "rgba(0, 132, 195, 0.1)",
          borderColor: "rgba(0, 132, 195, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Read MB/s",
          data: blockData.yreadSec,
          backgroundColor: "rgba(254, 140, 0, 0.1)",
          borderColor: "rgba(254, 140, 0, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Write MB/s",
          data: blockData.ywriteSec,
          backgroundColor: "rgba(58, 245, 39, 0.1)",
          borderColor: "rgba(58, 245, 39, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Average Request Size (KB)",
          data: blockData.yavgRQz,
          backgroundColor: "rgba(255, 0, 0, 0.1)",
          borderColor: "rgba(255, 0, 0, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Average Queue Size",
          data: blockData.yavgQz,
          backgroundColor: "rgba(95, 17, 177, 0.1)",
          borderColor: "rgba(95, 17, 177, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Latency in MS",
          data: blockData.yawaitMS,
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
    return {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            //   callback: function (value, index, ticks) {
            //     return value + "%";
            //   },
          },
          responsive: true,
          min: 0,
        },
      },
    };
  }

  const chartData = useMemo(() => {
    if (blockData) {
      return createChartData();
    }
  }, [blockData]);

  const chartOptions = useMemo(() => createChartOptions(), []);

  return (
    <>
      {blockData ? <LineChart options={chartOptions} data={chartData} /> : null}
      {blockData ? (
        <ItemList
          items={blockData.uniqDev}
          placeHolderText="Select Block Device"
        />
      ) : null}
    </>
  );
}
