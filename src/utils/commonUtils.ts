/* eslint-disable no-case-declarations */
// import { emptyCheck } from "./validations";

/* eslint-disable @typescript-eslint/no-explicit-any */
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isoWeek from "dayjs/plugin/isoWeek";
import { setHelpDeskTickets } from "../redux/features/HelpDeskSlice";
import { getAllTickets } from "../services/HelpDeskMainServices/dashboardServices";
dayjs.extend(isBetween);
dayjs.extend(isoWeek);

export const resetFormData = (
  initialData: { [key: string]: any },
  setData: (data: { [key: string]: any }) => void
): void => {
  const resetData = Object.keys(initialData).reduce(
    (acc: { [key: string]: any }, key: string) => {
      const field = initialData[key];
      acc[key] = {
        ...field,
        value: typeof field.value === "string" ? "" : null, // Reset string fields to "" and others to null
        isValid: true, // Reset validation status
        errorMsg: field.errorMsg || "", // Keep the original error messages if needed
      };
      return acc;
    },
    {}
  );

  // Update state with the reset data
  setData(resetData);
};

export const resetOptionsData = (
  initialOptions: any[],
  setOptions: (options: any[]) => void
): void => {
  const resetOptions = initialOptions.map((option: any) => ({
    ...option,
    Title: "", // Reset the Title field to an empty string
    value: "", // Reset the value field to an empty string
    Percentage: 0, // Reset the Percentage to its initial state
    isValid: true, // Reset validation status
    errorMsg: option.errorMsg || "", // Keep the original error messages if needed
  }));

  // Update the state with the reset options
  setOptions(resetOptions);
};

export const resetSelectedItem = (
  initialData: { [key: string]: any },
  setSelectedOption: (data: { [key: string]: any }) => void
): void => {
  const resetData = Object.keys(initialData).reduce(
    (acc: { [key: string]: any }, key: string) => {
      const field = initialData[key];
      acc[key] = field !== null && typeof field === "string" ? "" : null;
      return acc;
    },
    {}
  );

  // Update state with the reset data
  setSelectedOption(resetData);
};

type ValidationRule = {
  required?: boolean;
  type?: "string" | "date" | "file" | "array" | "number" | "boolean";
  customErrorMessage?: string;
};

export const validateField = (
  field: string,
  value: any,
  rules: ValidationRule
): { isValid: boolean; errorMsg: string } => {
  const { required = false, type, customErrorMessage } = rules;

  // Check for required fields
  // if (
  //   required &&
  //   (type === "date" || type === "array" ? !value : !emptyCheck(value))
  // ) {
  //   return {
  //     isValid: false,
  //     errorMsg: customErrorMessage || `${field} is required`,
  //   };
  // }

  // Additional validations based on type
  // if (required && type === "string" && typeof value !== "string") {
  //   return { isValid: false, errorMsg: "Invalid string format" };
  // }
  if (!required) {
    return { isValid: true, errorMsg: "" };
  }

  if (required && type === "string" && !value) {
    return {
      isValid: false,
      errorMsg: customErrorMessage || `${field} is required`,
    };
  }

  if (required && type === "number" && !value) {
    return {
      isValid: false,
      errorMsg: customErrorMessage || `${field} is required`,
    };
  }

  if (required && type === "boolean" && !value) {
    return {
      isValid: false,
      errorMsg: customErrorMessage || `${field} is required`,
    };
  }

  if (required && type === "date" && !value) {
    return {
      isValid: false,
      errorMsg: customErrorMessage || `${field} is required`,
    };
  }

  if (required && type === "file" && !value) {
    return {
      isValid: false,
      errorMsg: customErrorMessage || `${field} is required`,
    };
  }

  if (required && type === "array" && !value.length) {
    return {
      isValid: false,
      errorMsg: customErrorMessage || `${field} is required`,
    };
  }

  return { isValid: true, errorMsg: "" };
};

// help desk UTILS

// Utility function to filter tickets based on time period
export const filterTicketsByTimePeriod = (
  tickets: any[],
  timePeriod: "thisWeek" | "thisMonth" | "last3Months" | "last6Months"
): any[] => {
  const today = dayjs();

  switch (timePeriod) {
    case "thisWeek":
      // Get start of the week (Sunday as the first day)
      const startOfWeek = today.startOf("week");
      return tickets?.filter((ticket: any) =>
        dayjs(ticket?.Created).isAfter(startOfWeek)
      );

    case "thisMonth":
      // Get start of the current month
      const startOfMonth = today.startOf("month");
      return tickets?.filter((ticket: any) =>
        dayjs(ticket?.Created).isAfter(startOfMonth)
      );

    case "last3Months":
      // Get the date from 3 months ago
      const threeMonthsAgo = today.subtract(3, "month").startOf("month");
      return tickets?.filter((ticket: any) =>
        dayjs(ticket?.Created).isAfter(threeMonthsAgo)
      );

    case "last6Months":
      // Get the date from 6 months ago
      const sixMonthsAgo = today.subtract(6, "month").startOf("month");
      return tickets?.filter((ticket: any) =>
        dayjs(ticket?.Created).isAfter(sixMonthsAgo)
      );

    default:
      return [];
  }
};

export const getTicketsByKeyValue = (
  ticketsData: any,
  key: string,
  value: string
): any[] => {
  return ticketsData?.filter((item: any) => item?.[key] === value);
};

// Utility function to filter and group tickets by the day of the week with both `data` and `count`
export const groupTicketsByDayOfWeek = (
  tickets: any[],
  dataType: "Created" | "TicketClosedOn"
): Record<string, { data: any[]; count: number }> => {
  const today = dayjs();
  const startOfWeek = today.startOf("week"); // Start of the current week (Sunday)

  // Initialize an object to store data and count for each day of the week
  const groupedByDay: Record<string, { data: any[]; count: number }> = {
    Sunday: { data: [], count: 0 },
    Monday: { data: [], count: 0 },
    Tuesday: { data: [], count: 0 },
    Wednesday: { data: [], count: 0 },
    Thursday: { data: [], count: 0 },
    Friday: { data: [], count: 0 },
    Saturday: { data: [], count: 0 },
  };

  tickets?.forEach((ticket) => {
    const ticketDate = dayjs(ticket?.[dataType]);
    if (ticketDate.isAfter(startOfWeek)) {
      const ticketDayName = ticketDate.format("dddd"); // Get the day name as a string (e.g., 'Monday')

      // Push the ticket to the appropriate day and increment the count
      groupedByDay[ticketDayName].data.push(ticket);
      groupedByDay[ticketDayName].count += 1;
    }
  });

  return groupedByDay;
};

export const groupTicketsByPeriod = (
  tickets: any[],
  period: "This Week" | "This Month" | "Last 3 months" | "Last 6 months",
  dataType: "Created" | "TicketClosedOn"
): Record<string, { data: any[]; count: number }> => {
  const today = dayjs();

  // Initialize an object to store data and count for each period
  const groupedByPeriod: Record<string, { data: any[]; count: number }> = {};

  // Helper to group tickets based on the last 7 days
  const groupByWeek = (start: dayjs.Dayjs, end: dayjs.Dayjs): void => {
    const weekDays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    weekDays?.forEach((day) => {
      groupedByPeriod[day] = { data: [], count: 0 };
    });

    tickets?.forEach((ticket) => {
      const ticketDate = dayjs(ticket[dataType]);
      if (ticketDate.isBetween(start, end, null, "[]")) {
        const dayName = ticketDate.format("dddd");
        if (groupedByPeriod[dayName]) {
          groupedByPeriod[dayName].data.push(ticket);
          groupedByPeriod[dayName].count += 1;
        }
      }
    });
  };

  // Helper to group tickets by weeks in the current month
  const groupThisMonthByWeeks = (start: dayjs.Dayjs): void => {
    const startOfMonth = start.startOf("month");
    const endOfMonth = start.endOf("month");
    let currentWeekStart = startOfMonth.startOf("week"); // Start of the first week
    let weekCounter = 1;

    // Loop until the end of the month
    while (currentWeekStart.isBefore(endOfMonth.endOf("week"))) {
      const weekLabel = `Week ${weekCounter}`;
      groupedByPeriod[weekLabel] = { data: [], count: 0 };

      // Check if the week end exceeds the end of the month
      const currentWeekEnd = currentWeekStart.endOf("week");
      const adjustedWeekEnd = currentWeekEnd.isAfter(endOfMonth)
        ? endOfMonth
        : currentWeekEnd;

      tickets?.forEach((ticket) => {
        const ticketDate = dayjs(ticket[dataType]);
        // Check if the ticket is within the bounds of the current week and the month
        if (
          ticketDate.isBetween(currentWeekStart, adjustedWeekEnd, null, "[]")
        ) {
          groupedByPeriod[weekLabel].data.push(ticket);
          groupedByPeriod[weekLabel].count += 1;
        }
      });

      // Move to the next week
      currentWeekStart = currentWeekStart.add(1, "week");
      weekCounter++;
    }
  };

  // Helper to group tickets based on past months
  const groupByMonth = (start: dayjs.Dayjs, months: number): void => {
    for (let i = 0; i < months; i++) {
      const monthDate = start.add(i, "month");
      const monthName = monthDate.format("MMMM YYYY");
      groupedByPeriod[monthName] = { data: [], count: 0 };

      tickets?.forEach((ticket) => {
        const ticketDate = dayjs(ticket[dataType]);
        if (ticketDate.isSame(monthDate, "month")) {
          groupedByPeriod[monthName].data.push(ticket);
          groupedByPeriod[monthName].count += 1;
        }
      });
    }
  };

  switch (period) {
    case "This Week":
      const startOfWeek = today.startOf("week"); // Start of the week
      const endOfWeek = today; // End at today
      groupByWeek(startOfWeek, endOfWeek);
      break;

    case "This Month":
      const startOfMonth = today.startOf("month");
      groupThisMonthByWeeks(startOfMonth);
      break;

    case "Last 3 months":
      const startOfLast3Months = today.subtract(2, "months").startOf("month");
      groupByMonth(startOfLast3Months, 3);
      break;

    case "Last 6 months":
      const startOfLast6Months = today.subtract(5, "months").startOf("month");
      groupByMonth(startOfLast6Months, 6);
      break;

    default:
      break;
  }

  return groupedByPeriod;
};

export const currentRoleBasedDataUtil: any = (
  currentUserDetails: any,
  HelpDeskTicktesData: any,
  currentPath?: any
) => {
  if (
    currentUserDetails?.role === "Pernix_Admin" ||
    currentUserDetails?.role === "Super Admin" ||
    currentUserDetails?.role === "HelpDesk_Ticket_Managers"
  ) {
    return {
      ...HelpDeskTicktesData,
      role: "ticket_manager",
    };
  } else if (currentUserDetails?.role === "HelpDesk_IT_Owners") {
    const isItOwner = HelpDeskTicktesData?.data?.filter(
      (item: any) =>
        item?.ITOwner?.EMail === currentUserDetails?.email ||
        item?.EmployeeName?.EMail === currentUserDetails?.email
    );
    console.log("isItOwner: ", isItOwner);
    return {
      data: !currentPath?.includes("mentions")
        ? isItOwner
        : HelpDeskTicktesData?.data,
      role: "it_owner",
    };
  } else {
    const isUser = HelpDeskTicktesData?.data?.filter(
      (item: any) => item?.EmployeeName?.EMail === currentUserDetails?.email
    );

    return {
      data: !currentPath?.includes("mentions")
        ? isUser
        : HelpDeskTicktesData?.data,
      role: "user",
    };
  }
};

export const generateTicketNumber = (number: number): string => {
  console.log("number: ", number);

  // If number is not finite, default to 0
  const validNumber = isFinite(number) ? number : 0;

  // Convert number to string and pad it to 4 digits
  return `T_${String(validNumber).padStart(4, "0")}`;
};

// filter tickets by route path
export const ticketsFilter = async (
  currentPath: string,
  helpDeskTicketsData: any,
  currentUserDetails: any,
  dispatch: any
): Promise<void> => {
  if (currentPath.split("/").pop() === "all_tickets") {
    await getAllTickets(dispatch);
  }
  if (currentPath?.includes("unassigned")) {
    const filterHandleData: any = helpDeskTicketsData?.AllData?.filter(
      (item: any) => item?.ITOwnerId === null
    );

    dispatch(
      setHelpDeskTickets({
        isLoading: false,
        data: filterHandleData,
        AllData: helpDeskTicketsData?.AllData,
        ticketType: "unassigned",
      })
    );
  }
  if (currentPath?.includes("open")) {
    console.log("pass");
    const filterHandleData: any = helpDeskTicketsData?.AllData?.filter(
      (item: any) => item?.Status === "Open"
    );

    dispatch(
      setHelpDeskTickets({
        isLoading: false,
        data: filterHandleData,
        AllData: helpDeskTicketsData?.AllData,
        ticketType: "Open",
      })
    );
  }
  if (currentPath?.includes("email")) {
    console.log("pass");
    const filterHandleData: any = helpDeskTicketsData?.AllData?.filter(
      (item: any) => item?.TicketSource?.toLowerCase() === "email"
    );

    dispatch(
      setHelpDeskTickets({
        isLoading: false,
        data: filterHandleData,
        AllData: helpDeskTicketsData?.AllData,
        ticketType: "Open",
      })
    );
  }
  if (currentPath?.includes("web")) {
    console.log("pass");
    const filterHandleData: any = helpDeskTicketsData?.AllData?.filter(
      (item: any) => item?.TicketSource?.toLowerCase() === "web"
    );

    dispatch(
      setHelpDeskTickets({
        isLoading: false,
        data: filterHandleData,
        AllData: helpDeskTicketsData?.AllData,
        ticketType: "Open",
      })
    );
  }
  if (currentPath?.includes("closed")) {
    console.log("pass");
    const filterHandleData: any = helpDeskTicketsData?.AllData?.filter(
      (item: any) => item?.Status === "Closed"
    );

    dispatch(
      setHelpDeskTickets({
        isLoading: false,
        data: filterHandleData,
        AllData: helpDeskTicketsData?.AllData,
        ticketType: "Closed",
      })
    );
  }
  if (currentPath?.includes("onhold")) {
    console.log("pass");
    const filterHandleData: any = helpDeskTicketsData?.AllData?.filter(
      (item: any) => item?.Status === "On Hold"
    );

    dispatch(
      setHelpDeskTickets({
        isLoading: false,
        data: filterHandleData,
        AllData: helpDeskTicketsData?.AllData,
        ticketType: "On Hold",
      })
    );
  }
  if (currentPath?.includes("inprogress")) {
    console.log("pass");
    const filterHandleData: any = helpDeskTicketsData?.AllData?.filter(
      (item: any) => item?.Status === "In Progress"
    );

    dispatch(
      setHelpDeskTickets({
        isLoading: false,
        data: filterHandleData,
        AllData: helpDeskTicketsData?.AllData,
        ticketType: "In Progress",
      })
    );
  }
  if (currentPath?.includes("overdue")) {
    console.log("pass");
    const filterHandleData: any = helpDeskTicketsData?.AllData?.filter(
      (item: any) => item?.Status === "Overdue"
    );

    dispatch(
      setHelpDeskTickets({
        isLoading: false,
        data: filterHandleData,
        AllData: helpDeskTicketsData?.AllData,
        ticketType: "Overdue",
      })
    );
  }
  if (currentPath?.includes("recent")) {
    const createdTicketsData = groupTicketsByPeriod(
      helpDeskTicketsData?.AllData,
      "This Week",
      "Created"
    );
    const allCreatedTicketsFlattened = Object.keys(createdTicketsData)?.flatMap(
      (key: string) => createdTicketsData[key]?.data || []
    );
    dispatch(
      setHelpDeskTickets({
        isLoading: false,
        data: allCreatedTicketsFlattened,
        AllData: helpDeskTicketsData?.AllData,
        ticketType: "Last 7 days",
      })
    );
  }
  if (currentPath?.includes("mentions")) {
    const filterHandleData: any = helpDeskTicketsData?.AllData?.filter(
      (item: any) =>
        item?.TaggedPerson?.some(
          (person: any) => person?.EMail === currentUserDetails?.email
        )
    );

    dispatch(
      setHelpDeskTickets({
        isLoading: false,
        data: filterHandleData,
        AllData: helpDeskTicketsData?.AllData,
        ticketType: "Last 7 days",
      })
    );
  }
};

export const getCurrentRoleForTicketsRoute = (
  currentUserDetails: any
): string => {
  return currentUserDetails?.role === "Pernix_Admin" ||
    currentUserDetails?.role === "Super Admin" ||
    currentUserDetails?.role === "HelpDesk_Ticket_Managers"
    ? "/helpdesk_manager"
    : currentUserDetails?.role === "HelpDesk_IT_Owners"
    ? "/it_owner"
    : `/${currentUserDetails?.role}`;
};

export const sortByCreatedDate = (data: any[]): any[] => {
  return data?.sort((a, b) => {
    const dateA = new Date(a.Created).getTime();
    const dateB = new Date(b.Created).getTime();
    return dateB - dateA; // Newest items will come first
  });
};
interface TicketData {
  ID: number;
  TicketNumber: string;
  Category: string;
  Priority: string;
  Status: string;
}
// Helper function to format ticket data
export const formatTicketData = (data: any): any => {
  return data?.map((item: TicketData | any) => ({
    Created: item?.Created,
    id: item?.ID,
    ticket_number: item?.TicketNumber,
    IT_owner: item?.ITOwner,
    category: item?.Category,
    priority: item?.Priority,
    status: item?.Status,
  }));
};

// Filters tickets based on a search term across all fields except 'id' and 'created'
export const filterTicketsBySearch = (
  tickets: any[],
  searchTerm: string
): any[] => {
  console.log("tickets: ", tickets);
  if (!searchTerm) return tickets;
  return tickets.filter((ticket) =>
    Object.keys(ticket).some((key) =>
      ["id", "Created"].includes(key)
        ? false
        : ["IT_owner"].includes(key)
        ? ticket[key]?.EMail?.toString()
            ?.toLowerCase()
            ?.includes(searchTerm?.toLowerCase())
        : ticket[key]
            ?.toString()
            .toLowerCase()
            .includes(searchTerm?.toLowerCase())
    )
  );
};

// Filters tickets based on selected category
export const filterTicketsByCategory = (
  tickets: any[],
  selectedCategory: string | any
): any[] => {
  if (!selectedCategory) return tickets;
  return tickets?.filter((ticket) => ticket.category === selectedCategory);
};

// Filters tickets based on selected priority
export const filterTicketsByPriority = (
  tickets: any[],
  selectedPriority: string | any
): any[] => {
  if (!selectedPriority) return tickets;
  return tickets?.filter((ticket) => ticket.priority === selectedPriority);
};

// Sorts tickets by priority and/or created date
export const sortTickets = (
  tickets: any[],
  sortBy: string,
  prioritySort: boolean = true
): any[] => {
  const sortedTickets = [...tickets];

  if (sortBy === "New to old") {
    sortedTickets?.sort(
      (a, b) => new Date(b.Created).getTime() - new Date(a.Created).getTime()
    );
  } else if (sortBy === "Old to new") {
    sortedTickets?.sort(
      (a, b) => new Date(a.Created).getTime() - new Date(b.Created).getTime()
    );
  }

  return sortedTickets;
};

export const getLastTicketNumber = (data: any): any => {
  return Math.max(
    0,
    ...(data ?? [])
      .map((item: any) => {
        const ticketNumber = item?.TicketNumber;
        // Extract number part after underscore and parse as an integer
        const ticketNum = ticketNumber
          ? parseInt(ticketNumber.split("_")[1], 10)
          : 0;
        return ticketNum;
      })
      .filter((num: number) => !isNaN(num))
  );
};
