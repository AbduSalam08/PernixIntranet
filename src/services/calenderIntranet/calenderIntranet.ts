/* eslint-disable  @typescript-eslint/no-use-before-define */
import { graph } from "@pnp/graph/presets/all";
import { setCalenderIntranetData } from "../../redux/features/CalenderIntranetSlice";
import moment from "moment";
import { CONFIG } from "../../config/config";
import SpServices from "../SPServices/SpServices";
import { toast } from "react-toastify";

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
      render: "New event added successfully!",
      type: "success",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });

    // Optionally reset form data after successful submission
    return {
      status: "success",
      message: "Event created successfully",
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
      render: "The event updated successfully!",
      type: "success",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });

    return {
      status: "success",
      message: "Event updated successfully",
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
      render: "The event deleted successfully!",
      type: "success",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });

    return {
      status: "success",
      message: "Event deleted successfully",
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
