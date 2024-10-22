/* eslint-disable @typescript-eslint/no-explicit-any */
// MainChart.tsx
import { Pie, Doughnut, Line, Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
} from "chart.js";
ChartJS.register(ChartDataLabels);

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
);

interface MainChartProps {
  chartType: "Pie" | "Doughnut" | "Line" | "Bar";
  data: any;
  options?: any;
  height?: string;
  width?: string;
}

const MainChart = ({
  chartType,
  data,
  options,
  height = "100%",
  width = "100%",
}: MainChartProps): any => {
  const renderChart = (): any => {
    switch (chartType) {
      case "Pie":
        return (
          <Pie
            data={data}
            style={{
              maxHeight: "85%",
            }}
            options={options}
          />
        );
      case "Doughnut":
        return (
          <Doughnut
            data={data}
            style={{
              maxHeight: "85%",
            }}
            options={options}
          />
        );
      case "Line":
        return (
          <Line
            data={data}
            style={{
              maxHeight: "85%",
            }}
            options={options}
          />
        );
      case "Bar":
        return (
          <Bar
            data={data}
            style={{
              maxHeight: "85%",
            }}
            options={options}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        overflow: "hidden",
        maxHeight: "100%",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
        background: "#fff",
      }}
    >
      {renderChart()}
    </div>
  );
};

export default MainChart;
