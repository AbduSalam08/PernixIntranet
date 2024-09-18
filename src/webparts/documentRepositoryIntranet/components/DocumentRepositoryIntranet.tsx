/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
import styles from "./DocumentRepositoryIntranet.module.scss";
import SectionHeaderIntranet from "../../../components/common/SectionHeaderIntranet/SectionHeaderIntranet";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../utils/popupUtils";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { resetFormData, validateField } from "../../../utils/commonUtils";
import CustomInput from "../../../components/common/CustomInputFields/CustomInput";
import Popup from "../../../components/common/Popups/Popup";
import ViewAll from "../../../components/common/ViewAll/ViewAll";
const folderIcon = require("../../../assets/images/svg/folderIcon.svg");

const DocumentRepositoryIntranet = (): JSX.Element => {
  const dispatch = useDispatch();
  console.log("dispatch: ", dispatch);

  // popup properties
  const initialPopupController = [
    {
      open: false,
      popupTitle: "New document",
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
        success: "News document successfully!",
        error: "Something went wrong!",
        successDescription: "",
        errorDescription:
          "An error occured while adding news, please try again later.",
        inprogress: "Adding new document, please wait...",
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
    URL: {
      value: "",
      isValid: true,
      errorMsg: "Invalid title",
      validationRule: { required: true, type: "url" },
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
      // await addNews(formData, setPopupController, 0);
    } else {
      console.log("Form contains errors");
    }
  };

  const popupInputs: any[] = [
    [
      <div className={styles.addDocGrid} key={1}>
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

        <CustomInput
          value={formData.URL.value}
          placeholder="Paste URL"
          isValid={formData.URL.isValid}
          errorMsg={formData.URL.errorMsg}
          onChange={(e) => {
            const value = e;
            const { isValid, errorMsg } = validateField(
              "URL",
              value,
              formData.URL.validationRule
            );
            handleInputChange("URL", value, isValid, errorMsg);
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

  const foldersData = [
    {
      title: "Project Documents",
      url: "https://example.com/project-documents",
    },
    {
      title: "Marketing Assets",
      url: "https://example.com/marketing-assets",
    },
    {
      title: "Financial Reports",
      url: "https://example.com/financial-reports",
    },
    {
      title: "Client Presentations",
      url: "https://example.com/client-presentations",
    },
    {
      title: "Team Photos",
      url: "https://example.com/team-photos",
    },
    {
      title: "Contracts and Agreements",
      url: "https://example.com/contracts-agreements",
    },
    {
      title: "Design Mockups",
      url: "https://example.com/design-mockups",
    },
  ];

  const folderTemplate = (item: any, index: number): any => {
    return (
      <div className={styles.folderCard} key={index}>
        <img src={folderIcon} alt="folder image" />
        <span>{item?.title}</span>
      </div>
    );
  };

  return (
    <div className={styles.docRepoContainer}>
      <SectionHeaderIntranet
        label="Document Repository"
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

      {/* <Carousel
        className={styles.docCarousel}
        value={foldersData}
        numVisible={7}
        numScroll={2}
        responsiveOptions={responsiveOptions}
        itemTemplate={folderTemplate}
      /> */}
      <div className={styles.docCarousel}>
        {foldersData?.map((item: any, index: number) => {
          return folderTemplate(item, index);
        })}
      </div>

      <ViewAll />

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

export default DocumentRepositoryIntranet;
