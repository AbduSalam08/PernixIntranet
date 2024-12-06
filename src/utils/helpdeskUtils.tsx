/* eslint-disable no-debugger */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { Avatar } from "@mui/material";
import StatusPill from "../components/helpDesk/StatusPill/StatusPill";
import { ticketsFilter, validateField } from "./commonUtils";
import {
  addNewTicket,
  addRecurrenceConfigForTicket,
  updateRecurrenceConfigOfTicket,
  updateTicket,
} from "../services/HelpDeskMainServices/ticketServices";
import {
  getAllTickets,
  getAllTicketsData,
} from "../services/HelpDeskMainServices/dashboardServices";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { togglePopupVisibility } from "./popupUtils";

/* eslint-disable @typescript-eslint/no-explicit-any */
type FormField = {
  value: any;
  isValid: boolean;
  errorMsg: string;
  validationRule: { required: boolean; type: string };
};

export const mapRowDataToFormData = (
  currentRowData: any,
  initialData: Record<string, FormField>,
  isTicketManager: boolean,
  currentUserDetails: any,
  isITOwner: any
): Record<string, FormField> => {
  return {
    ...initialData,
    TicketNumber: {
      ...initialData.TicketNumber,
      value: currentRowData?.TicketNumber,
    },
    EmployeeNameId: {
      ...initialData.EmployeeNameId,
      value: {
        id: currentRowData?.EmployeeName?.ID,
        name: currentRowData?.EmployeeName?.Title,
        email: currentRowData?.EmployeeName?.EMail,
      },
    },
    ITOwnerId: {
      ...initialData.ITOwnerId,
      value:
        currentRowData?.ITOwnerId !== null
          ? {
              id: currentRowData?.ITOwner?.ID,
              name: currentRowData?.ITOwner?.Title,
              email: currentRowData?.ITOwner?.EMail,
            }
          : null,
    },
    TicketManagerId: {
      ...initialData.TicketManagerId,
      value: isTicketManager
        ? currentUserDetails?.id
        : currentRowData?.TicketManagerId !== null
        ? {
            id: currentRowData?.TicketManager?.ID,
            name: currentRowData?.TicketManager?.Title,
            email: currentRowData?.TicketManager?.EMail,
          }
        : null,
    },
    Category: {
      ...initialData.Category,
      value: currentRowData?.Category,
    },
    TicketDescription: {
      ...initialData.TicketDescription,
      value: currentRowData?.TicketDescription,
    },
    Priority: {
      ...initialData.Priority,
      value: currentRowData?.Priority,
    },
    TicketSource: {
      ...initialData.TicketSource,
      value: currentRowData?.TicketSource,
    },
    Status: {
      ...initialData.Status,
      value: currentRowData?.Status
        ? currentRowData?.Status === "Open" &&
          isTicketManager &&
          currentRowData?.ITOwnerId === null
          ? "In Progress"
          : currentRowData?.Status
        : "Open",
    },
    // Add any other fields that need to be mapped.
  };
};

export const mapRowDataToRecurrenceFormData = (
  currentRowData: any,
  initialData: Record<string, FormField>
): Record<string, FormField> => {
  console.log("currentRowData: ", currentRowData);
  return {
    ...initialData,
    StartDate: {
      ...initialData.StartDate,
      value: dayjs(currentRowData?.StartDate).toDate(),
    },
    EndDate: {
      ...initialData.EndDate,
      value: dayjs(currentRowData?.EndDate).toDate(),
    },
    Frequency: {
      ...initialData.Frequency,
      value:
        currentRowData?.Frequency !== "Repeat once" && currentRowData?.isActive
          ? currentRowData?.Frequency
          : "Repeat once",
    },
    DayOfWeek: {
      ...initialData.DayOfWeek,
      value: currentRowData?.DayOfWeek,
    },
  };
};

export const renderUserCard = (
  styles: any,
  user: any,
  placeholder: any,
  imageURL: any
): JSX.Element => {
  return user ? (
    <>
      <Avatar
        style={{ width: "35px", height: "35px" }}
        alt={user?.Title || ""}
        src={`${imageURL}${user?.EMail}`}
      />
      <div className={styles.userDetails}>
        <p>{user?.Title}</p>
        <span>{user?.EMail}</span>
      </div>
    </>
  ) : (
    <StatusPill size="SM" status={placeholder} />
  );
};

export const renderAttachments = (
  styles: any,
  currentAttachment: any,
  fileIcon: any
): JSX.Element => {
  return currentAttachment?.length > 0 ? (
    currentAttachment.map((item: any, idx: number) => (
      <a
        href={`${window.location.origin}${item?.ServerRelativeUrl}?web=1`}
        download
        key={idx}
        className={styles.fileName}
        onClick={() =>
          window.open(
            `${window.location.origin}${item?.ServerRelativeUrl}?web=1`
          )
        }
      >
        <img src={fileIcon} alt="file-icon" />
        <span>{item?.FileName}</span>
      </a>
    ))
  ) : (
    <div className={styles.fileName}>
      <span>No attachment</span>
    </div>
  );
};

export const handleSubmit = async (
  formData: any,
  setLoadingSubmit: any,
  setFormData: any,
  setSubmitClicked: any,
  openNewTicketSlide: any,
  setOpenNewTicketSlide: any,
  currentRole: any,
  currentUserDetails: any,
  HelpDeskTicktesData: any,
  initialData: any,
  dispatch: any,
  navigate: any,
  location: any,
  viewPage?: boolean
): Promise<any> => {
  let hasErrors = false;
  if (
    !Object.keys(formData)
      .filter((key) => formData[key]?.validationRule?.required)
      .every((key) => formData[key].isValid)
  ) {
    setLoadingSubmit(true);
  }
  // Validate each field and update the state with error messages
  const updatedFormData = Object.keys(formData).reduce((acc, key) => {
    const fieldData = formData[key];
    const { isValid, errorMsg } = validateField(
      key,
      fieldData?.value,
      fieldData?.validationRule
    );

    if (!isValid) {
      hasErrors = true;
    }

    return {
      ...acc,
      [key]: {
        ...fieldData,
        isValid,
        errorMsg,
      },
    };
  }, {} as typeof formData);

  setFormData(updatedFormData);

  if (!hasErrors) {
    setLoadingSubmit(true);
    setSubmitClicked(true);
    if (openNewTicketSlide.type === "add") {
      await Promise.all([addNewTicket(formData, ["Attachment"])])
        .then(async (res: any) => {
          await getAllTickets(dispatch);
          navigate(
            `${currentRole}/${
              currentRole !== "user" ? "all_tickets" : "my_tickets"
            }`
          );
          await ticketsFilter(
            `${currentRole}${location.pathname}`,
            HelpDeskTicktesData,
            currentUserDetails,
            dispatch
          );
          setFormData(initialData);
          setOpenNewTicketSlide((prev: any) => ({
            ...prev,
            open: false,
            type: "add",
          }));
        })
        ?.catch((err: any) => {
          console.log("err: ", err);
        });
    } else {
      await Promise.all([
        updateTicket(openNewTicketSlide?.data?.ID, formData, ["Attachment"]),
      ])
        ?.then(async (res: any) => {
          // navigate(location.pathname);
          if (viewPage) {
            await getAllTickets(dispatch);
          }

          const updatedTickets = await getAllTicketsData();

          ticketsFilter(
            `${currentRole}${location.pathname}`,
            {
              ...HelpDeskTicktesData,
              AllData: updatedTickets,
            },
            currentUserDetails,
            dispatch
          );
          setFormData(initialData);

          setOpenNewTicketSlide((prev: any) => ({
            ...prev,
            open: false,
            type: "add",
          }));
        })
        ?.catch((err: any) => {
          console.log("err: ", err);
        });
    }
  } else {
    toast.warning("Please fill out all fields!", {
      position: "top-center",
      autoClose: 3500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
    });
    setLoadingSubmit(true);
  }
};

// validate reccurence form
export const validateRecurrenceForm = async (
  query: "add" | "update",
  ticketDetails: any,
  recurrenceDetails: any,
  setRecurrenceDetails: any,
  recurrenceConfigID: number,
  setLoadingSubmit: any,
  setSubmitClicked: any,
  initialPopupController: any,
  setPopupController: any,
  dispatch: any,
  nextTicketIntimation: any,
  popupIndex?: number,
  ticketFilter?: any,
  currentRole?: any,
  currentUserDetails?: any,
  HelpDeskTicktesData?: any
): Promise<any> => {
  console.log("nextTicketIntimation: ", nextTicketIntimation);
  let hasErrors = false;

  const updatedFormData = Object.keys(recurrenceDetails).reduce((acc, key) => {
    const fieldData = recurrenceDetails[key];
    const { isValid, errorMsg } = validateField(
      key,
      fieldData?.value,
      fieldData?.validationRule
    );

    if (!isValid) {
      hasErrors = true;
    }

    return {
      ...acc,
      [key]: {
        ...fieldData,
        isValid,
        errorMsg,
      },
    };
  }, {} as typeof recurrenceDetails);

  // Additional validation for StartDate and EndDate
  const startDate = recurrenceDetails?.StartDate?.value;
  const endDate = recurrenceDetails?.EndDate?.value;

  if (startDate && endDate) {
    const start = dayjs(startDate, "DD/MM/YYYY");
    const end = dayjs(endDate, "DD/MM/YYYY");
    if (
      dayjs(startDate)?.format("DD/MM/YYYY") ===
      dayjs(endDate)?.format("DD/MM/YYYY")
    ) {
      hasErrors = true;
      updatedFormData.StartDate = {
        ...updatedFormData.StartDate,
        isValid: false,
        errorMsg: "Start date and End date cannot be the same.",
      };
      updatedFormData.EndDate = {
        ...updatedFormData.EndDate,
        isValid: false,
        errorMsg: "Start date and End date cannot be the same.",
      };
    }
    if (start.isAfter(end)) {
      hasErrors = true;
      updatedFormData.StartDate = {
        ...updatedFormData.StartDate,
        isValid: false,
        errorMsg: "Start date should not be after end date.",
      };
      updatedFormData.EndDate = {
        ...updatedFormData.EndDate,
        isValid: false,
        errorMsg: "End date should not be before start date.",
      };
    }
  }

  setRecurrenceDetails(updatedFormData);

  if (!hasErrors && !nextTicketIntimation.error) {
    setLoadingSubmit(true);
    setSubmitClicked(true);
    if (query === "add") {
      Promise.all([
        await addRecurrenceConfigForTicket(
          {
            StartDate: recurrenceDetails?.StartDate?.value,
            EndDate: recurrenceDetails?.EndDate?.value,
            Frequency: recurrenceDetails?.Frequency?.value,
            isActive: true,
            DayOfWeek: recurrenceDetails?.DayOfWeek?.value,
            ...ticketDetails,
          },
          recurrenceDetails?.TicketDetails?.value?.ID
        ),
      ]).then(async () => {
        await getAllTickets(dispatch);
        const updatedTickets = await getAllTicketsData();
        ticketsFilter(
          `${currentRole}${location.pathname}`,
          {
            ...HelpDeskTicktesData,
            AllData: updatedTickets,
          },
          currentUserDetails,
          dispatch
        );
        ticketFilter?.();
      });
      togglePopupVisibility(
        setPopupController,
        initialPopupController[popupIndex || 0],
        popupIndex || 0,
        "close"
      );
      // await getAllTickets(dispatch);
    } else if (query === "update") {
      Promise.all([
        await updateRecurrenceConfigOfTicket(
          {
            StartDate: recurrenceDetails?.StartDate?.value,
            EndDate: recurrenceDetails?.EndDate?.value,
            Frequency: recurrenceDetails?.Frequency?.value,
            isActive: recurrenceDetails?.IsActive?.value,
            DayOfWeek: recurrenceDetails?.DayOfWeek?.value,
            ...ticketDetails,
          },
          recurrenceDetails?.TicketDetails?.value?.ID,
          recurrenceConfigID
        ),
      ])?.then(async () => {
        // await getAllTickets(dispatch);
        const updatedTickets = await getAllTicketsData();
        ticketsFilter(
          `${currentRole}${location.pathname}`,
          {
            ...HelpDeskTicktesData,
            AllData: updatedTickets,
          },
          currentUserDetails,
          dispatch
        );
        ticketFilter?.();
      });
      togglePopupVisibility(
        setPopupController,
        initialPopupController[popupIndex || 0],
        popupIndex || 0,
        "close"
      );
      // await getAllTickets(dispatch);
    }
  } else {
    toast.warning(
      hasErrors
        ? "Please fill out all required fields!"
        : "Invalid recurrence details!",
      {
        position: "top-center",
        autoClose: 3500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
      }
    );
  }
};

export const calculateNextTicketDate = (
  startDate: string,
  todayDate: string,
  endDate: string,
  frequency: string
): string | any => {
  if (!startDate || !endDate || !frequency) return null;

  const start = dayjs(startDate, "DD/MM/YYYY");
  const end = dayjs(endDate, "DD/MM/YYYY");

  // Validate that startDate is not after endDate
  if (start.isAfter(end)) {
    return "Start date cannot be after end date";
  }

  const intervals: Record<string, number> = {
    Weekly: 7,
    Quarterly: 90,
    "Semi Annual": 182,
    Annual: 365,
  };

  const intervalDays = intervals[frequency];
  if (!intervalDays) return null;

  let nextDate = start;

  nextDate = nextDate.add(intervalDays, "day");

  if (nextDate.isAfter(end)) {
    const message = `The selected date range is too short for the recurrence cycle.`;
    return {
      date: message,
      error: true,
    };
  }

  return {
    date: nextDate?.format("DD/MM/YYYY"),
    error: false,
  };
};

// Helper function to get the next 7 days starting from today

// export const getDaysFromToday = (
//   startDate: any
// ): { date: string; day: string }[] => {
//   console.log("startDate: ", startDate);
//   const days = [];

//   for (let i = 0; i <= 7; i++) {
//     const currentDate = dayjs(startDate)?.add(i, "day");
//     days.push({
//       date: currentDate.format("DD/MM/YYYY"),
//       day: currentDate.format("dddd"), // Full day name
//     });
//   }

//   return days;
// };

// // Main function to calculate the next ticket date
// export const calculateNextTicketDate = (
//   startDate: string,
//   todayDate: string,
//   endDate: string,
//   frequency: string
// ): string | any => {
//   if (!startDate || !endDate || !frequency) return null;

//   const start = dayjs(startDate, "DD/MM/YYYY");
//   const end = dayjs(endDate, "DD/MM/YYYY");
//   // const today = dayjs(todayDate, "DD/MM/YYYY");

//   // Validate that startDate is not after endDate
//   if (start.isAfter(end)) {
//     return "Start date cannot be after end date";
//   }

//   const intervals: Record<string, number> = {
//     Weekly: 7,
//     Quarterly: 90,
//     "Semi Annual": 182,
//     Annual: 365,
//   };

//   const intervalDays = intervals[frequency];
//   if (!intervalDays) return null;

//   let nextDate = start;

//   // Weekly frequency calculation
//   if (frequency?.toLowerCase() === "weekly") {
//     const next7Days: any = getDaysFromToday(startDate);
//     const nextDateBasedOnDay = next7Days.find(
//       (day: any) => day.date === todayDate
//     );

//     console.log("nextDateBasedOnDay: ", nextDateBasedOnDay);

//     if (nextDateBasedOnDay) {
//       const nextDay = dayjs(nextDateBasedOnDay.date, "DD/MM/YYYY");
//       if (!nextDay.isValid()) {
//         return {
//           date: "The selected day is not a valid date.",
//           error: true,
//         };
//       }
//       nextDate = nextDay.add(intervalDays, "day");
//     } else {
//       return {
//         date: "The selected day does not fall within the next 7 days.",
//         error: true,
//       };
//     }
//   } else {
//     nextDate = nextDate.add(intervalDays, "day");
//   }

//   // Check if nextDate is after end date
//   if (nextDate.isAfter(end)) {
//     return {
//       date: "The selected date range is too short for the recurrence cycle.",
//       error: true,
//     };
//   }

//   // Ensure the final nextDate is valid
//   if (!nextDate.isValid()) {
//     return {
//       date: "The calculated date is invalid.",
//       error: true,
//     };
//   }

//   return {
//     date: nextDate.format("DD/MM/YYYY"),
//     error: false,
//   };
// };
