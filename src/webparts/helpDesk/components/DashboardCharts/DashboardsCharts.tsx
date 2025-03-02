/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo, useMemo } from "react";
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
  isLoading: boolean;
  Term: "This Week" | "This Month" | "Last 3 months" | "Last 6 months" | any;
}

export const emptyMessageText = (): JSX.Element => {
  return <p className="noDataText">No data found!</p>;
};

const TicketByStatusChart = memo(
  ({ AllTickets, Term, isLoading }: AllticketsDataProps): JSX.Element => {
    // Group tickets by the specified term
    const createdTicketsData = groupTicketsByPeriod(
      AllTickets?.data,
      Term,
      "Created"
    );

    // Flatmap to consolidate all ticket data into a single array
    const allTicketsFlattened = Object.keys(createdTicketsData)?.flatMap(
      (key: string) => createdTicketsData[key]?.data || []
    );

    const openTickets =
      getTicketsByKeyValue(allTicketsFlattened, "Status", "Open")?.length || 0;

    const onHoldTickets =
      getTicketsByKeyValue(allTicketsFlattened, "Status", "On Hold")?.length ||
      0;

    const overdueTickets =
      getTicketsByKeyValue(allTicketsFlattened, "Status", "Overdue")?.length ||
      0;

    const inProgressTickets =
      getTicketsByKeyValue(allTicketsFlattened, "Status", "In Progress")
        ?.length || 0;

    // const closedTickets = AllTickets?.filter((ticket: any) => ticket.status === "Closed")?.length || 0;

    const totalTickets =
      openTickets + onHoldTickets + inProgressTickets + overdueTickets; // Add other statuses if necessary

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
          backgroundColor: ["#0B4D53", "#F9C74F", "#5962B8", "#E0803D"],
        },
      ],
    };

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
            return `${percentage !== 0 ? `${percentage}%` : ""}`;
          },
        },
      },
    };

    return totalTickets === 0 ? (
      emptyMessageText()
    ) : (
      <MainChart
        chartType="Pie"
        height="90%"
        isLoading={isLoading}
        data={ticketByStatus}
        options={ticketByStatusOptions}
      />
    );
  }
);

const TicketBySource = memo(
  ({ AllTickets, Term, isLoading }: AllticketsDataProps): JSX.Element => {
    // Group tickets by the specified term
    const createdTicketsData = groupTicketsByPeriod(
      AllTickets?.data,
      Term,
      "Created"
    );

    // Flatmap to consolidate all ticket data into a single array
    const allTicketsFlattened = Object.keys(createdTicketsData)?.flatMap(
      (key: string) => createdTicketsData[key]?.data || []
    );

    const emailTickets =
      allTicketsFlattened?.filter(
        (ticket: any) => ticket.TicketSource === "Email"
      )?.length || 0;

    const portalTickets =
      allTicketsFlattened?.filter(
        (ticket: any) => ticket.TicketSource === "Web portal"
      )?.length || 0;

    // Add more sources if necessary
    // const otherSourceTickets = AllTickets?.filter((ticket: any) => ticket.source === "Other")?.length || 0;

    const totalTicketsBySource = emailTickets + portalTickets; // Add other sources if necessary

    const ticketBySource = {
      labels: ["Email", "Web portal"], // Add more labels if needed
      datasets: [
        {
          data: [
            Math.round((emailTickets / totalTicketsBySource) * 100) || 0,
            Math.round((portalTickets / totalTicketsBySource) * 100) || 0,
          ],
          backgroundColor: ["#E0803D", "#0B4D53"], // Colors for the sources
        },
      ],
    };

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
            return `${percentage !== 0 ? `${percentage}%` : ""}`;
          },
        },
      },
    };

    return totalTicketsBySource === 0 ? (
      emptyMessageText()
    ) : (
      <MainChart
        isLoading={isLoading}
        height="90%"
        chartType="Doughnut"
        data={ticketBySource}
        options={ticketBySourceOptions}
      />
    );
  }
);

const CreatedClosedTickets = memo(
  ({ AllTickets, Term, isLoading }: AllticketsDataProps): JSX.Element => {
    // Group tickets by the specified term
    const createdTicketsData = groupTicketsByPeriod(
      AllTickets?.data,
      Term,
      "Created"
    );

    const closedTicketsData = groupTicketsByPeriod(
      AllTickets?.data?.filter((item: any) => item?.TicketClosedOn !== null),
      Term,
      "TicketClosedOn"
    );

    const createdTicketsPerDay = Object.keys(createdTicketsData).map(
      (day) => createdTicketsData[day]?.count || 0
    );
    const closedTicketsPerDay = Object.keys(closedTicketsData).map(
      (day) => closedTicketsData[day]?.count || 0
    );

    // Flatmap to consolidate all ticket data into a single array
    const allCreatedTicketsFlattened = Object.keys(createdTicketsData)?.flatMap(
      (key: string) => createdTicketsData[key]?.data || []
    );
    const allClosedTicketsFlattened = Object.keys(closedTicketsData)?.flatMap(
      (key: string) => closedTicketsData[key]?.data || []
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

    return allClosedTicketsFlattened?.length === 0 &&
      allCreatedTicketsFlattened?.length === 0 ? (
      emptyMessageText()
    ) : (
      <MainChart
        chartType="Line"
        isLoading={isLoading}
        data={createdClosedTickets}
        options={createdClosedTicketsOptions}
      />
    );
  }
);

const TicketsByPriority = memo(
  ({
    AllTickets,
    Term,
    Status,
    isLoading,
  }: {
    AllTickets: {
      data: any[];
      role: string;
      isLoading: boolean;
    };
    isLoading: boolean;
    Term: "This Week" | "This Month" | "Last 3 months" | "Last 6 months" | any;
    Status:
      | "Open"
      | "Closed"
      | "On Hold"
      | "Overdue"
      | "In Progress"
      | "Un assigned"
      | any;
  }): JSX.Element => {
    const TicketsDataByTerm: any = groupTicketsByPeriod(
      AllTickets?.data,
      Term,
      "Created"
    );

    const allTicketsFlattened = Object.keys(TicketsDataByTerm)?.flatMap(
      (key: string) => TicketsDataByTerm[key]?.data || []
    );

    let dataFilteredByStatus: any[] = [];
    if (Status === "Un assigned") {
      dataFilteredByStatus =
        allTicketsFlattened?.filter((item: any) => item?.ITOwnerId === null) ||
        [];
    } else {
      dataFilteredByStatus = getTicketsByKeyValue(
        allTicketsFlattened,
        "Status",
        Status
      );
    }

    const priorities = [
      "Standard",
      "Low priority",
      "Medium priority",
      "High priority",
      "Critical/Impacting Multiple People",
    ];

    const priorityCounts = priorities.map((priority) => {
      return dataFilteredByStatus?.filter(
        (ticket: any) =>
          ticket.Priority?.toLowerCase() === priority?.toLowerCase()
      ).length;
    });

    const ticketsByPriority = {
      labels: priorities,
      datasets: [
        {
          label: "Tickets",
          data: priorityCounts,
          backgroundColor: [
            "#4F9DF9",
            "#0B4D53",
            "#F9C74F",
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
          formatter: (value: number) => value,
        },
      },
      barThickness: "flex",
      scales: {
        x: {
          title: { display: true, text: "Priority" },
          grid: { display: false },
        },
        y: {
          title: { display: true, text: "Ticket Count" },
          ticks: { beginAtZero: true },
        },
      },
    };

    return priorityCounts?.length === 0 ? (
      emptyMessageText()
    ) : priorityCounts.every((item) => item === 0) ? (
      emptyMessageText()
    ) : (
      <MainChart
        isLoading={isLoading}
        chartType="Bar"
        data={ticketsByPriority}
        options={ticketsByPriorityOptions}
      />
    );
  }
);

const TicketsCreatedByUserBasis = memo(
  ({
    AllTickets,
    Term,
    isLoading,
    helpdeskManagers,
    itOwners,
  }: {
    AllTickets: {
      data: any[];
      role: string;
      isLoading: boolean;
    };
    itOwners: string[]; // Assuming it's an array of emails
    helpdeskManagers: string[]; // Assuming it's an array of emails
    isLoading: boolean;
    Term: "This Week" | "This Month" | "Last 3 months" | "Last 6 months" | any;
  }): JSX.Element => {
    // Group tickets by the specified time period
    const TicketsDataByTerm = useMemo(
      () => groupTicketsByPeriod(AllTickets?.data, Term, "Created"),
      [AllTickets?.data, Term]
    );

    // Flatten the grouped tickets data
    const allTicketsFlattened = useMemo(
      () =>
        Object.keys(TicketsDataByTerm)?.flatMap(
          (key: string) => TicketsDataByTerm[key]?.data || []
        ),
      [TicketsDataByTerm]
    );

    // Filter tickets based on roles
    const itownersTickets = useMemo(
      () =>
        allTicketsFlattened.filter((res) =>
          itOwners.includes(res?.EmployeeName?.EMail)
        ),
      [allTicketsFlattened, itOwners]
    );

    const heldeskManagersTickets = useMemo(
      () =>
        allTicketsFlattened.filter((res) =>
          helpdeskManagers.includes(res?.EmployeeName?.EMail)
        ),
      [allTicketsFlattened, helpdeskManagers]
    );

    const otherUsersTickets = useMemo(
      () =>
        allTicketsFlattened.filter(
          (res) =>
            !helpdeskManagers.includes(res?.EmployeeName?.EMail) &&
            !itOwners.includes(res?.EmployeeName?.EMail)
        ),
      [allTicketsFlattened, helpdeskManagers, itOwners]
    );

    // Aggregate the counts and filter out zero values
    const ticketsCreatedByUserBasis = useMemo(() => {
      const counts = [
        {
          label: "Helpdesk managers",
          count: heldeskManagersTickets.length,
          color: "#F9C74F",
        },
        {
          label: "IT/Business owners",
          count: itownersTickets.length,
          color: "#0B4D53",
        },
        { label: "Users", count: otherUsersTickets.length, color: "#4F9DF9" },
      ];
      return counts;
    }, [heldeskManagersTickets, itownersTickets, otherUsersTickets]);

    // Chart data configuration
    const ticketsByPriority = useMemo(
      () => ({
        labels: ticketsCreatedByUserBasis.map((item) => item.label),
        datasets: [
          {
            label: "Tickets",
            data: ticketsCreatedByUserBasis.map((item) => item.count),
            backgroundColor: ticketsCreatedByUserBasis.map(
              (item) => item.color
            ),
          },
        ],
      }),
      [ticketsCreatedByUserBasis]
    );

    // Chart options
    const ticketsByPriorityOptions = {
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
            return `${value !== 0 ? value : ""}`;
          },
        },
      },
    };

    // Render the chart using the MainChart component or display an empty message
    return ticketsCreatedByUserBasis.length === 0 ? (
      emptyMessageText()
    ) : (
      <MainChart
        isLoading={isLoading}
        chartType="Pie"
        data={ticketsByPriority}
        options={ticketsByPriorityOptions}
      />
    );
  }
);

const TicketsCreatedByStatsForITOwner = memo(
  ({
    AllTickets,
    Term,
    isLoading,
    helpdeskManagers,
    itOwners,
    currentUserEmail,
  }: {
    AllTickets: {
      data: any[];
      role: string;
      isLoading: boolean;
    };
    currentUserEmail: string;
    itOwners: string[]; // Assuming it's an array of emails
    helpdeskManagers: string[]; // Assuming it's an array of emails
    isLoading: boolean;
    Term: "This Week" | "This Month" | "Last 3 months" | "Last 6 months" | any;
  }): JSX.Element => {
    // Group tickets by the specified time period
    const TicketsDataByTerm = useMemo(
      () => groupTicketsByPeriod(AllTickets?.data, Term, "Created"),
      [AllTickets?.data, Term]
    );

    // Flatten the grouped tickets data
    const allTicketsFlattened = useMemo(
      () =>
        Object.keys(TicketsDataByTerm)?.flatMap(
          (key: string) => TicketsDataByTerm[key]?.data || []
        ),
      [TicketsDataByTerm]
    );

    // Filter tickets based on roles
    const itownersTickets = useMemo(
      () =>
        allTicketsFlattened.filter(
          (res) => currentUserEmail === res?.EmployeeName?.EMail
        ),
      [allTicketsFlattened, currentUserEmail]
    );

    const otherUsersTickets = useMemo(
      () =>
        allTicketsFlattened.filter(
          (res) =>
            !helpdeskManagers.includes(res?.EmployeeName?.EMail) &&
            !itOwners.includes(res?.EmployeeName?.EMail)
        ),
      [allTicketsFlattened, helpdeskManagers, itOwners]
    );

    // Aggregate the counts for each role
    const ticketsCreatedByUserBasis = useMemo(() => {
      const rawData = [
        { label: "IT/Business owners (Me)", value: itownersTickets.length },
        { label: "Users", value: otherUsersTickets.length },
      ];
      return rawData;
    }, [itownersTickets, otherUsersTickets]);

    // Chart data configuration
    const ticketsByPriority = useMemo(
      () => ({
        labels: ticketsCreatedByUserBasis.map((entry) => entry.label),
        datasets: [
          {
            label: "Tickets",
            data: ticketsCreatedByUserBasis.map((entry) => entry.value),
            backgroundColor: ["#F9C74F", "#0B4D53"],
          },
        ],
      }),
      [ticketsCreatedByUserBasis]
    );

    // Chart options
    const ticketsByPriorityOptions = {
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
          formatter: (value: number) => `${value !== 0 ? value : ""}`,
        },
      },
    };

    // Render the chart using the MainChart component or display empty message
    return ticketsCreatedByUserBasis?.length === 0 ? (
      emptyMessageText()
    ) : (
      <MainChart
        isLoading={isLoading}
        chartType="Pie"
        data={ticketsByPriority}
        options={ticketsByPriorityOptions}
      />
    );
  }
);

export {
  TicketByStatusChart,
  TicketBySource,
  CreatedClosedTickets,
  TicketsByPriority,
  TicketsCreatedByUserBasis,
  TicketsCreatedByStatsForITOwner,
};
