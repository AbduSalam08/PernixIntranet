/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
import styles from "./DocumentRepositoryIntranet.module.scss";
import SectionHeaderIntranet from "../../../components/common/SectionHeaderIntranet/SectionHeaderIntranet";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../utils/popupUtils";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetFormData, validateField } from "../../../utils/commonUtils";
import CustomInput from "../../../components/common/CustomInputFields/CustomInput";
import Popup from "../../../components/common/Popups/Popup";
import ViewAll from "../../../components/common/ViewAll/ViewAll";
import {
  IAttachObj,
  IDocRepository,
  IDocRepositoryColumn,
  IFormFields,
  IUserDetails,
} from "../../../interface/interface";
import { RoleAuth } from "../../../services/CommonServices";
import { CONFIG } from "../../../config/config";
import {
  addDocRepository,
  getDocRepository,
} from "../../../services/docRepositoryIntranet/docRepositoryIntranet";
import CustomMultipleFileUpload from "../../../components/common/CustomInputFields/CustomMultipleFileUpload";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";

/* Interface creation */
interface IDocField {
  FolderName: IFormFields;
  Content: IFormFields;
}

/* Global variable creation */
const folderIcon = require("../../../assets/images/svg/folderIcon.svg");

let isAdmin: boolean = false;
let masterRes: any[] = [];
let masterDocDatas: IDocRepository[] = [];

const DocumentRepositoryIntranet = (props: any): JSX.Element => {
  /* Local variable creation */
  const dispatch = useDispatch();

  const currentUserDetails: IUserDetails = useSelector(
    (state: any) => state?.MainSPContext?.currentUserDetails
  );
  isAdmin = currentUserDetails.role === CONFIG.RoleDetails.user ? false : true;

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

  /* State creation */
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filDocDatas, setFilDocDatas] = useState<IDocRepository[]>([]);
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

  const curItemDatasFilter = async (path: string): Promise<boolean> => {
    let isAvailable: boolean = false;

    isAvailable = masterRes?.some((val: any) => val.FileDirRef === path);

    return isAvailable;
  };

  const splitResponseDatas = async (): Promise<void> => {
    let filMasterFolder: IDocRepository[] = [];
    masterDocDatas = [];

    filMasterFolder = await Promise.all(
      masterRes?.filter(
        (val: any) =>
          val.FileSystemObjectType === 1 &&
          `${CONFIG.fileFlowPath}/${val.FileLeafRef}` === val.FileRef &&
          val.IsActive
      )
    );

    masterDocDatas = await Promise.all(
      filMasterFolder?.map(async (val: any) => {
        const masObjAttach: IAttachObj = {
          isSubFiles: await curItemDatasFilter(val.FileRef),
          name: val?.FileLeafRef,
          content: [],
          fileType: "master_folder",
          ServerRelativeUrl: val?.FileRef,
        };

        return {
          ID: val?.ID || null,
          Content: masObjAttach,
          Priority: val?.Priority || "",
          IsActive: val?.IsActive || false,
        };
      })
    );

    await Promise.all(
      masterDocDatas?.sort((a: IDocRepository, b: IDocRepository) => {
        const priorityComparison = Number(a?.Priority) - Number(b?.Priority);

        if (priorityComparison === 0) {
          return a?.Content?.name.localeCompare(b?.Content?.name);
        }

        return priorityComparison;
      })
    );

    setFilDocDatas([...masterDocDatas]);
    setIsLoading(false);
  };

  const handleSubmit = async (
    data: any,
    folderPath: string = CONFIG.fileFlowPath,
    idx: number
  ): Promise<void> => {
    await addDocRepository(
      data,
      folderPath,
      setPopupController,
      idx,
      "master_folder"
    );

    await getDocRepository().then(async (val: any[]) => {
      masterRes = [...val];
      await splitResponseDatas();
    });
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
      } else if (key === "FolderName") {
        isValid = !filDocDatas?.some(
          (val: IDocRepository) =>
            val.Content.fileType !== "file" &&
            val.Content.name.toLowerCase() ===
              formData?.FolderName?.value?.trim()?.toLowerCase()
        );
        hasErrors = !isValid;
        errorMsg = !isValid ? "Folder name already exists." : "";
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
      const column: IDocRepositoryColumn = CONFIG.DocRepositoryColumn;

      data[column.FolderName] = formData?.FolderName?.value || "";
      data[column.Content] = formData?.Content?.value || null;

      await handleSubmit({ ...data }, folderPath, idx);
    } else {
      console.log("Form contains errors");
    }
  };

  const onLoadingFUN = async (): Promise<void> => {
    await RoleAuth(
      CONFIG.SPGroupName.Pernix_Admin,
      {
        highPriorityGroups: [CONFIG.SPGroupName.Documentrepository_Admin],
      },
      dispatch
    );

    await getDocRepository().then(async (val: any[]) => {
      masterRes = [...val];
      await splitResponseDatas();
    });
  };

  const popupInputs: any[] = [
    [
      <div className={styles.popupLayoutDesign} key={1}>
        <div className={styles.firstRow}>
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
        <div className={styles.secondRow}>
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
          await handleData(CONFIG.fileFlowPath, 0);
        },
      },
    ],
  ];

  useEffect(() => {
    setIsLoading(true);
    onLoadingFUN();
  }, []);

  const folderTemplate = (item: IDocRepository, index: number): JSX.Element => {
    return (
      <div
        className={styles.folderCard}
        key={index}
        onClick={() => {
          localStorage.removeItem(CONFIG.selMasterFolder);
          localStorage.setItem(
            CONFIG.selMasterFolder,
            JSON.stringify({
              Name: item?.Content?.name,
              Path: item?.Content?.ServerRelativeUrl,
            })
          );
          window.open(
            props.context.pageContext.web.absoluteUrl +
              CONFIG.NavigatePage.DocRepositoryPage,
            "_self"
          );
        }}
      >
        <img src={folderIcon} alt="folder image" />
        <span>{item?.Content?.name}</span>
      </div>
    );
  };

  return (
    <div className={styles.docRepoContainer}>
      {isLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "auto",
          }}
        >
          <CircularSpinner />
        </div>
      ) : (
        <>
          <SectionHeaderIntranet
            label="Document Repository"
            title="Create a new document"
            removeAdd={!isAdmin}
            headerAction={() => {
              resetFormData(formData, setFormData);
              togglePopupVisibility(
                setPopupController,
                initialPopupController[0],
                0,
                "open"
              );
            }}
          />

          <div className={styles.docCarousel}>
            {filDocDatas
              ?.slice(0, 7)
              ?.map((item: IDocRepository, index: number) => {
                return folderTemplate(item, index);
              })}
          </div>

          <ViewAll
            onClick={() => {
              localStorage.removeItem(CONFIG.selMasterFolder);
              window.open(
                props.context.pageContext.web.absoluteUrl +
                  CONFIG.NavigatePage.DocRepositoryPage,
                "_self"
              );
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
        </>
      )}
    </div>
  );
};

export default DocumentRepositoryIntranet;
