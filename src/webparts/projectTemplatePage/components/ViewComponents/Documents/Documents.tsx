/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
import DefaultButton from "../../../../../components/common/Buttons/DefaultButton";
import styles from "./Documents.module.scss";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useState, useEffect } from "react";
import { Add } from "@mui/icons-material";
import Popup from "../../../../../components/common/Popups/Popup";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../../../utils/popupUtils";
import { resetFormData, validateField } from "../../../../../utils/commonUtils";
import CustomMultipleFileUpload from "../../../../../components/common/CustomInputFields/CustomMultipleFileUpload";
import CustomInput from "../../../../../components/common/CustomInputFields/CustomInput";
import { CONFIG } from "../../../../../config/config";
import {
  addDocRepository,
  pathFileORFolderCheck,
} from "../../../../../services/ProjectTemplate/ProjectTemplate";
import {
  IAttachObj,
  IDocRepositoryColumn,
  IFormFields,
  IProRepository,
} from "../../../../../interface/interface";
import CircularSpinner from "../../../../../components/common/Loaders/CircularSpinner";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

/* Interface creation */
interface ITabObject {
  name: string;
  path: string;
}

interface IDocField {
  FolderName: IFormFields;
  Content: IFormFields;
}

/* Global variable creation */
const folderIcon: string = require("../../../../../assets/images/svg/folderIcon.svg");
const fileIcon = require("../../../../helpDesk/assets/images/svg/fileIcon.svg");
const errorGrey = require("../../../../../assets/images/svg/errorGrey.svg");

const Documents = ({ value }: any): JSX.Element => {
  /* Local variable creation */
  const sitePath: string =
    CONFIG.sitePath +
    "/" +
    CONFIG.ListNames.ProjectTemplate +
    "/" +
    value?.projectName +
    "_" +
    value?.id +
    "/" +
    CONFIG.ProjectDocNames.documnet;

  const items: ITabObject[] = [
    {
      name: "Home",
      path:
        CONFIG.sitePath +
        "/" +
        CONFIG.ListNames.ProjectTemplate +
        "/" +
        value?.projectName +
        "_" +
        value?.id +
        "/" +
        CONFIG.ProjectDocNames.documnet,
    },
  ];

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
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedPath, setSelectedPath] = useState<ITabObject[]>([...items]);
  console.log("setSelectedPath: ", setSelectedPath);
  const [curDocDatas, setCurDocDatas] = useState<IProRepository[]>([]);
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

  // const handleSelectFolder = async (
  //   type: string,
  //   path: string,
  //   idx: number,
  //   filePath: string
  // ): Promise<void> => {
  //   let curTabs: ITabObject[] = [];

  //   if (path === "Home") {
  //     let temp: IProRepository[] = [];

  //     temp = await Promise.all(
  //       masterDocDatas?.map(async (val: IProRepository) => {
  //         let objAttach: IAttachObj = {
  //           isSubFiles: await curItemDatasFilter(
  //             val?.Content?.ServerRelativeUrl
  //           ),
  //           name: val?.Content?.name,
  //           content: [],
  //           fileType: val?.Content?.fileType,
  //           ServerRelativeUrl: val?.Content?.ServerRelativeUrl,
  //         };

  //         return {
  //           ID: val?.ID,
  //           Content: objAttach,
  //         };
  //       }) || []
  //     );

  //     curTabs = selectedPath.slice(0, idx);
  //     setSelectedPath([...curTabs]);
  //   } else if (type === "remove") {
  //     curTabs = selectedPath.slice(0, idx);
  //     setSelectedPath([...curTabs]);
  //   } else {
  //     selectedPath.push({
  //       name: path,
  //       path: filePath,
  //     });
  //     setSelectedPath([...selectedPath]);
  //   }

  //   if (path !== "Home") {
  //     setIsLoading(true);
  //     await filCurrentItems(filePath);
  //   }
  // };

  const onLoadingFUN = async (path: string): Promise<void> => {
    await pathFileORFolderCheck(path).then((res: any[]) => {
      console.log("res: ", res);
      const temp: IProRepository[] =
        res?.map((val: any) => {
          const objAttach: IAttachObj = {
            isSubFiles: path === val?.FileRef ? true : false,
            name: val?.FileLeafRef,
            content: [],
            fileType: val?.FileSystemObjectType === 1 ? "folder" : "file",
            ServerRelativeUrl:
              val?.FileSystemObjectType === 1
                ? val?.FileRef
                : window.location.origin + val?.FileRef,
          };

          return {
            ID: val?.ID || null,
            Content: objAttach,
          };
        }) || [];

      setCurDocDatas([...temp]);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    setIsLoading(true);
    onLoadingFUN(sitePath);
  }, []);

  return (
    <div className={styles.accordion}>
      <div className={styles.accordionheader} onClick={toggleAccordion}>
        <p className={styles.accordionheading}>Documents</p>
        <DefaultButton
          text={isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          btnType="primaryGreen"
          onlyIcon
        />
      </div>

      {isOpen && (
        <>
          <div className={styles.addicon}>
            {/* Tab section */}
            <div className={styles.tabContainer}>
              {selectedPath?.map((val: ITabObject, idx: number) => {
                return (
                  <div key={idx}>
                    {selectedPath.length !== idx + 1 ? (
                      <div className={styles.tabsAlign}>
                        <div
                          className={styles.clickTab}
                          onClick={() => {
                            // handleSelectFolder(
                            //   "remove",
                            //   val.name,
                            //   idx + 1,
                            //   val.path
                            // );
                          }}
                        >
                          {val.name}
                        </div>
                        <NavigateNextIcon
                          style={{
                            color: "#7c7c7c",
                          }}
                        />
                      </div>
                    ) : (
                      <div className={styles.selectedTab}>{val.name}</div>
                    )}
                  </div>
                );
              })}
            </div>

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

          {isLoading ? (
            <div className={styles.LoaderContainer}>
              <CircularSpinner />
            </div>
          ) : curDocDatas?.length ? (
            <div className={styles.docCarousel}>
              {curDocDatas?.map((val: IProRepository, idx: number) => {
                return (
                  <div className={styles.folderCard} key={idx}>
                    <div
                      className={styles.folderContentSec}
                      title={val?.Content?.name}
                      onClick={() => {
                        if (val?.Content?.fileType !== "file") {
                          // handleSelectFolder(
                          //   "add",
                          //   val?.Content?.name,
                          //   idx + 1,
                          //   val?.Content?.ServerRelativeUrl
                          // );
                        } else {
                          window.open(
                            val?.Content?.ServerRelativeUrl + "?web=1"
                          );
                        }
                      }}
                    >
                      <img
                        src={
                          val?.Content?.fileType !== "file"
                            ? folderIcon
                            : fileIcon
                        }
                        className={
                          val?.Content?.fileType !== "file"
                            ? styles.folderIcon
                            : styles.fileIcon
                        }
                        alt="Doc"
                      />
                      <div className={styles.contentSec}>
                        {val?.Content?.name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="errorWrapper" style={{ height: "50vh" }}>
              <img src={errorGrey} alt="Error" />
              <span className="disabledText">No Data Found !!!</span>
            </div>
          )}
        </>
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
    </div>
  );
};

export default Documents;
