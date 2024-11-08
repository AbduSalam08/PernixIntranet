/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../../../assets/styles/Style.css";
import styles from "./MainBannerPage.module.scss";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
import CustomDateInput from "../../../components/common/CustomInputFields/CustomDateInput";
import { CONFIG } from "../../../config/config";
import {
  addMotivated,
  deleteMotivated,
  getChoiceData,
  getDailyQuote,
  updateMotivated,
} from "../../../services/mainBannerIntranet/mainBannerIntranet";
import DefaultButton from "../../../components/common/Buttons/DefaultButton";
import { Add } from "@mui/icons-material";
import {
  IFormFields,
  IMotivateColumn,
  IPageSearchFields,
  IPaginationData,
  IQuoteDatas,
  IUserDetails,
} from "../../../interface/interface";
import moment from "moment";
import { Paginator, PaginatorPageChangeEvent } from "primereact/paginator";
import FloatingLabelTextarea from "../../../components/common/CustomInputFields/CustomTextArea";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../utils/popupUtils";
import { resetFormData, validateField } from "../../../utils/commonUtils";
import CustomFileUpload from "../../../components/common/CustomInputFields/CustomFileUpload";
import Popup from "../../../components/common/Popups/Popup";
import { RoleAuth } from "../../../services/CommonServices";
import CustomDropDown from "../../../components/common/CustomInputFields/CustomDropDown";
import CustomInput from "../../../components/common/CustomInputFields/CustomInput";

/* Local interfaces */
interface IMotivateField {
  Quote: IFormFields;
  StartDate: IFormFields;
  EndDate: IFormFields;
  Attachments: IFormFields;
  Status: IFormFields;
}

/* Global variable creation */
const PernixBannerImage = require("../assets/PernixBannerImage.svg");

let masterQuotes: IQuoteDatas[] = [];
let isAdmin: boolean = false;

const MainBannerPage = (props: any): JSX.Element => {
  /* Local variable creation */
  const dispatch = useDispatch();

  let searchField: IPageSearchFields = CONFIG.PageSearchFields;
  const currentUserDetails: IUserDetails = useSelector(
    (state: any) => state?.MainSPContext?.currentUserDetails
  );
  isAdmin = currentUserDetails.role === CONFIG.RoleDetails.user ? false : true;

  /* popup properties */
  const initialPopupController: any[] = [
    {
      open: false,
      popupTitle: "Add quote",
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
        success: "Motivation added successfully!",
        error: "Something went wrong!",
        successDescription:
          "The new motivation 'ABC' has been added successfully.",
        errorDescription:
          "An error occured while adding motivation, please try again later.",
        inprogress: "Adding new motivation, please wait...",
      },
    },
    {
      open: false,
      popupTitle: "Update",
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
        success: "Motivation updated successfully!",
        error: "Something went wrong!",
        successDescription:
          "The new motivation 'ABC' has been updated successfully.",
        errorDescription:
          "An error occured while updating motivation, please try again later.",
        inprogress: "Updating motivation, please wait...",
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
        success: "Motivation deleted successfully!",
        error: "Something went wrong!",
        successDescription:
          "The new motivation 'ABC' has been deleted successfully.",
        errorDescription:
          "An error occured while delete motivation, please try again later.",
        inprogress: "Delete motivation, please wait...",
      },
    },
    {
      open: false,
      popupTitle: "",
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
        success: "",
        error: "",
        successDescription: "",
        errorDescription: "",
        inprogress: "",
      },
    },
  ];

  const initialFormData: IMotivateField = {
    StartDate: {
      value: new Date(),
      isValid: true,
      errorMsg: "",
      validationRule: {
        required: false,
        type: "date",
      },
    },
    EndDate: {
      value: null,
      isValid: true,
      errorMsg: "Please choose end date.",
      validationRule: {
        required: true,
        type: "date",
      },
    },
    Attachments: {
      value: null,
      isValid: true,
      errorMsg: "",
      validationRule: {
        required: false,
        type: "file",
      },
    },
    Quote: {
      value: "",
      isValid: true,
      errorMsg: "This field is required.",
      validationRule: {
        required: true,
        type: "string",
      },
    },
    Status: {
      value: "",
      isValid: true,
      errorMsg: "Status is required",
      validationRule: {
        required: true,
        type: "string",
      },
    },
  };

  /* State creation */
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<string>("");
  const [allQuotes, setAllQuotes] = useState<IQuoteDatas[]>([]);
  const [showQuotes, setShowQuotes] = useState<IQuoteDatas[]>([]);
  const [pagination, setPagination] = useState<IPaginationData>(
    CONFIG.PaginationData
  );
  const [popupController, setPopupController] = useState<any[]>(
    initialPopupController
  );
  const [formData, setFormData] = useState<IMotivateField | any>({
    ...initialFormData,
  });
  const [curObject, setCurObject] = useState<IQuoteDatas>({
    ...CONFIG.QuoteDatas,
  });
  const [isFileEdit, setIsFileEdit] = useState<boolean>(true);
  const [commonSearch, setCommonSearch] = useState<IPageSearchFields>({
    ...CONFIG.PageSearchFields,
  });
  const [statusDrop, setStatusDrop] = useState<string[]>([]);

  /* Functions creation */
  const handleInputChange = async (
    field: string,
    value: any,
    isValid: boolean,
    errorMsg: string = ""
  ): Promise<void> => {
    setFormData((prevData: IMotivateField | any) => ({
      ...prevData,
      [field]: {
        ...prevData[field],
        value: value,
        isValid,
        errorMsg: isValid ? "" : errorMsg,
      },
    }));
  };

  const onPageChange = async (
    event: PaginatorPageChangeEvent | any
  ): Promise<void> => {
    setPagination({
      first: event?.first || CONFIG.PaginationData.first,
      rows: event?.rows || CONFIG.PaginationData.rows,
    });
    setIsLoading(false);
  };

  const handleSearch = async (masterArray: IQuoteDatas[]): Promise<void> => {
    let temp: IQuoteDatas[] = [...masterArray];

    if (searchField.Status) {
      temp = temp?.filter(
        (val: IQuoteDatas) => val.Status === searchField.Status
      );
    }
    if (searchField.Search) {
      temp = temp?.filter((val: IQuoteDatas) =>
        val.Quote.toLowerCase().includes(searchField.Search.toLowerCase())
      );
    }
    if (searchField.Date) {
      temp = temp?.filter(
        (val: IQuoteDatas) =>
          moment(new Date(val.StartDate)).format("YYYYMMDD") <=
            moment(new Date(searchField.Date)).format("YYYYMMDD") &&
          moment(new Date(val.EndDate)).format("YYYYMMDD") >=
            moment(new Date(searchField.Date)).format("YYYYMMDD")
      );
    }

    setShowQuotes([...temp]);
    await onPageChange("");
  };

  const prepareDatas = async (curTab: string): Promise<void> => {
    let tempArray: IQuoteDatas[] = [];

    if (curTab === CONFIG.TabsName[0]) {
      tempArray = await Promise.all(
        masterQuotes?.filter(
          (val: IQuoteDatas) =>
            Number(moment().format("YYYYMMDD")) >=
              Number(moment(val.StartDate).format("YYYYMMDD")) &&
            Number(moment().format("YYYYMMDD")) <=
              Number(moment(val.EndDate).format("YYYYMMDD"))
        )
      );
    } else if (curTab === CONFIG.TabsName[1]) {
      tempArray = await Promise.all(
        masterQuotes?.filter(
          (val: IQuoteDatas) =>
            Number(moment().format("YYYYMMDD")) <
            Number(moment(val.StartDate).format("YYYYMMDD"))
        )
      );
    } else {
      tempArray = await Promise.all(
        masterQuotes?.filter(
          (val: IQuoteDatas) =>
            Number(moment().format("YYYYMMDD")) >
            Number(moment(val.EndDate).format("YYYYMMDD"))
        )
      );
    }

    if (!isAdmin) {
      tempArray = await Promise.all(
        tempArray?.filter((val: IQuoteDatas) => val.Status === "Active")
      );
    }

    searchField.Search = "";
    searchField.Status = "";
    searchField.Date = null;
    setCommonSearch({ ...searchField });
    setSelectedTab(curTab);
    setAllQuotes([...tempArray]);
    await handleSearch([...tempArray]);
  };

  const onLoadingFUN = async (): Promise<void> => {
    setIsLoading(true);
    await RoleAuth(
      CONFIG.SPGroupName.Pernix_Admin,
      {
        highPriorityGroups: [CONFIG.SPGroupName.Mainbanner_Admin],
      },
      dispatch
    );
    await getChoiceData().then(async (val: string[]) => {
      setStatusDrop([...val]);
    });
    await getDailyQuote().then(async (val: IQuoteDatas[]) => {
      masterQuotes = [...val];
      await prepareDatas(CONFIG.TabsName[0]);
    });
  };

  const handleSelect = async (
    data: IQuoteDatas,
    type: string
  ): Promise<void> => {
    setCurObject({ ...data });

    if (type === "edit") {
      setIsFileEdit(true);

      setFormData({
        StartDate: {
          ...initialFormData.StartDate,
          value: data.StartDate ? new Date(data.StartDate) : null,
        },
        EndDate: {
          ...initialFormData.EndDate,
          value: data.EndDate ? new Date(data.EndDate) : null,
        },
        Quote: {
          ...initialFormData.Quote,
          value: data?.Quote || "",
        },
        Attachments: {
          ...initialFormData.Attachments,
          value: data?.FileName || "",
        },
        Status: {
          ...initialFormData.Status,
          value: data?.Status || "",
        },
      });

      togglePopupVisibility(
        setPopupController,
        initialPopupController[1],
        1,
        "open"
      );
    } else if (type === "delete") {
      togglePopupVisibility(
        setPopupController,
        initialPopupController[2],
        2,
        "open"
      );
    } else {
      togglePopupVisibility(
        setPopupController,
        initialPopupController[3],
        3,
        "open"
      );
    }
  };

  const handleDelete = async (
    data: any,
    tab: string = CONFIG.TabsName[0]
  ): Promise<void> => {
    let isDeleted: boolean = await deleteMotivated(data, setPopupController, 2);

    if (isDeleted) {
      let curIndex: number = masterQuotes?.findIndex(
        (val: IQuoteDatas) => val.ID === data?.ID
      );

      masterQuotes?.splice(curIndex, 1);
    }

    await prepareDatas(tab);
  };

  const handleUpdate = async (
    data: any,
    fileData: any,
    tab: string
  ): Promise<void> => {
    let updatedJSON: any = await updateMotivated(
      data,
      fileData,
      setPopupController,
      1,
      isFileEdit,
      curObject
    );

    let curIndex: number = masterQuotes?.findIndex(
      (val: IQuoteDatas) => val.ID === updatedJSON?.ID
    );

    masterQuotes?.splice(curIndex, 1, { ...updatedJSON });

    setIsFileEdit(true);
    await prepareDatas(tab);
  };

  const handleSubmit = async (
    data: any,
    fileData: any,
    tab: string
  ): Promise<void> => {
    const addedJSON: any = await addMotivated(
      data,
      fileData,
      setPopupController,
      0
    );

    masterQuotes = [addedJSON, ...masterQuotes];

    await prepareDatas(tab);
  };

  const handleData = async (
    tab: string = CONFIG.TabsName[0]
  ): Promise<void> => {
    let hasErrors: boolean = false;

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
      let data: any = {};
      let fileData: any = {};
      const column: IMotivateColumn = CONFIG.MotivateColumn;

      data[column.ID] = curObject?.ID || null;
      data[column.StartDate] = formData?.StartDate?.value || null;
      data[column.EndDate] = formData?.EndDate?.value || null;
      data[column.Quote] = formData?.Quote?.value || "";
      data[column.Status] = formData?.Status?.value || "";
      data[column.IsDelete] = false;

      // Attachments json prepared.
      fileData[column.Attachments] = formData?.Attachments?.value || null;

      curObject?.ID
        ? await handleUpdate({ ...data }, { ...fileData }, tab)
        : await handleSubmit({ ...data }, { ...fileData }, tab);
    } else {
      console.log("Form contains errors");
    }
  };

  const popupInputs: any[] = [
    [
      <div className={styles.popupLayoutDesign} key={1}>
        <div className={styles.firstRow}>
          <FloatingLabelTextarea
            value={formData.Quote.value}
            placeholder="Description"
            rows={5}
            isValid={formData.Quote.isValid}
            errorMsg={formData.Quote.errorMsg}
            onChange={(e: any) => {
              const value = e.trimStart();
              const { isValid, errorMsg } = validateField(
                CONFIG.MotivateColumn.Quote,
                value,
                formData.Quote.validationRule
              );
              handleInputChange(
                CONFIG.MotivateColumn.Quote,
                value,
                isValid,
                errorMsg
              );
            }}
          />
        </div>
        <div className={styles.secondRow}>
          <div>
            <CustomFileUpload
              accept="image/png,image/svg"
              placeholder="Select Image - 1440 x 640 ( Optional )"
              value={formData?.Attachments?.value?.name || null}
              onFileSelect={(e: any) => {
                const value: any = e;
                const { isValid, errorMsg } = validateField(
                  CONFIG.MotivateColumn.Attachments,
                  value?.name || null,
                  formData.Attachments.validationRule
                );
                handleInputChange(
                  CONFIG.MotivateColumn.Attachments,
                  value || null,
                  isValid,
                  errorMsg
                );
              }}
              isValid={formData.Attachments.isValid}
              errMsg={formData.Attachments.errorMsg}
            />
          </div>
          <div>
            <CustomDropDown
              value={formData.Status.value}
              options={statusDrop || []}
              placeholder="Status"
              isValid={formData.Status.isValid}
              errorMsg={formData.Status.errorMsg}
              onChange={(value) => {
                const { isValid, errorMsg } = validateField(
                  CONFIG.MotivateColumn.Status,
                  value,
                  formData.Status.validationRule
                );
                handleInputChange(
                  CONFIG.MotivateColumn.Status,
                  value,
                  isValid,
                  errorMsg
                );
              }}
            />
          </div>
        </div>
        <div className={styles.thirdRow}>
          <div>
            <CustomDateInput
              value={formData?.StartDate?.value || null}
              label="Start Date"
              isDateController={true}
              minimumDate={new Date()}
              maximumDate={
                formData?.EndDate?.value
                  ? new Date(formData?.EndDate?.value)
                  : null
              }
              onChange={(e: any) => {
                const value = e;
                const { isValid, errorMsg } = validateField(
                  CONFIG.MotivateColumn.StartDate,
                  value,
                  formData.StartDate.validationRule
                );
                handleInputChange(
                  CONFIG.MotivateColumn.StartDate,
                  value,
                  isValid,
                  errorMsg
                );
              }}
            />
          </div>
          <div>
            <CustomDateInput
              value={formData.EndDate.value}
              label="End Date"
              isDateController={true}
              minimumDate={
                formData?.StartDate?.value
                  ? new Date(formData?.StartDate?.value)
                  : null
              }
              maximumDate={null}
              error={!formData.EndDate.isValid}
              errorMsg={formData.EndDate.errorMsg}
              onChange={(e: any) => {
                const value = e;
                const { isValid, errorMsg } = validateField(
                  CONFIG.MotivateColumn.EndDate,
                  value,
                  formData.EndDate.validationRule
                );
                handleInputChange(
                  CONFIG.MotivateColumn.EndDate,
                  value,
                  isValid,
                  errorMsg
                );
              }}
            />
          </div>
        </div>
      </div>,
    ],
    [
      <div className={styles.popupLayoutDesign} key={2}>
        <div className={styles.firstRow}>
          <FloatingLabelTextarea
            value={formData.Quote.value}
            placeholder="Description"
            rows={5}
            isValid={formData.Quote.isValid}
            errorMsg={formData.Quote.errorMsg}
            onChange={(e: any) => {
              const value = e.trimStart();
              const { isValid, errorMsg } = validateField(
                CONFIG.MotivateColumn.Quote,
                value,
                formData.Quote.validationRule
              );
              handleInputChange(
                CONFIG.MotivateColumn.Quote,
                value,
                isValid,
                errorMsg
              );
            }}
          />
        </div>
        <div className={styles.secondRow}>
          <div>
            <CustomFileUpload
              accept="image/png,image/svg"
              placeholder="Select Image - 1440 x 640 ( Optional )"
              value={
                isFileEdit
                  ? formData?.Attachments?.value || null
                  : formData?.Attachments?.value?.name || null
              }
              onFileSelect={(e: any) => {
                setIsFileEdit(false);
                const value: any = e;
                const { isValid, errorMsg } = validateField(
                  CONFIG.MotivateColumn.Attachments,
                  value?.name || null,
                  formData.Attachments.validationRule
                );
                handleInputChange(
                  CONFIG.MotivateColumn.Attachments,
                  value || null,
                  isValid,
                  errorMsg
                );
              }}
              isValid={formData.Attachments.isValid}
              errMsg={formData.Attachments.errorMsg}
            />
          </div>
          <div>
            <CustomDropDown
              value={formData.Status.value}
              options={statusDrop || []}
              placeholder="Status"
              isValid={formData.Status.isValid}
              errorMsg={formData.Status.errorMsg}
              onChange={(value) => {
                const { isValid, errorMsg } = validateField(
                  CONFIG.MotivateColumn.Status,
                  value,
                  formData.Status.validationRule
                );
                handleInputChange(
                  CONFIG.MotivateColumn.Status,
                  value,
                  isValid,
                  errorMsg
                );
              }}
            />
          </div>
        </div>
        <div className={styles.thirdRow}>
          <div>
            <CustomDateInput
              value={formData?.StartDate?.value || null}
              label="Start Date"
              isDateController={true}
              minimumDate={new Date()}
              maximumDate={
                formData?.EndDate?.value
                  ? new Date(formData?.EndDate?.value)
                  : null
              }
              onChange={(e: any) => {
                const value = e;
                const { isValid, errorMsg } = validateField(
                  CONFIG.MotivateColumn.StartDate,
                  value,
                  formData.StartDate.validationRule
                );
                handleInputChange(
                  CONFIG.MotivateColumn.StartDate,
                  value,
                  isValid,
                  errorMsg
                );
              }}
            />
          </div>
          <div>
            <CustomDateInput
              value={formData.EndDate.value}
              label="End Date"
              isDateController={true}
              minimumDate={
                formData?.StartDate?.value
                  ? new Date(formData?.StartDate?.value)
                  : null
              }
              maximumDate={null}
              error={!formData.EndDate.isValid}
              errorMsg={formData.EndDate.errorMsg}
              onChange={(e: any) => {
                const value = e;
                const { isValid, errorMsg } = validateField(
                  CONFIG.MotivateColumn.EndDate,
                  value,
                  formData.EndDate.validationRule
                );
                handleInputChange(
                  CONFIG.MotivateColumn.EndDate,
                  value,
                  isValid,
                  errorMsg
                );
              }}
            />
          </div>
        </div>
      </div>,
    ],
    [
      <div key={3}>
        <p>Are you sure you want to delete this motivation quote?</p>
      </div>,
    ],
    [
      <div key={4} className={styles.viewPopupContainer}>
        <img
          src={curObject?.Attachments || PernixBannerImage}
          alt="Banner"
          className={styles.viewScreenIMG}
        />
        <div className={styles.viewScreenQuote}>{curObject?.Quote || ""}</div>
        <div className={styles.viewScreenFooter}>
          <div
            className={styles.activeLable}
            style={{
              backgroundColor:
                curObject.Status === "Active"
                  ? "#dcf1dc"
                  : "rgb(243, 183, 183)",
              color:
                curObject.Status === "Active"
                  ? "rgb(58, 156, 58)"
                  : "rgb(227, 65, 65)",
            }}
          >
            {curObject?.Status || ""}
          </div>
          <div
            className={styles.dateLable}
          >{`${curObject?.StartDate} - ${curObject?.EndDate}`}</div>
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
          await handleData(selectedTab);
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
        text: "Update",
        btnType: "primaryGreen",
        endIcon: false,
        startIcon: false,
        disabled: !Object.keys(formData).every((key) => formData[key].isValid),
        size: "large",
        onClick: async () => {
          await handleData(selectedTab);
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
          const data: any = {};
          const column: IMotivateColumn = CONFIG.MotivateColumn;

          data[column.ID] = curObject?.ID || null;
          data[column.IsDelete] = true;

          await handleDelete({ ...data }, selectedTab);
        },
      },
    ],
    [
      {
        text: "Close",
        btnType: "darkGreyVariant",
        disabled: false,
        endIcon: false,
        startIcon: false,
        size: "large",
        onClick: () => {
          togglePopupVisibility(
            setPopupController,
            initialPopupController[3],
            3,
            "close"
          );
        },
      },
    ],
  ];

  useEffect(() => {
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
                  window.open(
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
              <div className={styles.backHeader}>Motivation Banner</div>
            </div>

            <div className={styles.searchContainer}>
              <div
                style={{
                  display: isAdmin ? "flex" : "none",
                }}
              >
                <CustomDropDown
                  noErrorMsg
                  value={commonSearch?.Status}
                  options={statusDrop || []}
                  placeholder="Select Status"
                  onChange={(e: any) => {
                    const value: any = e;
                    searchField.Status = value;
                    setCommonSearch((prev: IPageSearchFields) => ({
                      ...prev,
                      Status: value,
                    }));
                    handleSearch([...allQuotes]);
                  }}
                />
              </div>
              <div>
                <CustomInput
                  noErrorMsg
                  value={commonSearch?.Search}
                  placeholder="Search"
                  onChange={(e: any) => {
                    const value: string = e.trimStart();
                    searchField.Search = value;
                    setCommonSearch((prev: IPageSearchFields) => ({
                      ...prev,
                      Search: value,
                    }));
                    handleSearch([...allQuotes]);
                  }}
                />
              </div>
              <div>
                <CustomDateInput
                  label="Select Date"
                  value={commonSearch?.Date}
                  onChange={(e: any) => {
                    const value: any = e;
                    searchField.Date = value;
                    setCommonSearch((prev: IPageSearchFields) => ({
                      ...prev,
                      Date: value,
                    }));
                    handleSearch([...allQuotes]);
                  }}
                />
              </div>
              <div
                className={styles.refreshBTN}
                onClick={(_) => {
                  searchField.Search = "";
                  searchField.Status = "";
                  searchField.Date = null;
                  setCommonSearch({ ...searchField });
                  handleSearch([...allQuotes]);
                }}
              >
                <i className="pi pi-refresh" />
              </div>
              <div
                style={{
                  display: isAdmin ? "flex" : "none",
                }}
              >
                <DefaultButton
                  text="Add a quote"
                  btnType="primaryGreen"
                  startIcon={<Add />}
                  onClick={(_) => {
                    setCurObject({ ...CONFIG.QuoteDatas });
                    resetFormData(formData, setFormData);
                    setFormData({ ...initialFormData });
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

          {/* Tab section */}
          <div className={styles.tabsContainer}>
            {CONFIG.TabsName.map((str: string, i: number) => {
              return isAdmin ? (
                <div
                  key={i}
                  style={{
                    borderBottom:
                      selectedTab === str ? "3px solid #e0803d" : "none",
                  }}
                  onClick={(_) => {
                    setIsLoading(true);
                    setPagination({ ...CONFIG.PaginationData });
                    prepareDatas(str);
                  }}
                >
                  {str}
                </div>
              ) : i === 0 ? (
                <div
                  key={i}
                  style={{
                    borderBottom:
                      selectedTab === str ? "3px solid #e0803d" : "none",
                  }}
                  onClick={(_) => {
                    setIsLoading(true);
                    setPagination({ ...CONFIG.PaginationData });
                    prepareDatas(str);
                  }}
                >
                  {str}
                </div>
              ) : (
                ""
              );
            })}
          </div>

          {/* Body section */}
          {showQuotes.length ? (
            <div className={styles.bodyContainer}>
              {showQuotes
                ?.slice(pagination.first, pagination.first + pagination.rows)
                ?.map((val: IQuoteDatas, i: number) => {
                  return (
                    <div key={i} className={styles.cardSection}>
                      <img
                        className={styles.cardIMG}
                        src={val?.Attachments || PernixBannerImage}
                        alt="Banner"
                      />
                      <div className={styles.cardBody}>{val?.Quote || ""}</div>
                      <div className={styles.cardFooter}>
                        <div
                          className={styles.cardStatus}
                          style={{
                            backgroundColor:
                              val.Status === "Active"
                                ? "#dcf1dc"
                                : "rgb(243, 183, 183)",
                            color:
                              val.Status === "Active"
                                ? "rgb(58, 156, 58)"
                                : "rgb(227, 65, 65)",
                          }}
                        >
                          {val?.Status || ""}
                        </div>
                        <div className={styles.cardIcon}>
                          <div
                            onClick={(_) => {
                              handleSelect({ ...val }, "view");
                            }}
                          >
                            <i
                              className="pi pi-eye"
                              style={{
                                color: "#adadad",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              display:
                                isAdmin && selectedTab !== "Previous"
                                  ? "flex"
                                  : "none",
                            }}
                            onClick={(_) => {
                              handleSelect({ ...val }, "edit");
                            }}
                          >
                            <i
                              className="pi pi-pen-to-square"
                              style={{
                                color: "#adadad",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              display: isAdmin ? "flex" : "none",
                            }}
                            onClick={(_) => {
                              handleSelect({ ...val }, "delete");
                            }}
                          >
                            <i
                              className="pi pi-trash"
                              style={{
                                color: "#ff1c1c",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className={styles.bodyNoDataFound}>
              No motivational quote found!
            </div>
          )}

          {/* Pagination section */}
          {showQuotes.length ? (
            <div
              className="card"
              style={{
                padding: "4px 0px",
              }}
            >
              <Paginator
                first={pagination.first}
                rows={pagination.rows}
                totalRecords={showQuotes.length}
                onPageChange={onPageChange}
                template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
              />
            </div>
          ) : null}

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
                togglePopupVisibility(
                  setPopupController,
                  initialPopupController[0],
                  index,
                  "close"
                );
                if (popupData?.isLoading?.success) {
                  prepareDatas(selectedTab || CONFIG.TabsName[0]);
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
        </>
      )}
    </div>
  );
};

export default MainBannerPage;
