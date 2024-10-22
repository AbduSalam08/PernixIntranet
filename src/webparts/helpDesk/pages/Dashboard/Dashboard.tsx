/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import MainChart from "../../../../components/common/Charts/MainChart";
import PageHeader from "../../../../components/common/PageHeader/PageHeader";
// images
// Import SVGs
const myTickets: any = require("../../assets/images/svg/myTickets.svg");
const openTickets: any = require("../../assets/images/svg/openTickets.svg");
const closedTickets: any = require("../../assets/images/svg/closedTickets.svg");
const ticketsCreatedThisWeek: any = require("../../assets/images/svg/ticketsCreatedThisWeek.svg");
const ticketsOnHold: any = require("../../assets/images/svg/ticketsOnHold.svg");

import styles from "./Dashboard.module.scss";
const Dashboard = (): JSX.Element => {
  const ticketByStatus = {
    labels: ["Open", "Resolved", "Waiting to be Resolved", "Pending", "Closed"],
    datasets: [
      {
        data: [20, 25, 20, 15, 20],
        backgroundColor: [
          "#E0803D",
          "#0B4D53",
          "#2D9CDB",
          "#F9C74F",
          "#5962B8",
        ],
      },
    ],
  };

  const ticketByStatusOptions = {
    plugins: {
      legend: {
        position: "right",
        labels: {
          font: {
            size: 13, // Font size for the legend labels
            family: "'osMedium', sans-serif", // Font family
          },
          color: "#484848", // Label font color
          boxWidth: 10, // Width of the color box next to each legend label
          padding: 20, // Padding around legend labels
          usePointStyle: true, // Use a circle/point instead of a rectangle
          pointStyleWidth: 10, // Adjust the size of the point style
          borderRadius: 5, // Adjust the border radius to make the box rounded
        },
      },
      datalabels: {
        color: "white",
        formatter: (value: number, ctx: any) => {
          const total = ctx.chart.data.datasets[0].data.reduce(
            (sum: number, val: number) => sum + val,
            0
          );
          const percentage = Math.round((value / total) * 100); // Round the percentage
          return `${percentage}%`; // Display rounded percentage
        },
      },
    },
  };

  const ticketBySource = {
    labels: ["Email", "Portal"],
    datasets: [
      {
        data: [55, 45],
        backgroundColor: ["#E0803D", "#0B4D53"],
      },
    ],
  };

  const ticketBySourceOptions = {
    plugins: {
      legend: {
        position: "right",
        labels: {
          font: {
            size: 13, // Font size for the legend labels
            family: "'osMedium', sans-serif", // Font family
          },
          color: "#484848", // Label font color
          boxWidth: 10, // Width of the color box next to each legend label
          padding: 20, // Padding around legend labels
          usePointStyle: true, // Use a circle/point instead of a rectangle
          pointStyleWidth: 10, // Adjust the size of the point style
          borderRadius: 5, // Adjust the border radius to make the box rounded
        },
      },
      datalabels: {
        color: "white",
        formatter: (value: number, ctx: any) => {
          const total = ctx.chart.data.datasets[0].data.reduce(
            (sum: number, val: number) => sum + val,
            0
          );
          const percentage = Math.round((value / total) * 100); // Round the percentage
          return `${percentage}%`; // Display rounded percentage
        },
      },
    },
  };

  const ticketsByDayOfWeek = {
    labels: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    datasets: [
      {
        label: "Created tickets",
        data: [8, 5, 11, 6, 7, 4, 9],
        backgroundColor: "#E0803D",
        borderColor: "#E0803D",
        fill: false,
      },
      {
        label: "Closed tickets",
        data: [1, 9, 3, 10, 5, 3, 2],
        backgroundColor: "#0B4D53",
        borderColor: "#0B4D53",
        fill: false,
      },
    ],
  };

  const ticketsByDayOfWeekOptions = {
    plugins: {
      legend: {
        position: "bottom", // Position of the legend
        labels: {
          font: {
            size: 13, // Font size for the legend labels
            family: "'osMedium', sans-serif", // Font family
          },
          color: "#484848", // Label font color
          boxWidth: 10, // Width of the color box next to each legend label
          padding: 20, // Padding around legend labels
          usePointStyle: true, // Use a circle/point instead of a rectangle
          pointStyle: "circle", // Ensures the point style is a circle
        },
      },
      datalabels: {
        color: "white",
        formatter: (value: number, ctx: any) => {
          return "";
        },
      },
    },
    elements: {
      line: {
        tension: 0.4, // Line smoothing
      },
      point: {
        radius: 3, // Point size
        hoverRadius: 5, // Hover size for points
        borderRadius: 5, // Make points rounded
      },
    },
    scales: {
      x: { title: { display: true, text: "Day" } },
      y: { title: { display: true, text: "Number of Tickets" } },
    },
  };

  const currentTicketStatuses = {
    labels: ["New", "Unassigned", "Group", "Overdue", "Closed", "Backlog"],
    datasets: [
      {
        label: "Tickets",
        data: [5, 3, 7, 4, 9, 6],
        backgroundColor: [
          "#90BE6D",
          "#0B4D53",
          "#E0803D",
          "#BE6D6D",
          "#D74FF9",
          "#4F9DF9",
        ],
      },
    ],
  };

  const currentTicketStatusesOptions = {
    plugins: {
      legend: { display: false, position: "bottom" },

      datalabels: {
        color: "white",
        formatter: (value: number, ctx: any) => {
          return "";
        },
      },
    },
    barThickness: 60,
    scales: {
      x: { title: { display: true, text: "Status" } },
      y: { title: { display: true, text: "Ticket Count" } },
    },
  };

  // Info cards array
  const infoCards: any[] = [
    {
      cardName: "My Tickets",
      cardImg: myTickets,
      cardValues: "42",
    },
    {
      cardName: "Open",
      cardImg: openTickets,
      cardValues: "20",
    },
    {
      cardName: "Closed",
      cardImg: closedTickets,
      cardValues: "22",
    },
    {
      cardName: "This week's tickets",
      cardImg: ticketsCreatedThisWeek,
      cardValues: "6",
    },
    {
      cardName: "Tickets on hold",
      cardImg: ticketsOnHold,
      cardValues: "43",
    },
  ];

  console.log("infoCards: ", infoCards);

  return (
    <div className={styles.myDashboard}>
      <div className={styles.myDashboard_header}>
        <PageHeader title={"Dashboard"} noBackBtn />
      </div>

      <div className={styles.infoCards}>
        {infoCards?.map((item: any, idx: number) => (
          <div key={idx} className={styles.card}>
            <div className={styles.cardContent}>
              <span className={styles.cardName}>{item?.cardName}</span>
              <span className={styles.cardValue}>{item?.cardValues}</span>
            </div>
            <div className={styles.cardImg}>
              <img src={item.cardImg} alt={`${item.cardName} icon`} />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.chartDetails}>Ticket by status</div>
          <div className={styles.chart}>
            <MainChart
              chartType="Pie"
              height="90%"
              data={ticketByStatus}
              options={ticketByStatusOptions}
            />
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.chartDetails}>Tickets by source</div>
          <div className={styles.chart}>
            <MainChart
              height="90%"
              chartType="Doughnut"
              data={ticketBySource}
              options={ticketBySourceOptions}
            />
          </div>
        </div>
      </div>
      <div className={styles.metricsGrid2}>
        <div className={styles.metricCard}>
          <div className={styles.chartDetails}>Tickets by day of week</div>
          <div className={styles.chart}>
            <MainChart
              chartType="Line"
              data={ticketsByDayOfWeek}
              options={ticketsByDayOfWeekOptions}
            />
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.chartDetails}>Current ticket statuses</div>
          <div className={styles.chart}>
            <MainChart
              chartType="Bar"
              data={currentTicketStatuses}
              options={currentTicketStatusesOptions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
