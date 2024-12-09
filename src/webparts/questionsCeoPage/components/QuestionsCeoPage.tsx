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
  getcurrentUser,
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
import {
  IPageSearchFields,
  IPaginationData,
} from "../../../interface/interface";
import CustomInput from "../../../components/common/CustomInputFields/CustomInput";
import CustomPeoplePicker from "../../../components/common/CustomInputFields/CustomPeoplePicker";
import { setMainSPContext } from "../../../redux/features/MainSPContextSlice";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import { Checkbox } from "primereact/checkbox";
import { ToastContainer } from "react-toastify";

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

let assignedUser: string = "";
let isActivityPage: boolean = false;

const QuestionsCeoPage = (props: any): JSX.Element => {
  const dispatch = useDispatch();
  const searchField: IPageSearchFields = CONFIG.PageSearchFields;

  const QuestionCEOIntranetData: any = useSelector((state: any) => {
    return state.QuestionCEOIntranetData.value;
  });
  const [curUser, setCurUser] = useState<any>({});

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
      permission: false,
    },
    assignTo: {
      ID: null,
      value: "",
      isValid: true,
      errorMsg: "Invalid answer",
      validationRule: { required: true, type: "array" },
    },
  });
  const [newFormData, setNewFormData] = useState<any>({
    Description: {
      value: "",
      isValid: true,
      errorMsg: "This field is required",
      validationRule: { required: true, type: "string" },
    },
    Anonymous: {
      value: false,
      isValid: true,
      errorMsg: "",
      validationRule: { required: false, type: "boolean" },
    },
  });
  const [ceoQuestionsdata, setCeoQuestionsdata] = useState<IQuestion[]>([]);
  const [showCEOQuestions, setShowCEOQuestions] = useState<IQuestion[]>([]);
  const [userDetails, setUserDetails] = useState<any>({});
  const [assignToUsersList, setAssignToUsersList] = useState<any>([]);
  const [selectedTab, setSelectedTab] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchParamsQusID, setSearchParamsQusID] = useState<any>(null);
  const [commonSearch, setCommonSearch] = useState<IPageSearchFields>({
    ...CONFIG.PageSearchFields,
  });

  const totalRecords = showCEOQuestions?.length || 0;

  const onPageChange = (event: any): void => {
    setPagination({
      first: event?.first || CONFIG.PaginationData.first,
      rows: event?.rows || CONFIG.PaginationData.rows,
    });
  };

  const handleSearch = async (masterArray: IQuestion[]): Promise<void> => {
    let temp: IQuestion[] = [...masterArray];
    if (searchField.Search) {
      temp = temp?.filter(
        (val: any) =>
          val?.title.toLowerCase().includes(searchField.Search.toLowerCase()) ||
          val?.avatarUrl
            .toLowerCase()
            .includes(searchField.Search.toLowerCase()) ||
          val?.replies[0]?.content
            .toLowerCase()
            .includes(searchField.Search.toLowerCase()) ||
          val?.replies[0]?.avatarUrl
            .toLowerCase()
            .includes(searchField.Search.toLowerCase())
      );
    }
    setShowCEOQuestions([...temp]);
    await onPageChange("");
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
        success: "Person assigned successfully!",
        error: "Something went wrong!",
        successDescription: "The person assigned successfully.",
        errorDescription:
          "An error occured while submitting answer, please try again later.",
        inprogress: "Submitting answer, please wait...",
      },
    },
    {
      open: false,
      popupTitle: "New question to leadership",
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
    if (field === "answer") {
      setFormData((prevData: any) => ({
        ...prevData,
        [field]: {
          ...prevData[field],
          value: value,
          isValid,
          errorMsg: isValid ? "" : errorMsg,
          permission: true,
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
        answer: {
          ...prevData.answer,
          isValid: true,
          permission:
            userDetails.email.toLowerCase() === value?.email.toLowerCase()
              ? true
              : false,
          validationRule: {
            required:
              userDetails.email.toLowerCase() === value?.email.toLowerCase()
                ? true
                : false,
            type: "string",
          },
        },
      }));
    }
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
        key === "Description" ? "Question" : key,
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
      togglePopupVisibility(
        setPopupController,
        initialPopupController[1],
        1,
        "close"
      );
      await addQuestionCeo(newFormData, curUser);
      await getQuestionCeo(dispatch);
    } else {
      console.log("Form contains errors");
    }
  };

  const userHandleSubmit = async (submitCondition: boolean) => {
    setSearchParamsQusID(null);
    let hasErrors: boolean = false;
    const updatedFormData = Object.keys(formData).reduce((acc, key) => {
      const fieldData = formData[key];
      const { isValid, errorMsg } = validateField(
        key,
        key === "assignTo"
          ? fieldData?.value?.length > 0
            ? fieldData.value
            : fieldData.value
            ? [fieldData.value]
            : []
          : fieldData.value,
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
      if (submitCondition) {
        const AdminPayload =
          formData?.assignTo?.value?.email && formData?.answer?.value
            ? {
                Answer: formData?.answer?.value,
                AnswerById: userDetails?.id,
                AnswerDate: new Date(),
                AssignToId: formData?.assignTo?.value?.id,
              }
            : formData?.answer?.value
            ? {
                Answer: formData?.answer?.value ? formData?.answer?.value : "",
                AnswerById: userDetails?.id,
                AnswerDate: new Date(),
              }
            : {
                Answer: formData?.answer?.value ? formData?.answer?.value : "",
                AnswerById: null,
                AnswerDate: null,
                AssignToId: formData?.assignTo?.value?.email
                  ? formData?.assignTo?.value?.id
                  : formData?.assignTo?.previousAssignTo?.id,
              };

        const str: string =
          formData?.assignTo?.value?.email && formData?.answer?.value
            ? "response"
            : formData?.answer?.value
            ? "response"
            : "";

        if (str) {
          togglePopupVisibility(
            setPopupController,
            initialPopupController[0],
            0,
            "close"
          );
        }
        await submitCEOQuestionAnswer(
          formData,
          AdminPayload,
          setPopupController,
          0,
          dispatch,
          str
        );
      } else {
        const userPayload = {
          Answer: formData?.answer?.value,
          AnswerById: userDetails?.id,
          AnswerDate: new Date(),
        };

        togglePopupVisibility(
          setPopupController,
          initialPopupController[0],
          0,
          "close"
        );
        await submitCEOQuestionAnswer(
          formData,
          userPayload,
          setPopupController,
          0,
          dispatch,
          "response"
        );
      }
    } else {
      console.log("Form contains errors");
    }
  };

  const popupInputs: any = [
    [
      <div className={styles.addNewsGrid} key={1}>
        <div>
          <p className={styles.question}>{formData?.qustion?.value}</p>
        </div>
        {userDetails?.email?.toLowerCase() ===
          formData?.assignTo?.previousAssignTo?.email?.toLowerCase() ||
        userDetails?.email?.toLowerCase() ===
          formData?.assignTo?.value?.email?.toLowerCase() ||
        formData?.answer?.value !== "" ? (
          <div className={styles.r4}>
            <div className={styles.item5}>
              <FloatingLabelTextarea
                value={formData?.answer?.value}
                placeholder="Answer"
                rows={5}
                isValid={formData?.answer?.isValid}
                errorMsg={formData?.answer?.errorMsg}
                disabled={!formData?.answer?.permission}
                onChange={(e: any) => {
                  const value = e.trimStart();
                  const { isValid, errorMsg } = validateField(
                    "Answer",
                    value,
                    formData?.answer?.validationRule
                  );
                  handleInputChange("answer", value, isValid, errorMsg);
                }}
              />
            </div>
          </div>
        ) : (
          <div />
        )}
        {userDetails.role === "Admin" && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <div>
              <CustomPeoplePicker
                labelText="Assigned To"
                isValid={formData?.assignTo?.isValid}
                errorMsg={formData?.assignTo?.errorMsg}
                selectedItem={[formData?.assignTo?.value]}
                readOnly={
                  (userDetails.email.toLowerCase() ===
                    formData?.assignTo?.previousAssignTo?.email.toLowerCase() ||
                    userDetails.email.toLowerCase() ===
                      formData?.assignTo?.value?.email?.toLowerCase()) &&
                  formData?.answer?.value !== ""
                }
                groupName={CONFIG.SPGroupName.QuestionCEO}
                onChange={(item: any) => {
                  const value = item?.[0];
                  assignedUser = value?.name ?? "";
                  const { isValid, errorMsg } = validateField(
                    "Assigned To",
                    item,
                    formData?.assignTo?.validationRule
                  );
                  handleInputChange("assignTo", value, isValid, errorMsg);
                }}
              />
              <div
                style={{
                  fontSize: "14px",
                  marginTop: "10px",
                }}
              >
                {assignToUsersList?.filter(
                  (val: any) => val?.Title === assignedUser
                )?.[0]?.JobTitle || ""}
              </div>
            </div>

            <Tooltip
              title={
                <div
                  style={{
                    padding: "10px",
                    textAlign: "center",
                    minHeight: "50px",
                    maxHeight: "200px",
                    overflow: "auto",
                  }}
                >
                  {assignToUsersList?.map((user: any, index: number) => {
                    return (
                      <div
                        key={index}
                        style={{
                          padding:
                            assignToUsersList.length - 1 === index
                              ? "0px"
                              : "0px 0px 10px 0px",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "16px",
                            marginBottom: "2px",
                          }}
                        >
                          {user?.Title ?? ""}
                        </p>
                        <p
                          style={{
                            fontSize: "12px",
                          }}
                        >
                          {user?.JobTitle
                            ? `( ${user?.JobTitle ?? ""} )`
                            : null}
                        </p>
                      </div>
                    );
                  })}
                </div>
              }
              placement="right"
              arrow
            >
              <IconButton>
                <InfoIcon />
              </IconButton>
            </Tooltip>
          </div>
        )}
      </div>,
    ],
    [
      <div key={2}>
        <FloatingLabelTextarea
          value={newFormData?.Description?.value ?? ""}
          size="XL"
          placeholder="Enter question"
          rows={5}
          isValid={newFormData?.Description.isValid}
          errorMsg={newFormData?.Description.errorMsg}
          onChange={(e: any) => {
            const value = e.trimStart();
            const { isValid, errorMsg } = validateField(
              "Question",
              value,
              newFormData?.Description?.validationRule
            );
            handleNewFormInputChange("Description", value, isValid, errorMsg);
          }}
        />
        <div className={styles.anonymous}>
          <Checkbox
            inputId="Anonymous"
            value="Anonymous"
            checked={newFormData?.Anonymous?.value}
            onChange={(e: any) => {
              const { isValid, errorMsg } = validateField(
                "Anonymous",
                e.checked,
                newFormData?.Anonymous?.validationRule
              );
              handleNewFormInputChange(
                "Anonymous",
                e.checked,
                isValid,
                errorMsg
              );
            }}
          />

          <label htmlFor="Anonymous" className="ml-2">
            Anonymous
          </label>

          <Tooltip
            style={{
              color: "red",
            }}
            title={
              <div
                style={{
                  padding: "10px",
                  minHeight: "50px",
                  maxHeight: "200px",
                  overflow: "auto",
                  fontSize: "12px",
                  lineHeight: "1.4",
                }}
              >
                Selecting this will hide your name from the users/leadership in
                the homepage when the question is finally displayed. However the
                system Admin can find your submission.
              </div>
            }
            placement="right"
            arrow
          >
            <IconButton>
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </div>
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
          if (
            userDetails.email ===
            formData?.assignTo?.previousAssignTo?.email.toLowerCase()
          ) {
            if (userDetails.role === "Admin") {
              userHandleSubmit(true);
            } else {
              userHandleSubmit(false);
            }
          } else if (userDetails.role === "Admin") {
            userHandleSubmit(true);
          }
          // await handleAnswerSubmit();
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
    const userDetails = await questionsCurrentUserRole(
      setUserDetails,
      setAssignToUsersList
    );

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
            return newsItem?.avatarUrl?.toLowerCase() === userDetails?.email;
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
            // return newsItem?.replies.length > 0;
            if (
              newsItem?.assignTo?.email.toLowerCase() === userDetails?.email &&
              newsItem.ID === searchParamsQusID &&
              !newsItem?.isActive
            ) {
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
                  value: newsItem?.replies[0]?.content || "",
                  permission:
                    userDetails.email ===
                    newsItem?.assignTo?.email.toLowerCase()
                      ? true
                      : false,
                  ID: newsItem?.ID,
                  validationRule: {
                    required:
                      userDetails.email ===
                      newsItem?.assignTo?.email.toLowerCase()
                        ? true
                        : false,
                    type: "string",
                  },
                },
                assignTo: {
                  ...formData.assignTo,
                  isValid: true,
                  value: newsItem?.assignTo?.name || "",
                  previousAssignTo: newsItem?.assignTo,
                  ID: newsItem?.ID,
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
      } else {
        filteredData = QuestionCEOIntranetData?.data?.filter(
          (newsItem: any) => {
            return newsItem?.avatarUrl?.toLowerCase() === userDetails?.email;
          }
        );
      }
    } else {
      if (curTab === CONFIG.QuestionsPageTabsName[0]) {
        filteredData = QuestionCEOIntranetData?.data?.filter(
          (newsItem: any) => {
            if (
              newsItem?.assignTo?.email.toLowerCase() === userDetails?.email &&
              newsItem.ID === searchParamsQusID &&
              !newsItem?.isActive
            ) {
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
                  value: newsItem?.replies[0]?.content || "",
                  permission:
                    userDetails.email ===
                    newsItem?.assignTo?.email.toLowerCase()
                      ? true
                      : false,
                  ID: newsItem?.ID,
                  validationRule: {
                    required:
                      userDetails.email ===
                      newsItem?.assignTo.email.toLowerCase()
                        ? true
                        : false,
                    type: "string",
                  },
                },
                assignTo: {
                  ...formData.assignTo,
                  isValid: true,
                  value: newsItem?.assignTo?.name || "",
                  previousAssignTo: newsItem?.assignTo,
                  ID: newsItem?.ID,
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
            return (
              newsItem?.isActive ||
              newsItem?.assignTo?.email.toLowerCase() === userDetails.email
            );
          }
        );
      } else {
        filteredData = QuestionCEOIntranetData?.data?.filter(
          (newsItem: any) => {
            return newsItem?.avatarUrl?.toLowerCase() === userDetails?.email;
          }
        );
      }
    }
    setSelectedTab(curTab);
    setCeoQuestionsdata([...filteredData].reverse());
    setShowCEOQuestions([...filteredData].reverse());
    setIsLoading(false);
  };

  useEffect(() => {
    if (QuestionCEOIntranetData?.data?.length > 0) {
      onLoadingFUN(selectedTab || CONFIG.QuestionsPageTabsName[0]);
    }
  }, [QuestionCEOIntranetData]);

  useEffect(() => {
    setIsLoading(true);
    const urlObj = new URL(window.location.href);
    const params = new URLSearchParams(urlObj.search);
    const ID = params.get("questionID");
    isActivityPage = params?.get("Page") === "activity" ? true : false;

    setSearchParamsQusID(Number(ID));
    getQuestionCeo(dispatch);
    dispatch(setMainSPContext(props?.context));

    getcurrentUser()
      .then((res: any) => {
        if (res) {
          setCurUser({ ...res });
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
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
            className="pi pi-arrow-circle-left"
            style={{ fontSize: "1.5rem", color: "#E0803D" }}
          />
          <p>Questions to Leadership</p>
        </div>
        <div className={styles.rightSection}>
          <div>
            <CustomInput
              noErrorMsg
              value={commonSearch?.Search}
              placeholder="Search"
              size="SM"
              onChange={(e: any) => {
                const value: string = e.trimStart();
                searchField.Search = value;
                setCommonSearch((prev: IPageSearchFields) => ({
                  ...prev,
                  Search: value,
                }));
                handleSearch([...ceoQuestionsdata]);
              }}
            />
          </div>
          <div
            className={styles.refreshBTN}
            onClick={(_) => {
              searchField.Search = "";
              searchField.Status = "";
              searchField.Date = null;
              setCommonSearch({ ...searchField });
              handleSearch([...ceoQuestionsdata]);
            }}
          >
            <i className="pi pi-refresh" />
          </div>
          {userDetails?.role !== "CEO" && (
            <div
              style={{
                display: "flex",
              }}
              className={styles.addNewbtn}
              onClick={() => {
                resetFormData(newFormData, setNewFormData);
                togglePopupVisibility(
                  setPopupController,
                  initialPopupController[1],
                  1,
                  "open",
                  "Create a question to leadership"
                );
              }}
            >
              <i
                className="pi pi-plus"
                style={{ fontSize: "1rem", color: "#fff" }}
              />
              Add question
            </div>
          )}
        </div>
      </div>

      {/* tabs */}
      <div className={styles.tabsContainer}>
        {CONFIG.QuestionsPageTabsName.map((str: string, i: number) => {
          if (str === CONFIG.QuestionsPageTabsName[1]) {
            if (userDetails.role !== "CEO") {
              return (
                <div
                  key={i}
                  style={{
                    borderBottom:
                      selectedTab === str ? "3px solid #e0803d" : "none",
                    cursor: "pointer",
                  }}
                  onClick={(_) => {
                    setIsLoading(true);
                    setPagination(CONFIG.PaginationData);
                    if (selectedTab !== str) {
                      searchField.Search = "";
                      searchField.Status = "";
                      searchField.Date = null;
                      setCommonSearch({ ...searchField });
                      getQuestionCeo(dispatch);
                    }
                    setSelectedTab(str);
                    onLoadingFUN(str);
                  }}
                >
                  {str}
                </div>
              );
            }
          } else if (str === CONFIG.QuestionsPageTabsName[2]) {
            if (userDetails.role === "CEO") {
              return (
                <div
                  key={i}
                  style={{
                    borderBottom:
                      selectedTab === str ? "3px solid #e0803d" : "none",
                    cursor: "pointer",
                  }}
                  onClick={(_) => {
                    setIsLoading(true);
                    setPagination(CONFIG.PaginationData);
                    if (selectedTab !== str) {
                      searchField.Search = "";
                      searchField.Status = "";
                      searchField.Date = null;
                      setCommonSearch({ ...searchField });
                      getQuestionCeo(dispatch);
                    }
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
                  cursor: "pointer",
                }}
                onClick={(_) => {
                  setIsLoading(true);
                  setPagination(CONFIG.PaginationData);
                  if (selectedTab !== str) {
                    searchField.Search = "";
                    searchField.Status = "";
                    searchField.Date = null;
                    setCommonSearch({ ...searchField });
                    getQuestionCeo(dispatch);
                  }
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

      {showCEOQuestions?.length === 0 ? (
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
          No questions found!
        </div>
      ) : (
        <div className={styles.bodyContainer}>
          {showCEOQuestions
            ?.slice(pagination.first, pagination.first + pagination.rows)
            ?.map((val: any, index: number) => {
              return (
                <div key={index} className={styles.cardSection}>
                  <div className={styles.cardQuestionSec}>
                    <Avatar
                      title={val?.Anonymous ? "Anonymous" : val?.Author}
                      className={styles.avatarCreatedBy}
                      shape="circle"
                      image={`/_layouts/15/userphoto.aspx?size=S&username=${
                        val?.Anonymous ? "" : val?.avatarUrl
                      }`}
                    />
                    <span title={val.title}>{val.title}</span>
                  </div>

                  {val?.replies?.length ? (
                    <div className={styles.cardAnsSec}>
                      {/* <div className={styles.cardAnsUserSec}>
                        <div className={styles.replayLable}>Answer :</div>
                      </div> */}
                      <Avatar
                        title={val?.assignTo?.name}
                        className={styles.ansAvatar}
                        image={`/_layouts/15/userphoto.aspx?size=S&username=${val?.assignTo?.email}`}
                        shape="circle"
                      />
                      <div
                        title={val?.replies?.[0]?.content}
                        className={styles.cardAnsContentSec}
                      >
                        {val?.replies?.[0]?.content}
                      </div>
                    </div>
                  ) : (
                    <div
                      className={styles.cardAnsSec}
                      style={{
                        color: "#adadad",
                        justifyContent: "center",
                      }}
                    >
                      Not answered yet!
                    </div>
                  )}

                  <div className={styles.cardFooterSec}>
                    {/* <div className={styles.cardHeader}> */}
                    {/* <div
                        className={styles.createdByDetail}
                        style={{
                          background: val?.Anonymous
                            ? "#e0803d2e"
                            : "#0b4d532e",
                        }}
                      >
                        <Avatar
                          className={styles.avatarCreatedBy}
                          shape="circle"
                          image={`/_layouts/15/userphoto.aspx?size=S&username=${
                            val?.Anonymous ? "" : val?.avatarUrl
                          }`}
                        />
                        <div
                          title={val?.Author}
                          className={styles.createdByName}
                          style={{
                            color: val?.Anonymous ? "#e0803d" : "#0b4d53",
                          }}
                        >
                          {val?.Anonymous ? "Anonymous" : val?.Author}
                        </div>
                      </div> */}
                    {/* <div className={styles.ansUserSec}>
                        <Avatar
                          className={styles.ansAvatar}
                          image={`/_layouts/15/userphoto.aspx?size=S&username=${val?.assignTo?.email}`}
                          shape="circle"
                        />
                        <div
                          title={val?.assignTo?.name}
                          className={styles.ansUserLable}
                        >
                          {val?.assignTo?.name}
                        </div>
                      </div> */}
                    {/* </div> */}
                    <div className={styles.pillWithDate}>
                      <div
                        style={{
                          display:
                            userDetails.role === "Admin" ? "flex" : "none",
                        }}
                        className={
                          val.isActive ? styles.activepill : styles.inactivepill
                        }
                      >
                        {val.isActive ? "Active" : "In Active"}
                      </div>
                      <div
                        className={styles.footerDateSec}
                        style={{
                          display: val?.replies?.length ? "flex" : "none",
                        }}
                      >
                        {val?.replies?.[0]?.date}
                      </div>
                    </div>

                    <div className={styles.actionSec}>
                      {userDetails.role === "Admin" &&
                        val?.replies?.length > 0 && (
                          <InputSwitch
                            checked={val.isActive}
                            className="sectionToggler"
                            onChange={(e) => {
                              setShowCEOQuestions((prevItems) =>
                                prevItems.map((item: any, idx: number) =>
                                  val?.ID === item?.ID
                                    ? { ...item, isActive: e.value }
                                    : item
                                )
                              );
                              changeQuestionActiveStatus(val.ID, e.value);
                            }}
                          />
                        )}

                      {((userDetails.role === "Admin" && !val.isActive) ||
                        (userDetails.email ===
                          val?.assignTo?.email?.toLowerCase() &&
                          !val.isActive)) && (
                        <i
                          onClick={() => {
                            assignedUser = val?.assignTo?.name ?? "";
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
                                value: val?.replies[0]?.content || "",
                                permission:
                                  userDetails.email.toLowerCase() ===
                                  val?.assignTo?.email?.toLowerCase()
                                    ? true
                                    : false,
                                ID: val?.ID,
                                validationRule: {
                                  required:
                                    userDetails.email ===
                                    val?.assignTo?.email?.toLowerCase()
                                      ? true
                                      : false,
                                  type: "string",
                                },
                              },
                              assignTo: {
                                ...formData.assignTo,
                                isValid: true,
                                value: val?.assignTo?.name || "",
                                previousAssignTo: val?.assignTo,
                                ID: val?.ID,
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
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {showCEOQuestions.length > 0 && (
        <div
          className="card"
          style={{
            padding: "4px 0px",
          }}
        >
          <Paginator
            first={pagination.first}
            rows={pagination.rows}
            totalRecords={totalRecords}
            onPageChange={onPageChange}
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink "
          />
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
