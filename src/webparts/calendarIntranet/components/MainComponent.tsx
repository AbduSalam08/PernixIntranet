/* eslint-disable @typescript-eslint/no-var-requires */

import { Calendar } from "@fullcalendar/core";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import bootstrap5Plugin from "@fullcalendar/bootstrap5";
import "./Style.css";
import * as moment from "moment";

import { graph } from "@pnp/graph/presets/all";
const plusIcon = require("../../../assets/images/svg/plus.png");

let timeZone: string = "India Standard Time"; //for local time zone
let headers = { Prefer: 'outlook.timezone="' + timeZone + '"' };
import styles from "./CalendarIntranet.module.scss";
interface IEvent {
  title: string;
  description: string;
  start: string;
  end: string;
  isAllDay: boolean;
}
import { useEffect, useState } from "react";
const MainComponent = () => {
  const [datas, setDatas] = useState<IEvent[]>([]);

  const BindCalender = (data: any) => {
    let calendarEl: any = document.getElementById("myCalendar");
    let _Calendar = new Calendar(calendarEl, {
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
  const getEvents = () => {
    graph.groups
      // .getById("78038f17-b25d-453a-8442-c8bc07465725")
      // .getById("d00c8420-d7d0-499e-a292-f449c438073c")
      .getById("28cda519-7707-4fe0-b87a-51f9b8e558e0")
      .events.configure({ headers })
      .top(999)()
      .then((result: any) => {
        let arrDatas: IEvent[] = [];

        result.forEach((val: any) => {
          arrDatas.push({
            title: val.subject ? val.subject : "",
            description: val.bodyPreview ? val.bodyPreview : "",
            start: val.start ? val.start.dateTime : "",
            end: val.end ? val.end.dateTime : "",
            isAllDay: val.isAllDay,
          });
        });

        const now = moment();
        const todaysEvents: any[] = arrDatas.filter(
          (val) =>
            moment(val.start).format("YYYYMMDD") == now.format("YYYYMMDD")
        );

        let filterEvents = todaysEvents.sort(
          (a: any, b: any) =>
            moment(a.start).valueOf() - moment(b.start).valueOf()
        );
        console.log(filterEvents, "filterevents");

        // if (todaysEvents.length > 0) {
        // } else {
        const upcomingEvents = arrDatas.filter(
          (val) => moment(val.start) >= now
        );
        console.log(upcomingEvents, "upcomingevents");

        if (upcomingEvents.length > 0) {
          upcomingEvents.sort(
            (a: any, b: any) =>
              moment(a.start).valueOf() - moment(b.start).valueOf()
          );
          setDatas([...todaysEvents, ...upcomingEvents]);
          // }
        }

        BindCalender(arrDatas);
      })
      .then(() => {
        // hideRowsWithSameClass();
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  const createOutlookEvent = async () => {
    const startDate = moment().add(1, "days").toISOString(); // Event start time
    const endDate = moment().add(1, "days").add(1, "hours").toISOString(); // Event end time

    const event: any = {
      subject: "PnP SPFx Event1",
      body: {
        contentType: "HTML",
        content: "This is a sample event created using PnP JS in SPFx.",
      },
      start: {
        dateTime: startDate,
        timeZone: "UTC",
      },
      end: {
        dateTime: endDate,
        timeZone: "UTC",
      },
      location: {
        displayName: "Online Meeting",
      },
      attendees: [
        {
          emailAddress: {
            address: "attendee@example.com",
            name: "Attendee Name",
          },
          type: "required",
        },
      ],
    };

    try {
      await graph.groups
        .getById("28cda519-7707-4fe0-b87a-51f9b8e558e0")
        .calendar.events.add(event);
      alert("Event created successfully");
      console.log("Event created successfully");
      getEvents();
    } catch (error) {
      console.error("Error creating event", error);
    }
  };

  useEffect(() => {
    getEvents();
  }, []);
  return (
    <div className={styles.calenderContainer}>
      <div className={styles.header}>
        <img src={`${plusIcon}`} alt="" onClick={() => createOutlookEvent()} />
      </div>
      <div className={styles.container}>
        <div className={styles.calenderSection}>
          <div id="myCalendar" className={styles.mycalender}></div>
        </div>
        <div className={styles.calenderSection}>
          {datas.slice(0, 4).map((val: IEvent, index: number) => (
            <div className={styles.eventSection} key={index}>
              <div className={styles.date}>
                <p>{`${moment(val.start).format("D").padStart(2, "0")}`}</p>
                <p>{`${moment(val.start).format("MMM").toUpperCase()}`}</p>
              </div>
              <div className={styles.event}>
                <p>{val.title}</p>
                <p>{moment(val.start).format("hh:mm A")}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.footer}>
        <p>View all</p>
      </div>
    </div>
  );
};
export default MainComponent;
