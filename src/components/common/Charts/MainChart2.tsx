/* eslint-disable @typescript-eslint/no-explicit-any */
// ChartComponent.tsx
import React from "react";
import { Chart } from "react-google-charts";
import "../../../assets/styles/style.css";
interface ChartProps {
  chartType: any;
  data: any[];
  options?: object;
  width?: string;
  height?: string;
  colors?: string[];
  style?: React.CSSProperties; // Accept a custom style prop
}

const MainChart: React.FC<ChartProps> = ({
  chartType,
  data,
  options = {},
  width = "100%",
  height = "400px",
  colors,
  style = {}, // Default empty style
}) => {
  const mergedOptions = {
    ...options,
    colors, // Apply custom colors
    chartArea: {
      backgroundColor: "transparent",
    },
  };

  return (
    <Chart
      style={{
        ...style,
        backgroundColor: "transparent",
      }}
      chartType={chartType}
      data={data}
      options={mergedOptions}
      width={width}
      height={height}
      className="canvasjs-chart-canvas"
    />
  );
};

export default MainChart;
