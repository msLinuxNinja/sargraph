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
    {
      title: "Total usr% Avg",
      dataIndex: "average",
    }
  ];

  const tableData = [
    {
      key: "1",
      maxTime: cpuStats.maxTime,
      cpuID: cpuStats.cpuID,
      max: cpuStats.max,
      average: cpuStats.average,
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
  let perfOptions = true;

  //chart generation and select
  function getSelectedIndex(chart) {
    
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
    const cpuUsrData = cpuData.xlables.map((timeEntry, index) => ({
      x: timeEntry,
      y: cpuData.ycpuUsr[index]
    }));
    const cpuNiceData = cpuData.xlables.map((timeEntry, index) => ({
      x: timeEntry,
      y: cpuData.ycpuNice[index]
    }));
    const cpuSysData = cpuData.xlables.map((timeEntry, index) => ({
      x: timeEntry,
      y: cpuData.ycpuSys[index]
    }));
    const cpuIowaitData = cpuData.xlables.map((timeEntry, index) => ({
      x: timeEntry,
      y: cpuData.ycpuIowait[index]
    }));
    const cpuIrqData = cpuData.xlables.map((timeEntry, index) => ({
      x: timeEntry,
      y: cpuData.ycpuIrq[index]
    }));
    const cpuSoftData = cpuData.xlables.map((timeEntry, index) => ({
      x: timeEntry,
      y: cpuData.ycpuSoft[index]
    }));
    const cpuIdleData = cpuData.xlables.map((timeEntry, index) => ({
      x: timeEntry,
      y: cpuData.ycpuIdle[index]
    }));


    return {
      datasets: [
        {
          label: "CPU all usr%",
          data: cpuUsrData,
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
          data: cpuNiceData,
          backgroundColor: "rgba(254, 140, 0, 0.1)",
          borderColor: "rgba(254, 140, 0, 1)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "CPU all sys%",
          data: cpuSysData,
          backgroundColor: "rgba(58, 245, 39, 0.1)",
          borderColor: "rgba(58, 245, 39, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        // {
        //   label: "CPU all iowait%",
        //   data: cpuData.ycpuIowait,
        //   backgroundColor: "rgba(255, 0, 0, 0.1)",
        //   borderColor: "rgba(255, 0, 0, 0.8)",
        //   borderWidth: 2,
        //   fill: true,
        //   tension: 0.2,
        // },
        // {
        //   label: "CPU all irq%",
        //   data: cpuData.ycpuIrq,
        //   backgroundColor: "rgba(95, 17, 177, 0.1)",
        //   borderColor: "rgba(95, 17, 177, 0.8)",
        //   borderWidth: 2,
        //   fill: true,
        //   tension: 0.2,
        // },
        // {
        //   label: "CPU all softIrq%",
        //   data: cpuData.ycpuSoft,
        //   backgroundColor: "rgba(177, 17, 82, 0.1)",
        //   borderColor: "rgba(177, 17, 82, 0.8)",
        //   borderWidth: 2,
        //   fill: true,
        //   tension: 0.2,
        // },
        // {
        //   label: "CPU all idle%",
        //   data: cpuData.ycpuIdle,
        //   backgroundColor: "rgba(0, 210, 255, 0.05)",
        //   borderColor: "rgba(0, 210, 255, 0.8)",
        //   borderWidth: 2,
        //   fill: false,
        //   tension: 0.2,
        // },
      ],
    };
  }

  function createChartOptions() {
    if (cpuData.xlables.length > 6000) {
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
        },
        decimation: {
          enabled: true,
          algorithm: "lttb",
          samples: 300,
          threshold: 1000,
        },
      },
    };
  }
  
  //data statistics
  function getStats () {
    const newCpuStats = { ...cpuStats };
    newCpuStats.max = Math.max.apply(Math, cpuData.ycpuUsr)
    newCpuStats.index = cpuData.ycpuUsr.indexOf(newCpuStats.max)
    newCpuStats.maxTime = cpuData.xlables[newCpuStats.index]
    newCpuStats.cpuID = cpuData.cpuNumber[newCpuStats.index]
    newCpuStats.average = cpuData.ycpuUsr.reduce((a, b) => a + b, 0) / cpuData.ycpuUsr.length
    setCpuStats(newCpuStats);
  }


  // useMemo and effects
  const chartData = useMemo(() => {
    if (cpuData) {
      setIsLoading(true);
      setSelectedCPU("all") //sets default on first render
      return createChartData();
    }
  }, [cpuData]);

  const chartOptions = useMemo(() => {
    return createChartOptions();
  }, []);

  // useEffect(() => {
  //   const chart = chartRef.current

  //   if (cpuData) {
  //     getSelectedIndex(chart);
  //   }
  // }, [selectedCPU]);


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
