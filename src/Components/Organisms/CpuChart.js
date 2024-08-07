import { useMemo, useEffect, useRef, useState } from "react";
import { useDataContext } from "../Contexts/DataContext";

// antd imports
import { Button, Drawer, Flex, Typography } from "antd";

// chart.js imports
import "chartjs-adapter-date-fns";
import zoomPlugin, { zoom } from "chartjs-plugin-zoom"; // import zoom plugin
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

// Custom components
import ResetButton from "../Atoms/ResetButton";
import CopyClipboardButton from "../Atoms/CopyClipButton";
import ItemList from "../Atoms/List";
import TableDetails from "../Molecules/TableDetails";

//Colors

import {colorConfig} from "../../Utils/colors";

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

export default function CpuChart() {
  //states
  const { cpuData, selectedCPU, setSelectedCPU, setIsLoading } =
    useDataContext();
  const [cpuStats, setCpuStats] = useState({
    max: 0,
    average: 0,
    index: 0,
    maxTime: "",
    cpuID: 0,
  });

  const [visible, setVisible] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  // Metric states for selected period average calculation
  const [usrAvg, setUsrAvg] = useState(0);
  const [niceAvg, setNiceAvg] = useState(0);
  const [sysAvg, setSysAvg] = useState(0);
  const [iowaitAvg, setIowaitAvg] = useState(0);
  const [irqAvg, setIrqAvg] = useState(0);
  const [softIrqAvg, setSoftIrqAvg] = useState(0);
  const [idleAvg, setIdleAvg] = useState(0);

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

  // info table
  const infoTable = [
    {
      title: "Field",
      dataIndex: "field",
    },
    {
      title: "Description",
      dataIndex: "description",
    },
  ];

  const infoData = [
    {
      key: "1",
      field: "usr%",
      description:
        "Percentage of CPU utilization that occurred while executing at the user level (application).",
    },
    {
      key: "2",
      field: "nice%",
      description:
        "Percentage of CPU utilization that occurred while executing at the user level with nice priority.",
    },
    {
      key: "3",
      field: "sys%",
      description:
        "Percentage of CPU utilization that occurred while executing at the system level (kernel). Note that this field includes time spent servicing hardware and software interrupts.",
    },
    {
      key: "4",
      field: "iowait%",
      description:
        "Percentage of time that the CPU or CPUs were idle due to outstanding disk I/O request. (Higher % might indicate disk latency)",
    },
    {
      key: "5",
      field: "irq%",
      description:
        "Percentage of time spent by the CPU or CPUs to service hardware interrupts. (Higher % might indicate high network traffic)",
    },
    {
      key: "6",
      field: "soft%",
      description:
        "Percentage of time spent by the CPU or CPUs to service software interrupts.",
    },
    {
      key: "7",
      field: "idle%",
      description:
        "Percentage of time that the CPU or CPUs were idle and the system did not have an outstanding disk I/O request.",
    },
  ];

  //drawer on off
  function showDrawer() {
    setVisible(true);
  }

  function onClose() {
    setVisible(false);
  }

  function fetchData(min, max, chart) {
    const dataAvgs = [];
    chart.data.datasets.forEach((dataset) => {
      // Iterates over the datasets of the current chart
      const currentData = [];
      dataset.data.forEach((data) => {
        // Extracts the data based on the min/max x time values
        if (data.x >= min && data.x <= max) {
          currentData.push(data.y);
        }
      });
      const avg =
        Math.round(
          (currentData.reduce((acc, curr) => acc + curr, 0) /
            currentData.length) *
            100
        ) / 100; // Calculates the average of the data and round to two decimal places

      dataAvgs.push(avg);
    });
    setUsrAvg(dataAvgs[0]);
    setNiceAvg(dataAvgs[1]);
    setSysAvg(dataAvgs[2]);
    setIowaitAvg(dataAvgs[3]);
    setIrqAvg(dataAvgs[4]);
    setSoftIrqAvg(dataAvgs[5]);
    setIdleAvg(dataAvgs[6]);
  }

  const chartRef = useRef();

  function createChartData() {
    return {
      datasets: [
        {
          label: "usr%",
          data: cpuData.cpuArray[selectedCPU].cpuUsrData,
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
          data: cpuData.cpuArray[selectedCPU].cpuNiceData,
          backgroundColor: colorConfig.chartColors.color2.background,
          borderColor: colorConfig.chartColors.color2.border,
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "sys%",
          data: cpuData.cpuArray[selectedCPU].cpuSysData,
          backgroundColor: colorConfig.chartColors.color3.background,
          borderColor: colorConfig.chartColors.color3.border,
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "iowait%",
          data: cpuData.cpuArray[selectedCPU].cpuIowaitData,
          backgroundColor: colorConfig.chartColors.color4.background,
          borderColor: colorConfig.chartColors.color4.border,
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "irq%",
          data: cpuData.cpuArray[selectedCPU].cpuIrqData,
          backgroundColor: colorConfig.chartColors.color5.background,
          borderColor: colorConfig.chartColors.color5.border,
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "softIrq%",
          data: cpuData.cpuArray[selectedCPU].cpuSoftData,
          backgroundColor: colorConfig.chartColors.color6.background,
          borderColor: colorConfig.chartColors.color6.border,
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "idle%",
          data: cpuData.cpuArray[selectedCPU].cpuIdleData,
          backgroundColor: colorConfig.chartColors.color7.background,
          borderColor: colorConfig.chartColors.color7.border,
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
            color: colorConfig.textColor,
          },
          responsive: true,
          min: 0,
          type: "linear",
        },
        x: {
          ticks: {
            color: colorConfig.textColor,
            source: "auto",
            autoSkip: true,
            maxRotation: 0,
          },
          grid: {
            color: "rgba(0, 0, 0, 0.10)",
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
            color: colorConfig.textColor,
            font: {
              size:16
            }
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
            onZoomComplete: function ({ chart }) {
              setZoomLevel(chart.getZoomLevel()); // Updates zoom level when zoom completes
              const xAxis = chart.scales.x;
              const xMin = xAxis.min;
              const xMax = xAxis.max;
              fetchData(xMin, xMax, chart);
            },
          },
          pan: {
            enabled: true,
            mode: "x",
            onPanComplete: function ({ chart }) {
              const xAxis = chart.scales.x;
              const xMin = xAxis.min;
              const xMax = xAxis.max;
              fetchData(xMin, xMax, chart);
            },
          },
          limits: {
            x: {
              min: cpuData.cpuArray[0].cpuUsrData[0].x,
              max: cpuData.cpuArray[0].cpuUsrData[
                cpuData.cpuArray[0].cpuUsrData.length - 1
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

  //data statistics
  function getStats() {
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
    let timeString = new Date(
      cpuData.cpuArray[maxCpuIndex].cpuUsrData[maxUsrIndex].x
    ).toLocaleDateString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    timeString =
      timeString +
      " " +
      new Date(
        cpuData.cpuArray[maxCpuIndex].cpuUsrData[maxUsrIndex].x
      ).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    newCpuStats.max = cpuData.cpuArray[maxCpuIndex].cpuUsrData[maxUsrIndex].y;
    newCpuStats.maxTime = timeString;
    newCpuStats.cpuID = cpuData.uniqCPU[maxCpuIndex];
    setCpuStats(newCpuStats);
  }

  // Chart setup
  const chartData = useMemo(() => {
    setIsLoading(true);
    return createChartData();
  }, [selectedCPU]);

  const chartOptions = useMemo(() => createChartOptions(), [cpuData]);

  useEffect(() => {
    if (chartRef.current.scales) {
      // Update cpu data when selected CPU changes
      const xMin = chartRef.current.scales.x.min;
      const xMax = chartRef.current.scales.x.max;
      fetchData(xMin, xMax, chartRef.current);
    }
    chartRef.current.update(); // Update chart after selecting CPU
    setIsLoading(false);
  }, [selectedCPU]);

  useEffect(() => {
    setIsLoading(false);
    getStats();
  }, []);

  return (
    <>
      <Line ref={chartRef} options={chartOptions} data={chartData} />
      <Flex className="flex-col items-start gap-2 lg:flex-row lg:items-center">
        <ItemList
          items={cpuData.uniqCPU}
          placeHolderText="Select CPU (selected All)"
          setValue={setSelectedCPU}
        />
        <ResetButton chartRef={chartRef} />
        <CopyClipboardButton chartRef={chartRef}/>
        <Typography.Text type="primary">
          Current level zoom: {zoomLevel}
        </Typography.Text>
        <Typography.Text type="primary">
          Averages for selected period:
        </Typography.Text>
        <Typography.Text type="primary">
          usr: <b className="text-sky-600">{usrAvg}%</b>, 
          nice: <b className="text-amber-500">{niceAvg}%</b>, 
          sys: <b className="text-green-500">{sysAvg}%</b>,
          iowait: <b className="text-red-600">{iowaitAvg}%</b>,
          irq: <b className="text-violet-400">{irqAvg}%</b>, 
          softIrq: <b className="text-pink-700">{softIrqAvg}%</b>,
          idle: <b className="text-cyan-400">{idleAvg}%</b>
        </Typography.Text>
      </Flex>
      <Typography.Paragraph>
        Core with highest usr% usage is {cpuStats.cpuID}. Click on the button
        below for more details.
      </Typography.Paragraph>

      <Button type="primary" onClick={showDrawer}>
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
        <p>
          Max CPU usage is {cpuStats.max}% at {cpuStats.maxTime} on CPU{" "}
          {cpuStats.cpuID}.
        </p>
        <TableDetails
          title={"Core with highest usage"}
          columns={tableColumns}
          data={tableData}
        />
        <TableDetails
          title={"Description of the fields"}
          columns={infoTable}
          data={infoData}
        />
        <Button type="primary" onClick={onClose} className="mt-3">
          Close
        </Button>
      </Drawer>
    </>
  );
}
