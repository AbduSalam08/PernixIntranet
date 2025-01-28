/* eslint-disable no-debugger */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { useEffect, useState } from "react";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../utils/popupUtils";
import "../../../assets/styles/style.css";
import NewsCard from "./NewsCard/NewsCard";
import styles from "./NewsPage.module.scss";
import Popup from "../../../components/common/Popups/Popup";
import CustomInput from "../../../components/common/CustomInputFields/CustomInput";
import CustomDateInput from "../../../components/common/CustomInputFields/CustomDateInput";
// import FloatingLabelTextarea from "../../../components/common/CustomInputFields/CustomTextArea";
import CustomDropDown from "../../../components/common/CustomInputFields/CustomDropDown";
//import CustomFileUpload from "../../../components/common/CustomInputFields/CustomFileUpload";
import {
  addNews,
  deleteNews,
  editNews,
  getAllNewsData,
  handleApprove,
  inActive,
} from "../../../services/newsIntranet/newsInranet";
import { Paginator } from "primereact/paginator"; // Import Paginator
import { resetFormData, validateField } from "../../../utils/commonUtils";
import { useDispatch, useSelector } from "react-redux";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
import { CONFIG } from "../../../config/config";
import { RoleAuth } from "../../../services/CommonServices";
import dayjs from "dayjs";
import moment from "moment";
import { ICurUserData, IPaginationData } from "../../../interface/interface";
import { ToastContainer } from "react-toastify";
import DefaultButton from "../../../components/common/Buttons/DefaultButton";
import RichText from "../../../components/common/RichText/RichText";
import CustomFilePicker from "../../../components/common/CustomInputFields/CustomFilePicker";
import { fetchCurUserData } from "../../../services/BlogsPage/BlogsPageServices";
import { setNewsIntranetData } from "../../../redux/features/NewsIntranetSlice";

const errorGrey = require("../../../assets/images/svg/errorGrey.svg");

let curUserDetail: ICurUserData;
let isAdmin: boolean = false;

interface SearchField {
  selectedDate: Date | any;
  allSearch: string;
  Status: string;
}
interface FormField<T> {
  value: T;
  isValid: boolean;
  errorMsg: string;
  validationRule: {
    required: boolean;
    type: string;
  };
}
interface FormData {
  Title: FormField<string>;
  StartDate: FormField<string>;
  EndDate: FormField<string>;
  Status: FormField<string>;
  thumbnail: FormField<File | any>;
  Description: FormField<string>;
}

interface DateInput {
  StartDate: FormField<string>;
  EndDate: FormField<string>;
}
interface PopupState {
  open: boolean;
  popupTitle: string;
  popupWidth: string;
  popupType: string;
  defaultCloseBtn: boolean;
  centerActionBtn?: boolean;
  confirmationTitle?: string;
  popupData: string;
  isLoading: {
    inprogress: boolean;
    error: boolean;
    success: boolean;
  };
  messages: {
    success: string;
    error: string;
    successDescription: string;
    errorDescription: string;
    inprogress: string;
  };
}

let objFilter: SearchField = {
  selectedDate: null,
  allSearch: "",
  Status: "",
};
let isActivityPage: boolean = false;

const NewsPage = (props: any): JSX.Element => {
  const dispatch = useDispatch();
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isApprove, setIsApprove] = useState<boolean>(false);
  console.log("isApprove: ", isApprove);
  const [selectID, setSelectID] = useState<any | number>(null);
  console.log("selectID: ", selectID);
  const [isfilter, setIsfilter] = useState<boolean>(false);
  console.log("isMobile: ", isMobile);

  const newsIntranetData: any = useSelector((state: any) => {
    return state.NewsIntranetData.value;
  });
  const currentUserDetails: any = useSelector(
    (state: any) => state?.MainSPContext?.currentUserDetails
  );
  isAdmin = currentUserDetails.role === CONFIG.RoleDetails.user ? false : true;

  // popup properties
  const initialPopupController: PopupState[] = [
    {
      open: false,
      popupTitle: "Add an news",
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
        successDescription: "The news 'ABC' has been added successfully.",
        errorDescription:
          "An error occured while adding news, please try again later.",
        inprogress: "Adding news, please wait...",
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
        success: "News Updated successfully!",
        error: "Something went wrong!",
        successDescription: "The news 'ABC' has been Updated successfully.",
        errorDescription:
          "An error occured while Updated news, please try again later.",
        inprogress: "Updated news, please wait...",
      },
    },
    {
      open: false,
      popupTitle: "Confirmation",
      popupWidth: "450px",
      popupType: "confirmation",
      defaultCloseBtn: false,
      confirmationTitle: "Are you sure want to delete this news?",
      popupData: "",
      isLoading: {
        inprogress: false,
        error: false,
        success: false,
      },
      messages: {
        success: "News Deleted successfully!",
        error: "Something went wrong!",
        successDescription: "The news 'ABC' has been Deleted successfully.",
        errorDescription:
          "An error occured while Deleting news, please try again later.",
        inprogress: "Deleting news, please wait...",
      },
    },
    {
      open: false,
      popupTitle: "",
      popupWidth: "1200px",
      popupType: "custom",
      defaultCloseBtn: false,
      popupData: "",
      isLoading: {
        inprogress: false,
        error: false,
        success: false,
      },
      messages: {
        success: "News Deleted successfully!",
        error: "Something went wrong!",
        successDescription: "The news 'ABC' has been Deleted successfully.",
        errorDescription:
          "An error occured while Deleting news, please try again later.",
        inprogress: "Deleting news, please wait...",
      },
    },
    {
      open: false,
      popupTitle: "",
      popupWidth: "350",
      popupType: "custom",
      defaultCloseBtn: false,
      popupData: "",
      isLoading: {
        inprogress: false,
        error: false,
        success: false,
      },
      messages: {
        success: "News Deleted successfully!",
        error: "Something went wrong!",
        successDescription: "The news 'ABC' has been Deleted successfully.",
        errorDescription:
          "An error occured while Deleting news, please try again later.",
        inprogress: "Deleting news, please wait...",
      },
    },

    {
      open: false,
      popupTitle: "Confirmation",
      popupWidth: "450px",
      popupType: "custom",
      centerActionBtn: true,
      defaultCloseBtn: false,
      popupData: "",
      isLoading: {
        inprogress: false,
        error: false,
        success: false,
      },
      messages: {
        success: "Blog approved successfully!",
        error: "Something went wrong!",
        successDescription: "The blog 'ABC' has been approved successfully.",
        errorDescription:
          "An error occured while approve blog, please try again later.",
        inprogress: "Approve blog, please wait...",
      },
    },
  ];

  const [popupController, setPopupController] = useState<PopupState[]>(
    initialPopupController
  );
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<string>("");
  const [pagination, setPagination] = useState<IPaginationData>(
    CONFIG.PaginationData
  );
  const [isfile, setIsile] = useState<boolean>(false);
  const [isDelete, setisDelete] = useState<boolean>(false);
  const [id, setID] = useState<any | null>(null);
  const [searchField, setSearchField] = useState<SearchField>({
    selectedDate: null,
    allSearch: "",
    Status: "",
  });
  const [newsData, setNewsData] = useState<any[]>([]);
  // const [newsData, setNewsData] = useState(newsIntranetData?.data || []);

  const [shownewsData, setShowNewsData] = useState<any[]>([]);
  console.log("shownewsData: ", shownewsData);
  const [dateInput, setDateInput] = useState<any>({
    StartDate: {
      value: new Date(),
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
  });
  const [formData, setFormData] = useState<any>({
    Title: {
      value: "",
      isValid: true,
      errorMsg: "Invalid title",
      validationRule: { required: true, type: "string" },
    },
    StartDate: {
      value: new Date(),
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

    Author: {
      value: "",
      isValid: false,
      errorMsg: "This field is required",
      validationRule: { required: false, type: "string" },
    },
    Authorname: {
      value: "",
      isValid: false,
      errorMsg: "This field is required",
      validationRule: { required: false, type: "string" },
    },
  });

  const totalRecords = newsData?.length || 0;

  // pagination pange change
  const onPageChange = (event: any): void => {
    setPagination({
      first: event?.first || CONFIG.PaginationData.first,
      rows: event?.rows || CONFIG.PaginationData.rows,
    });
  };

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

  const handledateInputChange = (
    field: string,
    value: any,
    isValid: boolean,
    errorMsg: string = ""
  ): void => {
    setDateInput((prevData: any) => ({
      ...prevData,
      [field]: {
        ...prevData[field],
        value: value,
        isValid,
        errorMsg: isValid ? "" : errorMsg,
      },
    }));
  };

  const handleSubmit = async (status?: string | any): Promise<any> => {
    let hasErrors = false;

    // Validate each field and update the state with error messages
    const updatedFormData = Object.keys(formData).reduce((acc, key) => {
      const fieldData = formData[key as keyof FormData];
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
      if (isEdit) {
        setIsEdit(false);
        setisDelete(false);
        resetFormData(formData, setFormData);
        togglePopupVisibility(
          setPopupController,
          initialPopupController[1],
          1,
          "close"
        );
        await editNews(formData, id, isfile, status);
        setIsile(false);
        await getAllNewsData(dispatch);
      } else {
        setIsEdit(false);
        setisDelete(false);
        resetFormData(formData, setFormData);
        togglePopupVisibility(
          setPopupController,
          initialPopupController[0],
          0,
          "close"
        );
        await addNews(formData, status);
        setIsile(false);
        await getAllNewsData(dispatch);
      }
    } else {
      console.log("Form contains errors");
    }
  };

  const handleInputValidation = async (status?: string | any): Promise<any> => {
    let hasErrors = false;

    // Validate each field and update the state with error messages
    const updatedFormData = Object.keys(dateInput).reduce((acc, key) => {
      const fieldData = dateInput[key as keyof DateInput];
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
    }, {} as typeof dateInput);

    setDateInput(updatedFormData);
    debugger;
    if (!hasErrors) {
      await handleApprove(selectID, isApprove, dateInput, "Approved");

      togglePopupVisibility(
        setPopupController,
        initialPopupController[5],
        5,
        "close"
      );
    } else {
      console.log("Form contains errors");
    }
  };

  const popupInputs: any = [
    [
      <div className={styles.addNewsGrid} key={1}>
        <div className={styles.r1}>
          <div className={styles.item1}>
            <CustomInput
              value={formData.Title.value}
              placeholder="Enter title"
              isValid={formData.Title.isValid}
              errorMsg={formData.Title.errorMsg}
              onChange={(e) => {
                const value = e.trimStart();
                const { isValid, errorMsg } = validateField(
                  "Title",
                  value,
                  formData.Title.validationRule
                );
                handleInputChange("Title", value, isValid, errorMsg);
              }}
            />
          </div>
        </div>

        {/* <div className={styles.r2}>
          <div className={styles.item2}>
            <CustomDateInput
              value={formData.StartDate.value}
              label="Start date"
              error={!formData.StartDate.isValid}
              errorMsg={formData.StartDate.errorMsg}
              isDateController={true}
              minimumDate={new Date()}
              maximumDate={
                formData?.EndDate?.value
                  ? new Date(formData?.EndDate?.value)
                  : null
              }
              onChange={(date: any) => {
                const { isValid, errorMsg } = validateField(
                  "StartDate",
                  date,
                  formData.StartDate.validationRule
                );
                handleInputChange("StartDate", date, isValid, errorMsg);
              }}
            />
          </div>
          <div className={styles.item3}>
            <CustomDateInput
              value={formData.EndDate.value}
              label="End date"
              error={!formData.EndDate.isValid}
              errorMsg={formData.EndDate.errorMsg}
              isDateController={true}
              minimumDate={
                formData?.StartDate?.value
                  ? new Date(formData?.StartDate?.value)
                  : null
              }
              maximumDate={null}
              onChange={(date: any) => {
                const { isValid, errorMsg } = validateField("EndDate", date, {
                  required: true,
                  type: "date",
                });
                handleInputChange("EndDate", date, isValid, errorMsg);
              }}
            />
          </div>
        </div> */}

        <div className={styles.r3}>
          {/* <div className={styles.item4}>
            <CustomDropDown
              value={formData.Status.value}
              options={["Active", "Inactive"]}
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
          </div> */}
          <div className={styles.item5}>
            <CustomFilePicker
              context={props.context}
              // selectedFile={formData.Attachments.value}
              onSave={(fileData) => {
                console.log("fileData: ", fileData);

                const value: any = fileData?.file;
                debugger;

                const { isValid, errorMsg } = validateField(
                  "thumbnail",
                  value ? value.name : "",
                  formData.thumbnail.validationRule
                );
                handleInputChange("thumbnail", value, isValid, errorMsg);
              }}
              onChange={(fileData) => {
                console.log("File changed:", fileData);
              }}
              isValid={formData.thumbnail.isValid}
              errorMsg={formData.thumbnail.errorMsg}
              // isValid={false}
              // errorMsg={"Mandatory*"}
            />
            {/* <CustomFileUpload
              accept="image/png,image/svg"
              value={formData?.thumbnail.value?.name}
              onFileSelect={async (file) => {
                console.log("file: ", file);
                const { isValid, errorMsg } = validateField(
                  "thumbnail",
                  file ? file.name : "",
                  formData.thumbnail.validationRule
                );
                await handleInputChange("thumbnail", file, isValid, errorMsg);
              }}
              placeholder="Thumbnail (1120 x 350)"
              isValid={formData.thumbnail.isValid}
              errMsg={formData.thumbnail.errorMsg}
            /> */}
          </div>
        </div>

        <div className={styles.r4}>
          <div className={styles.item5}>
            {/* <FloatingLabelTextarea
              value={formData.Description.value}
              placeholder="Description"
              rows={5}
              isValid={formData.Description.isValid}
              errorMsg={formData.Description.errorMsg}
              onChange={(e: any) => {
                const value = e.trimStart();
                const { isValid, errorMsg } = validateField(
                  "Description",
                  value,
                  formData.Description.validationRule
                );
                handleInputChange("Description", value, isValid, errorMsg);
              }}
            /> */}

            <RichText
              className={`blog ${styles.richtextwrapper}`}
              isValid={!formData?.Description?.isValid}
              errorMsg={formData?.Description?.errorMsg}
              value={formData?.Description?.value}
              onChange={(res: any) => {
                let value: string = "";

                if (res === "<p><br></p>") {
                  value = "";
                } else if (
                  res?.replace(/<(.|\n)*?>/g, "").trim().length === 0
                ) {
                  value = "";
                } else {
                  value = res;
                }

                const { isValid, errorMsg } = validateField(
                  "Description",
                  value,
                  formData?.Description?.validationRule
                );
                handleInputChange("Description", value, isValid, errorMsg);
              }}
              placeholder="Type your content here..."
              // className="myRichTextEditor"
            />
          </div>
        </div>
      </div>,
    ],
    [
      <div className={styles.addNewsGrid} key={1}>
        <div className={styles.r1}>
          <div className={styles.item1}>
            <CustomInput
              value={formData.Title.value}
              placeholder="Enter title"
              isValid={formData.Title.isValid}
              errorMsg={formData.Title.errorMsg}
              onChange={(e) => {
                const value = e.trimStart();
                const { isValid, errorMsg } = validateField(
                  "Title",
                  value,
                  formData.Title.validationRule
                );
                handleInputChange("Title", value, isValid, errorMsg);
              }}
            />
          </div>
        </div>
        {/* {!(currentUserDetails.role === CONFIG.RoleDetails.user) ? (
          <div className={styles.r2}>
            <div className={styles.item2}>
              <CustomDateInput
                value={formData.StartDate.value}
                label="Start date"
                error={!formData.StartDate.isValid}
                errorMsg={formData.StartDate.errorMsg}
                isDateController={true}
                minimumDate={new Date()}
                maximumDate={
                  formData?.EndDate?.value
                    ? new Date(formData?.EndDate?.value)
                    : null
                }
                onChange={(date: any) => {
                  const { isValid, errorMsg } = validateField(
                    "StartDate",
                    date,
                    formData.StartDate.validationRule
                  );
                  handleInputChange("StartDate", date, isValid, errorMsg);
                }}
              />
            </div>
            <div className={styles.item3}>
              <CustomDateInput
                value={formData.EndDate.value}
                label="End date"
                error={!formData.EndDate.isValid}
                errorMsg={formData.EndDate.errorMsg}
                isDateController={true}
                minimumDate={
                  formData?.StartDate?.value
                    ? new Date(formData?.StartDate?.value)
                    : null
                }
                maximumDate={null}
                onChange={(date: any) => {
                  const { isValid, errorMsg } = validateField("EndDate", date, {
                    required: true,
                    type: "date",
                  });
                  handleInputChange("EndDate", date, isValid, errorMsg);
                }}
              />
            </div>
          </div>
        ) : (
          ""
        )} */}

        <div className={styles.r3}>
          {/* {currentUserDetails.role === CONFIG.RoleDetails.user ? (
            <div className={styles.item4}>
              <CustomDropDown
                value={formData.Status.value}
                options={["Active", "Inactive"]}
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
            </div>
          ) : (
            ""
          )} */}

          <div className={styles.item5}>
            <CustomFilePicker
              context={props.context}
              selectedFile={
                !isfile
                  ? formData.thumbnail?.value?.FileName || null
                  : formData.thumbnail.value?.name || null
              }
              // selectedFile={formData.Attachments.value}
              onSave={(fileData) => {
                setIsile(true);

                console.log("fileData: ", fileData);

                const value: any = fileData?.file;
                debugger;

                const { isValid, errorMsg } = validateField(
                  "thumbnail",
                  value ? value.name : "",
                  formData.thumbnail.validationRule
                );
                handleInputChange("thumbnail", value, isValid, errorMsg);
              }}
              onChange={(fileData) => {
                console.log("File changed:", fileData);
              }}
              isValid={formData.thumbnail.isValid}
              errorMsg={formData.thumbnail.errorMsg}
              // isValid={false}
              // errorMsg={"Mandatory*"}
            />
            {/* <CustomFileUpload
              accept="image/png,image/svg"
              value={
                !isfile
                  ? formData.thumbnail?.value?.FileName || null
                  : formData.thumbnail.value?.name || null
              }
              onFileSelect={async (file) => {
                setIsile(true);
                console.log("file: ", file);
                const { isValid, errorMsg } = validateField(
                  "thumbnail",
                  file ? file.name : "",
                  formData.thumbnail.validationRule
                );
                await handleInputChange("thumbnail", file, isValid, errorMsg);
              }}
              placeholder="Thumbnail (1120 x 350)"
              isValid={formData.thumbnail.isValid}
              errMsg={formData.thumbnail.errorMsg}
            /> */}
          </div>
        </div>

        <div className={styles.r4}>
          <div className={styles.item5}>
            {/* <FloatingLabelTextarea
              value={formData.Description.value}
              placeholder="Description"
              rows={5}
              isValid={formData.Description.isValid}
              errorMsg={formData.Description.errorMsg}
              onChange={(e: any) => {
                const value = e.trimStart();
                const { isValid, errorMsg } = validateField(
                  "Description",
                  value,
                  formData.Description.validationRule
                );
                handleInputChange("Description", value, isValid, errorMsg);
              }}
            /> */}

            <RichText
              className={`blog ${styles.richtextwrapper}`}
              isValid={!formData?.Description?.isValid}
              errorMsg={formData?.Description?.errorMsg}
              value={formData?.Description?.value}
              onChange={(res: any) => {
                let value: string = "";

                if (res === "<p><br></p>") {
                  value = "";
                } else if (
                  res?.replace(/<(.|\n)*?>/g, "").trim().length === 0
                ) {
                  value = "";
                } else {
                  value = res;
                }

                const { isValid, errorMsg } = validateField(
                  "Description",
                  value,
                  formData?.Description?.validationRule
                );
                handleInputChange("Description", value, isValid, errorMsg);
              }}
              placeholder="Type your content here..."
              // className="myRichTextEditor"
            />
          </div>
        </div>
      </div>,
    ],

    [
      <div key={2}>
        <p>Are you sure you want to delete this news item?</p>
      </div>,
    ],
    [
      <div key={3}>
        <div
          style={{
            width: "100%",
            height: isMobile ? "auto" : "350px",
            borderRadius: "10px",
          }}
        >
          <img
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "10px",
            }}
            src={formData?.thumbnail?.value}
            alt=""
          />
        </div>

        {isMobile ? (
          <div
            style={
              {
                // display: "flex",
                // justifyContent: "space-between",
                // alignItems: "flex-start",
                // margin: "20px 0px 10px 0px",
              }
            }
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                margin: "20px 0px 10px 0px",
              }}
            >
              <p
                style={{
                  fontSize: "14px",
                  // lineHeight: "px",
                  fontFamily: "osSemibold",
                  color: "#0b4d53",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,

                  // overflow: "hidden"
                  // textOverflow: "ellipsis",
                  // word-break: break-word,
                  // display: -webkit-box,
                  // -webkit-box-orient: vertical,
                  // line-clamp: 5,
                  // -webkit-line-clamp: 5,
                  // white-space: normal
                }}
              >
                {formData?.Title?.value}
              </p>

              <div
                className={
                  formData?.Status?.value == "Active"
                    ? styles.activepill
                    : styles.inactivepill
                }
                // style={{
                //   background: "#daf0da",
                //   padding: "6px 15px",
                //   color: "green",
                //   borderRadius: "4px",
                //   fontSize: "12px",
                //   fontFamily: "osMedium",
                // }}
              >
                {formData?.Status?.value}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                alignItems: "flex-end",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  marginTop: "10px",
                }}
              >
                <img
                  style={{ width: "22px", height: "22px", borderRadius: "50%" }}
                  src={`https://technorucs365.sharepoint.com/_layouts/15/userphoto.aspx?size=L&accountname=${formData?.Author?.value}`}
                />
                <span style={{ fontSize: "12px" }}>
                  {formData?.Authorname?.value}
                </span>
              </div>

              <span style={{ fontSize: "12px", color: "#adadad" }}>
                {" "}
                {`${moment(formData?.StartDate?.value).format(
                  "MM/DD/YYYY"
                )} - ${moment(formData?.EndDate?.value).format("MM/DD/YYYY")}`}
              </span>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              margin: "20px 0px 10px 0px",
            }}
          >
            <div
              style={{
                width: "80%",
              }}
            >
              <p
                style={{
                  fontSize: "22px",
                  lineHeight: "30px",
                  fontFamily: "osSemibold",
                  color: "#0b4d53",
                }}
              >
                {formData?.Title?.value}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  marginTop: "10px",
                }}
              >
                <img
                  style={{ width: "26px", height: "26px", borderRadius: "50%" }}
                  src={`https://technorucs365.sharepoint.com/_layouts/15/userphoto.aspx?size=L&accountname=${formData?.Author?.value}`}
                />
                <span>{formData?.Authorname?.value}</span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                alignItems: "flex-end",
              }}
            >
              <div
                className={
                  formData?.Status?.value === "Active"
                    ? styles.activepill
                    : styles.inactivepill
                }
              >
                {formData?.Status?.value}
              </div>

              <span style={{ fontSize: "14px", color: "#adadad" }}>
                {" "}
                {`${moment(formData?.StartDate?.value).format(
                  "MM/DD/YYYY"
                )} - ${moment(formData?.EndDate?.value).format("MM/DD/YYYY")}`}
              </span>
            </div>
          </div>
        )}

        <div
          className={styles.description}
          // style={{
          //   lineHeight: "23px",
          //   fontSize: "14px",
          //   fontFamily: "osRegular",
          // }}
          dangerouslySetInnerHTML={{
            __html: formData?.Description?.value || "",
          }}
        >
          {/* <p
            style={{
              lineHeight: "23px",
              fontSize: "14px",
              fontFamily: "osRegular",
            }}
          >
            {formData?.Description?.value}
          </p> */}
        </div>
      </div>,
    ],
    [
      <div
        key={4}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          margin: "10px",
        }}
      >
        <CustomDropDown
          value={searchField.Status}
          noErrorMsg
          width={"200px"}
          floatingLabel={false}
          options={["Active", "Inactive"]}
          placeholder="Status"
          onChange={(value) => {
            objFilter.Status = value;
            setSearchField({ ...searchField, Status: value });
            // handleSearch([...shownewsData]);
          }}
          size="SM"
        />

        <CustomInput
          value={searchField.allSearch}
          noErrorMsg
          secWidth="200px"
          labelText="Search"
          placeholder="Search"
          onChange={(e) => {
            const value = e;
            objFilter.allSearch = value;
            setSearchField({ ...searchField, allSearch: value });
            // handleSearch([...shownewsData]);
          }}
          size="SM"
        />
        <CustomDateInput
          label="Select date"
          placeHolder="Date"
          minWidth="200px"
          maxWidth="200px"
          value={searchField.selectedDate ? searchField.selectedDate : null}
          onChange={(e: any) => {
            const value: any = e;
            objFilter.selectedDate = value;
            setSearchField((prev: any) => ({
              ...prev,
              selectedDate: value,
            }));
            // handleSearch([...shownewsData]);
          }}
          size="SM"
        />
      </div>,
    ],
    [
      <div key={5}>
        {!isApprove ? (
          <>
            <p className={styles.approvePopupContent}>
              Are you sure want to Approved This News?
            </p>

            <div
              className={styles.approvePopupClose}
              title="Close"
              onClick={() => {
                togglePopupVisibility(
                  setPopupController,
                  initialPopupController[5],
                  5,
                  "close"
                );
              }}
            >
              <i className="pi pi-times" />
            </div>
          </>
        ) : (
          <div className={styles.r2}>
            <div className={styles.item2}>
              <CustomDateInput
                value={dateInput.StartDate.value}
                label="Start date"
                error={!dateInput.StartDate.isValid}
                errorMsg={dateInput.StartDate.errorMsg}
                isDateController={true}
                minimumDate={new Date()}
                maximumDate={
                  dateInput?.EndDate?.value
                    ? new Date(dateInput?.EndDate?.value)
                    : null
                }
                onChange={(date: any) => {
                  const { isValid, errorMsg } = validateField(
                    "StartDate",
                    date,
                    dateInput.StartDate.validationRule
                  );
                  handledateInputChange("StartDate", date, isValid, errorMsg);
                }}
              />
            </div>
            <div className={styles.item3}>
              <CustomDateInput
                value={dateInput.EndDate.value}
                label="End date"
                error={!dateInput.EndDate.isValid}
                errorMsg={dateInput.EndDate.errorMsg}
                isDateController={true}
                minimumDate={
                  dateInput?.StartDate?.value
                    ? new Date(dateInput?.StartDate?.value)
                    : null
                }
                maximumDate={null}
                onChange={(date: any) => {
                  const { isValid, errorMsg } = validateField("EndDate", date, {
                    required: true,
                    type: "date",
                  });
                  handledateInputChange("EndDate", date, isValid, errorMsg);
                }}
              />
            </div>
          </div>
        )}
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
          setIsEdit(false);
          setisDelete(false);
          setID(null);
          togglePopupVisibility(
            setPopupController,
            initialPopupController[0],
            0,
            "close"
          );
        },
      },

      {
        text: "Save as draft",
        btnType: "primaryGreen",
        endIcon: false,
        startIcon: false,
        disabled: !Object.keys(formData).every((key) => formData[key].isValid),
        size: "large",
        onClick: async () => {
          await handleSubmit("Draft");
          setisDelete(false);
          setIsEdit(false);
          setID(null);
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
          await handleSubmit("Pending");
          setisDelete(false);
          setIsEdit(false);
          setID(null);
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
          setIsEdit(false);
          setisDelete(false);
          setID(null);
          togglePopupVisibility(
            setPopupController,
            initialPopupController[1],
            1,
            "close"
          );
        },
      },

      {
        text: "Save as draft",
        btnType: "primaryGreen",
        endIcon: false,
        startIcon: false,
        disabled: !Object.keys(formData).every((key) => formData[key].isValid),
        size: "large",
        onClick: async () => {
          await handleSubmit("Draft");
          setisDelete(false);
          setIsEdit(false);
          setID(null);
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
          await handleSubmit("Pending");
          setisDelete(false);
          setIsEdit(false);
          setID(null);
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
          setIsEdit(false);
          setisDelete(false);
          setID(null);
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
        size: "large",
        onClick: async () => {
          if (isDelete) {
            togglePopupVisibility(
              setPopupController,
              initialPopupController[2],
              2,
              "close"
            );
            await deleteNews(id);
            setIsEdit(false);
            setID(null);
            setisDelete(false);
            await getAllNewsData(dispatch);
          }
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

    [
      {
        text: "Clear",
        btnType: "darkGreyVariant",
        disabled: false,
        endIcon: false,
        startIcon: false,
        size: "large",
        onClick: () => {
          togglePopupVisibility(
            setPopupController,
            initialPopupController[4],
            4,
            "close"
          );
          handleRefresh();
        },
      },
      {
        text: "Apply",
        btnType: "primaryGreen",
        endIcon: false,
        startIcon: false,
        size: "large",
        onClick: async () => {
          togglePopupVisibility(
            setPopupController,
            initialPopupController[4],
            4,
            "close"
          );
          handleSearch([...shownewsData]);
        },
      },
    ],

    [
      {
        text: isApprove ? "Cancel" : "Reject",
        btnType: "darkGreyVariant",
        disabled: false,
        endIcon: false,
        startIcon: false,
        size: "large",
        onClick: (data: any) => {
          if (data.target.innerText == "Reject") {
            handleApprove(selectID, isApprove, formData, "Reject");
          }
          setIsApprove(false);
          togglePopupVisibility(
            setPopupController,
            initialPopupController[5],
            5,
            "close"
          );
          // handleRefresh();
        },
      },
      {
        text: isApprove ? "Submit" : "Approve",
        btnType: "primaryGreen",
        endIcon: false,
        startIcon: false,
        size: "large",
        onClick: async (data: any) => {
          console.log("data: ", data);

          setIsApprove(true);

          if (isApprove && data?.target?.innerText == "Submit") {
            await handleInputValidation("Approved");
            // handleApprove(selectID, isApprove, formData, "Approved");
          }

          // handleSearch([...shownewsData]);
        },
      },
    ],
  ];

  const handleViewClick = (item: any): void => {
    setFormData({
      Title: {
        ...formData.Title,
        isValid: true,
        value: item.title || "",
      },
      StartDate: {
        ...formData.StartDate,
        isValid: true,
        value: new Date(item.StartDate) || null,
      },
      EndDate: {
        ...formData.EndDate,
        isValid: true,
        value: new Date(item.EndDate) || null,
      },
      Status: {
        ...formData.Status,
        isValid: true,
        value: item.Status || "",
      },
      thumbnail: {
        ...formData.thumbnail,
        isValid: true,
        value: item.imageUrl || null,
      },
      Description: {
        ...formData.Description,
        isValid: true,
        value: item.description || "",
      },

      Author: {
        ...formData.Author,
        isValid: true,
        value: item?.Author || "",
      },
      Authorname: {
        ...formData.Author,
        isValid: true,
        value: item?.AuthorName || "",
      },
    });
    setisDelete(false);
    togglePopupVisibility(
      setPopupController,
      initialPopupController[3],
      3,
      "open"
    );
  };

  const handleApproveClick = (item: any): void => {
    setSelectID(item?.ID);

    setDateInput((prevFormData: any) => ({
      ...prevFormData,
      StartDate: {
        ...prevFormData.StartDate,
        value: new Date(),
      },
    }));

    togglePopupVisibility(
      setPopupController,
      initialPopupController[5],
      5,
      "open"
    );
  };

  const handleEditClick = async (item: any): Promise<any> => {
    setIsile(false);
    setID(item.ID);
    setFormData({
      Title: {
        ...formData.Title,
        isValid: true,
        value: item.title || "",
      },
      StartDate: {
        ...formData.StartDate,
        isValid: true,
        value: new Date(item.StartDate) || null,
      },
      EndDate: {
        ...formData.EndDate,
        isValid: true,
        value: new Date(item.EndDate) || null,
      },
      Status: {
        ...formData.Status,
        isValid: true,
        value: item.Status || "",
      },
      thumbnail: {
        ...formData.thumbnail,
        isValid: true,
        value: item.FileName || null,
      },
      Description: {
        ...formData.Description,
        isValid: true,
        value: item.description || "",
      },
    });
    setisDelete(false);
    togglePopupVisibility(
      setPopupController,
      initialPopupController[1],
      1,
      "open"
    );
  };

  const handleSearch = (val: any): void => {
    let filteredResults = [...val];
    // Apply common text search for title, status, and description

    if (objFilter.Status) {
      const searchValue = objFilter.Status.trimStart().toLowerCase();
      filteredResults = filteredResults.filter(
        (item: any) => item?.Status?.toLowerCase() === searchValue
      );
    }

    if (objFilter.allSearch) {
      const searchValue = objFilter.allSearch.trimStart().toLowerCase();
      filteredResults = filteredResults.filter(
        (item: any) =>
          item?.title?.toLowerCase().includes(searchValue) ||
          // item?.Status?.toLowerCase().includes(searchValue) ||
          item?.description?.toLowerCase().includes(searchValue)
      );
    }

    // Apply date filter if date is selected
    if (objFilter.selectedDate) {
      const formattedDate = dayjs(objFilter.selectedDate).format("YYYY-MM-DD");
      filteredResults = filteredResults.filter(
        (item: any) =>
          dayjs(item.StartDate).format("YYYY-MM-DD") === formattedDate
      );
    }

    // Update the state with filtered results
    setNewsData(filteredResults || []);
  };

  const handleRefresh = (): void => {
    setSearchField({
      allSearch: "",
      selectedDate: null,
      Status: "",
    });
    objFilter = {
      selectedDate: null,
      allSearch: "",
      Status: "",
    };
    setNewsData([...shownewsData]);
  };

  const handleDeleteClick = (id: any): any => {
    setID(id);
    setIsEdit(false);
    togglePopupVisibility(
      setPopupController,
      initialPopupController[2],
      2,
      "open",
      "Confirmation"
    );
  };

  const handleActive = async (item: any, status: any): Promise<void> => {
    const curIndex: number = newsIntranetData?.data?.findIndex(
      (res: any) => res?.ID === item?.ID
    );

    if (newsIntranetData?.data[curIndex]) {
      const updatedData = [...newsIntranetData?.data];
      updatedData[curIndex] = { ...updatedData[curIndex], isActive: status };

      // setNewsData([...updatedData]);
      dispatch?.(
        setNewsIntranetData({
          isLoading: false,
          data: updatedData,
          // error: "Error fetching news data",
        })
      );
    }

    await inActive(Number(item?.ID), status);

    // await prepareNewsData(selectedTab);
  };

  const prepareNewsData = async (curTab: string): Promise<void> => {
    debugger;
    let filteredData: any[] = [];

    if (curTab === CONFIG.NewsTab[0] && newsIntranetData?.data?.length) {
      filteredData = isAdmin
        ? newsIntranetData?.data?.filter(
            (newsItem: any) =>
              Number(moment().format("YYYYMMDD")) <=
                Number(moment(newsItem.EndDate).format("YYYYMMDD")) &&
              newsItem?.Status === "Approved"
          )
        : newsIntranetData?.data?.filter(
            (newsItem: any) =>
              Number(moment().format("YYYYMMDD")) <=
                Number(moment(newsItem.EndDate).format("YYYYMMDD")) &&
              newsItem?.Status === "Approved" &&
              newsItem?.isActive
          );
    } else if (curTab === CONFIG.NewsTab[1] && newsIntranetData?.data?.length) {
      filteredData = newsIntranetData?.data?.filter(
        (newsItem: any) => newsItem?.AuthorId === Number(curUserDetail?.ID)

        // Number(moment().format("YYYYMMDD")) <
        // Number(moment(newsItem.StartDate).format("YYYYMMDD"))
      );
    } else if (curTab === CONFIG.NewsTab[2] && newsIntranetData?.data?.length) {
      filteredData = newsIntranetData?.data?.filter(
        (newsItem: any) =>
          Number(moment().format("YYYYMMDD")) >
          Number(moment(newsItem.EndDate).format("YYYYMMDD"))
      );
    } else if (curTab === CONFIG.NewsTab[3] && newsIntranetData?.data?.length) {
      filteredData = newsIntranetData?.data?.filter(
        (newsItem: any) => newsItem?.Status === "Pending"
        // Number(moment().format("YYYYMMDD")) >
        // Number(moment(newsItem.EndDate).format("YYYYMMDD"))
      );
    }

    objFilter.allSearch = "";
    objFilter.selectedDate = null;
    objFilter.Status = "";
    setSearchField({
      ...searchField,
      allSearch: "",
      selectedDate: null,
      Status: "",
    });
    setSelectedTab(curTab);
    setNewsData([...filteredData]);
    setShowNewsData([...filteredData]);
    handleSearch([...filteredData]);
  };
  const handleResponsiveChange = (): void => {
    setIsMobile(window.innerWidth <= 768);
  };
  const init = async (): Promise<void> => {
    await RoleAuth(
      CONFIG.SPGroupName.Pernix_Admin,
      { highPriorityGroups: [CONFIG.SPGroupName.News_Admin] },
      dispatch
    );
    await getAllNewsData(dispatch);
    await fetchCurUserData().then((res: ICurUserData[]) => {
      curUserDetail = res?.[0] || [];
    });
  };

  useEffect(() => {
    const urlObj = new URL(window.location.href);
    const params = new URLSearchParams(urlObj.search);
    isActivityPage = params?.get("Page") === "activity" ? true : false;

    init();
    handleResponsiveChange();

    // Add event listener for resize
    window.addEventListener("resize", handleResponsiveChange);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener("resize", handleResponsiveChange);
    };
  }, []);

  useEffect(() => {
    prepareNewsData(selectedTab ? selectedTab : CONFIG.NewsTab[0]);
  }, [newsIntranetData]);

  // const filteredNewsData =
  //   currentUserDetails.role === CONFIG.RoleDetails.user
  //     ? newsData?.filter((item: any) => item?.Status.toLowerCase() === "active")
  //     : newsData;

  return (
    <div className={styles.wrapper}>
      <div className={styles.newsHeaderContainer}>
        <div className={styles.leftSection}>
          <i
            onClick={() => {
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
            className="pi pi-arrow-circle-left"
            style={{ fontSize: "1.5rem", color: "#E0803D" }}
          />
          <p>News</p>
        </div>
        <div className={styles.rightSection}>
          {currentUserDetails.role !== CONFIG.RoleDetails.user && !isMobile ? (
            <CustomDropDown
              value={searchField.Status}
              noErrorMsg
              width={"200px"}
              floatingLabel={false}
              options={["Active", "Inactive"]}
              placeholder="Status"
              onChange={(value) => {
                objFilter.Status = value;
                setSearchField({ ...searchField, Status: value });
                handleSearch([...shownewsData]);
              }}
              size="SM"
            />
          ) : null}
          {!isMobile ? (
            <>
              <CustomInput
                value={searchField.allSearch}
                noErrorMsg
                secWidth="180px"
                labelText="Search"
                placeholder="Search"
                onChange={(e) => {
                  const value = e;
                  objFilter.allSearch = value;
                  setSearchField({ ...searchField, allSearch: value });
                  handleSearch([...shownewsData]);
                }}
                size="SM"
              />
              <CustomDateInput
                label="Select date"
                placeHolder="Date"
                minWidth="180px"
                maxWidth="180px"
                value={
                  searchField.selectedDate ? searchField.selectedDate : null
                }
                onChange={(e: any) => {
                  const value: any = e;
                  objFilter.selectedDate = value;
                  setSearchField((prev: any) => ({
                    ...prev,
                    selectedDate: value,
                  }));
                  handleSearch([...shownewsData]);
                }}
                size="SM"
              />
              <div className={styles.refreshBtn}>
                <i onClick={handleRefresh} className="pi pi-refresh" />
              </div>
            </>
          ) : (
            ""
          )}

          <div
            // style={{
            //   display:
            //     currentUserDetails.role === CONFIG.RoleDetails.user
            //       ? "none"
            //       : "flex",
            // }}
            className={styles.addNewbtn}
            onClick={() => {
              resetFormData(formData, setFormData);
              setFormData({
                Title: {
                  value: "",
                  isValid: true,
                  errorMsg: "Invalid title",
                  validationRule: { required: true, type: "string" },
                },
                StartDate: {
                  value: new Date(),
                  isValid: true,
                  errorMsg: "Invalid input",
                  validationRule: {
                    required:
                      formData?.Status?.value == "Approved" &&
                      currentUserDetails.role === CONFIG.RoleDetails.user
                        ? true
                        : false,
                    type: "date",
                  },
                },
                EndDate: {
                  value: "",
                  isValid: true,
                  errorMsg: "Invalid input",
                  validationRule: {
                    required:
                      formData?.Status?.value == "Approved" &&
                      currentUserDetails.role === CONFIG.RoleDetails.user
                        ? true
                        : false,
                    type: "date",
                  },
                },
                Status: {
                  value: "",
                  isValid: true,
                  errorMsg: "Status is required",
                  validationRule: {
                    required:
                      formData?.Status?.value == "Approved" &&
                      currentUserDetails.role === CONFIG.RoleDetails.user
                        ? true
                        : false,
                    type: "string",
                  },
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

              setisDelete(false);
              setIsEdit(false);
              setID(null);
              togglePopupVisibility(
                setPopupController,
                initialPopupController[0],
                0,
                "open"
              );
            }}
          >
            <i
              className="pi pi-plus"
              style={{ fontSize: "1rem", color: "#fff" }}
            />
            {isMobile ? "" : "Add an news"}
          </div>
        </div>
      </div>

      {/* tabs */}
      {/* <div className={styles.tabsContainer}>
        {CONFIG.TabsName.map((str: string, i: number) => {
          return currentUserDetails.role !== CONFIG.RoleDetails.user ? (
            <div
              key={i}
              style={{
                borderBottom:
                  selectedTab === str ? "3px solid #e0803d" : "none",
              }}
              onClick={(_) => {
                setSelectedTab(str);
                prepareNewsData(str);
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
                setSelectedTab(str);
                prepareNewsData(str);
              }}
            >
              {str}
            </div>
          ) : (
            ""
          );
        })}
      </div> */}

      <div className={styles.tabsContainer}>
        {CONFIG.NewsTab.filter((_, i) =>
          currentUserDetails.role !== CONFIG.RoleDetails.user ? true : i < 2
        ).map((str: string, i: number) => (
          <div
            key={i}
            style={{
              borderBottom: selectedTab === str ? "3px solid #e0803d" : "none",
            }}
            onClick={() => {
              setSelectedTab(str);
              prepareNewsData(str);
            }}
          >
            {str}
          </div>
        ))}
      </div>

      <div className={styles.newsContainer}>
        <div className={styles.newsContainerWrapper}>
          {newsIntranetData?.isLoading ? (
            <CircularSpinner />
          ) : newsIntranetData?.error ? (
            <div className="errorWrapper">
              <img src={errorGrey} alt="Error" />
              <span className="disabledText">{newsIntranetData?.error}</span>
            </div>
          ) : newsData?.length === 0 ? (
            <div className="errorWrapper" style={{ height: "50vh" }}>
              <img src={errorGrey} alt="Error" />
              <span className="disabledText">{"No News found"}</span>
            </div>
          ) : (
            newsData
              ?.slice(pagination.first, pagination.first + pagination.rows)
              ?.map((item: any, idx: number) => {
                return (
                  <NewsCard
                    title={item?.title}
                    imageUrl={item?.imageUrl}
                    isActive={item?.isActive}
                    key={idx}
                    idx={idx}
                    status={item?.Status}
                    currentUserDetails={currentUserDetails}
                    description={item?.description}
                    noActions={false}
                    noStatus={false}
                    setIsEdit={setIsEdit}
                    // setIsview={setIsview}
                    setisDelete={setisDelete}
                    handleEditClick={handleEditClick}
                    handleViewClick={handleViewClick}
                    handleDeleteClick={handleDeleteClick}
                    handleApproveClick={handleApproveClick}
                    item={item}
                    selectedTab={selectedTab}
                    handleActive={handleActive}
                    // prepareNewsData={prepareNewsData}
                    // newsIntranetData={newsIntranetData}
                  />
                );
              })
          )}
        </div>

        {isMobile && (
          <div className={styles.filtericon}>
            <i
              className="pi pi-filter"
              onClick={() => {
                setIsfilter(!isfilter);
                // togglePopupVisibility(
                //   setPopupController,
                //   initialPopupController[4],
                //   4,
                //   "open"
                // );
              }}
              // style={{
              //   fontSize: "1.2rem",
              //   color: "#0b4d53",
              //   cursor: "pointer",
              // }}
            />
          </div>
        )}
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
            <CustomDropDown
              value={searchField.Status}
              noErrorMsg
              width={"200px"}
              floatingLabel={false}
              options={["Active", "Inactive"]}
              placeholder="Status"
              onChange={(value) => {
                objFilter.Status = value;
                setSearchField({ ...searchField, Status: value });
                // handleSearch([...shownewsData]);
              }}
              size="SM"
            />

            <CustomInput
              value={searchField.allSearch}
              noErrorMsg
              secWidth="200px"
              labelText="Search"
              placeholder="Search"
              onChange={(e) => {
                const value = e;
                objFilter.allSearch = value;
                setSearchField({ ...searchField, allSearch: value });
                // handleSearch([...shownewsData]);
              }}
              size="SM"
            />
            <CustomDateInput
              label="Select date"
              placeHolder="Date"
              minWidth="200px"
              maxWidth="200px"
              value={searchField.selectedDate ? searchField.selectedDate : null}
              onChange={(e: any) => {
                const value: any = e;
                objFilter.selectedDate = value;
                setSearchField((prev: any) => ({
                  ...prev,
                  selectedDate: value,
                }));
                // handleSearch([...shownewsData]);
              }}
              size="SM"
            />

            <div>
              <DefaultButton
                text="Apply"
                size="small"
                fullWidth
                btnType="primaryGreen"
                onClick={(_) => {
                  handleSearch([...shownewsData]);

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

                  handleRefresh();
                }}
              />
            </div>
          </div>
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
              setIsEdit(false);
              setisDelete(false);
              resetFormData(formData, setFormData);
              togglePopupVisibility(
                setPopupController,
                initialPopupController[index],
                index,
                "close"
              );
              if (popupData?.isLoading?.success) {
                setIsile(false);
                getAllNewsData(dispatch);
              }
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
              popupData?.confirmationTitle
              // popupData.popupType !== "custom" ? popupData.popupTitle : ""
            }
            popupHeight={index === 0 ? true : false}
            noActionBtn={true}
          />
        ))}
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

      {/* pagination */}
      {newsData.length > 0 ? (
        <div className="card">
          <Paginator
            first={pagination.first}
            rows={pagination.rows}
            totalRecords={totalRecords}
            onPageChange={onPageChange}
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink "
          />
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default NewsPage;
