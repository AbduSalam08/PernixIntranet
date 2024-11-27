/* eslint-disable no-debugger */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { Avatar } from "@mui/material";
import StatusPill from "../components/helpDesk/StatusPill/StatusPill";
import { ticketsFilter, validateField } from "./commonUtils";
import {
  addNewTicket,
  updateTicket,
} from "../services/HelpDeskMainServices/ticketServices";
import { getAllTickets } from "../services/HelpDeskMainServices/dashboardServices";
import { toast } from "react-toastify";
import dayjs from "dayjs";

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
  location: any
): Promise<any> => {
  console.log("formData: ", formData);
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
  console.log("hasErrors: ", hasErrors);

  if (!hasErrors) {
    setLoadingSubmit(true);
    setSubmitClicked(true);
    if (openNewTicketSlide.type === "add") {
      await Promise.all([addNewTicket(formData, ["Attachment"])])
        .then(async (res: any) => {
          await getAllTickets(dispatch);
          // navigate(location.pathname);
          ticketsFilter(
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
        .then(async (res: any) => {
          await getAllTickets(dispatch);
          // navigate(`${currentRole}/all_tickets`);
          // navigate(location.pathname);
          ticketsFilter(
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
  recurrenceDetails: any,
  setRecurrenceDetails: any,
  setLoadingSubmit: any
): Promise<any> => {
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

  if (!hasErrors) {
    setLoadingSubmit(true);
    console.log("submitted");
  } else {
    toast.warning("Please fill out all required fields!", {
      position: "top-center",
      autoClose: 3500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
    });
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
  if (!intervalDays) return null; // Handle invalid frequency

  let nextDate = start;

  nextDate = nextDate.add(intervalDays, "day");

  if (nextDate.isAfter(end)) {
    const message = `The recurrence exceeds the end date`;
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
