import { graph } from "@pnp/graph/presets/all";
import moment from "moment";
import { setCalenderIntranetData } from "../../redux/features/CalenderIntranetSlice";
// import moment from "moment";

/* eslint-disable  @typescript-eslint/no-use-before-define */

interface IEvent {
  title: string;
  description: string;
  start: string;
  end: string;
  isAllDay: boolean;
}
import { Calendar } from "@fullcalendar/core";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import bootstrap5Plugin from "@fullcalendar/bootstrap5";
// import "./Style.css";
// import "../../../assets/styles/style.css";

const timeZone: string = "India Standard Time"; //for local time zone
const headers = { Prefer: 'outlook.timezone="' + timeZone + '"' };
const formatTime = (time: string | number): string => {
  const timeString = time.toString().padStart(2, "0"); // Ensure it's two digits
  return `${timeString}:00:00`; // Append ":00" for minutes if not provided
};

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
    const { Title, StartDate, EndDate, StartTime, EndTime, Description } =
      formData;
    const formattedStartTime = formatTime(StartTime.value); // Format startTime
    const formattedEndTime = formatTime(EndTime.value); // Format endTime

    //console.log("Date format: ", moment(StartDate.value).set("hour", 7)).toString();

    // Combining date and formatted time for start and end
    // const startDateTime = new Date(
    //   `${StartDate.value}T${formattedStartTime}`
    // ).toISOString();
    // const endDateTime = new Date(
    //   `${EndDate.value}T${formattedEndTime}`
    // ).toISOString();
    debugger;
    const event: any = {
      subject: Title.value,
      body: {
        contentType: "HTML",
        content: Description.value,
      },
      start: {
        dateTime: new Date(
          StartDate.value.setHours(parseInt(formattedStartTime.split(":")[0]))
        ),
        timeZone: "UTC",
      },
      end: {
        dateTime: new Date(
          EndDate.value.setHours(parseInt(formattedEndTime.split(":")[0]))
        ),
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
      .getById("28cda519-7707-4fe0-b87a-51f9b8e558e0")
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
export const getEvents = async (dispatch: any): Promise<void> => {
  try {
    // Set loading state before fetching events
    dispatch?.(
      setCalenderIntranetData({
        isLoading: true,
      })
    );

    // Fetch the events data
    const result = await graph.groups
      .getById("28cda519-7707-4fe0-b87a-51f9b8e558e0")
      .events.configure({ headers })
      .top(999)();

    const arrDatas: IEvent[] = result.map((val: any) => ({
      title: val.subject ? val.subject : "",
      description: val.bodyPreview ? val.bodyPreview : "",
      start: val.start ? val.start.dateTime : "",
      end: val.end ? val.end.dateTime : "",
      isAllDay: val.isAllDay,
    }));

    // Filter today's events
    const now = moment();
    const todaysEvents = arrDatas.filter(
      (val) => moment(val.start).format("YYYYMMDD") === now.format("YYYYMMDD")
    );

    // Sort today's events by start time
    const filterEvents = todaysEvents.sort(
      (a: any, b: any) => moment(a.start).valueOf() - moment(b.start).valueOf()
    );
    console.log(filterEvents, "filterEvents");

    // Filter upcoming events
    const upcomingEvents = arrDatas
      .filter((val) => moment(val.start) >= now)
      .sort(
        (a: any, b: any) =>
          moment(a.start).valueOf() - moment(b.start).valueOf()
      );
    console.log(upcomingEvents, "upcomingEvents");
    BindCalender(arrDatas);
    // Combine today's and upcoming events and update the state
    dispatch?.(
      setCalenderIntranetData({
        isLoading: false,
        data: [...filterEvents, ...upcomingEvents],
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

const BindCalender = (data: any): any => {
  const calendarEl: any = document.getElementById("myCalendar");
  const _Calendar = new Calendar(calendarEl, {
    plugins: [
      interactionPlugin,
      dayGridPlugin,
      timeGridPlugin,
      listPlugin,
      bootstrap5Plugin,
    ],
    selectable: true,
    buttonText: {
      today: "Today",
      dayGridMonth: "Month",
      dayGridWeek: "Week - ListGrid",
      timeGridWeek: "Week",
      dayGridDay: "Day - ListGrid",
      timeGridDay: "Day",
      listWeek: "List",
    },

    headerToolbar: {
      left: "prev",
      center: "title",
      right: "next",
    },
    initialDate: new Date(),

    events: data,
    height: "auto",
    displayEventTime: true,
    weekends: true,
    dayMaxEventRows: true,
    views: {
      dayGrid: {
        dayMaxEventRows: 4,
      },
    },
    showNonCurrentDates: false,
    fixedWeekCount: false,
    eventDidMount: (event) => {
      // const eventTitle = event.event._def.title.toLowerCase();
      event.el.setAttribute("data-bs-target", "event");
    },

    dateClick: function (arg) {
      const allDayNumberElements = document.querySelectorAll(
        ".fc-daygrid-day-number"
      );
      allDayNumberElements.forEach((dayNumber) => {
        (dayNumber as HTMLElement).style.color = "";
      });

      const dayNumber = arg.dayEl.querySelector(".fc-daygrid-day-number");
      if (dayNumber) {
        (dayNumber as HTMLElement).style.color = "#00a99d";
      }
      const selectedDateString = moment(arg.dateStr).format("YYYYMMDD");

      const filterEvents = data.filter(
        (event: any) =>
          moment(event.start).format("YYYYMMDD") === selectedDateString
      );

      filterEvents.length &&
        filterEvents.sort(
          (a: any, b: any) =>
            moment(a.start).valueOf() - moment(b.start).valueOf()
        );
    },
  });

  _Calendar.updateSize();
  _Calendar.render();
};
