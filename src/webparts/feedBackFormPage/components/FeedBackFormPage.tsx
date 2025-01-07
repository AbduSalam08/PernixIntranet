/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../../../assets/styles/Style.css";
import styles from "./FeedBackFormPage.module.scss";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
import {
  addFeedbackQus,
  deleteFeedbackQus,
  getFeedBackDatas,
  updateFeedbackQus,
} from "../../../services/FeedbackIntranet/FeedbackIntranet";
import { CONFIG } from "../../../config/config";
import { RoleAuth } from "../../../services/CommonServices";
import {
  IFeedbackQusColumn,
  IFeedbackQusType,
  IFeedbackResType,
  IFormFields,
  IPageSearchFields,
  IUserDetails,
} from "../../../interface/interface";
import CustomDateInput from "../../../components/common/CustomInputFields/CustomDateInput";
import CustomInput from "../../../components/common/CustomInputFields/CustomInput";
import { resetFormData, validateField } from "../../../utils/commonUtils";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../utils/popupUtils";
import DefaultButton from "../../../components/common/Buttons/DefaultButton";
import { Add, OpenInNew } from "@mui/icons-material";
import Popup from "../../../components/common/Popups/Popup";
import moment from "moment";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import FeedBackViewPage from "./FeedBackViewPage";
import { ToastContainer } from "react-toastify";

/* Local interfaces */
interface IFeedbackField {
  Title: IFormFields;
  StartDate: IFormFields;
  EndDate: IFormFields;
}

/* Global variable creation */
const errorImg: string = require("../../../assets/images/svg/errorImg.svg");
const errorGrey = require("../../../assets/images/svg/errorGrey.svg");

let isAdmin: boolean = false;
let masterFeedBackQus: IFeedbackQusType[] = [];
let masterFeedBackRes: IFeedbackResType[] = [];
let isActivityPage: boolean = false;

const FeedBackFormPage = (props: any): JSX.Element => {
  /* Local variable creation */
  const dispatch = useDispatch();

  const searchField: IPageSearchFields = CONFIG.PageSearchFields;
  const currentUserDetails: IUserDetails = useSelector(
    (state: any) => state?.MainSPContext?.currentUserDetails
  );
  isAdmin = currentUserDetails.role === CONFIG.RoleDetails.user ? false : true;

  /* popup properties */
  const initialPopupController: any[] = [
    {
      open: false,
      popupTitle: "Add a feedback question",
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
        success: "Feedback question added successfully!",
        error: "Something went wrong!",
        successDescription:
          "The new feedback question 'ABC' has been added successfully.",
        errorDescription:
          "An error occured while adding feedback question, please try again later.",
        inprogress: "Adding new feedback question, please wait...",
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
        success: "Feedback question updated successfully!",
        error: "Something went wrong!",
        successDescription:
          "The new feedback question 'ABC' has been updated successfully.",
        errorDescription:
          "An error occured while updating feedback question, please try again later.",
        inprogress: "Updating feedback question, please wait...",
      },
    },
    {
      open: false,
      popupTitle: "Confirmation",
      popupWidth: "450px",
      popupType: "custom",
      defaultCloseBtn: false,
      popupData: "",
      centerActionBtn: true,
      isLoading: {
        inprogress: false,
        error: false,
        success: false,
      },
      messages: {
        success: "Feedback question deleted successfully!",
        error: "Something went wrong!",
        successDescription:
          "The new feedback question 'ABC' has been deleted successfully.",
        errorDescription:
          "An error occured while delete feedback question, please try again later.",
        inprogress: "Delete feedback question, please wait...",
      },
    },
  ];

  const initialFormData: IFeedbackField = {
    Title: {
      value: "",
      isValid: true,
      errorMsg: "Question is required.",
      validationRule: {
        required: true,
        type: "string",
      },
    },
    StartDate: {
      value: new Date(),
      isValid: true,
      errorMsg: "",
      validationRule: {
        required: false,
        type: "date",
      },
    },
    EndDate: {
      value: null,
      isValid: true,
      errorMsg: "Please choose end date.",
      validationRule: {
        required: true,
        type: "date",
      },
    },
  };

  /* State creation */
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<string>("");
  const [allFeedbackQuestion, setAllFeedbackQuestion] = useState<
    IFeedbackQusType[]
  >([]);
  const [showFeedbackQuestion, setShowFeedbackQuestion] = useState<
    IFeedbackQusType[]
  >([]);
  const [curObject, setCurObject] = useState<IFeedbackQusType>({
    ...CONFIG.FeedbackQusType,
  });
  const [popupController, setPopupController] = useState<any[]>(
    initialPopupController
  );
  const [formData, setFormData] = useState<IFeedbackField | any>({
    ...initialFormData,
  });
  const [commonSearch, setCommonSearch] = useState<IPageSearchFields>({
    ...CONFIG.PageSearchFields,
  });
  const [isQuestion, setIsQuestion] = useState<boolean>(true);

  /* Functions creation */
  const handleInputChange = async (
    field: string,
    value: any,
    isValid: boolean,
    errorMsg: string = ""
  ): Promise<void> => {
    setFormData((prevData: IFeedbackField | any) => ({
      ...prevData,
      [field]: {
        ...prevData[field],
        value: value,
        isValid,
        errorMsg: isValid ? "" : errorMsg,
      },
    }));
  };

  const handleSearch = async (
    masterArray: IFeedbackQusType[]
  ): Promise<void> => {
    let temp: IFeedbackQusType[] = [...masterArray];

    if (searchField.Search) {
      temp = temp?.filter((val: IFeedbackQusType) =>
        val.Title.toLowerCase().includes(searchField.Search.toLowerCase())
      );
    }
    if (searchField.Date) {
      temp = temp?.filter(
        (val: IFeedbackQusType) =>
          moment(val.StartDate).format("YYYYMMDD") <=
            moment(new Date(searchField.Date)).format("YYYYMMDD") &&
          moment(val.EndDate).format("YYYYMMDD") >=
            moment(new Date(searchField.Date)).format("YYYYMMDD")
      );
    }

    setShowFeedbackQuestion([...temp]);
    setIsLoading(false);
  };

  const prepareDatas = async (curTab: string): Promise<void> => {
    let tempArray: IFeedbackQusType[] = [];

    if (curTab === CONFIG.TabsName[0]) {
      tempArray = await Promise.all(
        masterFeedBackQus?.filter(
          (val: IFeedbackQusType) =>
            Number(moment().format("YYYYMMDD")) >=
              Number(moment(val.StartDate).format("YYYYMMDD")) &&
            Number(moment().format("YYYYMMDD")) <=
              Number(moment(val.EndDate).format("YYYYMMDD"))
        )
      );
    } else if (curTab === CONFIG.TabsName[1]) {
      tempArray = await Promise.all(
        masterFeedBackQus?.filter(
          (val: IFeedbackQusType) =>
            Number(moment().format("YYYYMMDD")) <
            Number(moment(val.StartDate).format("YYYYMMDD"))
        )
      );
    } else {
      tempArray = await Promise.all(
        masterFeedBackQus?.filter(
          (val: IFeedbackQusType) =>
            Number(moment().format("YYYYMMDD")) >
            Number(moment(val.EndDate).format("YYYYMMDD"))
        )
      );
    }

    searchField.Search = "";
    searchField.Status = "";
    searchField.Date = null;
    setCommonSearch({ ...searchField });
    setSelectedTab(curTab);
    setAllFeedbackQuestion([...tempArray]);
    await handleSearch([...tempArray]);
  };

  const onLoadingFUN = async (): Promise<void> => {
    setIsLoading(true);
    await RoleAuth(
      CONFIG.SPGroupName.Pernix_Admin,
      {
        highPriorityGroups: [CONFIG.SPGroupName.Feedback_Admin],
      },
      dispatch
    );
    await getFeedBackDatas(CONFIG.ListNames.Intranet_feedbackQuestion).then(
      async (res: any[]) => {
        masterFeedBackQus = await Promise.all(
          res?.map((val: any) => {
            return {
              ID: Number(val.ID),
              Title: val?.Title ?? "",
              StartDate: val?.StartDate ?? null,
              EndDate: val?.EndDate ?? null,
            };
          }) || []
        );
      }
    );
    await getFeedBackDatas(CONFIG.ListNames.Intranet_feedbackResponse).then(
      async (res: any[]) => {
        masterFeedBackRes = await Promise.all(
          res?.map((val: any) => {
            return {
              ID: Number(val.ID),
              Answer: val?.Answer ?? "",
              FeedbackQuestionId: val?.FeedbackQuestion?.[0]?.lookupId ?? null,
              CreatedBy: {
                ID: Number(val?.Author?.[0]?.id || "0"),
                Title: val?.Author?.[0]?.title || "",
                Email: val?.Author?.[0]?.email || "",
              },
              Date: moment(val?.Created).format("DD MMM YYYY"),
            };
          }) || []
        );
      }
    );
    await prepareDatas(CONFIG.TabsName[0]);
  };

  const handleSelect = async (data: IFeedbackQusType): Promise<void> => {
    setCurObject({ ...data });
    setFormData({
      Title: {
        ...initialFormData.Title,
        value: data?.Title ?? "",
      },
      StartDate: {
        ...initialFormData.StartDate,
        value: data.StartDate ? new Date(data.StartDate) : null,
      },
      EndDate: {
        ...initialFormData.EndDate,
        value: data.EndDate ? new Date(data.EndDate) : null,
      },
    });
    togglePopupVisibility(
      setPopupController,
      initialPopupController[1],
      1,
      "open"
    );
  };

  const handleDelete = async (
    data: any,
    tab: string = CONFIG.TabsName[0]
  ): Promise<void> => {
    resetFormData(formData, setFormData);
    togglePopupVisibility(
      setPopupController,
      initialPopupController[2],
      2,
      "close"
    );

    const isDeleted: boolean = await deleteFeedbackQus(data);
    if (isDeleted) {
      const curIndex: number = masterFeedBackQus?.findIndex(
        (val: IFeedbackQusType) => val.ID === data?.ID
      );

      masterFeedBackQus?.splice(curIndex, 1);
    }

    await prepareDatas(tab);
  };

  const handleUpdate = async (data: any, tab: string): Promise<void> => {
    resetFormData(formData, setFormData);
    togglePopupVisibility(
      setPopupController,
      initialPopupController[1],
      1,
      "close"
    );

    const updatedJSON: any = await updateFeedbackQus(data);
    const curIndex: number = masterFeedBackQus?.findIndex(
      (val: IFeedbackQusType) => val.ID === updatedJSON?.ID
    );

    masterFeedBackQus?.splice(curIndex, 1, { ...updatedJSON });
    await prepareDatas(tab);
  };

  const handleSubmit = async (data: any, tab: string): Promise<void> => {
    resetFormData(formData, setFormData);
    togglePopupVisibility(
      setPopupController,
      initialPopupController[0],
      0,
      "close"
    );

    const addedJSON: any = await addFeedbackQus(data);
    masterFeedBackQus = [addedJSON, ...masterFeedBackQus];
    await prepareDatas(tab);
  };

  const handleData = async (
    tab: string = CONFIG.TabsName[0]
  ): Promise<void> => {
    let hasErrors: boolean = false;

    const updatedFormData = Object.keys(formData).reduce((acc, key) => {
      const fieldData = formData[key];
      const { isValid, errorMsg } = validateField(
        key === "Title" ? "Question" : key,
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
      const data: any = {};
      const column: IFeedbackQusColumn = CONFIG.FeedbackQusColumn;

      data[column.ID] = curObject?.ID || null;
      data[column.Title] = formData?.Title?.value || "";
      data[column.StartDate] = formData?.StartDate?.value || null;
      data[column.EndDate] = formData?.EndDate?.value || null;

      if (curObject?.ID) {
        await handleUpdate({ ...data }, tab);
      } else {
        await handleSubmit({ ...data }, tab);
      }
    } else {
      console.log("Form contains errors");
    }
  };

  const popupInputs: any[] = [
    [
      <div key={1} className={styles.inputFieldContainer}>
        <div className={styles.firstRow}>
          <CustomInput
            value={formData.Title.value}
            placeholder="Question"
            isValid={formData.Title.isValid}
            errorMsg={formData.Title.errorMsg}
            onChange={(e: any) => {
              const value = e.trimStart();
              const { isValid, errorMsg } = validateField(
                "Question",
                value,
                formData.Title.validationRule
              );
              handleInputChange(
                CONFIG.FeedbackQusColumn.Title,
                value,
                isValid,
                errorMsg
              );
            }}
          />
        </div>
        <div className={styles.secondRow}>
          <div
          // style={{
          //   width: "50%",
          // }}
          >
            <CustomDateInput
              value={formData?.StartDate?.value || null}
              label="Start Date"
              isDateController={true}
              minimumDate={new Date()}
              maximumDate={
                formData?.EndDate?.value
                  ? new Date(formData?.EndDate?.value)
                  : null
              }
              onChange={(e: any) => {
                const value = e;
                const { isValid, errorMsg } = validateField(
                  CONFIG.FeedbackQusColumn.StartDate,
                  value,
                  formData.StartDate.validationRule
                );
                handleInputChange(
                  CONFIG.FeedbackQusColumn.StartDate,
                  value,
                  isValid,
                  errorMsg
                );
              }}
            />
          </div>
          <div
          // style={{
          //   width: "50%",
          // }}
          >
            <CustomDateInput
              value={formData.EndDate.value}
              label="End Date"
              isDateController={true}
              minimumDate={
                formData?.StartDate?.value
                  ? new Date(formData?.StartDate?.value)
                  : null
              }
              maximumDate={null}
              error={!formData.EndDate.isValid}
              errorMsg={formData.EndDate.errorMsg}
              onChange={(e: any) => {
                const value = e;
                const { isValid, errorMsg } = validateField(
                  CONFIG.FeedbackQusColumn.EndDate,
                  value,
                  formData.EndDate.validationRule
                );
                handleInputChange(
                  CONFIG.FeedbackQusColumn.EndDate,
                  value,
                  isValid,
                  errorMsg
                );
              }}
            />
          </div>
        </div>
      </div>,
    ],
    [
      <div key={2} className={styles.inputFieldContainer}>
        <div className={styles.firstRow}>
          <CustomInput
            value={formData.Title.value}
            placeholder="Question"
            isValid={formData.Title.isValid}
            errorMsg={formData.Title.errorMsg}
            onChange={(e: any) => {
              const value = e.trimStart();
              const { isValid, errorMsg } = validateField(
                "Question",
                value,
                formData.Title.validationRule
              );
              handleInputChange(
                CONFIG.FeedbackQusColumn.Title,
                value,
                isValid,
                errorMsg
              );
            }}
          />
        </div>
        <div className={styles.secondRow}>
          <div
          // style={{
          //   width: "50%",
          // }}
          >
            <CustomDateInput
              value={formData?.StartDate?.value || null}
              label="Start Date"
              isDateController={true}
              minimumDate={new Date()}
              maximumDate={
                formData?.EndDate?.value
                  ? new Date(formData?.EndDate?.value)
                  : null
              }
              onChange={(e: any) => {
                const value = e;
                const { isValid, errorMsg } = validateField(
                  CONFIG.FeedbackQusColumn.StartDate,
                  value,
                  formData.StartDate.validationRule
                );
                handleInputChange(
                  CONFIG.FeedbackQusColumn.StartDate,
                  value,
                  isValid,
                  errorMsg
                );
              }}
            />
          </div>
          <div
          // style={{
          //   width: "50%",
          // }}
          >
            <CustomDateInput
              value={formData.EndDate.value}
              label="End Date"
              isDateController={true}
              minimumDate={
                formData?.StartDate?.value
                  ? new Date(formData?.StartDate?.value)
                  : null
              }
              maximumDate={null}
              error={!formData.EndDate.isValid}
              errorMsg={formData.EndDate.errorMsg}
              onChange={(e: any) => {
                const value = e;
                const { isValid, errorMsg } = validateField(
                  CONFIG.FeedbackQusColumn.EndDate,
                  value,
                  formData.EndDate.validationRule
                );
                handleInputChange(
                  CONFIG.FeedbackQusColumn.EndDate,
                  value,
                  isValid,
                  errorMsg
                );
              }}
            />
          </div>
        </div>
      </div>,
    ],
    [
      <div key={3}>
        <p
          style={{
            textAlign: "center",
            fontSize: "14px",
            lineHeight: "20px",
          }}
        >
          Are you sure you want to delete this feedback question?
        </p>
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
        disabled: !Object.keys(formData).every(
          (key: any) => formData[key].isValid
        ),
        size: "large",
        onClick: async () => {
          await handleData(selectedTab);
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
        disabled: !Object.keys(formData).every(
          (key: any) => formData[key].isValid
        ),
        size: "large",
        onClick: async () => {
          await handleData(selectedTab);
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
          const data: any = {};
          const column: IFeedbackQusColumn = CONFIG.FeedbackQusColumn;
          data[column.ID] = curObject?.ID || null;
          await handleDelete({ ...data }, selectedTab);
        },
      },
    ],
  ];

  useEffect(() => {
    const urlObj = new URL(window.location.href);
    const params = new URLSearchParams(urlObj.search);
    isActivityPage = params?.get("Page") === "activity" ? true : false;

    onLoadingFUN();
  }, []);

  return isQuestion ? (
    <div className={styles.container}>
      {isLoading ? (
        <div className={styles.LoaderContainer}>
          <CircularSpinner />
        </div>
      ) : (
        <>
          {/* Header section */}
          <div className={styles.headerContainer}>
            <div className={styles.backContainer}>
              <div
                style={{
                  cursor: "pointer",
                }}
                onClick={(_) => {
                  if (isActivityPage) {
                    window.open(
                      props.context.pageContext.web.absoluteUrl +
                        CONFIG.NavigatePage.ApprovalsPage,
                      "_self"
                    );
                  } else {
                    window.open(
                      props.context.pageContext.web.absoluteUrl +
                        CONFIG.NavigatePage.PernixIntranet,
                      "_self"
                    );
                  }
                }}
              >
                <i
                  className="pi pi-arrow-circle-left"
                  style={{
                    fontSize: "26px",
                    color: "#e0803d",
                  }}
                />
              </div>
              <div className={styles.backHeader}>Feedback</div>
            </div>

            <div
              className={styles.searchContainer}
              style={{
                display: isAdmin ? "flex" : "none",
              }}
            >
              <div>
                <CustomInput
                  noErrorMsg
                  size="SM"
                  value={commonSearch?.Search}
                  placeholder="Search"
                  onChange={(e: any) => {
                    const value: string = e.trimStart();
                    searchField.Search = value;
                    setCommonSearch((prev: IPageSearchFields) => ({
                      ...prev,
                      Search: value,
                    }));
                    handleSearch([...allFeedbackQuestion]);
                  }}
                />
              </div>
              <div>
                <CustomDateInput
                  label="Select Date"
                  value={commonSearch?.Date}
                  onChange={(e: any) => {
                    const value: any = e;
                    searchField.Date = value;
                    setCommonSearch((prev: IPageSearchFields) => ({
                      ...prev,
                      Date: value,
                    }));
                    handleSearch([...allFeedbackQuestion]);
                  }}
                  size="SM"
                />
              </div>
              <div
                className={styles.refreshBTN}
                onClick={(_) => {
                  searchField.Search = "";
                  searchField.Date = null;
                  setCommonSearch({ ...searchField });
                  handleSearch([...allFeedbackQuestion]);
                }}
              >
                <i className="pi pi-refresh" />
              </div>
              <div
                style={{
                  display: isAdmin ? "flex" : "none",
                }}
              >
                <DefaultButton
                  text="Add a feedback question"
                  btnType="primaryGreen"
                  startIcon={<Add />}
                  onClick={(_) => {
                    setCurObject({ ...CONFIG.FeedbackQusType });
                    resetFormData(formData, setFormData);
                    setFormData({ ...initialFormData });
                    togglePopupVisibility(
                      setPopupController,
                      initialPopupController[0],
                      0,
                      "open"
                    );
                  }}
                />
              </div>
            </div>
          </div>

          {isAdmin ? (
            <>
              {/* Tab section */}
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
                        setIsLoading(true);
                        prepareDatas(str);
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
                        setIsLoading(true);
                        prepareDatas(str);
                      }}
                    >
                      {str}
                    </div>
                  ) : (
                    ""
                  );
                })}
              </div>

              {/* Body section */}
              {showFeedbackQuestion?.length ? (
                <div className={styles.bodyContainer}>
                  {showFeedbackQuestion?.map(
                    (val: IFeedbackQusType, idx: number) => {
                      return (
                        <div key={idx} className={styles.bodySection}>
                          <div
                            className={styles.titleSec}
                            title={val?.Title}
                            onClick={() => {
                              setCurObject({ ...val });
                              setIsQuestion(false);
                            }}
                          >
                            {val?.Title}
                            <OpenInNew
                              onClick={() => {
                                setCurObject({ ...val });
                                setIsQuestion(false);
                              }}
                            />
                          </div>
                          <div className={styles.iconSec}>
                            <Edit
                              style={{
                                display:
                                  CONFIG.TabsName[2] !== selectedTab
                                    ? "flex"
                                    : "none",
                              }}
                              onClick={() => {
                                handleSelect(val);
                              }}
                            />
                            <Delete
                              onClick={() => {
                                setCurObject({ ...val });
                                togglePopupVisibility(
                                  setPopupController,
                                  initialPopupController[2],
                                  2,
                                  "open"
                                );
                              }}
                            />
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              ) : (
                // <div className={styles.bodyNoDataFound}>
                //   No feedback questions found!
                // </div>

                <div className="errorWrapper" style={{ height: "50vh" }}>
                  <img src={errorGrey} alt="Error" />
                  <span className="disabledText">
                    {"No feedback questions found!"}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className={styles.content}>
              <img src={errorImg} alt="errorImg" />
              <div>You don't have access to this page!</div>
            </div>
          )}

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

          {/* add and edit popup section */}
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
                resetFormData(formData, setFormData);
                togglePopupVisibility(
                  setPopupController,
                  initialPopupController[index],
                  index,
                  "close"
                );
                if (popupData?.isLoading?.success) {
                  prepareDatas(selectedTab || CONFIG.TabsName[0]);
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
              centerActionBtn={popupData.centerActionBtn}
              popupHeight={index === 0 ? true : false}
              noActionBtn={true}
            />
          ))}
        </>
      )}
    </div>
  ) : (
    <FeedBackViewPage
      isQuestion={isQuestion}
      setIsQuestion={setIsQuestion}
      curObject={curObject}
      masterFeedBackRes={masterFeedBackRes}
    />
  );
};

export default FeedBackFormPage;
