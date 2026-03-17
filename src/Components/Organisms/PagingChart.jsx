import { useEffect, useMemo, useRef, useState } from "react";
import { useDataContext } from "../Contexts/DataContext";

// antd imports
import { Flex, Typography } from "antd";

// chart.js imports
import "chartjs-adapter-date-fns";
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
  Decimation,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Custom components
import ResetButton from "../Atoms/ResetButton";
import CopyClipboardButton from "../Atoms/CopyClipButton";

// Colors
import { colorConfig } from "../../Utils/colors";

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

export default function PagingChart() {
  const { pagingData } = useDataContext();
  const chartRef = useRef();

  const [zoomLevel, setZoomLevel] = useState(1);

  // Metric states for selected period average calculation
  const [pgpginAvg, setPgpginAvg] = useState(0);
  const [pgpgoutAvg, setPgpgoutAvg] = useState(0);
  const [faultAvg, setFaultAvg] = useState(0);
  const [majfltAvg, setMajfltAvg] = useState(0);
  const [pgfreeAvg, setPgfreeAvg] = useState(0);
  const [pgscankAvg, setPgscankAvg] = useState(0);
  const [pgscandAvg, setPgscandAvg] = useState(0);
  const [pgstealAvg, setPgstealAvg] = useState(0);
  const [vmeffAvg, setVmeffAvg] = useState(0);

  function fetchData(min, max, chart) {
    const dataAvgs = [];
    chart.data.datasets.forEach((dataset) => {
      const currentData = [];
      dataset.data.forEach((data) => {
        if (data.x >= min && data.x <= max) {
          currentData.push(data.y);
        }
      });
      const avg =
        Math.round(
          (currentData.reduce((acc, curr) => acc + curr, 0) /
            currentData.length) *
            100
        ) / 100;

      dataAvgs.push(avg);
    });

    setPgpginAvg(dataAvgs[0]);
    setPgpgoutAvg(dataAvgs[1]);
    setFaultAvg(dataAvgs[2]);
    setMajfltAvg(dataAvgs[3]);
    setPgfreeAvg(dataAvgs[4]);
    setPgscankAvg(dataAvgs[5]);
    setPgscandAvg(dataAvgs[6]);
    setPgstealAvg(dataAvgs[7]);
    setVmeffAvg(dataAvgs[8]);
  }

  function createChartData() {
    return {
      datasets: [
        {
          label: "pgpgin/s",
          data: pagingData.pgpgin,
          backgroundColor: colorConfig.chartColors.color1.background,
          borderColor: colorConfig.chartColors.color1.border,
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "pgpgout/s",
          data: pagingData.pgpgout,
          backgroundColor: colorConfig.chartColors.color2.background,
          borderColor: colorConfig.chartColors.color2.border,
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "fault/s",
          data: pagingData.fault,
          backgroundColor: colorConfig.chartColors.color3.background,
          borderColor: colorConfig.chartColors.color3.border,
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "majflt/s",
          data: pagingData.majflt,
          backgroundColor: colorConfig.chartColors.color4.background,
          borderColor: colorConfig.chartColors.color4.border,
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "pgfree/s",
          data: pagingData.pgfree,
          backgroundColor: colorConfig.chartColors.color5.background,
          borderColor: colorConfig.chartColors.color5.border,
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "pgscank/s",
          data: pagingData.pgscank,
          backgroundColor: colorConfig.chartColors.color6.background,
          borderColor: colorConfig.chartColors.color6.border,
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "pgscand/s",
          data: pagingData.pgscand,
          backgroundColor: colorConfig.chartColors.color7.background,
          borderColor: colorConfig.chartColors.color7.border,
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "pgsteal/s",
          data: pagingData.pgsteal,
          backgroundColor: colorConfig.chartColors.color1a.background,
          borderColor: colorConfig.chartColors.color1a.border,
          borderWidth: 2,
          fill: true,
          tension: 0.2,
        },
        {
          label: "%vmeff",
          data: pagingData.vmeff,
          backgroundColor: "rgba(255, 215, 0, 0.1)",
          borderColor: "rgba(255, 215, 0, 1)",
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
            color: "rgba(0, 0, 0, 0.05)",
          },
          type: "time",
        },
      },
      normalized: true,
      maintainAspectRatio: false,
      parsing: false,
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: colorConfig.textColor,
            font: {
              size: 16,
            },
          },
        },
        verticalHoverLine: {
          lineWidth: 1,
          color: "rgba(148,163,184,0.45)",
          dash: [4, 4],
        },
        zoom: {
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
              setZoomLevel(chart.getZoomLevel());
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
              min: pagingData.pgpgin[0].x,
              max: pagingData.pgpgin[pagingData.pgpgin.length - 1].x,
            },
          },
        },
        decimation: {
          enabled: true,
          algorithm: "lttb",
          samples: 200,
          threshold: 1100,
        },
      },
    };
  }

  const hasData = pagingData && pagingData.pgpgin.length > 0;

  const chartData = useMemo(() => {
    if (hasData) {
      return createChartData();
    }
  }, [pagingData]);

  const chartOptions = useMemo(() => {
    if (hasData) {
      return createChartOptions();
    }
  }, []);

  useEffect(() => {
    if (hasData && chartRef.current && chartRef.current.scales) {
      const xMin = chartRef.current.scales.x.min;
      const xMax = chartRef.current.scales.x.max;
      fetchData(xMin, xMax, chartRef.current);
    }
  }, []);

  return (
    <>
      {hasData ? (
        <div className="relative w-full h-[60vh] md:h-[65vh] lg:h-[70vh]">
          <Line ref={chartRef} options={chartOptions} data={chartData} />
        </div>
      ) : (
        <>
          <h1>No data found</h1>
        </>
      )}
      {hasData ? (
        <Flex className="flex-col items-start gap-2 lg:flex-row lg:items-center">
          <ResetButton chartRef={chartRef} />
          <CopyClipboardButton chartRef={chartRef} />
          <Typography.Text type="primary">
            Current level zoom: {zoomLevel}
          </Typography.Text>
          <Typography.Text type="primary">
            Averages for selected period:
          </Typography.Text>
          <Typography.Text type="primary">
            pgpgin/s: <b className="text-sky-600">{pgpginAvg}</b>,{" "}
            pgpgout/s: <b className="text-amber-500">{pgpgoutAvg}</b>,{" "}
            fault/s: <b className="text-green-500">{faultAvg}</b>,{" "}
            majflt/s: <b className="text-red-600">{majfltAvg}</b>,{" "}
            pgfree/s: <b className="text-pink-600">{pgfreeAvg}</b>,{" "}
            pgscank/s: <b className="text-violet-400">{pgscankAvg}</b>,{" "}
            pgscand/s: <b className="text-cyan-400">{pgscandAvg}</b>,{" "}
            pgsteal/s: <b className="text-teal-700">{pgstealAvg}</b>,{" "}
            %vmeff: <b className="text-yellow-400">{vmeffAvg}%</b>
          </Typography.Text>
        </Flex>
      ) : (
        <></>
      )}
    </>
  );
}
