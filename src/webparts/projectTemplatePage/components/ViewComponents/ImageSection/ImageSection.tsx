/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-empty-function */

import { useEffect, useState } from "react";
import Popup from "../../../../../components/common/Popups/Popup";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../../../utils/popupUtils";
import CustomMultipleFileUpload from "../../../../../components/common/CustomInputFields/CustomMultipleFileUpload";
import { resetFormData, validateField } from "../../../../../utils/commonUtils";
import { CONFIG } from "../../../../../config/config";
import DefaultButton from "../../../../../components/common/Buttons/DefaultButton";
import { Add } from "@mui/icons-material";

const ImageSection = ({ value }: any) => {
  /* popup properties */
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

  const initialFormData: any = {
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
  const [formData, setFormData] = useState<any>({
    ...initialFormData,
  });

  const handleInputChange = async (
    field: string,
    value: any,
    isValid: boolean,
    errorMsg: string = ""
  ): Promise<void> => {
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

    // await getDocRepository().then(async (val: any[]) => {
    //   masterRes = [...val];
    //   await splitResponseDatas();
    // });
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
      const column: any = CONFIG.DocRepositoryColumn;

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
          <CustomMultipleFileUpload
            accept="image/*"
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
          await handleData(CONFIG.fileFlowPath, 0);
        },
      },
    ],
  ];

  useEffect(() => {}, []);
  return (
    <>
      <div style={{ position: "absolute", top: 10, right: 0 }}>
        <DefaultButton
          onlyIcon
          text={<Add />}
          btnType="primaryGreen"
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
      <img
        src={value?.images}
        alt="img"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          position: "relative",
        }}
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
    </>
  );
};
export default ImageSection;
