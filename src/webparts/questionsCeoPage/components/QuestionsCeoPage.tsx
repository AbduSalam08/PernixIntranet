/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type*/
import { Avatar } from "primereact/avatar";
import { useEffect, useState } from "react";
import styles from "./QuestionsCeoPage.module.scss";
import "../../../assets/styles/Style.css";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
import { CONFIG } from "../../../config/config";
import { useDispatch, useSelector } from "react-redux";
import {
  addQuestionCeo,
  changeQuestionActiveStatus,
  getQuestionCeo,
  questionsCurrentUserRole,
  submitCEOQuestionAnswer,
} from "../../../services/QuestionCEOIntranet/QuestionCEOIntranet";
import { InputSwitch } from "primereact/inputswitch";
import "./style.css";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../utils/popupUtils";
import Popup from "../../../components/common/Popups/Popup";
import FloatingLabelTextarea from "../../../components/common/CustomInputFields/CustomTextArea";
import { resetFormData, validateField } from "../../../utils/commonUtils";
import { Paginator } from "primereact/paginator";
import { IPaginationData } from "../../../interface/interface";
interface IReplies {
  avatarUrl: string;
  content: string;
  date: string;
}
interface IQuestion {
  avatarUrl: string;
  date: string;
  title: string;
  replies: IReplies;
  isAllDay: boolean;
}
interface PopupState {
  open: boolean;
  popupTitle: string;
  popupWidth: string;
  popupType: string;
  defaultCloseBtn: boolean;
  confirmationTitle?: string;
  popupData: string;
  isLoading: {
    inprogress: boolean;
    error: boolean;
    success: boolean;
  };
  messages: {
    success: string;
    error: string;
    successDescription: string;
    errorDescription: string;
    inprogress: string;
  };
}

const QuestionsCeoPage = (props: any): JSX.Element => {
  const dispatch = useDispatch();
  const QuestionCEOIntranetData: any = useSelector((state: any) => {
    return state.QuestionCEOIntranetData.value;
  });

  const [pagination, setPagination] = useState<IPaginationData>(
    CONFIG.PaginationData
  );

  const [formData, setFormData] = useState<any>({
    qustion: {
      ID: null,
      value: "",
      isValid: true,
      errorMsg: "Invalid title",
      validationRule: { required: true, type: "string" },
    },
    answer: {
      ID: null,
      value: "",
      isValid: true,
      errorMsg: "Invalid answer",
      validationRule: { required: true, type: "string" },
    },
  });
  const [newFormData, setNewFormData] = useState<any>({
    Description: {
      value: "",
      isValid: true,
      errorMsg: "This field is required",
      validationRule: { required: true, type: "string" },
    },
  });
  const [ceoQuestionsdata, setCeoQuestionsdata] = useState<IQuestion[]>([]);
  const [userRole, setUserRole] = useState<string>("User");
  const [selectedTab, setSelectedTab] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchParamsQusID, setSearchParamsQusID] = useState<any>(null);
  console.log(searchParamsQusID);

  const totalRecords = ceoQuestionsdata?.length || 0;
  const onPageChange = (event: any): void => {
    setPagination({
      first: event?.first || CONFIG.PaginationData.first,
      rows: event?.rows || CONFIG.PaginationData.rows,
    });
  };

  // popup properties
  const initialPopupController: PopupState[] = [
    {
      open: false,
      popupTitle: "",
      popupWidth: "720px",
      popupType: "custom",
      defaultCloseBtn: false,
      popupData: "",
      isLoading: {
        inprogress: false,
        error: false,
        success: false,
      },
      messages: {
        success: "Answer submitted successfully!",
        error: "Something went wrong!",
        successDescription: "The answer submitted successfully.",
        errorDescription:
          "An error occured while submitting answer, please try again later.",
        inprogress: "Submitting answer, please wait...",
      },
    },
    {
      open: false,
      popupTitle: "New question to CEO",
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
        success: "Question added successfully!",
        error: "Something went wrong!",
        successDescription:
          "The new Question 'ABC' has been added successfully.",
        errorDescription:
          "An error occured while adding Question, please try again later.",
        inprogress: "Adding Question, please wait...",
      },
    },
  ];

  const [popupController, setPopupController] = useState<PopupState[]>(
    initialPopupController
  );

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
  };

  const handleNewFormInputChange = (
    field: string,
    value: any,
    isValid: boolean,
    errorMsg: string = ""
  ): void => {
    setNewFormData((prevData: any) => ({
      ...prevData,
      [field]: {
        ...prevData[field],
        value: value,
        isValid,
        errorMsg: isValid ? "" : errorMsg,
      },
    }));
  };

  const handleSubmit = async (): Promise<any> => {
    let hasErrors = false;

    // Validate each field and update the state with error messages
    const updatedFormData = Object.keys(newFormData).reduce((acc, key) => {
      const fieldData = newFormData[key];
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
    }, {} as typeof newFormData);

    setNewFormData(updatedFormData);
    if (!hasErrors) {
      await addQuestionCeo(newFormData, setPopupController, 1, dispatch);
    } else {
      console.log("Form contains errors");
    }
  };

  const handleAnswerSubmit = async () => {
    const type = formData.answer.ID ? "Update" : "New";
    setSearchParamsQusID(null);
    if (formData.answer.value !== "") {
      await submitCEOQuestionAnswer(
        type,
        formData.qustion.ID,
        formData.answer.ID,
        formData.answer.value,
        setPopupController,
        0,
        dispatch
      );
    }
  };

  const popupInputs: any = [
    [
      <div className={styles.addNewsGrid} key={1}>
        <div>
          <p className={styles.question}>{formData.qustion.value}</p>
        </div>
        <div className={styles.r4}>
          <div className={styles.item5}>
            <FloatingLabelTextarea
              value={formData.answer.value}
              placeholder="answer"
              rows={5}
              isValid={formData.answer.isValid}
              errorMsg={formData.answer.errorMsg}
              onChange={(e: any) => {
                const value = e.trimStart();
                const { isValid, errorMsg } = validateField(
                  "answer",
                  value,
                  formData.answer.validationRule
                );
                handleInputChange("answer", value, isValid, errorMsg);
              }}
            />
          </div>
        </div>
      </div>,
    ],
    [
      <div key={2}>
        <FloatingLabelTextarea
          value={newFormData.Description.value}
          size="XL"
          placeholder="Enter question"
          rows={5}
          isValid={newFormData.Description.isValid}
          errorMsg={newFormData.Description.errorMsg}
          onChange={(e: any) => {
            const value = e;
            const { isValid, errorMsg } = validateField(
              "Description",
              value,
              newFormData.Description.validationRule
            );
            handleNewFormInputChange("Description", value, isValid, errorMsg);
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
        disabled: false,
        size: "large",
        onClick: async () => {
          await handleAnswerSubmit();
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
        text: "Submit",
        btnType: "primaryGreen",
        endIcon: false,
        startIcon: false,
        disabled: !Object.keys(newFormData).every(
          (key) => newFormData[key].isValid
        ),
        size: "large",
        onClick: async () => {
          await handleSubmit();
        },
      },
    ],
  ];

  const onLoadingFUN = async (curTab: any): Promise<void> => {
    let filteredData: any[] = [];
    const userDetails = await questionsCurrentUserRole(setUserRole);
    console.log(userDetails);

    if (QuestionCEOIntranetData?.data?.length && userDetails?.role === "CEO") {
      if (curTab === CONFIG.QuestionsPageTabsName[0]) {
        filteredData = QuestionCEOIntranetData?.data?.filter(
          (newsItem: any) => {
            if (newsItem.ID === searchParamsQusID) {
              setFormData({
                qustion: {
                  ...formData.qustion,
                  isValid: true,
                  value: newsItem.title || "",
                  ID: newsItem.ID,
                },
                answer: {
                  ...formData.answer,
                  isValid: true,
                  value: newsItem?.replies[0]?.content || null,
                  ID: newsItem?.replies[0]?.ID || null,
                },
              });
              togglePopupVisibility(
                setPopupController,
                initialPopupController[0],
                0,
                "open",
                "Submit answer"
              );
            }
            return newsItem;
          }
        );
      } else if (curTab === CONFIG.QuestionsPageTabsName[1]) {
        filteredData = QuestionCEOIntranetData?.data?.filter(
          (newsItem: any) => {
            return newsItem?.avatarUrl === userDetails?.email;
          }
        );
      } else {
        filteredData = QuestionCEOIntranetData?.data?.filter(
          (newsItem: any) => {
            return newsItem?.replies.length === 0;
          }
        );
      }
    } else if (
      QuestionCEOIntranetData?.data?.length &&
      userDetails?.role === "Admin"
    ) {
      if (curTab === CONFIG.QuestionsPageTabsName[0]) {
        filteredData = QuestionCEOIntranetData?.data?.filter(
          (newsItem: any) => {
            return newsItem?.replies.length > 0;
          }
        );
      } else {
        filteredData = QuestionCEOIntranetData?.data?.filter(
          (newsItem: any) => {
            return (
              newsItem?.avatarUrl === userDetails?.email &&
              newsItem?.replies.length > 0
            );
          }
        );
      }
    } else {
      if (curTab === CONFIG.QuestionsPageTabsName[0]) {
        filteredData = QuestionCEOIntranetData?.data?.filter(
          (newsItem: any) => {
            return newsItem?.isActive;
          }
        );
      } else {
        filteredData = QuestionCEOIntranetData?.data?.filter(
          (newsItem: any) => {
            return (
              newsItem?.avatarUrl === userDetails?.email && newsItem?.isActive
            );
          }
        );
      }
    }
    setSelectedTab(curTab);
    setCeoQuestionsdata([...filteredData]);
    setIsLoading(false);
  };

  useEffect(() => {
    if (QuestionCEOIntranetData?.data?.length > 0) {
      onLoadingFUN(CONFIG.QuestionsPageTabsName[0]);
    }
  }, [QuestionCEOIntranetData || userRole]);

  useEffect(() => {
    const urlObj = new URL(window.location.href);
    const params = new URLSearchParams(urlObj.search);
    const ID = params.get("ID");
    setSearchParamsQusID(Number(ID));

    // questionsCurrentUserRole(setUserRole);
    getQuestionCeo(dispatch);
  }, [dispatch]);

  return isLoading ? (
    <div className={styles.LoaderContainer}>
      <CircularSpinner />
    </div>
  ) : (
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
          <p>Questions to the CEO</p>
        </div>
        <div className={styles.rightSection}>
          <div
            style={{
              display: "flex",
            }}
            className={styles.addNewbtn}
            onClick={() => {
              togglePopupVisibility(
                setPopupController,
                initialPopupController[1],
                1,
                "open",
                "Submit a question to CEO"
              );
              resetFormData(newFormData, setNewFormData);
            }}
          >
            <i
              className="pi pi-plus"
              style={{ fontSize: "1rem", color: "#fff" }}
            />
            Add an question
          </div>
        </div>
      </div>
      {/* tabs */}
      <div className={styles.tabsContainer}>
        {CONFIG.QuestionsPageTabsName.map((str: string, i: number) => {
          if (str === CONFIG.QuestionsPageTabsName[1]) {
            if (userRole !== "CEO") {
              return (
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
              );
            }
          } else if (str === CONFIG.QuestionsPageTabsName[2]) {
            if (userRole === "CEO") {
              return (
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
              );
            }
          } else {
            return (
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
            );
          }
        })}
      </div>
      <div className={styles.questionSection}>
        {QuestionCEOIntranetData?.isLoading ? (
          <CircularSpinner />
        ) : QuestionCEOIntranetData?.error ? (
          <div className="errorWrapper">
            {/* <img src={errorGrey} alt="Error" /> */}
            <span className="disabledText">
              {QuestionCEOIntranetData?.error}
            </span>
          </div>
        ) : ceoQuestionsdata?.length === 0 ? (
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
          <div>
            {ceoQuestionsdata
              ?.slice(pagination.first, pagination.first + pagination.rows)
              ?.map((val: any, index: number) => {
                return (
                  <div key={index} className={styles.contentSection}>
                    <div style={{ width: "90%" }}>
                      <div className={styles.questions}>
                        <div className={styles.imgsection}>
                          <Avatar
                            className="qustionceo"
                            image={`/_layouts/15/userphoto.aspx?size=S&username=${val?.avatarUrl}`}
                            // size="small"
                            shape="circle"
                            style={{
                              width: "40px !important",
                              height: "40px !important",
                            }}
                            // data-pr-tooltip={val.receiverName}
                          />
                        </div>
                        <p className={styles.ques}>{val.title}</p>
                      </div>
                      <p className={styles.date}>
                        <i
                          className="pi pi-clock"
                          style={{ fontSize: "1rem" }}
                        />
                        {val.date}
                      </p>
                      <div>
                        <div className={styles.questions}>
                          <div className={styles.imgsection}>
                            <Avatar
                              className="qustionceo"
                              image={`/_layouts/15/userphoto.aspx?size=S&username=${val?.replies[0]?.avatarUrl}`}
                              shape="circle"
                            />
                          </div>
                          <p className={styles.answer}>
                            {val.replies[0]?.content}
                          </p>
                        </div>
                        <p className={styles.date}>
                          <i
                            className="pi pi-clock"
                            style={{ fontSize: "1rem" }}
                          />
                          {val.replies[0]?.date}
                        </p>
                      </div>
                    </div>
                    <div className={styles.rhsActions}>
                      {userRole === "Admin" && (
                        <div
                          className={
                            val.isActive
                              ? styles.activepill
                              : styles.inactivepill
                          }
                        >
                          {val.isActive ? "Active" : "In Active"}
                        </div>
                      )}
                      {userRole !== "User" && (
                        <div className={styles.actionBtns}>
                          {userRole === "Admin" && (
                            <InputSwitch
                              checked={val.isActive}
                              className="sectionToggler"
                              onChange={(e) => {
                                setCeoQuestionsdata((prevItems) =>
                                  prevItems.map((item: any, idx: number) =>
                                    idx === index
                                      ? { ...item, isActive: e.value }
                                      : item
                                  )
                                );
                                changeQuestionActiveStatus(val.ID, e.value);
                              }}
                            />
                          )}
                          {userRole !== "Admin" && (
                            <i
                              onClick={() => {
                                setFormData({
                                  qustion: {
                                    ...formData.qustion,
                                    isValid: true,
                                    value: val.title || "",
                                    ID: val.ID,
                                  },
                                  answer: {
                                    ...formData.answer,
                                    isValid: true,
                                    value: val?.replies[0]?.content || null,
                                    ID: val?.replies[0]?.ID || null,
                                  },
                                });
                                togglePopupVisibility(
                                  setPopupController,
                                  initialPopupController[0],
                                  0,
                                  "open",
                                  "Submit answer"
                                );
                              }}
                              style={{
                                color: "#adadad",
                                fontSize: "1.2rem",
                                cursor: "pointer",
                              }}
                              className="pi pi-pen-to-square"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
      {ceoQuestionsdata.length > 0 && (
        <div className="card">
          <Paginator
            first={pagination.first}
            rows={pagination.rows}
            totalRecords={totalRecords}
            onPageChange={onPageChange}
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink "
          />
        </div>
      )}
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
            // setIsEdit(false);
            // setisDelete(false);
            togglePopupVisibility(
              setPopupController,
              initialPopupController[index],
              index,
              "close"
            );
            if (popupData?.isLoading?.success) {
              // setIsile(false);
              // getAllNewsData(dispatch);
            }
            // resetFormData(formData, setFormData);
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
            popupData?.confirmationTitle
            // popupData.popupType !== "custom" ? popupData.popupTitle : ""
          }
          popupHeight={index === 0 ? true : false}
          noActionBtn={true}
        />
      ))}
    </div>
  );
};

export default QuestionsCeoPage;
