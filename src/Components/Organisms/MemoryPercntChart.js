import React, { useContext, useMemo } from "react";
import LineChart from "../Molecules/LineChart";
import { DataContext } from "../Contexts/DataContext";


export default function MemoryPercntChart(props) {
    const { sarData } = useContext(DataContext);
    const chartData = useMemo(() => {
      if(sarData) {
        return createChartData(sarData)
      }
    } , [sarData]);
    
    const chartOptions = useMemo(() => {
        if(sarData) {
            return createChartOptions(sarData);
        }
    } , [sarData]);

    return (
      <>
        {sarData ? <LineChart options={chartOptions} data={chartData} /> : null}
      </>
    );
}

export function createChartData(sarData) {

    return {
        labels: sarData.memoryObject.xlables,
        datasets: [
            {
                label: 'Memory Used %',
                data: sarData.memoryObject.ymemUsedPrcnt,
                // backgroundColor:'rgba(0, 132, 195, 0.1)',
                backgroundColor: (context) => { 
                    const ctx = context.chart.ctx;
                    let yAxis = context.chart.scales.y.height; // Get chart height to make it responsive
                    if(yAxis === undefined) { // scales.y.height is undefined when starting ideally should use isMounted? but for now an if to check if undefined assign an arbitrary number.
                        yAxis = 400;
                    } else {
                        yAxis = context.chart.scales.y.height;
                    };                        
                    
                    const gradient = ctx.createLinearGradient(0, 0, 0, yAxis); // pass the height of the chart
                    gradient.addColorStop(0,"rgba(0, 132, 195, 0.40)");
                    gradient.addColorStop(0.25, "rgba(0, 132, 195, 0.30)"); // Stops for gradient
                    gradient.addColorStop(0.50, "rgba(0, 132, 195, 0.20)");
                    gradient.addColorStop(0.75, "rgba(0, 132, 195, 0.10)");
                    gradient.addColorStop(1, "rgba(0, 132, 195, 0.005)");
                    return gradient;
                },
                borderColor: 'rgba(0, 132, 195, 0.8)',
                borderWidth: 2,
                fill: true,
                tension: 0.2
            }, {
                label: 'Memory Commit %',
                data: sarData.memoryObject.ycommitPrcnt,
                // backgroundColor:'rgba(254, 140, 0, 0.1)',
                backgroundColor: (context) => { 
                  const ctx = context.chart.ctx;
                  let yAxis = context.chart.scales.y.height; // Get chart height to make it responsive
                  if(yAxis === undefined) { // scales.y.height is undefined when starting ideally should use isMounted? but for now an if to check if undefined assign an arbitrary number.
                      yAxis = 400;
                  } else {
                      yAxis = context.chart.scales.y.height;
                  };                        
                  
                  const gradient = ctx.createLinearGradient(0, 0, 0, yAxis); // pass the height of the chart
                  gradient.addColorStop(0,"rgba(254, 140, 0, 0.40)");
                  gradient.addColorStop(0.25, "rgba(254, 140, 0, 0.30)"); // Stops for gradient
                  gradient.addColorStop(0.50, "rgba(254, 140, 0, 0.20)");
                  gradient.addColorStop(0.75, "rgba(254, 140, 0, 0.10)");
                  gradient.addColorStop(1, "rgba(254, 140, 0, 0.005");
                  return gradient;
                },
                borderColor: 'rgba(254, 140, 0, 0.8)',
                borderWidth: 2,
                fill: true,
                tension: 0.2
            },
        ],
    };
}
export function createChartOptions(sarData) {
    
    return {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value, index, ticks) {
            return value + '%';
          },
        },
        responsive: true,
        min: 0,
        max: 100,
      },
    },
  };
}