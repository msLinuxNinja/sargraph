import { useContext, useMemo, useEffect } from "react";
import LineChart from "../Molecules/LineChart";
import { useDataContext } from "../Contexts/DataContext";
import ItemList from "../Atoms/List";

function getSelectedIndex(cpuData, selectedOption) {
  //logs the indexes of the selected value (CPU)
  console.log(selectedOption);
  console.log(cpuData);

  const dataIndex = cpuData.cpuNumber
    .map((x, index) => (x.includes(selectedOption) ? index : null))
    .filter((item) => item !== null);

  console.log(dataIndex);
}

export default function CpuChart() {
  const { cpuData, selectedOption } = useDataContext();

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
            gradient.addColorStop(0, "rgba(0, 132, 195, 0.40)");
            gradient.addColorStop(0.25, "rgba(0, 132, 195, 0.30)"); // Stops for gradient
            gradient.addColorStop(0.5, "rgba(0, 132, 195, 0.20)");
            gradient.addColorStop(0.75, "rgba(0, 132, 195, 0.10)");
            gradient.addColorStop(1, "rgba(0, 132, 195, 0.005");
            return gradient;
          },
          borderColor: "rgba(0, 132, 195, 0.8)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "CPU all nice%",
          data: cpuData.ycpuNice,
          backgroundColor: "rgba(254, 140, 0, 0.1)",
          borderColor: "rgba(254, 140, 0, 0.8)",
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
      return createChartData();
    }
  }, [cpuData]);

  const chartOptions = useMemo(() => {
    return createChartOptions();
  }, []);

  useEffect(() => {
    if (cpuData) {
      getSelectedIndex(cpuData, selectedOption);
    }
  }, [selectedOption]);

  return (
    <>
      {cpuData ? <LineChart options={chartOptions} data={chartData} /> : null}
      {cpuData ? (
        <ItemList items={cpuData.uniqCPU} placeHolderText="Select CPU" />
      ) : null}
    </>
  );
}
