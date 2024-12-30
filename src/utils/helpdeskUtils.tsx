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
import { IPersonField, ITicketSchema } from "../interface/interface";
import SpServices from "../services/SPServices/SpServices";
import { CONFIG } from "../config/config";

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
    TicketLocation: {
      ...initialData.TicketLocation,
      value: currentRowData?.TicketLocation,
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

export const getAllTicketLocations = (): Promise<any> => {
  return SpServices.SPReadItems({
    Listname: CONFIG.ListNames.HelpDesk_TicketLocationConfig,
  })
    .then((res: any) => {
      console.log("res: ", res);
      return res; // Return the response directly
    })
    .catch((err: any) => {
      console.log("Error: ", err);
      throw err; // Ensure to propagate the error if needed
    });
};

export const handleTicketLocation = async (
  ticketLocation: string | any
): Promise<any> => {
  if (ticketLocation && ticketLocation?.trim() !== "") {
    try {
      // Read items from the SharePoint list
      const res: any = await SpServices.SPReadItems({
        Listname: CONFIG.ListNames.HelpDesk_TicketLocationConfig,
      });

      console.log("Response: ", res);

      const locationExists = res.some(
        (item: any) => item.LocationName === ticketLocation
      );

      if (!locationExists) {
        // If the location does not exist, add it
        await SpServices.SPAddItem({
          Listname: CONFIG.ListNames.HelpDesk_TicketLocationConfig,
          RequestJSON: {
            LocationName: ticketLocation,
          },
        });
      } else {
        console.log("Location already exists.");
      }
    } catch (err) {
      console.log("Error: ", err);
    }
  } else {
    console.log("Invalid location.");
  }
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
      await handleTicketLocation(formData?.TicketLocation?.value);
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
      await handleTicketLocation(formData?.TicketLocation?.value);
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
  HelpDeskTicktesData?: any,
  hasErrors?: boolean
): Promise<any> => {
  console.log("ticketDetails: ", ticketDetails);
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
            DayOfWeek:
              recurrenceDetails?.Frequency?.value === "Weekly"
                ? recurrenceDetails?.DayOfWeek?.value
                : null,
            ...ticketDetails,
            NextTicketDate:
              recurrenceDetails?.Frequency?.value !== "Weekly"
                ? dayjs(ticketDetails?.NextTicketDate).toDate()
                : null,
          },
          recurrenceDetails?.TicketDetails?.value?.ID
        ),
      ]).then(async () => {
        // await getAllTickets(dispatch);
        // const updatedTickets = await getAllTicketsData();
        // ticketsFilter(
        //   `${currentRole}${location.pathname}`,
        //   {
        //     ...HelpDeskTicktesData,
        //     AllData: updatedTickets,
        //   },
        //   currentUserDetails,
        //   dispatch
        // );
        // ticketFilter?.();
        togglePopupVisibility(
          setPopupController,
          initialPopupController[popupIndex || 0],
          popupIndex || 0,
          "close"
        );
      });
      // await getAllTickets(dispatch);
    } else if (query === "update") {
      // Promise.all([
      console.log("nextTicketIntimation?.date: ", nextTicketIntimation?.date);
      await updateRecurrenceConfigOfTicket(
        {
          StartDate: recurrenceDetails?.StartDate?.value,
          EndDate: recurrenceDetails?.EndDate?.value,
          Frequency: recurrenceDetails?.Frequency?.value,
          isActive: recurrenceDetails?.IsActive?.value,
          DayOfWeek:
            recurrenceDetails?.Frequency?.value === "Weekly"
              ? recurrenceDetails?.DayOfWeek?.value
              : null,
          ...ticketDetails,
          NextTicketDate:
            recurrenceDetails?.Frequency?.value !== "Weekly"
              ? dayjs(ticketDetails?.NextTicketDate).toDate()
              : null,
        },
        recurrenceDetails?.TicketDetails?.value?.ID,
        recurrenceConfigID
      );
      // ])?.then(async () => {
      //   // await getAllTickets(dispatch);
      //   const updatedTickets = await getAllTicketsData();
      //   ticketsFilter(
      //     `${currentRole}${location.pathname}`,
      //     {
      //       ...HelpDeskTicktesData,
      //       AllData: updatedTickets,
      //     },
      //     currentUserDetails,
      //     dispatch
      //   );
      //   ticketFilter?.();
      // });
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
    // date: nextDate?.format("DD/MM/YYYY"),
    date: nextDate,
    error: false,
  };
};

export const mapTicketDataToSchema = (ticketsData: any[]): ITicketSchema[] => {
  // Maps person data to an IPersonField object.
  const mapPersonField = (personArray: any[]): IPersonField | null => {
    if (!personArray || personArray.length === 0) return null;
    const person = personArray[0];
    return {
      ID: parseInt(person.id, 10),
      Title: person.title || null,
      EMail: person.email || null,
    };
  };

  // Extracts IDs from person array (returns an array or a single ID).
  const getPersonFieldId = (personArray: any): number | number[] | null => {
    if (!personArray || personArray.length === 0) return null;
    // If multiple persons are present, return an array of IDs
    return personArray.length > 1
      ? personArray.map((item: any) => parseInt(item.id, 10))
      : parseInt(personArray[0].id, 10);
  };

  // Maps lookup field data (returns a number).
  const mapLookupField = (lookupArray: any[]): number | null => {
    if (!lookupArray || lookupArray.length === 0) return null;
    const lookup = lookupArray[0];
    return parseInt(lookup.lookupId, 10);
  };

  // Iterate over the ticket data and map it to the desired schema.
  return ticketsData.map((data: any) => ({
    ID: parseInt(data.ID, 10),
    id: parseInt(data.ID, 10),
    Title: data.Title || null,
    TicketNumber: data.TicketNumber || null,
    EmployeeName: mapPersonField(data.EmployeeName || []),
    EmployeeNameId: getPersonFieldId(data.EmployeeName) || null,
    ITOwner: mapPersonField(data.ITOwner || []),
    ITOwnerId: getPersonFieldId(data.ITOwner) || null,
    TicketManager: mapPersonField(data.TicketManager || []),
    TicketManagerId: getPersonFieldId(data.TicketManager || []),
    Category: data.Category || null,
    Priority: data.Priority || null,
    TicketSource: data.TicketSource || null,
    Status: data.Status || null,
    RepeatedTicket: data.RepeatedTicket === "Yes",
    RepeatedTicketSourceId: mapLookupField(data.RepeatedTicketSource || []),
    Rating: data.Rating ? parseFloat(data.Rating) : null,
    TicketClosedOn: data.TicketClosedOn || null,
    TicketRepeatedOn: data.TicketRepeatedOn || null,
    TicketDescription: data.TicketDescription || null,
    RepeatedTicketSource_TicketNumber:
      data.RepeatedTicketSource_x003a__x002 || null,
    TicketClosedBy: mapPersonField(data.TicketClosedBy || []),
    TicketClosedById: getPersonFieldId(data.TicketClosedBy) || null,
    TaggedPerson: (data.TaggedPerson || [])
      .map((person: any) => mapPersonField([person]))
      .filter(Boolean) as IPersonField[],
    TaggedPersonId: getPersonFieldId(data.TaggedPerson) || null,
    MailID: data.MailID || null,
    ConId: data.ConId || null,
    RecurrenceConfigDetailsId: mapLookupField(
      data.RecurrenceConfigDetails || []
    ),
    IsRecurredTicket: data.IsRecurredTicket === "Yes",
    HasRecurrence: data.HasRecurrence === "Yes",
    Created: data?.["Created."] || null,
    TicketEscalated: data.TicketEscalated === "Yes",
    Modified: data?.["Modified."] || null,
    CreatedBy: mapPersonField(data.Author || []),
    ModifiedBy: mapPersonField(data.Editor || []),
    Attachments: data?.Attachments === "1",
    TicketLocation: data?.TicketLocation || "",
  })) as ITicketSchema[];
};
