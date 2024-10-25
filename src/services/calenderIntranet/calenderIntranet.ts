import { graph } from "@pnp/graph/presets/all";
// import moment from "moment";
import { setCalenderIntranetData } from "../../redux/features/CalenderIntranetSlice";
import moment from "moment";
// import moment from "moment";

/* eslint-disable  @typescript-eslint/no-use-before-define */

interface IEvent {
  id: number;
  title: string;
  description: string;
  start: string;
  end: string;
  isAllDay: boolean;
}
// import { Calendar } from "@fullcalendar/core";
// import interactionPlugin from "@fullcalendar/interaction";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import timeGridPlugin from "@fullcalendar/timegrid";
// import listPlugin from "@fullcalendar/list";
// import bootstrap5Plugin from "@fullcalendar/bootstrap5";
// import "./Style.css";
// import "../../../assets/styles/style.css";

const timeZone: string = "India Standard Time"; //for local time zone
const headers = { Prefer: 'outlook.timezone="' + timeZone + '"' };
// const formatTime = (time: string | number): string => {
//   const timeString = time.toString().padStart(2, "0");
//   return `${timeString}:00:00`;
// };

export const createOutlookEvent = async (
  formData: any,
  setLoaderState: any,
  index: number,
  dispatch: any
): Promise<any> => {
  // Start loader for the specific item at the given index
  setLoaderState((prevState: any) => {
    const updatedState = [...prevState]; // Create a copy of the array
    updatedState[index] = {
      ...updatedState[index],
      popupWidth: "450px",
      isLoading: {
        inprogress: true,
        error: false,
        success: false,
      },
    };
    return updatedState;
  });

  try {
    // Combining date and time for start and end
    const { Title, StartDate, StartTime, EndTime, Description } = formData;
    // const formattedStartTime = formatTime(StartTime.value); // Format startTime
    // const formattedEndTime = formatTime(EndTime.value); // Format endTime

    // Assuming StartTime.value and EndTime.value are Date objects
    const startDate = new Date(StartTime.value); // Convert to Date object
    const endDate = new Date(EndTime.value); // Convert to Date object

    // Extract hours and minutes from the Date objects
    const startHours = startDate.getHours(); // Get hours (0-23)
    const startMinutes = startDate.getMinutes(); // Get minutes (0-59)

    const endHours = endDate.getHours(); // Get hours (0-23)
    const endMinutes = endDate.getMinutes(); // Get minutes (0-59)

    console.log("Start Hours:", startHours, "Start Minutes:", startMinutes);
    console.log("End Hours:", endHours, "End Minutes:", endMinutes);

    // Now you can set the hours and minutes as needed for your event creation
    const newStartDate = new Date(StartDate.value); // Copy of startDate
    newStartDate.setHours(startHours, startMinutes, 0, 0); // Set hours and minutes

    const newEndDate = new Date(StartDate.value); // Copy of endDate
    newEndDate.setHours(endHours, endMinutes, 0, 0); // Set hours and minutes

    console.log(newStartDate.toISOString()); // Outputs the ISO string for the start date
    console.log(newEndDate.toISOString()); // Outputs the ISO string for the end date

    const event: any = {
      subject: Title.value,
      body: {
        contentType: "HTML",
        content: Description.value,
      },
      start: {
        // dateTime: new Date(
        //   StartDate.value.setHours(parseInt(formattedStartTime.split(":")[0]))
        // ),
        dateTime: newStartDate.toISOString(),
        timeZone: "UTC",
      },
      end: {
        // dateTime: new Date(
        //   StartDate.value.setHours(parseInt(formattedEndTime.split(":")[0]))
        // ),
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

    // Add the event to the calendar
    await graph.groups
      .getById("d22c8ed9-1acc-4e41-b539-3a509152306f")
      .calendar.events.add(event);

    // Create the updated state

    // Dispatch action with serializable payload

    // Success state after the event is added
    await setLoaderState((prevState: any) => {
      const updatedState = [...prevState]; // Copy state array
      updatedState[index] = {
        ...updatedState[index],
        popupWidth: "450px",
        isLoading: {
          inprogress: false,
          success: true,
          error: false,
        },
        messages: {
          ...updatedState[index].messages,
          successDescription: `The event '${Title.value}' has been created successfully.`,
        },
      };
      return updatedState;
    });

    // Optionally reset form data after successful submission
    return {
      status: "success",
      message: "Event created successfully",
    };
  } catch (error) {
    console.error("Error creating event", error);

    // Error state if event creation fails
    setLoaderState((prevState: any) => {
      const updatedState = [...prevState]; // Copy state array
      updatedState[index] = {
        ...updatedState[index],
        popupWidth: "450px",
        isLoading: {
          inprogress: false,
          success: false,
          error: true,
        },
        messages: {
          ...updatedState[index].messages,
          errorDescription:
            "An error occurred while creating the event, please try again later.",
        },
      };
      return updatedState;
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

    // Fetch the events data
    const result = await graph.groups
      .getById("d22c8ed9-1acc-4e41-b539-3a509152306f")
      .events.configure({ headers })
      .top(999)();
    console.log(result, "result");

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

    console.log(filtervalue, "arrdatas");
    // if (isview == "") {
    //   BindCalender(arrDatas);
    // }
    // Combine today's and upcoming events and update the state
    dispatch?.(
      setCalenderIntranetData({
        isLoading: false,
        data: filtervalue,
      })
    );

    // Optionally bind the calendar with all events
    // BindCalender(arrDatas);
  } catch (err) {
    console.error("Error fetching events:", err);

    // Handle errors in state
    dispatch?.(
      setCalenderIntranetData({
        isLoading: false,
        data: [],
        error: err.message || "Error fetching events",
      })
    );
  }
};

// const BindCalender = (data: any): any => {
//   const calendarEl: any = document.getElementById("myCalendar");
//   const _Calendar = new Calendar(calendarEl, {
//     plugins: [
//       interactionPlugin,
//       dayGridPlugin,
//       timeGridPlugin,
//       listPlugin,
//       bootstrap5Plugin,
//     ],
//     selectable: true,
//     buttonText: {
//       today: "Today",
//       dayGridMonth: "Month",
//       dayGridWeek: "Week - ListGrid",
//       timeGridWeek: "Week",
//       dayGridDay: "Day - ListGrid",
//       timeGridDay: "Day",
//       listWeek: "List",
//     },

//     headerToolbar: {
//       left: "prev",
//       center: "title",
//       right: "next",
//     },
//     initialDate: new Date(),

//     events: data,
//     height: "auto",
//     displayEventTime: true,
//     weekends: true,
//     dayMaxEventRows: true,
//     views: {
//       dayGrid: {
//         dayMaxEventRows: 4,
//       },
//     },
//     showNonCurrentDates: false,
//     fixedWeekCount: false,
//     eventDidMount: (event) => {
//       // const eventTitle = event.event._def.title.toLowerCase();
//       event.el.setAttribute("data-bs-target", "event");
//     },

//     dateClick: function (arg) {
//       const allDayNumberElements = document.querySelectorAll(
//         ".fc-daygrid-day-number"
//       );
//       allDayNumberElements.forEach((dayNumber) => {
//         (dayNumber as HTMLElement).style.color = "";
//       });

//       const dayNumber = arg.dayEl.querySelector(".fc-daygrid-day-number");
//       if (dayNumber) {
//         (dayNumber as HTMLElement).style.color = "#00a99d";
//       }
//       const selectedDateString = moment(arg.dateStr).format("YYYYMMDD");

//       const filterEvents = data.filter(
//         (event: any) =>
//           moment(event.start).format("YYYYMMDD") === selectedDateString
//       );

//       filterEvents.length &&
//         filterEvents.sort(
//           (a: any, b: any) =>
//             moment(a.start).valueOf() - moment(b.start).valueOf()
//         );
//     },
//   });

//   _Calendar.updateSize();
//   _Calendar.render();
// };

export const updateOutlookEvent = async (
  eventId: string, // The ID of the event you want to edit
  formData: any,
  setLoaderState: any,
  index: number
): Promise<any> => {
  // Start loader for the specific item at the given index
  setLoaderState((prevState: any) => {
    const updatedState = [...prevState];
    updatedState[index] = {
      ...updatedState[index],
      popupWidth: "450px",
      isLoading: {
        inprogress: true,
        error: false,
        success: false,
      },
    };
    return updatedState;
  });

  try {
    const { Title, StartDate, StartTime, EndTime, Description } = formData;
    // const formattedStartTime = formatTime(StartTime.value);
    // const formattedEndTime = formatTime(EndTime.value);

    const startDate = new Date(StartTime.value); // Convert to Date object
    const endDate = new Date(EndTime.value); // Convert to Date object

    // Extract hours and minutes from the Date objects
    const startHours = startDate.getHours(); // Get hours (0-23)
    const startMinutes = startDate.getMinutes(); // Get minutes (0-59)

    const endHours = endDate.getHours(); // Get hours (0-23)
    const endMinutes = endDate.getMinutes(); // Get minutes (0-59)

    console.log("Start Hours:", startHours, "Start Minutes:", startMinutes);
    console.log("End Hours:", endHours, "End Minutes:", endMinutes);

    // Now you can set the hours and minutes as needed for your event creation
    const newStartDate = new Date(StartDate.value); // Copy of startDate
    newStartDate.setHours(startHours, startMinutes, 0, 0); // Set hours and minutes

    const newEndDate = new Date(StartDate.value); // Copy of endDate
    newEndDate.setHours(endHours, endMinutes, 0, 0); // Set hours and minutes

    console.log(newStartDate.toISOString()); // Outputs the ISO string for the start date
    console.log(newEndDate.toISOString()); 

    const eventUpdate: any = {
      subject: Title.value,
      body: {
        contentType: "HTML",
        content: Description.value,
      },
      start: {
        dateTime: newStartDate.toISOString(),

        // dateTime: new Date(
        //   StartDate.value.setHours(parseInt(formattedStartTime.split(":")[0]))
        // ),
        timeZone: "UTC",
      },

      end: {
        dateTime: newEndDate.toISOString(),

        // dateTime: new Date(
        //   StartDate.value.setHours(parseInt(formattedEndTime.split(":")[0]))
        // ),
        timeZone: "UTC",
      },
      location: {
        displayName: "Online Meeting",
      },
    };

    // Update the event
    await graph.groups
      .getById("d22c8ed9-1acc-4e41-b539-3a509152306f")
      .calendar.events.getById(eventId)
      .update(eventUpdate);

    setLoaderState((prevState: any) => {
      const updatedState = [...prevState];
      updatedState[index] = {
        ...updatedState[index],
        popupWidth: "450px",
        isLoading: {
          inprogress: false,
          success: true,
          error: false,
        },
        messages: {
          ...updatedState[index].messages,
          successDescription: `The event '${Title.value}' has been updated successfully.`,
        },
      };
      return updatedState;
    });

    return {
      status: "success",
      message: "Event updated successfully",
    };
  } catch (error) {
    console.error("Error updating event", error);

    setLoaderState((prevState: any) => {
      const updatedState = [...prevState];
      updatedState[index] = {
        ...updatedState[index],
        popupWidth: "450px",
        isLoading: {
          inprogress: false,
          success: false,
          error: true,
        },
        messages: {
          ...updatedState[index].messages,
          errorDescription:
            "An error occurred while updating the event, please try again later.",
        },
      };
      return updatedState;
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
  // Start loader for the specific item at the given index
  setLoaderState((prevState: any) => {
    const updatedState = [...prevState];
    updatedState[index] = {
      ...updatedState[index],
      popupWidth: "450px",
      isLoading: {
        inprogress: true,
        error: false,
        success: false,
      },
    };
    return updatedState;
  });

  try {
    // Delete the event
    await graph.groups
      .getById("d22c8ed9-1acc-4e41-b539-3a509152306f")
      .calendar.events.getById(eventId)
      .delete();

    setLoaderState((prevState: any) => {
      const updatedState = [...prevState];
      updatedState[index] = {
        ...updatedState[index],
        popupWidth: "450px",
        isLoading: {
          inprogress: false,
          success: true,
          error: false,
        },
        messages: {
          ...updatedState[index].messages,
          successDescription: `The event has been deleted successfully.`,
        },
      };
      return updatedState;
    });

    return {
      status: "success",
      message: "Event deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting event", error);

    setLoaderState((prevState: any) => {
      const updatedState = [...prevState];
      updatedState[index] = {
        ...updatedState[index],
        popupWidth: "450px",
        isLoading: {
          inprogress: false,
          success: false,
          error: true,
        },
        messages: {
          ...updatedState[index].messages,
          errorDescription:
            "An error occurred while deleting the event, please try again later.",
        },
      };
      return updatedState;
    });

    return {
      status: "error",
      message: "Error while deleting event",
    };
  }
};
