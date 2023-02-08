import { useMemo, useRef, useEffect } from "react";

import { useDataContext } from "../Contexts/DataContext";
import ItemList from "../Atoms/List";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function BlockIOChart(props) {
  const { blockData, selectedBlock, setSelectedBlock } = useDataContext();
  const chartRef = useRef();
  let perfOptions = true;

  function getSelectedIndex(chart) {
    //logs the indexes of the selected value (CPU)
    // console.log(chart.data.datasets[0].data) 
    // console.log(chart.data.labels)
  

    const re =  new RegExp (`^${selectedBlock}$`) // Build RegExp

    const dataIndex = blockData.blockDevices // Returns the indexes where the RegExp occurs
      .map((x, index) => (x.match(re) ? index : null))
      .filter((item) => item !== null);

  
    const newXLables = dataIndex.map(index => {

      return blockData.xlables[index]
    })
    
    const newTps = dataIndex.map(index => {

      return blockData.ytps[index]
    })    
    
    const newReadSec = dataIndex.map(index => {

      return blockData.yreadSec[index]
    })    
    
    const newWriteSec = dataIndex.map(index => {

      return blockData.ywriteSec[index]
    })    
    
    const newAvgRQsz = dataIndex.map(index => {

      return blockData.yavgRQz[index]
    })    
    
    const newAvgQz = dataIndex.map(index => {

      return blockData.yavgQz[index]
    })    
    
    const newAwaitMs = dataIndex.map(index => {

      return blockData.yawaitMS[index]
    })    
    

    chart.data.labels = newXLables
    chart.data.datasets[0].data = newTps
    chart.data.datasets[1].data = newReadSec
    chart.data.datasets[2].data = newWriteSec
    chart.data.datasets[3].data = newAvgRQsz
    chart.data.datasets[4].data = newAvgQz
    chart.data.datasets[5].data = newAwaitMs


    
    chart.update()
  }

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
    if (blockData.xlables.length > 1800) {
      perfOptions = false;
    }
    console.log(blockData.xlables.length)
    return {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: "rgba(180, 180, 180, 1)",
            //   callback: function (value, index, ticks) {
            //     return value + "%";
            //   },
          },
          
          responsive: true,
          min: 0,
        },

        x: {
          ticks: {
            color: "rgba(180, 180, 180, 1)",
          },

          grid: {
            color: "rgba(0, 0, 0, 0.05)",
          }
        },
      },
      animation: perfOptions,
      normalized: true,
      matainAspectRatio: false,
    };
  }

  const chartData = useMemo(() => {
    if (blockData) {
      setSelectedBlock(blockData.uniqDev[0]) //sets default on first render
      return createChartData();
    }
  }, [blockData]);

  const chartOptions = useMemo(() => {
    if (blockData) {
      return createChartOptions()
    }    
  }, [blockData]);

  useEffect(() => {
    const chart = chartRef.current

    if (blockData) {
      getSelectedIndex(chart);
    }
  }, [selectedBlock]);

  return (
    <>
      {blockData ? <Chart ref={chartRef} type="line" options={chartOptions} data={chartData} /> : null}
      {blockData ? (
        <ItemList items={blockData.uniqDev.sort()} placeHolderText={`Select Block Device (Selected ${blockData.uniqDev[0]})`} setValue={setSelectedBlock} showSearch={true}/>
      ) : null}
    </>
  );
}
