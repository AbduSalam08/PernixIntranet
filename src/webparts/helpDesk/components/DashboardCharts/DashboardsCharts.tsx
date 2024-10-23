/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import MainChart from "../../../../components/common/Charts/MainChart";
import {
  getTicketsByKeyValue,
  groupTicketsByPeriod,
} from "../../../../utils/commonUtils";

interface AllticketsDataProps {
  AllTickets: {
    data: any[];
    role: string;
    isLoading: boolean;
  };
  Term: "This Week" | "This Month" | "Last 3 months" | "Last 6 months";
}

const TicketByStatusChart = ({
  AllTickets,
}: AllticketsDataProps): JSX.Element => {
  // Step 1: Filter tickets by status and count
  const openTickets =
    getTicketsByKeyValue(AllTickets?.data, "Status", "Open")?.length || 0;

  const onHoldTickets =
    getTicketsByKeyValue(AllTickets?.data, "Status", "On Hold")?.length || 0;

  const overdueTickets =
    getTicketsByKeyValue(AllTickets?.data, "Status", "Overdue")?.length || 0;

  console.log("overdueTickets: ", overdueTickets);
  const inProgressTickets =
    getTicketsByKeyValue(AllTickets?.data, "Status", "In Progress")?.length ||
    0;
  console.log("inProgressTickets: ", inProgressTickets);

  // const closedTickets = AllTickets?.filter((ticket: any) => ticket.status === "Closed")?.length || 0;

  // Step 2: Total tickets for calculating percentages
  const totalTickets =
    openTickets + onHoldTickets + inProgressTickets + overdueTickets; // Add other statuses if necessary

  // Step 3: Calculate percentages dynamically
  const ticketByStatus = {
    labels: ["Open", "On Hold", "In Progress", "Overdue"], // Add more labels as needed
    datasets: [
      {
        data: [
          Math.round((openTickets / totalTickets) * 100) || 0,
          Math.round((onHoldTickets / totalTickets) * 100) || 0,
          Math.round((inProgressTickets / totalTickets) * 100) || 0,
          Math.round((overdueTickets / totalTickets) * 100) || 0,
        ],
        backgroundColor: ["#E0803D", "#0B4D53", "#5962B8", "#F9C74F"], // Corresponding colors for the statuses
      },
    ],
  };

  // Step 4: Options for the chart
  const ticketByStatusOptions = {
    plugins: {
      legend: {
        position: "right",
        labels: {
          font: {
            size: 13,
            family: "'osMedium', sans-serif",
          },
          color: "#484848",
          boxWidth: 10,
          padding: 20,
          usePointStyle: true,
          pointStyleWidth: 10,
          borderRadius: 5,
        },
      },
      datalabels: {
        color: "white",
        formatter: (value: number, ctx: any) => {
          // Using actual data for percentage calculation
          const total = ctx.chart.data.datasets[0].data.reduce(
            (sum: number, val: number) => sum + val,
            0
          );
          const percentage = Math.round((value / total) * 100);
          return `${percentage}%`;
        },
      },
    },
  };

  return (
    <MainChart
      chartType="Pie"
      height="90%"
      data={ticketByStatus}
      options={ticketByStatusOptions}
    />
  );
};

const TicketBySource = ({ AllTickets }: AllticketsDataProps): JSX.Element => {
  // Step 1: Filter tickets by source and count
  const emailTickets =
    AllTickets?.data?.filter((ticket: any) => ticket.TicketSource === "Email")
      ?.length || 0;

  const portalTickets =
    AllTickets?.data?.filter((ticket: any) => ticket.TicketSource === "Web")
      ?.length || 0;

  // Add more sources if necessary
  // const otherSourceTickets = AllTickets?.filter((ticket: any) => ticket.source === "Other")?.length || 0;

  // Step 2: Total tickets for calculating percentages
  const totalTicketsBySource = emailTickets + portalTickets; // Add other sources if necessary

  // Step 3: Calculate percentages dynamically
  const ticketBySource = {
    labels: ["Email", "Web"], // Add more labels if needed
    datasets: [
      {
        data: [
          (emailTickets / totalTicketsBySource) * 100 || 0,
          (portalTickets / totalTicketsBySource) * 100 || 0,
        ],
        backgroundColor: ["#E0803D", "#0B4D53"], // Colors for the sources
      },
    ],
  };

  // Step 4: Options for the chart
  const ticketBySourceOptions = {
    plugins: {
      legend: {
        position: "right",
        labels: {
          font: {
            size: 13,
            family: "'osMedium', sans-serif",
          },
          color: "#484848",
          boxWidth: 10,
          padding: 20,
          usePointStyle: true,
          pointStyleWidth: 10,
          borderRadius: 5,
        },
      },
      datalabels: {
        color: "white",
        formatter: (value: number, ctx: any) => {
          // Using actual data for percentage calculation
          const total = ctx.chart.data.datasets[0].data.reduce(
            (sum: number, val: number) => sum + val,
            0
          );
          const percentage = Math.round((value / total) * 100);
          return `${percentage}%`;
        },
      },
    },
  };

  return (
    <MainChart
      height="90%"
      chartType="Doughnut"
      data={ticketBySource}
      options={ticketBySourceOptions}
    />
  );
};

const CreatedClosedTickets = ({
  AllTickets,
  Term,
}: AllticketsDataProps): JSX.Element => {
  console.log("Term: ", Term);
  // Group tickets by the specified term
  const createdTicketsData = groupTicketsByPeriod(
    AllTickets?.data,
    Term,
    "Created"
  );
  console.log("createdTicketsData: ", createdTicketsData);

  const closedTicketsData = groupTicketsByPeriod(
    AllTickets?.data?.filter((item: any) => item?.TicketClosedOn !== null),
    Term,
    "TicketClosedOn"
  );
  console.log("closedTicketsData: ", closedTicketsData);

  const createdTicketsPerDay = Object.keys(createdTicketsData).map(
    (day) => createdTicketsData[day]?.count || 0
  );
  const closedTicketsPerDay = Object.keys(closedTicketsData).map(
    (day) => closedTicketsData[day]?.count || 0
  );

  // Chart data using the dynamic ticket data
  const createdClosedTickets = {
    labels: Object.keys(createdTicketsData),
    datasets: [
      {
        label: "Created tickets",
        data: createdTicketsPerDay,
        backgroundColor: "#E0803D",
        borderColor: "#E0803D",
        fill: false,
      },
      {
        label: "Closed tickets",
        data: closedTicketsPerDay,
        backgroundColor: "#0B4D53",
        borderColor: "#0B4D53",
        fill: false,
      },
    ],
  };

  // Chart options
  const createdClosedTicketsOptions = {
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: {
            size: 13,
            family: "'osMedium', sans-serif",
          },
          color: "#484848",
          boxWidth: 10,
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
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
        tension: 0.4,
      },
      point: {
        radius: 3,
        hoverRadius: 5,
        borderRadius: 5,
      },
    },
    scales: {
      x: { title: { display: true, text: Term } },
      y: { title: { display: true, text: "Number of Tickets" } },
    },
  };

  return (
    <MainChart
      chartType="Line"
      data={createdClosedTickets}
      options={createdClosedTicketsOptions}
    />
  );
};

const TicketsByPriority = ({
  AllTickets,
  Term,
  Status,
}: {
  AllTickets: {
    data: any[];
    role: string;
    isLoading: boolean;
  };
  Term: "This Week" | "This Month" | "Last 3 months" | "Last 6 months";
  Status: "Open" | "Closed" | "On Hold" | "Overdue" | "Un assigned";
}): JSX.Element => {
  let dataFilteredByStatus: any;
  if (Status === "Un assigned") {
    dataFilteredByStatus =
      AllTickets?.data?.filter((item: any) => item?.ITOwnerId === null)
        ?.length || 0;
  }
  dataFilteredByStatus =
    getTicketsByKeyValue(AllTickets?.data, "Status", Status)?.length || 0;

  // ITOwnerId === null
  console.log("dataFilteredByStatus: ", dataFilteredByStatus);

  const ticketsByPriority = {
    labels: [
      "Standard",
      "Low priority",
      "Medium priority",
      "High priority",
      "Critical/Impacting Multiple People",
    ],

    datasets: [
      {
        label: "Tickets",
        data: [5, 3, 7, 4, 9, 6],
        backgroundColor: [
          "#4F9DF9",
          "#0B4D53",
          "#D74FF9",
          "#BE6D6D",
          "#E0803D",
        ],
      },
    ],
  };

  const ticketsByPriorityOptions = {
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
  return (
    <MainChart
      chartType="Bar"
      data={ticketsByPriority}
      options={ticketsByPriorityOptions}
    />
  );
};

export {
  TicketByStatusChart,
  TicketBySource,
  CreatedClosedTickets,
  TicketsByPriority,
};
