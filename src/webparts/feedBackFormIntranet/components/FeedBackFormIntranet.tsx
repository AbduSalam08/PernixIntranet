/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable  @typescript-eslint/no-use-before-define */
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./FeedBackFormIntranet.module.scss";
import "../../../assets/styles/style.css";
import { CONFIG } from "../../../config/config";
import {
  IFeedbackQusColumn,
  IFeedbackQusType,
  IFeedbackResColumn,
  IFeedbackResType,
  IFormFields,
  IUserData,
  IUserDetails,
} from "../../../interface/interface";
import { RoleAuth } from "../../../services/CommonServices";
import {
  addFeedbackQus,
  addFeedbackRes,
  getFeedBackDatas,
} from "../../../services/FeedbackIntranet/FeedbackIntranet";
import moment from "moment";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
import SectionHeaderIntranet from "../../../components/common/SectionHeaderIntranet/SectionHeaderIntranet";
import { resetFormData, validateField } from "../../../utils/commonUtils";
import CustomDateInput from "../../../components/common/CustomInputFields/CustomDateInput";
import CustomInput from "../../../components/common/CustomInputFields/CustomInput";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../utils/popupUtils";
import Popup from "../../../components/common/Popups/Popup";
import { Carousel } from "primereact/carousel";
import FloatingLabelTextarea from "../../../components/common/CustomInputFields/CustomTextArea";
import { Button } from "primereact/button";
import { sp } from "@pnp/sp";
import { ToastContainer } from "react-toastify";

/* Local interfaces */
interface IFeedbackField {
  Title: IFormFields;
  StartDate: IFormFields;
  EndDate: IFormFields;
}

interface IFeedbackResField {
  Answer: IFormFields;
}

/* Global variable creation */
let isAdmin: boolean = false;
let masterFeedBackQus: IFeedbackQusType[] = [];
let masterFeedBackRes: IFeedbackResType[] = [];
let currentUserData: IUserData;

const FeedBackFormIntranet = (props: any): JSX.Element => {
  /* Local variable creation */
  const dispatch = useDispatch();

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

  const initialResData: IFeedbackResField = {
    Answer: {
      value: "",
      isValid: true,
      errorMsg: "Answer is required.",
      validationRule: {
        required: true,
        type: "string",
      },
    },
  };

  /* State creation */
  const [isLoader, setIsLoader] = useState<boolean>(true);
  const [allFeedbackQuestion, setAllFeedbackQuestion] = useState<
    IFeedbackQusType[]
  >([]);
  const [popupController, setPopupController] = useState<any[]>(
    initialPopupController
  );
  const [formData, setFormData] = useState<IFeedbackField | any>({
    ...initialFormData,
  });
  const [isResponse, setIsResponse] = useState<boolean>(false);
  const [responseData, setResponseData] = useState<IFeedbackResField | any>({
    ...initialResData,
  });
  const [curQuestionId, setCurQuestionId] = useState<number | null>(null);

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

  const handleResChange = async (
    field: string,
    value: any,
    isValid: boolean,
    errorMsg: string = ""
  ): Promise<void> => {
    setResponseData((prevData: IFeedbackResField | any) => ({
      ...prevData,
      [field]: {
        ...prevData[field],
        value: value,
        isValid,
        errorMsg: isValid ? "" : errorMsg,
      },
    }));
  };

  const prepareDatas = async (): Promise<void> => {
    let tempArray: IFeedbackQusType[] = [];

    tempArray = await Promise.all(
      masterFeedBackQus?.filter(
        (val: IFeedbackQusType) =>
          Number(moment().format("YYYYMMDD")) >=
            Number(moment(val.StartDate).format("YYYYMMDD")) &&
          Number(moment().format("YYYYMMDD")) <=
            Number(moment(val.EndDate).format("YYYYMMDD"))
      )
    );

    tempArray = await Promise.all(
      tempArray?.filter(
        (val: IFeedbackQusType) =>
          !masterFeedBackRes?.some(
            (res: IFeedbackResType) =>
              res?.FeedbackQuestionId === val?.ID &&
              res?.CreatedBy?.ID === currentUserData?.ID
          )
      )
    );

    setAllFeedbackQuestion([...tempArray]);
    setIsLoader(false);
  };

  const getCurrentUserID = async (): Promise<void> => {
    const currentUser: any = await sp.web.currentUser.get();
    currentUserData = {
      ID: currentUser?.Id || null,
      Title: currentUser?.Title || "",
      Email: currentUser?.Email || "",
    };

    await prepareDatas();
  };

  const onLoadingFUN = async (): Promise<void> => {
    setIsLoader(true);
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

    await getCurrentUserID();
  };

  const handleResSubmit = async (): Promise<void> => {
    let data: any = {};
    const column: IFeedbackResColumn = CONFIG.FeedbackResColumn;

    data[column.Answer] = responseData?.Answer?.value ?? "";
    data[column.FeedbackQuestionId] = curQuestionId;

    const addResData: any = await addFeedbackRes({ ...data }, currentUserData);

    masterFeedBackRes = [addResData, ...masterFeedBackRes];
    resetFormData(responseData, setResponseData);
    setResponseData({ ...initialResData });
    setCurQuestionId(null);
    setIsResponse(false);
    await prepareDatas();
  };

  const handleSubmit = async (data: any): Promise<void> => {
    resetFormData(formData, setFormData);
    togglePopupVisibility(
      setPopupController,
      initialPopupController[0],
      0,
      "close"
    );

    const addedJSON: any = await addFeedbackQus(data);

    masterFeedBackQus = [addedJSON, ...masterFeedBackQus];
    await prepareDatas();
  };

  const handleData = async (): Promise<void> => {
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
      let data: any = {};
      const column: IFeedbackQusColumn = CONFIG.FeedbackQusColumn;

      data[column.Title] = formData?.Title?.value || "";
      data[column.StartDate] = formData?.StartDate?.value || null;
      data[column.EndDate] = formData?.EndDate?.value || null;

      await handleSubmit({ ...data });
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
            style={{
              width: "50%",
            }}
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
            style={{
              width: "50%",
            }}
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
          await handleData();
        },
      },
    ],
  ];

  const productTemplate = (val: IFeedbackQusType): JSX.Element => {
    return (
      <div className={styles.carouselContainer}>
        <div className={styles.CarouselTitle} title={val?.Title}>
          {val?.Title}
        </div>
        <div className={styles.CarouselTextArea}>
          <FloatingLabelTextarea
            value={responseData?.Answer?.value}
            placeholder="Answer"
            isValid={responseData.Answer.isValid}
            errorMsg={responseData.Answer.errorMsg}
            highLightBackground={true}
            rows={11}
            noErrorMsg
            onChange={(e: any) => {
              const value = e.trimStart();

              if (value?.length === 0) {
                setCurQuestionId(null);
                setIsResponse(false);
              } else {
                setCurQuestionId(val?.ID);
                setIsResponse(true);
              }

              const { isValid, errorMsg } =
                value?.length &&
                validateField(
                  CONFIG.FeedbackResColumn.Answer,
                  value,
                  responseData.Answer.validationRule
                );
              handleResChange(
                CONFIG.FeedbackResColumn.Answer,
                value,
                isValid,
                errorMsg
              );
            }}
          />
        </div>
      </div>
    );
  };

  useEffect(() => {
    onLoadingFUN();
  }, []);

  return (
    <div className={styles.container}>
      {isLoader ? (
        <div className={styles.LoaderContainer}>
          <CircularSpinner />
        </div>
      ) : (
        <div>
          {/* Header section */}
          <SectionHeaderIntranet
            title="Create a feedback question"
            label="Feedback form"
            removeAdd={!isAdmin}
            headerAction={() => {
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

          {/* Carousel section */}
          {allFeedbackQuestion.length ? (
            <div className={styles.PRCarouselContainer}>
              <Carousel
                value={allFeedbackQuestion}
                numScroll={1}
                numVisible={1}
                showIndicators={!isResponse}
                showNavigators={false}
                circular
                autoplayInterval={
                  isResponse
                    ? 0
                    : allFeedbackQuestion.length > 1
                    ? 6000
                    : 8.64e7
                }
                itemTemplate={productTemplate}
              />
              <div
                style={{
                  display: isResponse ? "flex" : "none",
                  height: "8px",
                }}
              ></div>
            </div>
          ) : (
            <div className={styles.noDataFound}>
              No feedback questions found!
            </div>
          )}

          {/* footer section */}
          <div
            className={styles.footerBTNSec}
            style={{
              justifyContent: allFeedbackQuestion.length
                ? "space-between"
                : "end",
            }}
          >
            <Button
              className={styles.sendBTN}
              style={{
                background: curQuestionId ? "#0b4d53" : "#a5a5a5",
                border: curQuestionId
                  ? "1px solid #0b4d53"
                  : "1px solid #a5a5a5",
                display: allFeedbackQuestion.length ? "flex" : "none",
              }}
              label="Send"
              disabled={curQuestionId ? false : true}
              onClick={() => {
                handleResSubmit();
              }}
            />
            <button
              className={styles.viewAllBTN}
              style={{
                display: isAdmin ? "flex" : "none",
              }}
              onClick={() => {
                window.open(
                  props.context.pageContext.web.absoluteUrl +
                    CONFIG.NavigatePage.FeedbackPage,
                  "_self"
                );
              }}
            >
              View all
            </button>
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
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedBackFormIntranet;
