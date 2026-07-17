import { useMemo, useRef, useEffect, useState } from "react";
import { useDataContext } from "../Contexts/DataContext";

// antd imports
import { Flex, Select, Typography } from "antd";

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

// Metrics available per block device (matches parseDiskIO() output shape)
const metricOptions = [
  { value: "tps", label: "Transfers per second (tps)", unit: "/s" },
  { value: "readSec", label: "Read MB/s", unit: "MB/s" },
  { value: "writeSec", label: "Write MB/s", unit: "MB/s" },
  { value: "avgRQz", label: "Average Request Size (KB)", unit: "KB" },
  { value: "avgQz", label: "Average Queue Size", unit: "" },
  { value: "awaitMS", label: "Latency in MS", unit: "ms" },
];

// Generates N perceptually-spread colors by varying hue around the color wheel
function generatePalette(count) {
  const total = Math.max(count, 1);
  return Array.from({ length: total }, (_, i) => {
    const hue = Math.round((i * 360) / total);
    return `hsl(${hue}, 70%, 55%)`;
  });
}

export default function BlockTimelineChart() {
  const { blockData } = useDataContext();
  const chartRef = useRef();

  const [selectedMetric, setSelectedMetric] = useState("tps");
  const [zoomLevel, setZoomLevel] = useState(1);

  // Stats for the currently visible zoom window
  const [metricAvg, setMetricAvg] = useState(0);
  const [busiestDevice, setBusiestDevice] = useState("");
  const [busiestDeviceAvg, setBusiestDeviceAvg] = useState(0);

  const selectedMetricConfig =
    metricOptions.find((m) => m.value === selectedMetric) || metricOptions[0];

  function fetchData(min, max, chart) {
    let sum = 0;
    let count = 0;
    let maxAvg = -Infinity;
    let maxLabel = "";

    chart.data.datasets.forEach((dataset) => {
      const currentData = [];
      dataset.data.forEach((data) => {
        if (data.x >= min && data.x <= max) {
          currentData.push(data.y);
          sum += data.y;
          count += 1;
        }
      });
      if (currentData.length > 0) {
        const avg =
          currentData.reduce((acc, curr) => acc + curr, 0) /
          currentData.length;
        if (avg > maxAvg) {
          maxAvg = avg;
          maxLabel = dataset.label;
        }
      }
    });

    setMetricAvg(count > 0 ? Math.round((sum / count) * 100) / 100 : 0);
    setBusiestDevice(maxLabel);
    setBusiestDeviceAvg(maxAvg > -Infinity ? Math.round(maxAvg * 100) / 100 : 0);
  }

  function createChartData() {
    const palette = generatePalette(blockData.uniqDev.length);
    return {
      datasets: blockData.uniqDev.map((devName, idx) => ({
        label: devName,
        data: blockData.diskArray[idx][selectedMetric],
        borderColor: palette[idx],
        backgroundColor: "transparent",
        borderWidth: 1.5,
        // pointRadius: 2,
        pointHoverRadius: 6,
        tension: 0.2,
        spanGaps: true,
      })),
    };
  }

  function createChartOptions() {
    const pointCount = blockData.diskArray[0][selectedMetric].length;
    const perfOptions = !(
      pointCount > 1800 || blockData.uniqDev.length > 5
    );

    return {
      interaction: {
        mode: "nearest",
        intersect: true,
        axis: "x",
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return selectedMetricConfig.unit
                ? `${value}${selectedMetricConfig.unit}`
                : value;
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
            color: "rgba(0, 0, 0, 0.05)",
          },
          type: "time",
        },
      },
      animation: perfOptions,
      normalized: true,
      maintainAspectRatio: false,
      parsing: false,
      responsive: true,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: colorConfig.textColor,
            boxWidth: 12,
            font: {
              size: 11,
            },
          },
          onClick: (e, legendItem, legend) => {
            // Click a legend entry to isolate that device; click again to restore all.
            // Ctrl/Cmd+click toggles that device on/off, adding it to the current selection.
            const chart = legend.chart;
            const index = legendItem.datasetIndex;
            const multiSelect = e?.native?.ctrlKey || e?.native?.metaKey;

            if (multiSelect) {
              const meta = chart.getDatasetMeta(index);
              meta.hidden = !meta.hidden;
              chart.update();
              return;
            }

            const isolated = chart.data.datasets.every((ds, i) => {
              const meta = chart.getDatasetMeta(i);
              return i === index ? !meta.hidden : !!meta.hidden;
            });
            chart.data.datasets.forEach((ds, i) => {
              const meta = chart.getDatasetMeta(i);
              meta.hidden = isolated ? false : i !== index;
            });
            chart.update();
          },
        },
        verticalHoverLine: {
          lineWidth: 1,
          color: "rgba(148,163,184,0.45)",
          dash: [4, 4],
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
              min: blockData.diskArray[0][selectedMetric][0].x,
              max: blockData.diskArray[0][selectedMetric][
                blockData.diskArray[0][selectedMetric].length - 1
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

  const chartData = useMemo(() => {
    if (!blockData || blockData.diskArray.length === 0) {
      return false;
    }
    return createChartData();
  }, [selectedMetric]);

  const chartOptions = useMemo(() => {
    if (!blockData || blockData.diskArray.length === 0) {
      return false;
    }
    return createChartOptions();
  }, [selectedMetric]);

  useEffect(() => {
    if (!blockData || blockData.diskArray.length === 0) {
      return;
    }

    if (chartRef.current && chartRef.current.scales) {
      const xMin = chartRef.current.scales.x.min;
      const xMax = chartRef.current.scales.x.max;
      fetchData(xMin, xMax, chartRef.current);
    }

    if (chartRef.current) {
      chartRef.current.update();
    }
  }, [selectedMetric]);

  return (
    <>
      {chartData ? (
        <div className="relative w-full h-[60vh] md:h-[65vh] lg:h-[70vh]">
          <Line ref={chartRef} options={chartOptions} data={chartData} />
        </div>
      ) : (
        <>
          <h1>No block data found</h1>
        </>
      )}
      {chartData ? (
        <Flex className="flex-col items-start gap-2 lg:flex-row lg:items-center">
          <Select
            options={metricOptions}
            value={selectedMetric}
            onChange={setSelectedMetric}
            placeholder="Select Metric"
            size="large"
            bordered={true}
            style={{
              width: 320,
            }}
          />
          <ResetButton chartRef={chartRef} />
          <CopyClipboardButton chartRef={chartRef} />
          <Typography.Text type="primary">
            Current level zoom: {zoomLevel}
          </Typography.Text>
          <Typography.Text type="secondary">
            Click a legend entry to isolate a device, Ctrl/Cmd+click to
            select multiple.
          </Typography.Text>
          <Typography.Text type="primary">
            Average for selected period:{" "}
            <b className="text-sky-600">
              {metricAvg}
              {selectedMetricConfig.unit}
            </b>
            , Busiest device:{" "}
            <b className="text-amber-500">
              {busiestDevice} ({busiestDeviceAvg}
              {selectedMetricConfig.unit})
            </b>
          </Typography.Text>
        </Flex>
      ) : (
        <></>
      )}
    </>
  );
}
