/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-floating-promises*/
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Calendar } from "@fullcalendar/core";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import bootstrap5Plugin from "@fullcalendar/bootstrap5";
import "./Style.css";
import "../../../assets/styles/style.css";
import * as moment from "moment";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../utils/popupUtils";
import Popup from "../../../components/common/Popups/Popup";
import { resetFormData, validateField } from "../../../utils/commonUtils";
import styles from "./CalendarIntranet.module.scss";
import { useEffect, useState } from "react";
import SectionHeaderIntranet from "../../../components/common/SectionHeaderIntranet/SectionHeaderIntranet";
import CustomInput from "../../../components/common/CustomInputFields/CustomInput";
import CustomDateInput from "../../../components/common/CustomInputFields/CustomDateInput";
import FloatingLabelTextarea from "../../../components/common/CustomInputFields/CustomTextArea";
import {
  createEvent,
  // createOutlookEvent,
  fetchEvents,
  // getEvents,
} from "../../../services/calenderIntranet/calenderIntranet";
import { useDispatch, useSelector } from "react-redux";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
import { CONFIG } from "../../../config/config";
import { RoleAuth } from "../../../services/CommonServices";
import CustomTimePicker from "../../../components/common/CustomInputFields/CustomTimePicker";
import { ToastContainer } from "react-toastify";
import ViewAll from "../../../components/common/ViewAll/ViewAll";
import useMediaQuery from "@mui/material/useMediaQuery";

interface IEvent {
  title: string;
  description: string;
  start: string;
  end: string;
  isAllDay: boolean;
}

const errorGrey = require("../../../assets/images/svg/errorGrey.svg");

const CalendarIntranet = (props: any): JSX.Element => {
  const dispatch = useDispatch();

  const isMobile = useMediaQuery("(max-width:768px)"); // Detect screen size

  // const [isMobile, setIsMobile] = useState(false);

  const calenderIntranetData: any = useSelector((state: any) => {
    return state.CalenderIntranetData.value;
  });
  const currentUserDetails: any = useSelector(
    (state: any) => state?.MainSPContext?.currentUserDetails
  );

  const [showcalendardata, setShowcalendardata] = useState<any[]>([]);
  const initialPopupController = [
    {
      open: false,
      popupTitle: "New event",
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
    StartTime: {
      value: "",
      isValid: true,
      errorMsg: "StartTime is required",
      validationRule: { required: true, type: "string" },
    },
    EndTime: {
      value: "",
      isValid: true,
      errorMsg: "EndTime is required",
      validationRule: { required: true, type: "string" },
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
    if (field === "StartDate") {
      setFormData((prevData: any) => ({
        ...prevData,
        [field]: {
          ...prevData[field],
          value: value,
          isValid,
          errorMsg: isValid ? "" : errorMsg,
        },
        ["StartTime"]: {
          ...prevData["StartTime"],
          value: null,
          isValid: true,
          errorMsg: "",
        },
        ["EndTime"]: {
          ...prevData["EndTime"],
          value: null,
          isValid: true,
          errorMsg: "",
        },
      }));
    } else if (field === "StartTime") {
      setFormData((prevData: any) => ({
        ...prevData,
        [field]: {
          ...prevData[field],
          value: value,
          isValid,
          errorMsg: isValid ? "" : errorMsg,
        },
        ["EndTime"]: {
          ...prevData["EndTime"],
          value: null,
          isValid: true,
          errorMsg: "",
        },
      }));
    } else {
      setFormData((prevData: any) => ({
        ...prevData,
        [field]: {
          ...prevData[field],
          value: value,
          isValid,
          errorMsg: isValid ? "" : errorMsg,
        },
      }));
    }
  };

  const handleSubmit = async (): Promise<any> => {
    let hasErrors = false;

    // Validate each field and update the state with error messages
    const updatedFormData = Object.keys(formData).reduce((acc, key) => {
      const fieldData = formData[key];
      let { isValid, errorMsg } = validateField(
        key,
        fieldData.value,
        fieldData?.validationRule
      );

      if (!isValid) {
        hasErrors = true;
      } else if (key === "EndTime") {
        isValid =
          Number(
            formData?.StartTime?.value?.split(":")[0] +
              formData?.StartTime?.value?.split(":")[1]
          ) <
          Number(
            fieldData?.value?.split(":")[0] + fieldData?.value?.split(":")[1]
          );
        hasErrors = !isValid;
        errorMsg = !isValid ? "Please select a valid time." : "";
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
      resetFormData(formData, setFormData);
      togglePopupVisibility(
        setPopupController,
        initialPopupController[0],
        0,
        "close"
      );
      await createEvent(formData);
      // await createOutlookEvent(formData, dispatch);
      await fetchEvents(dispatch);
    } else {
      console.log("Form contains errors");
    }
  };

  const popupInputs: any[] = [
    [
      <div key={1}>
        <CustomInput
          value={formData.Title.value}
          placeholder="Enter title"
          secWidth="100%"
          isValid={formData.Title.isValid}
          errorMsg={formData.Title.errorMsg}
          onChange={(e) => {
            const value = e.trimStart();
            const { isValid, errorMsg } = validateField(
              "Title",
              value,
              formData.Title.validationRule
            );
            handleInputChange("Title", value, isValid, errorMsg);
          }}
        />
        <div
          // style={{
          //   display: "flex",
          //   gap: "20px",
          //   alignItems: "center",
          //   margin: "20px 0px",
          // }}
          className={styles.addNewsGrid}
        >
          <CustomDateInput
            value={formData.StartDate.value}
            label="Date"
            isDateController={true}
            minimumDate={new Date()}
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

          <CustomTimePicker
            disabled={!formData.StartDate.value}
            placeholder="Select start time"
            value={formData.StartTime.value}
            isValid={formData.StartTime.isValid}
            errorMsg={formData.StartTime.errorMsg}
            onChange={(date: any) => {
              const { isValid, errorMsg } = validateField(
                "StartTime",
                date,
                formData.StartTime.validationRule
              );
              handleInputChange("StartTime", date, isValid, errorMsg);
            }}
          />

          <CustomTimePicker
            disabled={!formData.StartTime.value}
            placeholder="Select end time"
            value={formData.EndTime.value}
            isValid={formData.EndTime.isValid}
            errorMsg={formData.EndTime.errorMsg}
            onChange={(date: any) => {
              const { isValid, errorMsg } = validateField(
                "EndTime",
                date,
                formData.EndTime.validationRule
              );
              handleInputChange("EndTime", date, isValid, errorMsg);
            }}
          />
        </div>

        <FloatingLabelTextarea
          value={formData.Description.value}
          placeholder="Description"
          rows={5}
          isValid={formData.Description.isValid}
          errorMsg={formData.Description.errorMsg}
          onChange={(e: any) => {
            const value = e.trimStart();
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

  const BindCalender = (data: any): any => {
    const today = Number(moment().format("YYYYMMDDHHmm"));
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

        setShowcalendardata([...filterEvents]);
      },
    });

    _Calendar.updateSize();
    _Calendar.render();

    let temp: any = data?.filter((newsItem: any) => {
      const startDate = Number(moment(newsItem.end).format("YYYYMMDDHHmm"));
      return today <= startDate;
    });
    setShowcalendardata(temp);
  };

  // const handleResponsiveChange = (): void => {
  //   setIsMobile(window.innerWidth <= 768);
  // };
  useEffect(() => {
    RoleAuth(
      CONFIG.SPGroupName.Pernix_Admin,
      { highPriorityGroups: [CONFIG.SPGroupName.Calendar_Admin] },

      dispatch
    );
    fetchEvents(dispatch);
    // getEvents(dispatch, "");

    // handleResponsiveChange();

    // // Add event listener for resize
    // window.addEventListener("resize", handleResponsiveChange);

    // // Cleanup function to remove the event listener
    // return () => {
    //   window.removeEventListener("resize", handleResponsiveChange);
    // };

    // BindCalender(calenderIntranetData);
    BindCalender(calenderIntranetData?.data);
  }, []);

  useEffect(() => {
    BindCalender(calenderIntranetData?.data);

    // handleResponsiveChange();

    // // Add event listener for resize
    // window.addEventListener("resize", handleResponsiveChange);

    // // Cleanup function to remove the event listener
    // return () => {
    //   window.removeEventListener("resize", handleResponsiveChange);
    // };
  }, [calenderIntranetData]);

  return (
    <>
      <div className={styles.calenderContainer}>
        <div className={styles.header}>
          <SectionHeaderIntranet
            label="Calendar"
            title="Create a event"
            removeAdd={
              currentUserDetails.role === CONFIG.RoleDetails.user ? true : false
            }
            headerAction={() => {
              resetFormData(formData, setFormData);
              setFormData({
                Title: {
                  value: "",
                  isValid: true,
                  errorMsg: "Invalid name",
                  validationRule: { required: true, type: "string" },
                },
                StartDate: {
                  value: new Date(),
                  isValid: true,
                  errorMsg: "Invalid input",
                  validationRule: { required: true, type: "date" },
                },
                StartTime: {
                  value: "",
                  isValid: true,
                  errorMsg: "StartTime is required",
                  validationRule: { required: true, type: "string" },
                },
                EndTime: {
                  value: "",
                  isValid: true,
                  errorMsg: "EndTime is required",
                  validationRule: { required: true, type: "string" },
                },
                Description: {
                  value: "",
                  isValid: true,
                  errorMsg: "This field is required",
                  validationRule: { required: true, type: "string" },
                },
              });
              togglePopupVisibility(
                setPopupController,
                initialPopupController[0],
                0,
                "open"
              );
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
            ) : showcalendardata?.length === 0 ? (
              // <div
              //   style={{
              //     width: "100%",
              //     height: isMobile ? "100px" : "310px",
              //     display: "flex",
              //     justifyContent: "center",
              //     alignItems: "center",
              //     fontSize: isMobile ? "12px" : "14px",
              //     color: "#adadad",
              //     fontFamily: "osMedium, sans-serif",
              //   }}
              // >
              //   No events found!
              // </div>

              <div className="errorWrapper" style={{ height: "50vh" }}>
                <img src={errorGrey} alt="Error" />
                <span className="disabledText">{" No events found!"}</span>
              </div>
            ) : (
              showcalendardata
                ?.slice(0, isMobile ? 2 : 3)
                .map((val: IEvent, index: number) => (
                  <div className={styles.eventSection} key={index}>
                    <div className={styles.date}>
                      <p>{`${moment(val.start)
                        .format("D")
                        .padStart(2, "0")}`}</p>
                      <p>{`${moment(val.start)
                        .format("MMM")
                        .toUpperCase()}`}</p>
                    </div>
                    <div className={styles.event}>
                      <p className={styles.Title} title={val.title}>
                        {val.title}
                      </p>
                      <span className={styles.time}>{`${moment(
                        val.start
                      ).format("hh:mm A")} - ${moment(val.end).format(
                        "hh:mm A"
                      )}`}</span>
                      <span
                        className={styles.description}
                        title={val?.description}
                      >
                        {val?.description}
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        <ViewAll
          onClick={() => {
            window.open(
              props.context.pageContext.web.absoluteUrl +
                CONFIG.NavigatePage.CalendarPage,
              "_self"
            );
          }}
        />

        {/* 
      <div
        className={styles.footer}
        onClick={(_: any) => {
          window.open(
            props.context.pageContext.web.absoluteUrl +
              CONFIG.NavigatePage.CalendarPage,
            "_self"
          );
        }}
      >
        {isMobile ? (
          <i style={{ color: "#0b4d53" }} className="pi pi-ellipsis-h"></i>
        ) : (
          <p>View all</p>
        )}
      </div> */}

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
                fetchEvents(dispatch);
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

      {/* Toast message section */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default CalendarIntranet;
