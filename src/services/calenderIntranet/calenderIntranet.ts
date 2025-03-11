/* eslint-disable  @typescript-eslint/no-use-before-define */
import { graph } from "@pnp/graph/presets/all";
import { setCalenderIntranetData } from "../../redux/features/CalenderIntranetSlice";
import moment from "moment";
import { CONFIG } from "../../config/config";
import SpServices from "../SPServices/SpServices";
import { toast } from "react-toastify";
import { ICalendarListColumn, ICalendarObj } from "../../interface/interface";

interface IEvent {
  id: number;
  title: string;
  description: string;
  start: string;
  end: string;
  isAllDay: boolean;
}

const timeZone: string = "India Standard Time"; //for local time zone
const headers = { Prefer: 'outlook.timezone="' + timeZone + '"' };

const getAzureGroupId = async (): Promise<string> => {
  let azureId: string = "";

  await SpServices.SPReadItems({
    Listname: CONFIG.ListNames.Calendar_Azure_Group_ID,
  }).then((res: any) => {
    azureId = res?.[0]?.Title || "";
  });

  return azureId;
};

export const createOutlookEvent = async (
  formData: any,
  dispatch: any
): Promise<any> => {
  const toastId = toast.loading("Creating a new event...");
  console.log("formData: ", formData);

  try {
    // Combining date and time for start and end
    const { Title, StartDate, StartTime, EndTime, Description } = formData;

    // Now you can set the hours and minutes as needed for your event creation
    const newStartDate = new Date(StartDate.value); // Copy of startDate
    newStartDate.setHours(
      StartTime.value?.split(":")[0],
      StartTime.value?.split(":")[1],
      0,
      0
    ); // Set hours and minutes

    const newEndDate = new Date(StartDate.value); // Copy of endDate
    newEndDate.setHours(
      EndTime.value?.split(":")[0],
      EndTime.value?.split(":")[1],
      0,
      0
    ); // Set hours and minutes

    const event: any = {
      subject: Title.value,
      body: {
        contentType: "HTML",
        content: Description.value,
      },
      start: {
        dateTime: newStartDate.toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: newEndDate.toISOString(),
        timeZone: "UTC",
      },
      location: {
        displayName: "Online Meeting",
      },
      attendees: [
        {
          emailAddress: {
            address: "attendee@example.com", // Example attendee, can be dynamic
            name: "Attendee Name",
          },
          type: "required",
        },
      ],
    };

    const calendarGUID: string = await getAzureGroupId();

    // Add the event to the calendar
    await graph.groups.getById(calendarGUID).calendar.events.add(event);

    // Success state after the event is added
    toast.update(toastId, {
      render: "Event added successfully!",
      type: "success",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });

    // Optionally reset form data after successful submission
    return {
      status: "success",
      message: "Event created successfully!",
    };
  } catch (error) {
    console.error("Error creating event", error);

    toast.update(toastId, {
      render: "Error event. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });

    // Optionally return error response
    return {
      status: "error",
      message: "Error while creating event",
    };
  }
};

//get events
export const getEvents = async (dispatch: any, isview?: any): Promise<void> => {
  try {
    // Set loading state before fetching events
    dispatch?.(
      setCalenderIntranetData({
        isLoading: true,
      })
    );

    const calendarGUID: string = await getAzureGroupId();

    // Fetch the events data
    const result = await graph.groups
      .getById(calendarGUID)
      .events.configure({ headers })
      .top(999)();

    console.log("result: ", result);
    const arrDatas: IEvent[] = result.map((val: any) => ({
      id: val?.id || null,
      title: val.subject ? val.subject : "",
      description: val.bodyPreview ? val.bodyPreview : "",
      start: val.start ? val.start.dateTime : "",
      end: val.end ? val.end.dateTime : "",
      isAllDay: val.isAllDay,
    }));

    let filtervalue = arrDatas.sort(
      (a: any, b: any) => moment(a.start).valueOf() - moment(b.start).valueOf()
    );

    dispatch?.(
      setCalenderIntranetData({
        isLoading: false,
        data: filtervalue,
      })
    );
  } catch (err) {
    console.error("Error fetching events:", err);

    dispatch?.(
      setCalenderIntranetData({
        isLoading: false,
        data: [],
        error: err.message || "Error fetching events",
      })
    );
  }
};

export const updateOutlookEvent = async (
  eventId: string, // The ID of the event you want to edit
  formData: any
): Promise<any> => {
  const toastId = toast.loading("Updating the event...");

  try {
    const { Title, StartDate, StartTime, EndTime, Description } = formData;

    // Now you can set the hours and minutes as needed for your event creation
    const newStartDate = new Date(StartDate.value); // Copy of startDate
    newStartDate.setHours(
      StartTime.value?.split(":")[0],
      StartTime.value?.split(":")[1],
      0,
      0
    ); // Set hours and minutes

    const newEndDate = new Date(StartDate.value); // Copy of endDate
    newEndDate.setHours(
      EndTime.value?.split(":")[0],
      EndTime.value?.split(":")[1],
      0,
      0
    ); // Set hours and minutes

    const eventUpdate: any = {
      subject: Title.value,
      body: {
        contentType: "HTML",
        content: Description.value,
      },
      start: {
        dateTime: newStartDate.toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: newEndDate.toISOString(),
        timeZone: "UTC",
      },
      location: {
        displayName: "Online Meeting",
      },
    };

    const calendarGUID: string = await getAzureGroupId();

    // Update the event
    await graph.groups
      .getById(calendarGUID)
      .calendar.events.getById(eventId)
      .update(eventUpdate);

    toast.update(toastId, {
      render: "Event updated successfully!",
      type: "success",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });

    return {
      status: "success",
      message: "Event updated successfully!",
    };
  } catch (error) {
    console.error("Error updating event", error);

    toast.update(toastId, {
      render: "Error event. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });

    return {
      status: "error",
      message: "Error while updating event",
    };
  }
};

export const deleteOutlookEvent = async (
  eventId: string,
  setLoaderState: any,
  index: number
): Promise<any> => {
  const toastId = toast.loading("Deleting the event...");

  try {
    const calendarGUID: string = await getAzureGroupId();

    // Delete the event
    await graph.groups
      .getById(calendarGUID)
      .calendar.events.getById(eventId)
      .delete();

    toast.update(toastId, {
      render: "Event deleted successfully!",
      type: "success",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });

    return {
      status: "success",
      message: "Event deleted successfully!",
    };
  } catch (error) {
    console.error("Error deleting event", error);

    toast.update(toastId, {
      render: "Error event. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });

    return {
      status: "error",
      message: "Error while deleting event",
    };
  }
};

/* List items add, update, delete and fetch overall functions */
/* Create the Event function */
export const createEvent = async (formData: any): Promise<void> => {
  const toastId = toast.loading("Creating a new event...");
  console.log("formData: ", formData);

  try {
    let data: any = {};
    const column: ICalendarListColumn = CONFIG.CalendarListColumn;

    data[column.Title] = formData?.Title?.value ?? "";
    data[column.StartTime] = formData?.StartTime?.value ?? "";
    data[column.EndTime] = formData?.EndTime?.value ?? "";
    data[column.Description] = formData?.Description?.value ?? "";
    data[column.Date] = formData?.StartDate?.value ?? null;

    await SpServices.SPAddItem({
      Listname: CONFIG.ListNames.Intranet_Calendar,
      RequestJSON: {
        ...data,
      },
    });

    toast.update(toastId, {
      render: "Event added successfully!",
      type: "success",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  } catch (error) {
    console.error("Error creating event: ", error);

    toast.update(toastId, {
      render: "Error event. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  }
};

/* Update the Event function */
export const updateEvent = async (formData: any, id: number): Promise<void> => {
  const toastId = toast.loading("Updating the event...");

  try {
    let data: any = {};
    const column: ICalendarListColumn = CONFIG.CalendarListColumn;

    data[column.Title] = formData?.Title?.value ?? "";
    data[column.StartTime] = formData?.StartTime?.value ?? "";
    data[column.EndTime] = formData?.EndTime?.value ?? "";
    data[column.Description] = formData?.Description?.value ?? "";
    data[column.Date] = formData?.StartDate?.value ?? null;

    await SpServices.SPUpdateItem({
      Listname: CONFIG.ListNames.Intranet_Calendar,
      ID: id,
      RequestJSON: {
        ...data,
      },
    });

    toast.update(toastId, {
      render: "Event updated successfully!",
      type: "success",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  } catch (error) {
    console.error("Error updating event: ", error);

    toast.update(toastId, {
      render: "Error event. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  }
};

/* Delete the Event function */
export const deleteEvent = async (id: number): Promise<void> => {
  const toastId = toast.loading("Deleting the event...");

  try {
    await SpServices.SPDeleteItem({
      Listname: CONFIG.ListNames.Intranet_Calendar,
      ID: id,
    });

    toast.update(toastId, {
      render: "Event deleted successfully!",
      type: "success",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  } catch (error) {
    console.error("Error deleting event: ", error);

    toast.update(toastId, {
      render: "Error event. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  }
};

/* Fetch the Events function */
export const fetchEvents = async (dispatch: any): Promise<void> => {
  try {
    dispatch?.(
      setCalenderIntranetData({
        isLoading: true,
      })
    );

    const res: any = await SpServices.SPReadItems({
      Listname: CONFIG.ListNames.Intranet_Calendar,
      Topcount: 5000,
    });

    console.log("res: ", res);
    const arrDatas: ICalendarObj[] = await Promise.all(
      res?.map((val: any) => ({
        id: val?.ID || null,
        title: val?.Title ?? "",
        description: val?.Description ?? "",
        start: val.StartTime
          ? `${moment(val?.Date).format("YYYY-MM-DD")}T${
              val.StartTime
            }:00.0000000`
          : null,
        end: val.EndTime
          ? `${moment(val?.Date).format("YYYY-MM-DD")}T${
              val.EndTime
            }:00.0000000`
          : null,
      })) || []
    );

    const filtervalue: ICalendarObj[] = await Promise.all(
      arrDatas?.sort(
        (a: ICalendarObj, b: ICalendarObj) =>
          moment(a?.start).valueOf() - moment(b?.start).valueOf()
      ) || []
    );
    console.log("filtervalue: ", filtervalue);

    dispatch?.(
      setCalenderIntranetData({
        isLoading: false,
        data: filtervalue,
      })
    );
  } catch (err) {
    console.error("Error fetching events:", err);

    dispatch?.(
      setCalenderIntranetData({
        isLoading: false,
        data: [],
        error: err.message || "Error fetching events",
      })
    );
  }
};
