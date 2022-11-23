import React, { useContext, useMemo } from "react";
import LineChart from "../Molecules/LineChart";
import { DataContext } from "../Contexts/DataContext";
import ItemList from "../Atoms/List";

export default function BlockIOChart(props) {
    const { sarData } = useContext(DataContext);
    const chartData = useMemo(() => {
      if(sarData) {
        return createChartData(sarData)
        
      }
    } , [sarData]);
    const chartOptions = useMemo(() => createChartOptions(), []);
    return (
      <>
        {sarData ? <LineChart options={chartOptions} data={chartData} /> : null}
        {sarData ? <ItemList items={sarData.blockObject.uniqDev} placeHolderText="Select Block Device" /> : null}
      </>
    );
}

export function createChartData(sarData) {
  return {
    labels: sarData.blockObject.xlables,
    datasets: [
        {
            label: 'Transfers per second',
            data: sarData.blockObject.ytps,
            backgroundColor:'rgba(0, 132, 195, 0.1)',
            borderColor: 'rgba(0, 132, 195, 0.8)',
            borderWidth: 2,
            fill: true,
            tension: 0.2
        }, {
            label: 'Read MB/s',
            data: sarData.blockObject.yreadSec,
            backgroundColor:'rgba(254, 140, 0, 0.1)',
            borderColor: 'rgba(254, 140, 0, 0.8)',
            borderWidth: 2,
            fill: true,
            tension: 0.2
        }, {
            label: 'Write MB/s',
            data: sarData.blockObject.ywriteSec,
            backgroundColor:'rgba(58, 245, 39, 0.1)',
            borderColor: 'rgba(58, 245, 39, 0.8)',
            borderWidth: 2,
            fill: true,
            tension: 0.2
        }, {
            label: 'Average Request Size (KB)',
            data: sarData.blockObject.yavgRQz,
            backgroundColor:'rgba(255, 0, 0, 0.1)',
            borderColor: 'rgba(255, 0, 0, 0.8)',
            borderWidth: 2,
            fill: true,
            tension: 0.2
        }, {
            label: 'Average Queue Size',
            data: sarData.blockObject.yavgQz,
            backgroundColor:'rgba(95, 17, 177, 0.1)',
            borderColor: 'rgba(95, 17, 177, 0.8)',
            borderWidth: 2,
            fill: true,
            tension: 0.2
        }, {
            label: 'Latency in MS',
            data: sarData.blockObject.yawaitMS,
            backgroundColor:'rgba(0, 175, 218, 0.1)',
            borderColor: 'rgba(0, 175, 218, 0.8)',
            borderWidth: 2,
            fill: true,
            tension: 0.2
        },
    ],
  };
}
export function createChartOptions() {
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