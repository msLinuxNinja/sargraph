import { useMemo } from "react";
import LineChart from "../Molecules/LineChart";
import { useDataContext } from "../Contexts/DataContext";

export default function MemoryPercntChart(props) {
  const { memoryData } = useDataContext();
  function createChartData() {
    return {
      labels: memoryData.xlables,
      datasets: [
        {
          label: "Memory Used %",
          data: memoryData.ymemUsedPrcnt,
          // backgroundColor:'rgba(0, 132, 195, 0.1)',
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
            gradient.addColorStop(1, "rgba(0, 132, 195, 0.005)");
            return gradient;
          },
          borderColor: "rgba(0, 132, 195, 1)",
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "Memory Commit %",
          data: memoryData.ycommitPrcnt,
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
            gradient.addColorStop(0, "rgba(254, 140, 0, 0.20)");
            gradient.addColorStop(0.25, "rgba(254, 140, 0, 0.15)"); // Stops for gradient
            gradient.addColorStop(0.5, "rgba(254, 140, 0, 0.10)");
            gradient.addColorStop(0.75, "rgba(254, 140, 0, 0.05)");
            gradient.addColorStop(1, "rgba(254, 140, 0, 0.005)");
            return gradient;
          },
          borderColor: "rgba(254, 140, 0, 1)",
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
            callback: function (value, index, ticks) {
              return value + "%";
            },
            color: "rgba(180, 180, 180, 1)",
          },

          grid: {
            color: "rgba(0, 0, 0, 0.2)",
          },
          responsive: true,
          min: 0,
          max: 100,
          
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
