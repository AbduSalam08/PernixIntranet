/* eslint-disable no-debugger */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { useEffect, useState } from "react";
import "../../../assets/styles/Style.css";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
import styles from "./CalendarPage.module.scss";
import { CONFIG } from "../../../config/config";
import CustomDateInput from "../../../components/common/CustomInputFields/CustomDateInput";
import CustomInput from "../../../components/common/CustomInputFields/CustomInput";
import { useDispatch, useSelector } from "react-redux";
import {
  createOutlookEvent,
  deleteOutlookEvent,
  getEvents,
  updateOutlookEvent,
} from "../../../services/calenderIntranet/calenderIntranet";
import moment from "moment";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../utils/popupUtils";
import { resetFormData, validateField } from "../../../utils/commonUtils";
import FloatingLabelTextarea from "../../../components/common/CustomInputFields/CustomTextArea";
import Popup from "../../../components/common/Popups/Popup";
import dayjs from "dayjs";
import { RoleAuth } from "../../../services/CommonServices";
interface IEvent {
  title: string;
  description: string;
  start: string;
  end: string;
  isAllDay: boolean;
}

interface SearchField {
  selectedDate: Date | any;
  allSearch: string;
}
let objFilter: SearchField = {
  selectedDate: null,
  allSearch: "",
};
const errorGrey = require("../../../assets/images/svg/errorGrey.svg");
let isAdmin: boolean = false;

const CalendarPage = (props: any): JSX.Element => {
  // const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<string>("");
  const [selectvalue, setSelectvalue] = useState<any>({
    isEdit: false,
    id: null,
  });
  const [calendardata, setCalendardata] = useState<IEvent[]>([]);
  const [showcalendardata, setShowcalendardata] = useState<IEvent[]>([]);
  const [searchField, setSearchField] = useState<SearchField>({
    selectedDate: null,
    allSearch: "",
  });
  const dispatch = useDispatch();

  const calenderIntranetData: any = useSelector((state: any) => {
    return state.CalenderIntranetData.value;
  });

  const currentUserDetails: any = useSelector(
    (state: any) => state?.MainSPContext?.currentUserDetails
  );

  isAdmin = currentUserDetails.role === CONFIG.RoleDetails.user ? false : true;

  const initialPopupController = [
    {
      open: false,
      popupTitle: "Add an event",
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

    {
      open: false,
      popupTitle: "Update",
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
        success: "Event Update successfully!",
        error: "Something went wrong!",
        successDescription: "The Event 'ABC' has been Update successfully.",
        errorDescription:
          "An error occured while Updating Event, please try again later.",
        inprogress: "Updating newEvent, please wait...",
      },
    },

    {
      open: false,
      popupTitle: "Confirmation",
      popupWidth: "450px",
      popupType: "confirmation",
      confirmationTitle: "Are you sure want to delete this Event?",
      defaultCloseBtn: false,
      popupData: "",
      isLoading: {
        inprogress: false,
        error: false,
        success: false,
      },
      messages: {
        success: "Event Delete successfully!",
        error: "Something went wrong!",
        successDescription: "The Event 'ABC' has been Deleted successfully.",
        errorDescription:
          "An error occured while Deleting Event, please try again later.",
        inprogress: "Deleting Event, please wait...",
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
    // EndDate: {
    //   value: "",
    //   isValid: true,
    //   errorMsg: "Invalid input",
    //   validationRule: { required: true, type: "date" },
    // },
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
      (await selectvalue.isEdit)
        ? updateOutlookEvent(selectvalue.id, formData, setPopupController, 1)
        : createOutlookEvent(formData, setPopupController, 0, dispatch);
    } else {
      console.log("Form contains errors");
    }
  };
  const popupInputs: any[] = [
    // [
    //   <div key={1}>
    //     <CustomInput
    //       value={formData.Title.value}
    //       placeholder="Enter title"
    //       secWidth="100%"
    //       isValid={formData.Title.isValid}
    //       errorMsg={formData.Title.errorMsg}
    //       onChange={(e) => {
    //         const value = e;
    //         const { isValid, errorMsg } = validateField(
    //           "Title",
    //           value,
    //           formData.Title.validationRule
    //         );
    //         handleInputChange("Title", value, isValid, errorMsg);
    //       }}
    //     />
    //     <div
    //       style={{
    //         display: "flex",
    //         gap: "20px",
    //         alignItems: "center",
    //         margin: "20px 0px",
    //       }}
    //     >
    //       <CustomDateInput
    //         value={formData.StartDate.value}
    //         label="Start date"
    //         error={!formData.StartDate.isValid}
    //         errorMsg={formData.StartDate.errorMsg}
    //         onChange={(date: any) => {
    //           const { isValid, errorMsg } = validateField(
    //             "StartDate",
    //             date,
    //             formData.StartDate.validationRule
    //           );
    //           handleInputChange("StartDate", date, isValid, errorMsg);
    //         }}
    //       />

    //       {/* <CustomDateInput
    //       value={formData.EndDate.value}
    //       label="End date"
    //       error={!formData.EndDate.isValid}
    //       errorMsg={formData.EndDate.errorMsg}
    //       onChange={(date: any) => {
    //         const { isValid, errorMsg } = validateField("EndDate", date, {
    //           required: true,
    //           type: "date",
    //         });
    //         handleInputChange("EndDate", date, isValid, errorMsg);
    //       }}
    //     /> */}

    //       <CustomInput
    //         value={formData.StartTime.value}
    //         placeholder="Enter start time"
    //         isValid={formData.StartTime.isValid}
    //         errorMsg={formData.StartTime.errorMsg}
    //         type="number"
    //         onChange={(e) => {
    //           const value = e.toString();
    //           const { isValid, errorMsg } = validateField(
    //             "StartTime",
    //             value,
    //             formData.StartTime.validationRule
    //           );
    //           handleInputChange("StartTime", value, isValid, errorMsg);
    //         }}
    //       />

    //       <CustomInput
    //         value={formData.EndTime.value}
    //         placeholder="Enter end time"
    //         type="number"
    //         isValid={formData.EndTime.isValid}
    //         errorMsg={formData.EndTime.errorMsg}
    //         onChange={(e) => {
    //           const value = e.toString();
    //           const { isValid, errorMsg } = validateField(
    //             "EndTime",
    //             value,
    //             formData.EndTime.validationRule
    //           );
    //           handleInputChange("EndTime", value, isValid, errorMsg);
    //         }}
    //       />
    //     </div>

    //     <FloatingLabelTextarea
    //       value={formData.Description.value}
    //       placeholder="Description"
    //       rows={5}
    //       isValid={formData.Description.isValid}
    //       errorMsg={formData.Description.errorMsg}
    //       onChange={(e: any) => {
    //         const value = e;
    //         const { isValid, errorMsg } = validateField(
    //           "Description",
    //           value,
    //           formData.Description.validationRule
    //         );
    //         handleInputChange("Description", value, isValid, errorMsg);
    //       }}
    //     />
    //   </div>,
    // ],

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
          style={{
            display: "flex",
            gap: "20px",
            alignItems: "center",
            margin: "20px 0px",
          }}
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

          <CustomDateInput
            value={formData.StartTime.value}
            disabledInput={!formData.StartDate.value}
            timeOnly
            isDateController={true}
            minimumDate={new Date()}
            showIcon={false}
            label="Start Time"
            error={!formData.StartTime.isValid}
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

          <CustomDateInput
            value={formData.EndTime.value}
            disabledInput={
              formData.StartDate.value
                ? formData.StartTime.value
                  ? false
                  : true
                : true
            }
            timeOnly
            isDateController={true}
            minimumDate={new Date()}
            showIcon={false}
            label="End Time"
            error={!formData.EndTime.isValid}
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
    // [
    //   <div key={2}>
    //     <CustomInput
    //       value={formData.Title.value}
    //       placeholder="Enter title"
    //       secWidth="100%"
    //       isValid={formData.Title.isValid}
    //       errorMsg={formData.Title.errorMsg}
    //       onChange={(e) => {
    //         const value = e;
    //         const { isValid, errorMsg } = validateField(
    //           "Title",
    //           value,
    //           formData.Title.validationRule
    //         );
    //         handleInputChange("Title", value, isValid, errorMsg);
    //       }}
    //     />
    //     <div
    //       style={{
    //         display: "flex",
    //         gap: "20px",
    //         alignItems: "center",
    //         margin: "20px 0px",
    //       }}
    //     >
    //       <CustomDateInput
    //         value={formData.StartDate.value}
    //         label="Start date"
    //         error={!formData.StartDate.isValid}
    //         errorMsg={formData.StartDate.errorMsg}
    //         onChange={(date: any) => {
    //           const { isValid, errorMsg } = validateField(
    //             "StartDate",
    //             date,
    //             formData.StartDate.validationRule
    //           );
    //           handleInputChange("StartDate", date, isValid, errorMsg);
    //         }}
    //       />

    //       {/* <CustomDateInput
    //       value={formData.EndDate.value}
    //       label="End date"
    //       error={!formData.EndDate.isValid}
    //       errorMsg={formData.EndDate.errorMsg}
    //       onChange={(date: any) => {
    //         const { isValid, errorMsg } = validateField("EndDate", date, {
    //           required: true,
    //           type: "date",
    //         });
    //         handleInputChange("EndDate", date, isValid, errorMsg);
    //       }}
    //     /> */}

    //       <CustomInput
    //         value={formData.StartTime.value}
    //         placeholder="Enter start time"
    //         isValid={formData.StartTime.isValid}
    //         errorMsg={formData.StartTime.errorMsg}
    //         type="number"
    //         onChange={(e) => {
    //           const value = e.toString();
    //           const { isValid, errorMsg } = validateField(
    //             "StartTime",
    //             value,
    //             formData.StartTime.validationRule
    //           );
    //           handleInputChange("StartTime", value, isValid, errorMsg);
    //         }}
    //       />

    //       <CustomInput
    //         value={formData.EndTime.value}
    //         placeholder="Enter end time"
    //         type="number"
    //         isValid={formData.EndTime.isValid}
    //         errorMsg={formData.EndTime.errorMsg}
    //         onChange={(e) => {
    //           const value = e.toString();
    //           const { isValid, errorMsg } = validateField(
    //             "EndTime",
    //             value,
    //             formData.EndTime.validationRule
    //           );
    //           handleInputChange("EndTime", value, isValid, errorMsg);
    //         }}
    //       />
    //     </div>

    //     <FloatingLabelTextarea
    //       value={formData.Description.value}
    //       placeholder="Description"
    //       rows={5}
    //       isValid={formData.Description.isValid}
    //       errorMsg={formData.Description.errorMsg}
    //       onChange={(e: any) => {
    //         const value = e;
    //         const { isValid, errorMsg } = validateField(
    //           "Description",
    //           value,
    //           formData.Description.validationRule
    //         );
    //         handleInputChange("Description", value, isValid, errorMsg);
    //       }}
    //     />
    //   </div>,
    // ],

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
          style={{
            display: "flex",
            gap: "20px",
            alignItems: "center",
            margin: "20px 0px",
          }}
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

          <CustomDateInput
            value={formData.StartTime.value}
            disabledInput={!formData.StartDate.value}
            timeOnly
            isDateController={true}
            minimumDate={new Date()}
            showIcon={false}
            label="Start Time"
            error={!formData.StartTime.isValid}
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

          <CustomDateInput
            value={formData.EndTime.value}
            disabledInput={
              formData.StartDate.value
                ? formData.StartTime.value
                  ? false
                  : true
                : true
            }
            timeOnly
            isDateController={true}
            minimumDate={new Date()}
            showIcon={false}
            label="End Time"
            error={!formData.EndTime.isValid}
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
    [
      <div
        key={3}
        style={{
          width: "100%",
          textAlign: "center",
        }}
      >
        <p>Are you sure want to delete this Event?</p>
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
            initialPopupController[1],
            1,
            "close"
          );
        },
      },
      {
        text: "Update",
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
            initialPopupController[2],
            2,
            "close"
          );
        },
      },
      {
        text: "Delete",
        btnType: "primaryGreen",
        endIcon: false,
        startIcon: false,
        disabled: !Object.keys(formData).every((key) => formData[key].isValid),
        size: "large",
        onClick: async () => {
          selectvalue.id &&
            deleteOutlookEvent(selectvalue.id, setPopupController, 2);
          // await handleSubmit();
        },
      },
    ],
  ];

  const onLoadingFUN = async (curTab: any): Promise<void> => {
    // setIsLoading(false);

    let filteredData: any[] = [];

    const today = Number(moment().format("YYYYMMDD"));

    if (curTab === CONFIG.TabsName[0] && calenderIntranetData?.data?.length) {
      // Current events where start or end date is today
      filteredData = calenderIntranetData?.data?.filter((newsItem: any) => {
        const startDate = Number(moment(newsItem.start).format("YYYYMMDD"));
        const endDate = Number(moment(newsItem.end).format("YYYYMMDD"));
        return today >= startDate && today <= endDate;
      });
    } else if (
      curTab === CONFIG.TabsName[1] &&
      calenderIntranetData?.data?.length
    ) {
      // Upcoming events where start date is in the future
      filteredData = calenderIntranetData?.data?.filter((newsItem: any) => {
        const startDate = Number(moment(newsItem.start).format("YYYYMMDD"));
        return today < startDate;
      });
    } else if (
      curTab === CONFIG.TabsName[2] &&
      calenderIntranetData?.data?.length
    ) {
      // Previous events where end date is in the past
      filteredData = calenderIntranetData?.data?.filter((newsItem: any) => {
        const endDate = Number(moment(newsItem.end).format("YYYYMMDD"));
        return today > endDate;
      });
    }
    objFilter.allSearch = "";
    objFilter.selectedDate = null;
    setSearchField({
      ...searchField,
      allSearch: "",
      selectedDate: null,
    });

    setSelectedTab(curTab);
    setCalendardata([...filteredData]);
    setShowcalendardata([...filteredData]);
    handleSearch([...filteredData]);
  };

  const handleSearch = (val: any): void => {
    let filteredResults = [...val];

    // Apply common text search for title, status, and description

    if (objFilter.allSearch) {
      const searchValue = objFilter.allSearch.trimStart().toLowerCase();
      filteredResults = filteredResults.filter(
        (item: any) =>
          item?.title?.toLowerCase().includes(searchValue) ||
          // item?.Status?.toLowerCase().includes(searchValue) ||
          item?.description?.toLowerCase().includes(searchValue)
      );
    }

    // Apply date filter if date is selected
    if (objFilter.selectedDate) {
      const formattedDate = dayjs(objFilter.selectedDate).format("YYYY-MM-DD");
      filteredResults = filteredResults.filter(
        (item: any) => dayjs(item.start).format("YYYY-MM-DD") === formattedDate
      );
    }

    // Update the state with filtered results
    setShowcalendardata(filteredResults || []);
  };

  const handleRefresh = (): void => {
    setSearchField({
      allSearch: "",
      selectedDate: null,
    });
    objFilter = {
      selectedDate: null,
      allSearch: "",
    };
    setShowcalendardata([...calendardata]);
  };

  const handleEdit = (item: any): any => {
    // const startTime = item?.start.split("T")[1].split(":")[0];
    // const endTime = item?.end.split("T")[1].split(":")[0];
    setFormData({
      Title: {
        ...formData.Title,
        isValid: true,
        value: item.title || "",
      },
      StartDate: {
        ...formData.StartDate,
        isValid: true,
        value: new Date(item.start) || null,
      },
      StartTime: {
        ...formData.StartTime,
        isValid: true,
        value: new Date(item.start) || "",
      },
      EndTime: {
        ...formData.EndTime,
        isValid: true,
        value: new Date(item.end) || "",
      },

      Description: {
        ...formData.Description,
        isValid: true,
        value: item.description || "",
      },
    });

    setSelectvalue({ ...selectvalue, id: item.id, isEdit: true });
    togglePopupVisibility(
      setPopupController,
      initialPopupController[1],
      1,
      "open"
    );
  };
  const handleDelete = (val: any): any => {
    setSelectvalue({ ...selectvalue, id: val.id });

    togglePopupVisibility(
      setPopupController,
      initialPopupController[2],
      2,
      "open"
    );
  };
  useEffect(() => {
    getEvents(dispatch, "viewall");

    RoleAuth(
      CONFIG.SPGroupName.Pernix_Admin,
      { highPriorityGroups: [CONFIG.SPGroupName.Calendar_Admin] },
      dispatch
    );
    // BindCalender(calenderIntranetData);
  }, []);

  useEffect(() => {
    onLoadingFUN(CONFIG.TabsName[0]);
  }, [calenderIntranetData]);

  return (
    <div className={styles.boxWrapper}>
      <div className={styles.newsHeaderContainer}>
        <div className={styles.leftSection}>
          <i
            onClick={() => {
              window.open(
                props.context.pageContext.web.absoluteUrl +
                  CONFIG.NavigatePage.PernixIntranet,
                "_self"
              );
            }}
            className="pi pi-arrow-circle-left"
            style={{ fontSize: "1.5rem", color: "#E0803D" }}
          />
          <p>Calendar</p>
        </div>
        <div className={styles.rightSection}>
          <CustomInput
            value={searchField.allSearch ? searchField.allSearch : ""}
            secWidth="180px"
            labelText="Search"
            placeholder="Search"
            noErrorMsg
            onChange={(e) => {
              const value = e;
              objFilter.allSearch = value;
              setSearchField({ ...searchField, allSearch: value });
              handleSearch([...calendardata]);
            }}
          />
          {/* <InputText
            value={searchField.allSearch}
            style={{ width: "150px" }}
            placeholder="Search"
            onChange={(e) => {
              objFilter.allSearch = e.target.value;
              setSearchField({ ...searchField, allSearch: e.target.value });
              handleSearch([...shownewsData]);
            }}
          /> */}
          <CustomDateInput
            label="Select date"
            placeHolder="Date"
            minWidth="180px"
            maxWidth="180px"
            value={searchField.selectedDate ? searchField.selectedDate : null}
            onChange={(e: any) => {
              const value: any = e;
              objFilter.selectedDate = value;
              setSearchField((prev: any) => ({
                ...prev,
                selectedDate: value,
              }));
              handleSearch([...calendardata]);
            }}
          />
          <div className={styles.refreshBtn} onClick={handleRefresh}>
            <i className="pi pi-refresh" />
          </div>
          <div
            style={{
              display:
                currentUserDetails.role === CONFIG.RoleDetails.user
                  ? "none"
                  : "flex",
            }}
            className={styles.addNewbtn}
            onClick={() => {
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
                // EndDate: {
                //   value: "",
                //   isValid: true,
                //   errorMsg: "Invalid input",
                //   validationRule: { required: true, type: "date" },
                // },
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

              // setisDelete(false);
              // setIsEdit(false);
              // setID(null);
              togglePopupVisibility(
                setPopupController,
                initialPopupController[0],
                0,
                "open"
              );
              debugger;
            }}
          >
            <i
              className="pi pi-plus"
              style={{ fontSize: "1rem", color: "#fff" }}
            />
            Add an event
          </div>
        </div>
      </div>

      {/* tabs */}
      <div className={styles.tabsContainer}>
        {CONFIG.TabsName.map((str: string, i: number) => {
          return isAdmin ? (
            <div
              key={i}
              style={{
                borderBottom:
                  selectedTab === str ? "3px solid #e0803d" : "none",
              }}
              onClick={(_) => {
                setSelectedTab(str);

                onLoadingFUN(str);
              }}
            >
              {str}
            </div>
          ) : i === 0 ? (
            <div
              key={i}
              style={{
                borderBottom:
                  selectedTab === str ? "3px solid #e0803d" : "none",
              }}
              onClick={(_) => {
                setSelectedTab(str);

                onLoadingFUN(str);
              }}
            >
              {str}
            </div>
          ) : (
            ""
          );
        })}
      </div>

      <div className={styles.calenderSection}>
        {calenderIntranetData?.isLoading ? (
          <CircularSpinner />
        ) : calenderIntranetData?.error ? (
          <div className="errorWrapper">
            <img src={errorGrey} alt="Error" />
            <span className="disabledText">{calenderIntranetData?.error}</span>
          </div>
        ) : showcalendardata?.length === 0 ? (
          <div
            style={{
              width: "100%",
              height: "50vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "14px",
              color: "#adadad",
              fontFamily: "osMedium, sans-serif",
            }}
          >
            No events found.
          </div>
        ) : (
          <div className={styles.eventWrapper}>
            {showcalendardata?.map((val: IEvent, index: number) => (
              <div className={styles.eventSection} key={index}>
                <div className={styles.date}>
                  <p>{`${moment(val.start).format("D").padStart(2, "0")}`}</p>
                  <p>{`${moment(val.start).format("MMM").toUpperCase()}`}</p>
                </div>
                <div className={styles.event}>
                  <p className={styles.Title} title={styles.Title}>
                    {val.title}
                  </p>
                  <span className={styles.time}>
                    {`${moment(val.start).format("hh:mm A")} - ${moment(
                      val.end
                    ).format("hh:mm A")}`}
                  </span>
                  <span className={styles.description} title={val?.description}>
                    {val?.description}
                  </span>
                </div>

                {isAdmin && (
                  <div className={styles.icons}>
                    <i
                      onClick={() => handleEdit(val)}
                      style={{ color: "#adadad", fontSize: "1.2rem" }}
                      className="pi pi-pen-to-square

"
                    />
                    <i
                      onClick={() => handleDelete(val)}
                      style={{ color: "red", fontSize: "1.2rem" }}
                      className="pi pi-trash


"
                    />{" "}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
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
          confirmationTitle={popupData?.confirmationTitle}
          popupHeight={index === 0 ? true : false}
          noActionBtn={true}
          // popupActions={[]}
        />
      ))}
    </div>
  );
};

export default CalendarPage;
