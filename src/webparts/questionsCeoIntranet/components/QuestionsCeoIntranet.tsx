/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-floating-promises */

import { Avatar } from "primereact/avatar";
import SectionHeaderIntranet from "../../../components/common/SectionHeaderIntranet/SectionHeaderIntranet";
import styles from "./QuestionsCeoIntranet.module.scss";
import { Carousel } from "primereact/carousel";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../utils/popupUtils";
import { resetFormData, validateField } from "../../../utils/commonUtils";
import { useEffect, useState } from "react";
import Popup from "../../../components/common/Popups/Popup";
import "../../../assets/styles/style.css";
import FloatingLabelTextarea from "../../../components/common/CustomInputFields/CustomTextArea";
import {
  addQuestionCeo,
  getQuestionCeo,
} from "../../../services/QuestionCEOIntranet/QuestionCEOIntranet";
import { useDispatch, useSelector } from "react-redux";
import ViewAll from "../../../components/common/ViewAll/ViewAll";
import { CONFIG } from "../../../config/config";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
// import { useSelector } from "react-redux";
const QuestionsCeoIntranet = (props: any): JSX.Element => {
  const dispatch = useDispatch();

  const QuestionCEOIntranetData: any = useSelector((state: any) => {
    return state.QuestionCEOIntranetData.value;
  });

  console.log(QuestionCEOIntranetData, "QuestionCEOIntranetData");

  // const dispatch = useDispatch();
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
  console.log("CEOQuestions", CEOQuestions);

  // const newsIntranetData: any = useSelector((state: any) => {
  //   return state.NewsIntranetData.value;
  // });

  const [formData, setFormData] = useState<any>({
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
      await addQuestionCeo(formData, setPopupController, 0, dispatch);
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
  }, [dispatch]);

  const handlenavigate = (): void => {
    window.open(
      props.context.pageContext.web.absoluteUrl +
        CONFIG.NavigatePage.QuestionsCEOPage,
      "_self"
    );
  };

  const productTemplate = (val: any): JSX.Element => {
    return (
      <div>
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
          <i className="pi pi-clock" style={{ fontSize: "1rem" }} />
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
            <p className={styles.answer}>{val.replies[0]?.content}</p>
          </div>
          <p className={styles.date}>
            <i className="pi pi-clock" style={{ fontSize: "1rem" }} />
            {val.replies[0]?.date}
          </p>
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
        label={"Question to CEO"}
        headerAction={() => {
          togglePopupVisibility(
            setPopupController,
            initialPopupController[0],
            0,
            "open",
            "Submit a question to CEO"
          );
          resetFormData(formData, setFormData);
        }}
      />

      <div className={styles.contentSection}>
        <Carousel
          value={CEOQuestions}
          numScroll={1}
          numVisible={1}
          showIndicators={true}
          showNavigators={false}
          circular
          autoplayInterval={CEOQuestions?.length > 1 ? 3000 : 8.64e7}
          // responsiveOptions={responsiveOptions}
          itemTemplate={productTemplate}
        />
      </div>
      <ViewAll onClick={handlenavigate} />

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
