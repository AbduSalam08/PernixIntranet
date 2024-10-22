/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-floating-promises*/
/* eslint-disable @typescript-eslint/no-explicit-any */

// import { Calendar } from "@fullcalendar/core";
// import interactionPlugin from "@fullcalendar/interaction";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import timeGridPlugin from "@fullcalendar/timegrid";
// import listPlugin from "@fullcalendar/list";
// import bootstrap5Plugin from "@fullcalendar/bootstrap5";
import "./Style.css";
import "../../../assets/styles/style.css";
import * as moment from "moment";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../utils/popupUtils";
import Popup from "../../../components/common/Popups/Popup";
import { resetFormData, validateField } from "../../../utils/commonUtils";

// import { graph } from "@pnp/graph/presets/all";
// const plusIcon = require("../../../assets/images/svg/plus.png");

// const timeZone: string = "India Standard Time"; //for local time zone
// const headers = { Prefer: 'outlook.timezone="' + timeZone + '"' };
import styles from "./CalendarIntranet.module.scss";
interface IEvent {
  title: string;
  description: string;
  start: string;
  end: string;
  isAllDay: boolean;
}
import { useEffect, useState } from "react";
import SectionHeaderIntranet from "../../../components/common/SectionHeaderIntranet/SectionHeaderIntranet";
import CustomInput from "../../../components/common/CustomInputFields/CustomInput";
import CustomDateInput from "../../../components/common/CustomInputFields/CustomDateInput";
import FloatingLabelTextarea from "../../../components/common/CustomInputFields/CustomTextArea";
import {
  createOutlookEvent,
  getEvents,
} from "../../../services/calenderIntranet/calenderIntranet";
import { useDispatch, useSelector } from "react-redux";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";

const errorGrey = require("../../../assets/images/svg/errorGrey.svg");

const CalendarIntranet = (): JSX.Element => {
  const dispatch = useDispatch();

  const calenderIntranetData: any = useSelector((state: any) => {
    return state.CalenderIntranetData.value;
  });

  const initialPopupController = [
    {
      open: false,
      popupTitle: "Add Event",
      popupWidth: "900px",
      popupType: "custom",
      defaultCloseBtn: false,
      popupData: "",
      isLoading: {
        inprogress: false,
        error: false,
        success: false,
      },
      messages: {
        success: "Event added successfully!",
        error: "Something went wrong!",
        successDescription: "The Event 'ABC' has been added successfully.",
        errorDescription:
          "An error occured while adding Event, please try again later.",
        inprogress: "Adding newEvent, please wait...",
      },
    },
  ];

  const [popupController, setPopupController] = useState(
    initialPopupController
  );

  const [formData, setFormData] = useState<any>({
    Title: {
      value: "",
      isValid: true,
      errorMsg: "Invalid name",
      validationRule: { required: true, type: "string" },
    },
    StartDate: {
      value: "",
      isValid: true,
      errorMsg: "Invalid input",
      validationRule: { required: true, type: "date" },
    },
    EndDate: {
      value: "",
      isValid: true,
      errorMsg: "Invalid input",
      validationRule: { required: true, type: "date" },
    },
    StartTime: {
      value: "",
      isValid: true,
      errorMsg: "StartTime is required",
      validationRule: { required: true, type: "number" },
    },
    EndTime: {
      value: null,
      isValid: true,
      errorMsg: "EndTime is required",
      validationRule: { required: true, type: "number" },
    },
    Description: {
      value: "",
      isValid: true,
      errorMsg: "This field is required",
      validationRule: { required: true, type: "string" },
    },
  });

  const handleInputChange = (
    field: string,
    value: any,
    isValid: boolean,
    errorMsg: string = ""
  ): void => {
    setFormData((prevData: any) => ({
      ...prevData,
      [field]: {
        ...prevData[field],
        value: value,
        isValid,
        errorMsg: isValid ? "" : errorMsg,
      },
    }));

    console.log(formData, "formData");
  };

  const handleSubmit = async (): Promise<any> => {
    let hasErrors = false;

    // Validate each field and update the state with error messages
    const updatedFormData = Object.keys(formData).reduce((acc, key) => {
      const fieldData = formData[key];
      const { isValid, errorMsg } = validateField(
        key,
        fieldData.value,
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
      await createOutlookEvent(formData, setPopupController, 0, dispatch);
    } else {
      console.log("Form contains errors");
    }
  };
  const popupInputs: any[] = [
    [
      <div className={styles.addNewsGrid} key={1}>
        <CustomInput
          value={formData.Title.value}
          placeholder="Enter title"
          isValid={formData.Title.isValid}
          errorMsg={formData.Title.errorMsg}
          onChange={(e) => {
            const value = e;
            const { isValid, errorMsg } = validateField(
              "Title",
              value,
              formData.Title.validationRule
            );
            handleInputChange("Title", value, isValid, errorMsg);
          }}
        />

        <CustomDateInput
          value={formData.StartDate.value}
          label="Start date"
          error={!formData.StartDate.isValid}
          errorMsg={formData.StartDate.errorMsg}
          onChange={(date: any) => {
            const { isValid, errorMsg } = validateField(
              "StartDate",
              date,
              formData.StartDate.validationRule
            );
            handleInputChange("StartDate", date, isValid, errorMsg);
          }}
        />

        <CustomDateInput
          value={formData.EndDate.value}
          label="End date"
          error={!formData.EndDate.isValid}
          errorMsg={formData.EndDate.errorMsg}
          onChange={(date: any) => {
            const { isValid, errorMsg } = validateField("EndDate", date, {
              required: true,
              type: "date",
            });
            handleInputChange("EndDate", date, isValid, errorMsg);
          }}
        />

        <CustomInput
          value={formData.StartTime.value}
          placeholder="Enter start time"
          isValid={formData.StartTime.isValid}
          errorMsg={formData.StartTime.errorMsg}
          type="number"
          onChange={(e) => {
            const value = e.toString();
            const { isValid, errorMsg } = validateField(
              "StartTime",
              value,
              formData.StartTime.validationRule
            );
            handleInputChange("StartTime", value, isValid, errorMsg);
          }}
        />

        <CustomInput
          value={formData.EndTime.value}
          placeholder="Enter end time"
          type="number"
          isValid={formData.EndTime.isValid}
          errorMsg={formData.EndTime.errorMsg}
          onChange={(e) => {
            const value = e.toString();
            const { isValid, errorMsg } = validateField(
              "EndTime",
              value,
              formData.EndTime.validationRule
            );
            handleInputChange("EndTime", value, isValid, errorMsg);
          }}
        />

        <FloatingLabelTextarea
          value={formData.Description.value}
          placeholder="Description"
          rows={5}
          isValid={formData.Description.isValid}
          errorMsg={formData.Description.errorMsg}
          onChange={(e: any) => {
            const value = e;
            const { isValid, errorMsg } = validateField(
              "Description",
              value,
              formData.Description.validationRule
            );
            handleInputChange("Description", value, isValid, errorMsg);
          }}
        />
      </div>,
    ],
  ];

  const popupActions: any[] = [
    [
      {
        text: "Cancel",
        btnType: "darkGreyVariant",
        disabled: false,
        endIcon: false,
        startIcon: false,
        size: "large",
        onClick: () => {
          togglePopupVisibility(
            setPopupController,
            initialPopupController[0],
            0,
            "close"
          );
        },
      },
      {
        text: "Submit",
        btnType: "primaryGreen",
        endIcon: false,
        startIcon: false,
        disabled: !Object.keys(formData).every((key) => formData[key].isValid),
        size: "large",
        onClick: async () => {
          await handleSubmit();
        },
      },
    ],
  ];

  // const [datas, setDatas] = useState<IEvent[]>([]);

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

  // const getEvents = (): any => {
  //   graph.groups
  //     // .getById("78038f17-b25d-453a-8442-c8bc07465725")
  //     // .getById("d00c8420-d7d0-499e-a292-f449c438073c")
  //     .getById("28cda519-7707-4fe0-b87a-51f9b8e558e0")
  //     .events.configure({ headers })
  //     .top(999)()
  //     .then((result: any) => {
  //       const arrDatas: IEvent[] = [];

  //       result.forEach((val: any) => {
  //         arrDatas.push({
  //           title: val.subject ? val.subject : "",
  //           description: val.bodyPreview ? val.bodyPreview : "",
  //           start: val.start ? val.start.dateTime : "",
  //           end: val.end ? val.end.dateTime : "",
  //           isAllDay: val.isAllDay,
  //         });
  //       });

  //       const now = moment();
  //       const todaysEvents: any[] = arrDatas.filter(
  //         (val) =>
  //           moment(val.start).format("YYYYMMDD") === now.format("YYYYMMDD")
  //       );

  //       const filterEvents = todaysEvents.sort(
  //         (a: any, b: any) =>
  //           moment(a.start).valueOf() - moment(b.start).valueOf()
  //       );
  //       console.log(filterEvents, "filterevents");

  //       // if (todaysEvents.length > 0) {
  //       // } else {
  //       const upcomingEvents = arrDatas.filter(
  //         (val) => moment(val.start) >= now
  //       );
  //       console.log(upcomingEvents, "upcomingevents");

  //       if (upcomingEvents.length > 0) {
  //         upcomingEvents.sort(
  //           (a: any, b: any) =>
  //             moment(a.start).valueOf() - moment(b.start).valueOf()
  //         );
  //         // setDatas([...todaysEvents, ...upcomingEvents]);
  //         // }
  //       }

  //       BindCalender(arrDatas);
  //     })
  //     .then(() => {
  //       // hideRowsWithSameClass();
  //     })
  //     .catch((err: any) => {
  //       console.log(err);
  //     });
  // };

  // const createOutlookEvent = async (): Promise<any> => {
  //   const startDate = moment().add(1, "days").toISOString(); // Event start time
  //   const endDate = moment().add(1, "days").add(1, "hours").toISOString(); // Event end time

  //   const event: any = {
  //     subject: "PnP SPFx Event1",
  //     body: {
  //       contentType: "HTML",
  //       content: "This is a sample event created using PnP JS in SPFx.",
  //     },
  //     start: {
  //       dateTime: startDate,
  //       timeZone: "UTC",
  //     },
  //     end: {
  //       dateTime: endDate,
  //       timeZone: "UTC",
  //     },
  //     location: {
  //       displayName: "Online Meeting",
  //     },
  //     attendees: [
  //       {
  //         emailAddress: {
  //           address: "attendee@example.com",
  //           name: "Attendee Name",
  //         },
  //         type: "required",
  //       },
  //     ],
  //   };

  //   try {
  //     await graph.groups
  //       .getById("28cda519-7707-4fe0-b87a-51f9b8e558e0")
  //       .calendar.events.add(event);
  //     alert("Event created successfully");
  //     console.log("Event created successfully");
  //     getEvents();
  //   } catch (error) {
  //     console.error("Error creating event", error);
  //   }
  // };

  useEffect(() => {
    getEvents(dispatch);
    // BindCalender(calenderIntranetData);
  }, []);
  return (
    <div className={styles.calenderContainer}>
      <div className={styles.header}>
        <SectionHeaderIntranet
          label="Calendar"
          headerAction={() => {
            togglePopupVisibility(
              setPopupController,
              initialPopupController[0],
              0,
              "open"
            );
            resetFormData(formData, setFormData);
          }}
        />
        {/* <img src={`${plusIcon}`} alt="" onClick={() => createOutlookEvent()} /> */}
      </div>
      <div className={styles.container}>
        <div className={styles.calenderSection}>
          <div id="myCalendar" className={styles.mycalender} />
        </div>
        <div className={styles.calenderSection}>
          {calenderIntranetData?.isLoading ? (
            <CircularSpinner />
          ) : calenderIntranetData?.error ? (
            <div className="errorWrapper">
              <img src={errorGrey} alt="Error" />
              <span className="disabledText">
                {calenderIntranetData?.error}
              </span>
            </div>
          ) : calenderIntranetData?.data?.length == 0 ? (
            <div>No Events Founds</div>
          ) : (
            calenderIntranetData?.data
              ?.slice(0, 4)
              .map((val: IEvent, index: number) => (
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
              ))
          )}
        </div>
      </div>

      <div className={styles.footer}>
        <p>View all</p>
      </div>

      {popupController?.map((popupData: any, index: number) => (
        <Popup
          key={index}
          isLoading={popupData?.isLoading}
          messages={popupData?.messages}
          resetPopup={() => {
            setPopupController((prev: any): any => {
              resetPopupController(prev, index, true);
            });
          }}
          PopupType={popupData.popupType}
          onHide={() => {
            togglePopupVisibility(
              setPopupController,
              initialPopupController[0],
              index,
              "close"
            );
            resetFormData(formData, setFormData);

            if (popupData?.isLoading?.success) {
              getEvents(dispatch);
            }
          }}
          popupTitle={
            popupData.popupType !== "confimation" && popupData.popupTitle
          }
          popupActions={popupActions[index]}
          visibility={popupData.open}
          content={popupInputs[index]}
          popupWidth={popupData.popupWidth}
          defaultCloseBtn={popupData.defaultCloseBtn || false}
          confirmationTitle={
            popupData.popupType !== "custom" ? popupData.popupTitle : ""
          }
          popupHeight={index === 0 ? true : false}
          noActionBtn={true}
          // popupActions={[]}
        />
      ))}
    </div>
  );
};
export default CalendarIntranet;
