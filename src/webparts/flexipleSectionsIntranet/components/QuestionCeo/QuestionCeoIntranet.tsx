/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable  @typescript-eslint/no-var-requires */

import { Avatar } from "primereact/avatar";
import styles from "../QuestionCeo/QuestionCeoIntranet.module.scss";
import { Carousel } from "primereact/carousel";
import { useEffect, useState } from "react";
import "../../../../assets/styles/style.css";
import { useDispatch, useSelector } from "react-redux";
import {
  addQuestionCeo,
  getcurrentUser,
  getQuestionCeo,
} from "../../../../services/QuestionCEOIntranet/QuestionCEOIntranet";
import FloatingLabelTextarea from "../../../../components/common/CustomInputFields/CustomTextArea";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../../utils/popupUtils";
import { CONFIG } from "../../../../config/config";
import CircularSpinner from "../../../../components/common/Loaders/CircularSpinner";
import SectionHeaderIntranet from "../../../../components/common/SectionHeaderIntranet/SectionHeaderIntranet";
import ViewAll from "../../../../components/common/ViewAll/ViewAll";
import Popup from "../../../../components/common/Popups/Popup";
import { resetFormData, validateField } from "../../../../utils/commonUtils";
// import { ToastContainer } from "react-toastify";
import { Checkbox } from "primereact/checkbox";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";

// const errorGrey = require("../../../../images/svg/errorGrey.svg");
const errorGrey = require("../../../../assets/images/svg/errorGrey.svg");

const QuestionsCeoIntranet = ({ props }: any): JSX.Element => {
  const dispatch = useDispatch();

  const QuestionCEOIntranetData: any = useSelector((state: any) => {
    return state.QuestionCEOIntranetData.value;
  });

  // popup properties
  const initialPopupController = [
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

  const [popupController, setPopupController] = useState(
    initialPopupController
  );
  const [CEOQuestions, setCEOQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [curUser, setCurUser] = useState<any>({});
  console.log("curUser: ", curUser);
  const [formData, setFormData] = useState<any>({
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

  const handleSubmit = async (): Promise<any> => {
    let hasErrors = false;

    // Validate each field and update the state with error messages
    const updatedFormData = Object.keys(formData).reduce((acc, key) => {
      const fieldData = formData[key];
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
      await addQuestionCeo(formData, curUser);
      await getQuestionCeo(dispatch);
    } else {
      console.log("Form contains errors");
    }
  };

  const popupInputs: any[] = [
    [
      <div key={1}>
        <FloatingLabelTextarea
          value={formData.Description.value}
          size="XL"
          placeholder="Enter question"
          rows={5}
          isValid={formData.Description.isValid}
          errorMsg={formData.Description.errorMsg}
          onChange={(e: any) => {
            const value = e.trimStart();
            const { isValid, errorMsg } = validateField(
              "Question",
              value,
              formData.Description.validationRule
            );
            handleInputChange("Description", value, isValid, errorMsg);
          }}
        />

        <div className={styles.anonymous}>
          <Checkbox
            inputId="Anonymous"
            value="Anonymous"
            checked={formData?.Anonymous?.value}
            onChange={(e: any) => {
              const { isValid, errorMsg } = validateField(
                "Anonymous",
                e.checked,
                formData?.Anonymous?.validationRule
              );
              handleInputChange("Anonymous", e.checked, isValid, errorMsg);
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
        disabled: !Object.keys(formData).every((key) => formData[key].isValid),
        size: "large",
        onClick: async () => {
          await handleSubmit();
        },
      },
    ],
  ];

  useEffect(() => {
    if (QuestionCEOIntranetData?.data?.length > 0) {
      setIsLoading(true);
      const filteredData = QuestionCEOIntranetData?.data
        ?.filter((item: any) => item.isActive)
        .reverse()
        .slice(0, 5);
      setCEOQuestions([...filteredData]);
      setIsLoading(false);
    }
  }, [QuestionCEOIntranetData]);

  useEffect(() => {
    getQuestionCeo(dispatch);
    getcurrentUser()
      .then((res: any) => {
        res && setCurUser({ ...res });
      })
      .catch((err: any) => {
        console.log(err);
      });
  }, [dispatch]);

  const productTemplate = (val: any): JSX.Element => {
    return (
      <div className={styles.Container}>
        <div className={styles.questions}>
          <div className={styles.imgsection}>
            <Avatar
              className="qustionceo"
              image={`/_layouts/15/userphoto.aspx?size=S&username=${
                val?.Anonymous
                  ? "https://randomuser.me/api/portraits/placeholder.jpg"
                  : val?.avatarUrl
              }`}
              shape="circle"
              style={{
                width: "25px !important",
                height: "25px !important",
              }}
            />
          </div>
          <p className={styles.ques} title={val.title}>
            {val.title}
          </p>
        </div>

        <div>
          <div className={styles.answer}>
            <div className={styles.imgsection}>
              <Avatar
                className="qustionceo"
                image={`/_layouts/15/userphoto.aspx?size=S&username=${val?.replies[0]?.avatarUrl}`}
                shape="circle"
                style={{
                  width: "25px !important",
                  height: "25px !important",
                }}
              />
            </div>
            <p title={val.replies[0]?.content}>{val.replies[0]?.content}</p>
          </div>

          <p className={styles.date}>Posted on : {val.date}</p>
        </div>
      </div>
    );
  };

  return isLoading ? (
    <div className={styles.LoaderContainer}>
      <CircularSpinner />
    </div>
  ) : (
    <div className={styles.quesToCEOContainer}>
      <SectionHeaderIntranet
        label={"Questions to Leadership"}
        title="Add a question"
        headerAction={() => {
          togglePopupVisibility(
            setPopupController,
            initialPopupController[0],
            0,
            "open",
            "Create a question to leadership"
          );
          resetFormData(formData, setFormData);
        }}
      />

      <div className={styles.carouselWrapper}>
        <div className={styles.contentSection}>
          {CEOQuestions?.length == 0 ? (
            <div className="errorWrapper" style={{ height: "50vh" }}>
              <img src={errorGrey} alt="Error" />
              <span className="disabledText">{"No questions found!"}</span>
            </div>
          ) : (
            <Carousel
              value={CEOQuestions}
              numScroll={1}
              numVisible={1}
              showIndicators={true}
              showNavigators={false}
              circular
              autoplayInterval={CEOQuestions?.length > 1 ? 8.64e7 : 8.64e7}
              // responsiveOptions={responsiveOptions}
              itemTemplate={productTemplate}
            />
          )}
        </div>
      </div>
      <ViewAll
        onClick={() => {
          window.open(
            props.context.pageContext.web.absoluteUrl +
              CONFIG.NavigatePage.QuestionsCEOPage,
            "_self"
          );
        }}
      />

      {/* Toast message section */}
      {/* <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      /> */}

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
              initialPopupController[0],
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
  );
};

export default QuestionsCeoIntranet;
