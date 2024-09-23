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
// import { useSelector } from "react-redux";
const QuestionsCeoIntranet = (): JSX.Element => {
  const dispatch = useDispatch();

  const QuestionCEOIntranetData: any = useSelector((state: any) => {
    return state.QuestionCEOIntranetData.value;
  });

  console.log(QuestionCEOIntranetData, "QuestionCEOIntranetData");
  // interface IQuestion {
  //   title: string;
  //   content: string;
  //   date: string;
  //   avatarUrl: string;
  //   replies: IReply[];
  // }

  // interface IReply {
  //   content: string;
  //   date: string;
  //   avatarUrl: string;
  // }

  // const questions: IQuestion[] = [
  //   {
  //     title: "The future of analytics and business intelligence",
  //     content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
  //     date: "23/08/2024",
  //     avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
  //     replies: [
  //       {
  //         content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
  //         date: "26/08/2024",
  //         avatarUrl: "https://randomuser.me/api/portraits/men/34.jpg",
  //       },
  //     ],
  //   },

  //   {
  //     title: "The future of analytics and business intelligence",
  //     content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
  //     date: "23/08/2024",
  //     avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
  //     replies: [
  //       {
  //         content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
  //         date: "26/08/2024",
  //         avatarUrl: "https://randomuser.me/api/portraits/men/34.jpg",
  //       },
  //     ],
  //   },

  //   {
  //     title: "The future of analytics and business intelligence",
  //     content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
  //     date: "23/08/2024",
  //     avatarUrl: "Venkat@mydomain28.onmicrosoft.com",
  //     replies: [
  //       {
  //         content:
  //           "Lorem ipsum dolor sit amet, consectetur adipiscing elit Lorem ipsum dolor sit amet, consectetur adipiscing elit Lorem ipsum dolor sit amet, consectetur adipiscing elit Lorem ipsum dolor sit amet, consectetur adipiscing elit Lorem ipsum dolor sit amet, consectetur adipiscing elit Lorem ipsum dolor sit amet, consectetur adipiscing elit",
  //         date: "26/08/2024",
  //         avatarUrl: "Venkat@mydomain28.onmicrosoft.com",
  //       },
  //     ],
  //   },
  //   // Add more questions here
  // ];

  // const dispatch = useDispatch();
  // popup properties
  const initialPopupController = [
    {
      open: false,
      popupTitle: "Add Question of CEO",
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
      <div className={styles.addNewsGrid} key={1}>
        <FloatingLabelTextarea
          value={formData.Description.value}
          size="XL"
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

  useEffect(() => {
    getQuestionCeo(dispatch);
  }, [dispatch]);

  const productTemplate = (val: any) => {
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
          <i className="pi pi-clock" style={{ fontSize: "1rem" }}></i>
          {val.date}
        </p>

        <div>
          <div className={styles.questions}>
            <div className={styles.imgsection}>
              <Avatar
                className="qustionceo"
                image={`/_layouts/15/userphoto.aspx?size=S&username=${val?.replies[0]?.avatarUrl}`}
                shape="circle"

                // data-pr-tooltip={val.receiverName}
              />
            </div>
            <p className={styles.answer}>{val.replies[0]?.content}</p>
          </div>
          <p className={styles.date}>
            <i className="pi pi-clock" style={{ fontSize: "1rem" }}></i>
            {val.replies[0]?.date}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.quesToCEOContainer}>
      <SectionHeaderIntranet
        label={"Question to the CEO"}
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

      <div className={styles.contentSexction}>
        <Carousel
          value={QuestionCEOIntranetData?.data}
          numScroll={1}
          numVisible={1}
          showIndicators={true}
          showNavigators={false}
          circular
          autoplayInterval={
            QuestionCEOIntranetData?.data?.length > 1 ? 3000 : 8.64e7
          }
          // responsiveOptions={responsiveOptions}
          itemTemplate={productTemplate}
        />
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
