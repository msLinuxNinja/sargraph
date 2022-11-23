import { useContext, useMemo } from "react";
import LineChart from "../Molecules/LineChart";
import { DataContext } from "../Contexts/DataContext";


export default function MemoryChart(props) {
    const { sarData } = useContext(DataContext);
    const chartData = useMemo(() => {
      if(sarData) {
        return createChartData(sarData)
      }
    } , [sarData]);
    
    const chartOptions = useMemo(() => {
        if(sarData) {
            return createChartOptions(sarData);
        }
    } , [sarData]);
    
    return (
      <>
        {sarData ? <LineChart options={chartOptions} data={chartData} /> : null}
      </>
    );
}

export function createChartData(sarData) {
  return {
    labels: sarData.memoryObject.xlables,
    datasets: [
        {
            label: 'Memory Free GB',
            data: sarData.memoryObject.ykbmemFree,
            backgroundColor:'rgba(0, 132, 195, 0.1)',
            borderColor: 'rgba(0, 132, 195, 0.8)',
            borderWidth: 2,
            fill: true,
            tension: 0.2
        }, {
            label: 'Memory Used GB',
            data: sarData.memoryObject.ykbMemUsed,
            backgroundColor:'rgba(254, 140, 0, 0.1)',
            borderColor: 'rgba(254, 140, 0, 0.8)',
            borderWidth: 2,
            fill: true,
            tension: 0.2
        }, {
            label: 'Memory Buffers GB',
            data: sarData.memoryObject.ykbBuffers,
            backgroundColor:'rgba(58, 245, 39, 0.1)',
            borderColor: 'rgba(58, 245, 39, 0.8)',
            borderWidth: 2,
            fill: true,
            tension: 0.2
        }, {
            label: 'Memory Cache GB',
            data: sarData.memoryObject.ykbCached,
            backgroundColor:'rgba(255, 0, 0, 0.1)',
            borderColor: 'rgba(255, 0, 0, 0.8)',
            borderWidth: 2,
            fill: true,
            tension: 0.2
        }, {
            label: 'Memory Commit GB',
            data: sarData.memoryObject.ykbCommit,
            backgroundColor:'rgba(95, 17, 177, 0.1)',
            borderColor: 'rgba(95, 17, 177, 0.8)',
            borderWidth: 2,
            fill: true,
            tension: 0.2
        }, {
            label: 'Total Memory',
            data: sarData.memoryObject.ytotalMemory,
            backgroundColor:'rgba(0, 175, 218, 0.1)',
            borderColor: 'rgba(0, 175, 218, 0.8)',
            borderWidth: 2,
            fill: false,
            tension: 0.2
        },
    ],
  };
}
export function createChartOptions(sarData) {
    
    const maxMemory = parseInt(sarData.memoryObject.ytotalMemory[0] * 1.05);

    return {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value, index, ticks) {
            return value + 'GB';
          },
        },
        responsive: true,
        min: 0,
        max: maxMemory,
      },
    },
  };
}