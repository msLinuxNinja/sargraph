import { useEffect, useMemo, useRef } from "react";
import { useDataContext } from "../Contexts/DataContext";


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

export default function MemoryPercntChart() {
  const { memoryData } = useDataContext();
  const chartRef = useRef();

  function createChartData() {
    return {
      datasets: [
        {
          label: "Memory Used %",
          data: memoryData.memUsedPrcnt,
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            let yAxis = context.chart.scales.y.height; // Get chart height to make it responsive
            if (yAxis === undefined) {
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
          data: memoryData.commitPrcnt,
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
          min: 0,
          max: 100,
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
              min: memoryData.memUsedPrcnt[0].x,
              max: memoryData.memUsedPrcnt[memoryData.memUsedPrcnt.length - 1].x,
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

  const chartData = useMemo(() => {
    return createChartData();
  }, []);

  const chartOptions = useMemo(() => {
    return createChartOptions();
  }, []);

  useEffect(() => {

    const chart = chartRef.current;
    console.log(chart.data)
  }, []);

  return (
    <>
      <Line ref={chartRef} options={chartOptions} data={chartData} />
    </>
  );
}
