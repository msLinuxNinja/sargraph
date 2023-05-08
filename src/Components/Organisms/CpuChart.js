import { useMemo, useEffect, useRef, useState } from "react";

import { useDataContext } from "../Contexts/DataContext";
import ItemList from "../Atoms/List";
import TableDetails from "../Molecules/TableDetails";
import {Button, Drawer } from "antd";

import 'chartjs-adapter-date-fns';
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
  Decimation
} from 'chart.js';
import { Line } from 'react-chartjs-2';



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
)




export default function CpuChart() {
  //states
  const { cpuData, selectedCPU, setSelectedCPU, setIsLoading } = useDataContext();
  const [cpuStats, setCpuStats] = useState({
    max: 0,
    average: 0,
    index: 0,
    maxTime: "",
    cpuID: 0,
  });

  const [visible, setVisible] = useState(false);

  //table details
  const tableColumns = [
    {
      title: "Time",
      dataIndex: "maxTime",
    },
    {
      title: "CPU ID",
      dataIndex: "cpuID",
    },
    {
      title: "Max usr%",
      dataIndex: "max",
    },
    // {
    //   title: "Total usr% Avg",
    //   dataIndex: "average",
    // }
  ];

  const tableData = [
    {
      key: "1",
      maxTime: cpuStats.maxTime,
      cpuID: cpuStats.cpuID,
      max: cpuStats.max,
      // average: cpuStats.average,
    },
  ];

  //drawer on off
  function showDrawer() {
    setVisible(true);
  }

  function onClose() {
    setVisible(false);
  }

  const chartRef = useRef();
  

  //chart generation and select
  function changeDatasetData(chart) {

    chart.data.datasets[0].data = cpuData.cpuArray[selectedCPU].cpuUsrData;
    chart.data.datasets[1].data = cpuData.cpuArray[selectedCPU].cpuNiceData;
    chart.data.datasets[2].data = cpuData.cpuArray[selectedCPU].cpuSysData;
    chart.data.datasets[3].data = cpuData.cpuArray[selectedCPU].cpuIowaitData;
    chart.data.datasets[4].data = cpuData.cpuArray[selectedCPU].cpuIrqData;
    chart.data.datasets[5].data = cpuData.cpuArray[selectedCPU].cpuSoftData;
    chart.data.datasets[6].data = cpuData.cpuArray[selectedCPU].cpuIdleData;
    chart.update();
  }

  function createChartData() {
    
    return {
      datasets: [
        {
          label: "usr%",
          data: cpuData.cpuArray[0].cpuUsrData,
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
          label: "nice%",
          data: cpuData.cpuArray[0].cpuNiceData,
          backgroundColor: "rgba(254, 140, 0, 0.1)",
          borderColor: "rgba(254, 140, 0, 1)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "sys%",
          data: cpuData.cpuArray[0].cpuSysData,
          backgroundColor: "rgba(58, 245, 39, 0.1)",
          borderColor: "rgba(58, 245, 39, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "iowait%",
          data: cpuData.cpuArray[0].cpuIowaitData,
          backgroundColor: "rgba(255, 0, 0, 0.1)",
          borderColor: "rgba(255, 0, 0, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "irq%",
          data: cpuData.cpuArray[0].cpuIrqData,
          backgroundColor: "rgba(95, 17, 177, 0.1)",
          borderColor: "rgba(95, 17, 177, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "softIrq%",
          data: cpuData.cpuArray[0].cpuSoftData,
          backgroundColor: "rgba(177, 17, 82, 0.1)",
          borderColor: "rgba(177, 17, 82, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "idle%",
          data: cpuData.cpuArray[0].cpuIdleData,
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
    let perfOptions = true;
    if (cpuData.cpuArray[0].cpuUsrData.length > 2000) {
      perfOptions = false;
    }
    return {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value, index, ticks) {
              return value + "%";
            },
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
      mantainAspectRatio: false,
      parsing: false,
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: "rgba(180, 180, 180, 1)",
          },
        },
        zoom: { // logic to enable zoom chart
          zoom: {
            wheel: {
              enabled: true,
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
              min: cpuData.cpuArray[0].cpuUsrData[0].x,
              max: cpuData.cpuArray[0].cpuUsrData[cpuData.cpuArray[0].cpuUsrData.length - 1].x,
            }
          }
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
  
  //data statistics
  function getStats () {
    const newCpuStats = { ...cpuStats };

    let max = -Infinity;
    let maxCpuIndex = -1;
    let maxUsrIndex = -1;

    cpuData.cpuArray.slice(1).forEach((cpu, cpuIndex) => {
      cpu.cpuUsrData.forEach((usrData, usrIndex) => {
        const y = usrData.y;
        if (y > max) {
          max = y;
          maxCpuIndex = cpuIndex + 1;
          maxUsrIndex = usrIndex;
        }
      });
    });
    let timeString = new Date(cpuData.cpuArray[maxCpuIndex].cpuUsrData[maxUsrIndex].x).toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' });
    timeString = timeString + " " + new Date(cpuData.cpuArray[maxCpuIndex].cpuUsrData[maxUsrIndex].x).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    newCpuStats.max = cpuData.cpuArray[maxCpuIndex].cpuUsrData[maxUsrIndex].y;
    newCpuStats.maxTime = timeString
    newCpuStats.cpuID = cpuData.uniqCPU[maxCpuIndex]
    setCpuStats(newCpuStats);
  }


  // useMemo and effects
  const chartData = useMemo(() => {
    setIsLoading(true);
    return createChartData();
  }, []);

  const chartOptions = useMemo(() => {
    return createChartOptions();
  }, []);

  useEffect(() => {
    const chart = chartRef.current
    changeDatasetData(chart);
  }, [selectedCPU]);


  useEffect(() => {
    setIsLoading(false);
    getStats()
  }, [])

  return (
    <>
      <Line ref={chartRef} options={chartOptions} data={chartData}  />
      <ItemList items={cpuData.uniqCPU} placeHolderText="Select CPU (selected All)" setValue={setSelectedCPU} />
      <p>Core with highest usr% usage is {cpuStats.cpuID}. Click on the button below for more details.</p>
      <Button type="primary" onClick={showDrawer} >
        More Details
      </Button>
      <Drawer
        title="CPU Details"
        placement="left"
        onClose={onClose}
        open={visible}
        width={700}
        className="text-white"
      >
        <p >Max CPU usage is {cpuStats.max}% at {cpuStats.maxTime} on CPU {cpuStats.cpuID}.</p>
        <TableDetails columns={tableColumns} data={tableData}  />
        <Button type="primary" onClick={onClose}>
        Close
      </Button>
      </Drawer>
    </>
  );
}
