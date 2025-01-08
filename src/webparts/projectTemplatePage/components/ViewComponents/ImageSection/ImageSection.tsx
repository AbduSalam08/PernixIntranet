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
import {
  addBannerImages,
  getFolderFiles,
} from "../../../../../services/ProjectTemplate/ProjectTemplate";
import { Carousel } from "primereact/carousel";
import CircularSpinner from "../../../../../components/common/Loaders/CircularSpinner";

const ImageSection = ({ value }: any) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [images, setImages] = useState<any>([]);
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
    togglePopupVisibility(
      setPopupController,
      initialPopupController[0],
      0,
      "close"
    );

    let x = `${window.location.pathname
      .split("/", 3)
      .join("/")}/ProjectTemplate/${value?.projectName}/BannerImages`;

    await addBannerImages(formData, x);

    const transformedFiles = formData?.Content?.value?.map((val: any) => ({
      name: val.name,
      serverRelativeUrl: `${window.location.pathname
        .split("/", 3)
        .join("/")}/ProjectTemplate/${value?.projectName}/BannerImages/${
        val.name
      }`,
    }));

    setImages((prevImages: any) => [...prevImages, ...transformedFiles]);

    resetFormData(formData, setFormData);

    debugger;

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

  useEffect(() => {
    setIsLoading(true);

    let x = `${window.location.pathname
      .split("/", 3)
      .join("/")}/ProjectTemplate/${value?.projectName}/BannerImages`;
    getFolderFiles(x).then((res) => {
      const transformedFiles = res?.map((val: any) => ({
        name: val.Name,
        serverRelativeUrl: val.ServerRelativeUrl,
      }));
      console.log("Transformed Files:", transformedFiles);

      setImages([...transformedFiles]);
      setIsLoading(false);
      return transformedFiles;
    });
  }, []);

  const itemTemplate = (item: any) => (
    <div style={{ position: "relative", height: "430px", overflow: "hidden" }}>
      {/* Default Button */}
      <div
        style={{ position: "absolute", top: "10px", right: "10px", zIndex: 10 }}
      >
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

      {/* Image */}
      <img
        src={item?.serverRelativeUrl}
        alt="img"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>
  );
  return (
    <>
      {isLoading ? (
        <CircularSpinner />
      ) : (
        <div style={{ position: "relative" }}>
          {/* Carousel */}
          <Carousel
            value={images || []}
            itemTemplate={itemTemplate}
            numVisible={1}
            numScroll={1}
            circular
            autoplayInterval={230000000000000}
            style={{ width: "100%" }}
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
