/* eslint-disable   @typescript-eslint/no-var-requires */
/* eslint-disable    @typescript-eslint/no-floating-promises */

import DefaultButton from "../../../../../components/common/Buttons/DefaultButton";
import styles from "./Documents.module.scss";
const folderIcon = require("../../../../../assets/images/svg/folderIcon.svg");
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useState } from "react";
import { Add } from "@mui/icons-material";
import Popup from "../../../../../components/common/Popups/Popup";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../../../utils/popupUtils";
import { resetFormData, validateField } from "../../../../../utils/commonUtils";
import CustomMultipleFileUpload from "../../../../../components/common/CustomInputFields/CustomMultipleFileUpload";
import CustomInput from "../../../../../components/common/CustomInputFields/CustomInput";
import {
  IDocRepositoryColumn,
  IFormFields,
} from "../../../../../interface/interface";
import { CONFIG } from "../../../../../config/config";
import { addDocRepository } from "../../../../../services/ProjectTemplate/ProjectTemplate";
interface IDocField {
  FolderName: IFormFields;
  Content: IFormFields;
}
const Documents = ({ value }: any) => {
  const [isOpen, setIsOpen] = useState(false);

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

  const initialFormData: IDocField = {
    FolderName: {
      value: "",
      isValid: true,
      errorMsg: "Please enter file name.",
      validationRule: {
        required: true,
        type: "string",
      },
    },
    Content: {
      value: null,
      isValid: true,
      errorMsg: "",
      validationRule: {
        required: false,
        type: "file",
      },
    },
  };

  const [popupController, setPopupController] = useState<any[]>(
    initialPopupController
  );
  const [formData, setFormData] = useState<IDocField | any>({
    ...initialFormData,
  });

  /* Functions creation */
  const handleInputChange = async (
    field: string,
    value: any,
    isValid: boolean,
    errorMsg: string = ""
  ): Promise<void> => {
    setFormData((prevData: IDocField | any) => ({
      ...prevData,
      [field]: {
        ...prevData[field],
        value: value,
        isValid,
        errorMsg: isValid ? "" : errorMsg,
      },
    }));
  };

  const handleSubmit = async (
    data: any,
    folderPath: string = CONFIG.fileFlowPath,
    idx: number
  ): Promise<void> => {
    resetFormData(formData, setFormData);
    togglePopupVisibility(
      setPopupController,
      initialPopupController[idx],
      idx,
      "close"
    );

    await addDocRepository(data, folderPath, "master_folder");
  };

  const handleData = async (folderPath: string, idx: number): Promise<void> => {
    let hasErrors: boolean = false;

    const updatedFormData = Object.keys(formData).reduce((acc, key) => {
      const fieldData = formData[key];
      let { isValid, errorMsg } = validateField(
        key,
        fieldData.value,
        fieldData?.validationRule
      );

      if (!isValid) {
        hasErrors = true;
      }

      // else if (key === "FolderName") {
      //   isValid = !filDocDatas?.some(
      //     (val: IDocRepository) =>
      //       val.Content.fileType !== "file" &&
      //       val.Content.name.toLowerCase() ===
      //         formData?.FolderName?.value?.trim()?.toLowerCase()
      //   );
      //   hasErrors = !isValid;
      //   errorMsg = !isValid ? "Folder name already exists." : "";
      // }

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
      const column: IDocRepositoryColumn = CONFIG.DocRepositoryColumn;

      data[column.FolderName] = formData?.FolderName?.value || "";
      data[column.Content] = formData?.Content?.value || null;

      await handleSubmit({ ...data }, folderPath, idx);
    } else {
      console.log("Form contains errors");
    }
  };

  const popupInputs: any[] = [
    [
      <div key={1}>
        <div>
          <CustomInput
            value={formData.FolderName.value}
            placeholder="Folder name"
            isValid={formData.FolderName.isValid}
            errorMsg={formData.FolderName.errorMsg}
            onChange={(e: any) => {
              const value = e.trimStart();
              const { isValid, errorMsg } = validateField(
                "FolderName",
                value,
                formData.FolderName.validationRule
              );
              handleInputChange("FolderName", value, isValid, errorMsg);
            }}
          />
        </div>
        <div>
          <CustomMultipleFileUpload
            accept="application/*"
            placeholder="Click to upload a file"
            multiple
            value={formData?.Content?.value ?? []}
            onFileSelect={(e: any) => {
              const value: any = e;
              const { isValid, errorMsg } = validateField(
                "Content",
                value?.name || null,
                formData.Content.validationRule
              );
              handleInputChange("Content", value || null, isValid, errorMsg);
            }}
            isValid={formData.Content.isValid}
            errMsg={formData.Content.errorMsg}
          />
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
          let x = `${window.location.pathname
            .split("/", 3)
            .join("/")}/ProjectTemplate/${value?.projectName}/Documents`;
          console.log("x: ", x);

          await handleData(x, 0);
        },
      },
    ],
  ];

  const toggleAccordion = (): void => {
    setIsOpen(!isOpen);
  };
  return (
    <div>
      <div className={styles.accordion}>
        <div className={styles.accordionheader} onClick={toggleAccordion}>
          <p className={styles.accordionheading}>Documents</p>
          <DefaultButton
            text={isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            btnType="primaryGreen"
            onlyIcon
          />
          {/* <span className="accordion-icon">{isOpen ? "-" : "+"}</span> */}
        </div>
        {isOpen && (
          <>
            <div className={styles.addicon}>
              <DefaultButton
                text={<Add />}
                btnType="primaryGreen"
                onlyIcon
                onClick={() => {
                  togglePopupVisibility(
                    setPopupController,
                    initialPopupController[0],
                    0,
                    "open"
                  );
                }}
              />
            </div>
            <div className={styles.docCarousel}>
              <div
                className={styles.folderCard}
                key={1}
                // onClick={() => {
                //   localStorage.removeItem(CONFIG.selMasterFolder);
                //   localStorage.setItem(
                //     CONFIG.selMasterFolder,
                //     JSON.stringify({
                //       Name: item?.Content?.name,
                //       Path: item?.Content?.ServerRelativeUrl,
                //     })
                //   );
                //   window.open(
                //     props.context.pageContext.web.absoluteUrl +
                //       CONFIG.NavigatePage.DocRepositoryPage,
                //     "_self"
                //   );
                // }}
              >
                <img src={folderIcon} alt="folder image" />
                <span>{"test"}</span>
              </div>
            </div>
          </>
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
export default Documents;
