/* eslint-disable no-case-declarations */
// import { emptyCheck } from "./validations";

/* eslint-disable @typescript-eslint/no-explicit-any */
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isoWeek from "dayjs/plugin/isoWeek";
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
  HelpDeskTicktesData: any
) => {
  if (
    currentUserDetails?.role === "Pernix_Admin" ||
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
      data: isItOwner,
      role: "it_owner",
    };
  } else {
    const isUser = HelpDeskTicktesData?.data?.filter(
      (item: any) => item?.EmployeeName?.EMail === currentUserDetails?.email
    );

    return {
      data: isUser,
      role: "user",
    };
  }
};
