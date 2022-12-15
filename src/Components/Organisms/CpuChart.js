import React, { useContext, useMemo, useEffect, useRef } from "react";

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



export default function CpuChart() {
  const { cpuData, selectedCPU, setSelectedCPU } = useDataContext();
  const chartRef = useRef();


  function getSelectedIndex(chart) {
    //logs the indexes of the selected value (CPU)
    // console.log(chart.data.datasets[0].data)
    // console.log(chart.data.labels)
    
    const re =  new RegExp (`^${selectedCPU}$`) // Build RegExp

    const dataIndex = cpuData.cpuNumber // Returns the indexes where the RegExp occurs
      .map((x, index) => (x.match(re) ? index : null))
      .filter((item) => item !== null);

    const newXLables = dataIndex.map(index => {

      return cpuData.xlables[index]
    })
    
    const newCpuUsr = dataIndex.map(index => {

      return cpuData.ycpuUsr[index]
    })
    
    const newCpuNice = dataIndex.map(index => {

      return cpuData.ycpuNice[index]
    })
    
    const newCpuSys = dataIndex.map(index => {

      return cpuData.ycpuSys[index]
    })
    
    const newCpuIowait = dataIndex.map(index => {

      return cpuData.ycpuIowait[index]
    })
    
    const newCpuIrq = dataIndex.map(index => {

      return cpuData.ycpuIrq[index]
    })
    
    const newCpuSoft = dataIndex.map(index => {

      return cpuData.ycpuSoft[index]
    })
    
    const newCpuIdle = dataIndex.map(index => {

      return cpuData.ycpuIdle[index]
    })
    
    
    // console.log(newTime)

    chart.data.labels = newXLables
    chart.data.datasets[0].data = newCpuUsr
    chart.data.datasets[1].data = newCpuNice
    chart.data.datasets[2].data = newCpuSys
    chart.data.datasets[3].data = newCpuIowait
    chart.data.datasets[4].data = newCpuIrq
    chart.data.datasets[5].data = newCpuSoft
    chart.data.datasets[6].data = newCpuIdle

    
    chart.update()
  }

  function createChartData() {
    return {
      labels: cpuData.xlables,
      datasets: [
        {
          label: "CPU all usr%",
          data: cpuData.ycpuUsr,
          // backgroundColor: "rgba(0, 132, 195, 0.1)",
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            let yAxis = context.chart.scales.y.height; // Get chart height to make it responsive
            if (yAxis === undefined) {
              // scales.y.height is undefined when starting ideally should use isMounted? but for now an if to check if undefined assign an arbitrary number.
              yAxis = 400;
            } else {
              yAxis = context.chart.scales.y.height;
            }

            const gradient = ctx.createLinearGradient(0, 0, 0, yAxis); // pass the height of the chart
            gradient.addColorStop(0, "rgba(0, 132, 195, 0.20)");
            gradient.addColorStop(0.25, "rgba(0, 132, 195, 0.15)"); // Stops for gradient
            gradient.addColorStop(0.5, "rgba(0, 132, 195, 0.10)");
            gradient.addColorStop(0.75, "rgba(0, 132, 195, 0.05)");
            gradient.addColorStop(1, "rgba(0, 132, 195, 0.005");
            return gradient;
          },
          borderColor: "rgba(0, 132, 195, 1)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "CPU all nice%",
          data: cpuData.ycpuNice,
          backgroundColor: "rgba(254, 140, 0, 0.1)",
          borderColor: "rgba(254, 140, 0, 1)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "CPU all sys%",
          data: cpuData.ycpuSys,
          backgroundColor: "rgba(58, 245, 39, 0.1)",
          borderColor: "rgba(58, 245, 39, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "CPU all iowait%",
          data: cpuData.ycpuIowait,
          backgroundColor: "rgba(255, 0, 0, 0.1)",
          borderColor: "rgba(255, 0, 0, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "CPU all irq%",
          data: cpuData.ycpuIrq,
          backgroundColor: "rgba(95, 17, 177, 0.1)",
          borderColor: "rgba(95, 17, 177, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "CPU all softIrq%",
          data: cpuData.ycpuSoft,
          backgroundColor: "rgba(177, 17, 82, 0.1)",
          borderColor: "rgba(177, 17, 82, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "CPU all idle%",
          data: cpuData.ycpuIdle,
          backgroundColor: "rgba(0, 210, 255, 0.05)",
          borderColor: "rgba(0, 210, 255, 0.8)",
          borderWidth: 2,
          fill: false,
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
            callback: function (value, index, ticks) {
              return value + "%";
            },
          },
          responsive: true,
          min: 0,
          max: 100,
        },
      },
    };
  }

  const chartData = useMemo(() => {
    if (cpuData) {
      setSelectedCPU("all") //sets default on first render
      return createChartData();
    }
  }, [cpuData]);

  const chartOptions = useMemo(() => {
    return createChartOptions();
  }, []);

  useEffect(() => {
    const chart = chartRef.current

    if (cpuData) {
      getSelectedIndex(chart);
    }
  }, [selectedCPU]);



  return (
    <>
      {cpuData ? <Chart ref={chartRef} type='line' options={chartOptions} data={chartData}  /> : null}
      {cpuData ? (
        <ItemList items={cpuData.uniqCPU} placeHolderText="Select CPU (selected All)" setValue={setSelectedCPU}/>
      ) : null}
    </>
  );
}
