/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import SectionHeaderIntranet from "../../../components/common/SectionHeaderIntranet/SectionHeaderIntranet";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../utils/popupUtils";
import NewsCard from "./NewsCard/NewsCard";
import styles from "./NewsIntranet.module.scss";
import Popup from "../../../components/common/Popups/Popup";
import CustomInput from "../../../components/common/CustomInputFields/CustomInput";
import CustomDateInput from "../../../components/common/CustomInputFields/CustomDateInput";
import FloatingLabelTextarea from "../../../components/common/CustomInputFields/CustomTextArea";
import CustomDropDown from "../../../components/common/CustomInputFields/CustomDropDown";
import CustomFileUpload from "../../../components/common/CustomInputFields/CustomFileUpload";
import {
  addNews,
  getAllNewsData,
} from "../../../services/newsIntranet/newsInranet";
import { resetFormData, validateField } from "../../../utils/commonUtils";
import { useDispatch, useSelector } from "react-redux";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
import ViewAll from "../../../components/common/ViewAll/ViewAll";
import { CONFIG } from "../../../config/config";
import { RoleAuth } from "../../../services/CommonServices";
// const PernixBannerImage = require("../../../assets/images/svg/PernixBannerImage.svg");
const errorGrey = require("../../../assets/images/svg/errorGrey.svg");

const NewsIntranet = (props: any): JSX.Element => {
  const dispatch = useDispatch();
  // popup properties
  const initialPopupController = [
    {
      open: false,
      popupTitle: "Add News",
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
        success: "News added successfully!",
        error: "Something went wrong!",
        successDescription: "The new news 'ABC' has been added successfully.",
        errorDescription:
          "An error occured while adding news, please try again later.",
        inprogress: "Adding new news, please wait...",
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
      errorMsg: "Invalid title",
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
    Status: {
      value: "",
      isValid: true,
      errorMsg: "Status is required",
      validationRule: { required: true, type: "string" },
    },
    thumbnail: {
      value: null,
      isValid: true,
      errorMsg: "Invalid file",
      validationRule: { required: true, type: "file" },
    },
    Description: {
      value: "",
      isValid: true,
      errorMsg: "This field is required",
      validationRule: { required: true, type: "string" },
    },
  });

  const newsIntranetData: any = useSelector((state: any) => {
    return state.NewsIntranetData.value;
  });
  const currentUserDetails: any = useSelector(
    (state: any) => state?.MainSPContext?.currentUserDetails
  );
  console.log("News_Admin currentUserDetails: ", currentUserDetails);

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
      await addNews(formData, setPopupController, 0);
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

        <CustomDropDown
          value={formData.Status.value}
          options={["Active", "In Active"]}
          placeholder="Status"
          isValid={formData.Status.isValid}
          errorMsg={formData.Status.errorMsg}
          onChange={(value) => {
            const { isValid, errorMsg } = validateField(
              "Status",
              value,
              formData.Status.validationRule
            );
            handleInputChange("Status", value, isValid, errorMsg);
          }}
        />

        <CustomFileUpload
          accept="image/png,image/svg"
          value={formData.thumbnail.value?.name}
          onFileSelect={(file) => {
            console.log("file: ", file);
            const { isValid, errorMsg } = validateField(
              "thumbnail",
              file ? file.name : "",
              formData.thumbnail.validationRule
            );
            handleInputChange("thumbnail", file, isValid, errorMsg);
          }}
          placeholder="Thumbnail"
          isValid={formData.thumbnail.isValid}
          errMsg={formData.thumbnail.errorMsg}
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
  const handlenavigate = (): void => {
    window.open(
      props.context.pageContext.web.absoluteUrl + CONFIG.NavigatePage.NewsPage,
      "_self"
    );
  };

  useEffect(() => {
    RoleAuth(
      CONFIG.SPGroupName.Pernix_Admin,
      { highPriorityGroups: [CONFIG.SPGroupName.News_Admin] },
      dispatch
    );
    getAllNewsData(dispatch);
  }, []);

  return (
    <div className={styles.newsContainer}>
      <SectionHeaderIntranet
        label={"News"}
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

      <div className={styles.newsContainerWrapper}>
        {newsIntranetData?.isLoading ? (
          <CircularSpinner />
        ) : newsIntranetData?.error ? (
          <div className="errorWrapper">
            <img src={errorGrey} alt="Error" />
            <span className="disabledText">{newsIntranetData?.error}</span>
          </div>
        ) : (
          newsIntranetData?.data
            ?.slice(-3)
            .map((item: any, idx: number) => (
              <NewsCard
                title={item?.title}
                imageUrl={item?.imageUrl}
                key={idx}
                description={item?.description}
                noActions={true}
                noStatus={true}
              />
            ))
        )}
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

            if (popupData?.isLoading?.success) {
              getAllNewsData(dispatch);
            }
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

export default NewsIntranet;
