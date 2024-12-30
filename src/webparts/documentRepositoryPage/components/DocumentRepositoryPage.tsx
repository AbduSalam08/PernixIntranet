/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../../../assets/styles/Style.css";
import "./docStyle.css";
import styles from "./DocumentRepositoryPage.module.scss";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
import {
  IAttachObj,
  IDocRepository,
  IDocRepositoryColumn,
  IFormFields,
  IUserDetails,
} from "../../../interface/interface";
import { CONFIG } from "../../../config/config";
import { RoleAuth } from "../../../services/CommonServices";
import CustomInput from "../../../components/common/CustomInputFields/CustomInput";
import DefaultButton from "../../../components/common/Buttons/DefaultButton";
import { Add, Upload } from "@mui/icons-material";
import {
  addDocRepository,
  deleteDocRepository,
  getDocRepository,
  pathFileORFolderCheck,
  updateDocRepositoryData,
} from "../../../services/docRepositoryIntranet/docRepositoryIntranet";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Popup from "../../../components/common/Popups/Popup";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../utils/popupUtils";
import { resetFormData, validateField } from "../../../utils/commonUtils";
import CustomMultipleFileUpload from "../../../components/common/CustomInputFields/CustomMultipleFileUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import CustomDropDown from "../../../components/common/CustomInputFields/CustomDropDown";
import { InputSwitch } from "primereact/inputswitch";
import { ToastContainer } from "react-toastify";

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import IconButton from "@mui/material/IconButton";
import useMediaQuery from "@mui/material/useMediaQuery";

/* Interface creation */
interface ITabObject {
  name: string;
  path: string;
}

interface IDocField {
  FolderName: IFormFields;
  Content: IFormFields;
  Priority: IFormFields;
  IsActive: IFormFields;
}

/* Global variable creation */
const folderIcon = require("../../../assets/images/svg/folderIcon.svg");
const fileIcon = require("../../../webparts/helpDesk/assets/images/svg/fileIcon.svg");

let items: ITabObject[] = [{ name: "Home", path: CONFIG.fileFlowPath }];
let isAdmin: boolean = false;
let masterRes: any[] = [];
let masterDocDatas: IDocRepository[] = [];
let isActivityPage: boolean = false;

const DocumentRepositoryPage = (props: any): JSX.Element => {
  /* Local variable creation */
  const dispatch = useDispatch();
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  const currentUserDetails: IUserDetails = useSelector(
    (state: any) => state?.MainSPContext?.currentUserDetails
  );
  isAdmin = currentUserDetails.role === CONFIG.RoleDetails.user ? false : true;

  /* popup properties */
  const initialPopupController: any[] = [
    {
      open: false,
      popupTitle: "Create a folder",
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
        success: "Folder created successfully!",
        error: "Something went wrong!",
        successDescription:
          "The new folder 'ABC' has been created successfully.",
        errorDescription:
          "An error occured while adding folder, please try again later.",
        inprogress: "Adding new folder, please wait...",
      },
    },
    {
      open: false,
      popupTitle: "Upload files",
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
        success: "Files uploaded successfully!",
        error: "Something went wrong!",
        successDescription:
          "The new files 'ABC' has been uploaded successfully.",
        errorDescription:
          "An error occured while uploading file, please try again later.",
        inprogress: "Uploading file, please wait...",
      },
    },
    {
      open: false,
      popupTitle: "Confirmation",
      popupWidth: "450px",
      popupType: "custom",
      defaultCloseBtn: false,
      popupData: "",
      isLoading: {
        inprogress: false,
        error: false,
        success: false,
      },
      messages: {
        success: "Folder deleted successfully!",
        error: "Something went wrong!",
        successDescription:
          "The new folder 'ABC' has been deleted successfully.",
        errorDescription:
          "An error occured while delete folder, please try again later.",
        inprogress: "Delete folder, please wait...",
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
    Priority: {
      value: "1",
      isValid: true,
      errorMsg: "",
      validationRule: {
        required: false,
        type: "string",
      },
    },
    IsActive: {
      value: false,
      isValid: true,
      errorMsg: "",
      validationRule: {
        required: false,
        type: "boolean",
      },
    },
  };

  const initialFileData: IDocField = {
    FolderName: {
      value: "",
      isValid: true,
      errorMsg: "",
      validationRule: {
        required: false,
        type: "string",
      },
    },
    Content: {
      value: null,
      isValid: true,
      errorMsg: "Please select file's.",
      validationRule: {
        required: true,
        type: "file",
      },
    },
    Priority: {
      value: "1",
      isValid: true,
      errorMsg: "",
      validationRule: {
        required: false,
        type: "string",
      },
    },
    IsActive: {
      value: false,
      isValid: true,
      errorMsg: "",
      validationRule: {
        required: false,
        type: "boolean",
      },
    },
  };

  /* State creation */
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isfilter, setIsfilter] = useState<boolean>(false);

  const [filDocDatas, setFilDocDatas] = useState<IDocRepository[]>([]);
  const [selectedPath, setSelectedPath] = useState<ITabObject[]>([...items]);
  const [isFileSearch, setIsFileSearch] = useState<boolean>(false);
  const [curDocDatas, setCurDocDatas] = useState<IDocRepository[]>([]);
  const [strSearch, setStrSearch] = useState<string>("");
  const [popupController, setPopupController] = useState<any[]>(
    initialPopupController
  );
  const [formData, setFormData] = useState<IDocField | any>({
    ...initialFormData,
  });
  const [curObject, setCurObject] = useState<IDocRepository | undefined>(
    undefined
  );
  const [curFilePath, setCurFilePath] = useState<string>(CONFIG.fileFlowPath);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const isMobile = useMediaQuery("(max-width:768px)"); // Detect screen size

  const handleClick = (event: React.MouseEvent<HTMLElement>, index: number) => {
    setAnchorEl(event.currentTarget);
    setCurrentIndex(index);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setCurrentIndex(null);
  };

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

  const handleSearch = async (
    value: string,
    arrDatas: IDocRepository[]
  ): Promise<void> => {
    let temp: IDocRepository[] = [...arrDatas];

    temp = temp?.filter((val: IDocRepository) =>
      val?.Content?.name.toLowerCase().includes(value.toLowerCase())
    );

    setCurDocDatas([...temp]);
    setIsFileSearch(false);
    setIsLoading(false);
  };

  const curItemDatasFilter = async (path: string): Promise<boolean> => {
    let isAvailable: boolean = false;

    isAvailable = masterRes?.some((val: any) => val.FileDirRef === path);

    return isAvailable;
  };

  const filCurrentItems = async (filePath: string): Promise<void> => {
    let tempFilter: any[] = [];
    let filteredItems: IDocRepository[] = [];

    let filFilePath: string = "";

    if (filePath.includes(window.location.origin)) {
      const location: string = window.location.origin;
      filFilePath = filePath.slice(location.length);
    } else {
      filFilePath = filePath;
    }

    tempFilter = await Promise.all(
      masterRes?.filter((val: any) => val?.FileDirRef === filFilePath)
    );

    filteredItems = await Promise.all(
      tempFilter?.map(async (val: any) => {
        let objAttach: IAttachObj = {
          isSubFiles: await curItemDatasFilter(val.FileRef),
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
          Priority: "",
          IsActive: false,
        };
      })
    );

    setFilDocDatas([...filteredItems]);
    await handleSearch("", [...filteredItems]);
  };

  const handleSelectFolder = async (
    type: string,
    path: string,
    idx: number,
    filePath: string
  ): Promise<void> => {
    let curTabs: ITabObject[] = [];
    localStorage.removeItem(CONFIG.selMasterFolder);

    if (path === "Home") {
      let temp: IDocRepository[] = [];

      temp = await Promise.all(
        masterDocDatas?.map(async (val: IDocRepository) => {
          let objAttach: IAttachObj = {
            isSubFiles: await curItemDatasFilter(
              val?.Content?.ServerRelativeUrl
            ),
            name: val?.Content?.name,
            content: [],
            fileType: val?.Content?.fileType,
            ServerRelativeUrl: val?.Content?.ServerRelativeUrl,
          };

          return {
            ID: val?.ID,
            Content: objAttach,
            Priority: val?.Priority || "",
            IsActive: val?.IsActive || false,
          };
        }) || []
      );

      curTabs = selectedPath.slice(0, idx);
      setSelectedPath([...curTabs]);
      setFilDocDatas([...temp]);
      setCurFilePath(filePath);
      await handleSearch("", [...temp]);
    } else if (type === "remove") {
      curTabs = selectedPath.slice(0, idx);
      setSelectedPath([...curTabs]);
      setCurFilePath(filePath);
    } else {
      selectedPath.push({
        name: path,
        path: filePath,
      });
      setSelectedPath([...selectedPath]);
      setCurFilePath(filePath);
    }

    if (path !== "Home") {
      setIsFileSearch(true);
      await filCurrentItems(filePath);
    }
  };

  const splitResponseDatas = async (): Promise<void> => {
    let curSelectedFolder: string =
      JSON.parse(localStorage.getItem(CONFIG.selMasterFolder) || "{}")?.Name ||
      "";
    let curSelectedPath: string =
      JSON.parse(localStorage.getItem(CONFIG.selMasterFolder) || "{}")?.Path ||
      "";
    let filMasterFolder: IDocRepository[] = [];
    masterDocDatas = [];

    filMasterFolder = await Promise.all(
      isAdmin
        ? masterRes?.filter(
            (val: any) =>
              val.FileSystemObjectType === 1 &&
              `${CONFIG.fileFlowPath}/${val.FileLeafRef}` === val.FileRef
          )
        : masterRes?.filter(
            (val: any) =>
              val.FileSystemObjectType === 1 &&
              `${CONFIG.fileFlowPath}/${val.FileLeafRef}` === val.FileRef &&
              val?.IsActive
          )
    );

    masterDocDatas = await Promise.all(
      filMasterFolder?.map(async (val: any) => {
        let masObjAttach: IAttachObj = {
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
    if (!curSelectedFolder) {
      await handleSearch("", [...masterDocDatas]);
    } else {
      selectedPath.push({
        name: curSelectedFolder,
        path: curSelectedPath,
      });
      setSelectedPath([...selectedPath]);
      setCurFilePath(curSelectedPath);
      await filCurrentItems(curSelectedPath);
    }
  };

  const handleDelete = async (
    id: number,
    folderType: string,
    folderPath: string = CONFIG.fileFlowPath
  ): Promise<void> => {
    let arrFileData: string[] = folderPath.split("/");
    arrFileData.pop();
    const newPath: string = arrFileData.join("/");

    togglePopupVisibility(
      setPopupController,
      initialPopupController[2],
      2,
      "close"
    );

    await deleteDocRepository(id);
    await getDocRepository().then(async (val: any[]) => {
      masterRes = [...val];
      folderType === "master_folder"
        ? await splitResponseDatas()
        : await filCurrentItems(newPath);
    });
  };

  const handleSubmit = async (
    data: any,
    folderType: string,
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

    await addDocRepository(data, folderPath, folderType);
    await getDocRepository().then(async (val: any[]) => {
      masterRes = [...val];
      folderType === "master_folder"
        ? await splitResponseDatas()
        : await filCurrentItems(folderPath);
    });
  };

  const handleData = async (
    folderType: string,
    folderPath: string,
    idx: number
  ): Promise<void> => {
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
        isValid = !curDocDatas?.some(
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

      await handleSubmit({ ...data }, folderType, folderPath, idx);
    } else {
      console.log("Form contains errors");
    }
  };

  const handleStatusAndPriorityChange = async (
    type: string,
    val: any,
    anotherVal: any,
    idx: number
  ): Promise<void> => {
    let data: any = {};
    const column: IDocRepositoryColumn = CONFIG.DocRepositoryColumn;

    data[column.ID] = masterDocDatas[idx]?.ID || null;
    data[column.Priority] =
      type === CONFIG.DocRepositoryColumn.Priority ? val : anotherVal;
    data[column.IsActive] =
      type === CONFIG.DocRepositoryColumn.IsActive ? val : anotherVal;

    masterDocDatas[idx].Priority =
      type === CONFIG.DocRepositoryColumn.Priority ? val : anotherVal;
    masterDocDatas[idx].IsActive =
      type === CONFIG.DocRepositoryColumn.IsActive ? val : anotherVal;

    await pathFileORFolderCheck(
      masterDocDatas[idx]?.Content?.ServerRelativeUrl
    ).then((res: any[]) => {
      masterDocDatas[idx].Content.isSubFiles = res.length ? true : false;
    });

    await Promise.all(
      masterDocDatas?.sort((a: IDocRepository, b: IDocRepository) => {
        const priorityComparison = Number(a?.Priority) - Number(b?.Priority);

        if (priorityComparison === 0) {
          return a?.Content?.name.localeCompare(b?.Content?.name);
        }

        return priorityComparison;
      })
    );

    await updateDocRepositoryData({ ...data });
    setFilDocDatas([...masterDocDatas]);
    await handleSearch("", [...masterDocDatas]);
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
    [
      <div className={styles.popupLayoutDesign} key={2}>
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
                value?.[0]?.name || null,
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
    [
      <div key={3}>
        <p>
          Are you sure you want to delete this{" "}
          {curObject?.Content?.fileType !== "file" ? "folder" : "file"}?
        </p>
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
          await handleData(
            selectedPath.length === 1 ? "master_folder" : "folder",
            curFilePath,
            0
          );
        },
      },
    ],
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
            initialPopupController[1],
            1,
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
          await handleData("file", curFilePath, 1);
        },
      },
    ],
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
            initialPopupController[2],
            2,
            "close"
          );
        },
      },
      {
        text: "Delete",
        btnType: "primaryGreen",
        endIcon: false,
        startIcon: false,
        disabled: !Object.keys(formData).every((key) => formData[key].isValid),
        size: "large",
        onClick: async () => {
          if (
            curObject?.ID !== undefined &&
            curObject?.Content?.fileType !== undefined &&
            curObject?.Content?.ServerRelativeUrl
          ) {
            await handleDelete(
              curObject.ID,
              curObject.Content.fileType,
              curObject.Content.ServerRelativeUrl
            );
          }
        },
      },
    ],
  ];

  useEffect(() => {
    const urlObj = new URL(window.location.href);
    const params = new URLSearchParams(urlObj.search);
    isActivityPage = params?.get("Page") === "activity" ? true : false;

    onLoadingFUN();
  }, []);

  return (
    <div className={styles.container}>
      {isLoading ? (
        <div className={styles.LoaderContainer}>
          <CircularSpinner />
        </div>
      ) : (
        <>
          {/* Header section */}
          <div className={styles.headerContainer}>
            <div className={styles.backContainer}>
              <div
                style={{
                  cursor: "pointer",
                }}
                onClick={(_) => {
                  localStorage.removeItem(CONFIG.selMasterFolder);
                  isActivityPage
                    ? window.open(
                        props.context.pageContext.web.absoluteUrl +
                          CONFIG.NavigatePage.ApprovalsPage,
                        "_self"
                      )
                    : window.open(
                        props.context.pageContext.web.absoluteUrl +
                          CONFIG.NavigatePage.PernixIntranet,
                        "_self"
                      );
                }}
              >
                <i
                  className="pi pi-arrow-circle-left"
                  style={{
                    fontSize: "26px",
                    color: "#e0803d",
                  }}
                />
              </div>
              <div className={styles.backHeader}>Document Repository</div>
            </div>

            <div className={styles.searchContainer}>
              <div>
                <CustomInput
                  noErrorMsg
                  value={strSearch}
                  size="SM"
                  placeholder="Search"
                  onChange={(e: any) => {
                    const value: string = e.trimStart();
                    setStrSearch(value);
                    handleSearch(value, [...filDocDatas]);
                  }}
                />
              </div>
              <div
                className={styles.refreshBTN}
                onClick={(_) => {
                  setStrSearch("");
                  handleSearch("", [...filDocDatas]);
                }}
              >
                <i className="pi pi-refresh" />
              </div>
              {selectedPath.length !== 1 && (
                <div
                  style={{
                    display: isAdmin ? "flex" : "none",
                  }}
                >
                  <DefaultButton
                    text="File upload"
                    btnType="primaryGreen"
                    startIcon={<Upload />}
                    onClick={(_) => {
                      resetFormData({ ...initialFileData }, setFormData);
                      togglePopupVisibility(
                        setPopupController,
                        initialPopupController[1],
                        1,
                        "open"
                      );
                    }}
                  />
                </div>
              )}
              <div
                style={{
                  display: isAdmin ? "flex" : "none",
                }}
              >
                <DefaultButton
                  text="Create a folder"
                  btnType="primaryGreen"
                  startIcon={<Add />}
                  onClick={(_) => {
                    resetFormData({ ...initialFormData }, setFormData);
                    togglePopupVisibility(
                      setPopupController,
                      initialPopupController[0],
                      0,
                      "open"
                    );
                  }}
                />
              </div>
            </div>

            <div className={styles.ismobile}>
              {selectedPath.length !== 1 && (
                <div
                  style={{
                    display: isAdmin ? "flex" : "none",
                  }}
                >
                  <DefaultButton
                    // text="File upload"
                    btnType="primaryGreen"
                    onlyIcon
                    title="File upload"
                    startIcon={<Upload />}
                    onClick={(_) => {
                      resetFormData({ ...initialFileData }, setFormData);
                      togglePopupVisibility(
                        setPopupController,
                        initialPopupController[1],
                        1,
                        "open"
                      );
                    }}
                  />
                </div>
              )}
              <div
                style={{
                  display: isAdmin ? "flex" : "none",
                }}
              >
                <DefaultButton
                  // text="Create a folder"
                  title="Create a folder"
                  btnType="primaryGreen"
                  onlyIcon
                  startIcon={<Add />}
                  onClick={(_) => {
                    resetFormData({ ...initialFormData }, setFormData);
                    togglePopupVisibility(
                      setPopupController,
                      initialPopupController[0],
                      0,
                      "open"
                    );
                  }}
                />
              </div>
            </div>
          </div>

          <div className={styles.docRepoWrapper}>
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
                            handleSelectFolder(
                              "remove",
                              val.name,
                              idx + 1,
                              val.path
                            );
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

            {/* Body section */}
            {isFileSearch ? (
              <>
                <CircularSpinner />
              </>
            ) : curDocDatas.length ? (
              <div className={styles.bodyContainer}>
                {curDocDatas?.map((val: IDocRepository, idx: number) => {
                  return (
                    <div key={idx} className={styles.folderSection}>
                      <div
                        className={styles.folderContentSec}
                        title={val?.Content?.name}
                        onClick={() => {
                          if (val?.Content?.fileType !== "file") {
                            handleSelectFolder(
                              "add",
                              val?.Content?.name,
                              idx + 1,
                              val?.Content?.ServerRelativeUrl
                            );
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
                      {/* <div
                        className={styles.folderActionSec}
                        style={{
                          justifyContent:
                            val?.Content?.fileType === "master_folder"
                              ? "flex-start"
                              : "end",
                        }}
                      >
                       
                      </div> */}

                      <div
                        className={styles.folderActionSec}
                        style={{
                          justifyContent:
                            val?.Content?.fileType === "master_folder"
                              ? "flex-start"
                              : "end",
                        }}
                      >
                        {!isMobile ? (
                          // Normal layout for screens wider than 768px
                          <>
                            {val?.Content?.fileType === "master_folder" &&
                              isAdmin && (
                                <>
                                  <div
                                    style={{
                                      width: "50%",
                                    }}
                                  >
                                    <CustomDropDown
                                      highlightDropdown
                                      noErrorMsg
                                      value={val?.Priority}
                                      size="SM"
                                      width="100px"
                                      options={[
                                        "1",
                                        "2",
                                        "3",
                                        "4",
                                        "5",
                                        "6",
                                        "7",
                                      ]}
                                      onChange={(data: any) => {
                                        handleStatusAndPriorityChange(
                                          CONFIG.DocRepositoryColumn.Priority,
                                          data,
                                          val?.IsActive,
                                          idx
                                        );
                                      }}
                                    />
                                  </div>

                                  <div
                                    style={{
                                      width: "26%",
                                    }}
                                  >
                                    <InputSwitch
                                      className="sectionToggler"
                                      checked={val?.IsActive}
                                      onChange={(data: any) => {
                                        handleStatusAndPriorityChange(
                                          CONFIG.DocRepositoryColumn.IsActive,
                                          data?.value,
                                          val?.Priority,
                                          idx
                                        );
                                      }}
                                    />
                                  </div>
                                </>
                              )}

                            {!val?.Content?.isSubFiles && isAdmin && (
                              <DeleteIcon
                                className={styles.deleteIcon}
                                onClick={() => {
                                  setCurObject({ ...val });
                                  togglePopupVisibility(
                                    setPopupController,
                                    initialPopupController[2],
                                    2,
                                    "open"
                                  );
                                }}
                              />
                            )}
                          </>
                        ) : (
                          // More icon with menu for screens smaller than 768px
                          <>
                            {isAdmin && (
                              <>
                                <IconButton
                                  aria-label="more options"
                                  aria-controls={
                                    open ? "folder-action-menu" : undefined
                                  }
                                  aria-haspopup="true"
                                  onClick={(event: any) => {
                                    handleClick(event, idx);
                                  }}
                                >
                                  <MoreVertIcon />
                                </IconButton>

                                <Menu
                                  id={`menu-${idx}`}
                                  anchorEl={anchorEl}
                                  open={currentIndex === idx}
                                  onClose={handleClose}
                                  // MenuListProps={{
                                  //   "aria-labelledby": "more-options",
                                  // }}
                                >
                                  {val?.Content?.fileType === "master_folder" &&
                                    isAdmin && (
                                      <MenuItem>
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px",

                                            // width: "50%",
                                          }}
                                        >
                                          <p
                                            style={{
                                              fontSize: "12px",
                                            }}
                                          >
                                            Sort
                                          </p>
                                          <CustomDropDown
                                            highlightDropdown
                                            noErrorMsg
                                            value={val?.Priority}
                                            size="SM"
                                            width="100px"
                                            options={[
                                              "1",
                                              "2",
                                              "3",
                                              "4",
                                              "5",
                                              "6",
                                              "7",
                                            ]}
                                            onChange={(data: any) => {
                                              handleStatusAndPriorityChange(
                                                CONFIG.DocRepositoryColumn
                                                  .Priority,
                                                data,
                                                val?.IsActive,
                                                idx
                                              );
                                            }}
                                          />
                                        </div>
                                      </MenuItem>
                                    )}

                                  {val?.Content?.fileType === "master_folder" &&
                                    isAdmin && (
                                      <MenuItem>
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px",

                                            // width: "26%",
                                          }}
                                        >
                                          <p
                                            style={{
                                              fontSize: "12px",
                                            }}
                                          >
                                            Activity
                                          </p>
                                          <InputSwitch
                                            className="sectionToggler"
                                            checked={val?.IsActive}
                                            onChange={(data: any) => {
                                              handleStatusAndPriorityChange(
                                                CONFIG.DocRepositoryColumn
                                                  .IsActive,
                                                data?.value,
                                                val?.Priority,
                                                idx
                                              );
                                            }}
                                          />
                                        </div>
                                      </MenuItem>
                                    )}

                                  {!val?.Content?.isSubFiles && isAdmin && (
                                    <MenuItem
                                      onClick={() => {
                                        setCurObject({ ...val });
                                        togglePopupVisibility(
                                          setPopupController,
                                          initialPopupController[2],
                                          2,
                                          "open"
                                        );
                                        handleClose();
                                      }}
                                      sx={{
                                        fontSize: "12px",
                                      }}
                                    >
                                      Delete
                                      <DeleteIcon
                                        className={styles.deleteIcon}
                                        sx={{
                                          fontSize: "24px", // Change font size
                                          color: "red", // Change color
                                        }}
                                      />
                                    </MenuItem>
                                  )}
                                </Menu>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.bodyNoDataFound}>No Data Found !!!</div>
            )}

            <div className={styles.filtericon}>
              <i
                className="pi pi-filter"
                onClick={() => {
                  setIsfilter(!isfilter);
                }}
              />
            </div>

            <div
              className={`${styles.filter_container} ${
                isfilter ? styles.active_filter_container : ""
              }`}

              // className={`filter_container ${
              //   isfilter ? "active_filter_container" : ""
              // }`}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  margin: "10px",
                }}
              >
                <CustomInput
                  noErrorMsg
                  value={strSearch}
                  size="SM"
                  placeholder="Search"
                  onChange={(e: any) => {
                    const value: string = e.trimStart();
                    setStrSearch(value);
                    // handleSearch(value, [...filDocDatas]);
                  }}
                />

                <div>
                  <DefaultButton
                    text="Apply"
                    size="small"
                    fullWidth
                    btnType="primaryGreen"
                    onClick={(_) => {
                      // handleSearch([...shownewsData]);

                      handleSearch(strSearch, [...filDocDatas]);

                      setIsfilter(!isfilter);
                    }}
                  />
                </div>
                <div>
                  <DefaultButton
                    text="Clear"
                    size="small"
                    fullWidth
                    btnType="darkGreyVariant"
                    onClick={(_) => {
                      setIsfilter(!isfilter);

                      setStrSearch("");
                      handleSearch("", [...filDocDatas]);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Toast message section */}
          <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />

          {/* add and edit popup section */}
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
      )}
    </div>
  );
};

export default DocumentRepositoryPage;
