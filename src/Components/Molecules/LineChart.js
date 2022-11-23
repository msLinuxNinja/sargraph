import React from "react";
import Chart from "chart.js/auto";
import { Line } from "react-chartjs-2";




export default function LineChart(props) {
  // Chart.register(props.plugins)

  return (
    <>
      <Line options={props.options} data={props.data}/>
    </>
  );
};

