/* eslint-disable no-debugger */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import SectionHeaderIntranet from "../../../components/common/SectionHeaderIntranet/SectionHeaderIntranet";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../utils/popupUtils";
import { Calendar } from "primereact/calendar";
import "../../../assets/styles/style.css";
import NewsCard from "./NewsCard/NewsCard";
import styles from "./NewsPage.module.scss";
import Popup from "../../../components/common/Popups/Popup";
import CustomInput from "../../../components/common/CustomInputFields/CustomInput";
import CustomDateInput from "../../../components/common/CustomInputFields/CustomDateInput";
import FloatingLabelTextarea from "../../../components/common/CustomInputFields/CustomTextArea";
import CustomDropDown from "../../../components/common/CustomInputFields/CustomDropDown";
import CustomFileUpload from "../../../components/common/CustomInputFields/CustomFileUpload";
import {
  addNews,
  deleteNews,
  editNews,
  getAllNewsData,
} from "../../../services/newsIntranet/newsInranet";

import { Paginator } from "primereact/paginator"; // Import Paginator

import { resetFormData, validateField } from "../../../utils/commonUtils";
import { useDispatch, useSelector } from "react-redux";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
import { CONFIG } from "../../../config/config";
import { RoleAuth } from "../../../services/CommonServices";
import dayjs from "dayjs";
import { InputText } from "primereact/inputtext";
// const PernixBannerImage = require("../../../assets/images/svg/PernixBannerImage.svg");
const errorGrey = require("../../../assets/images/svg/errorGrey.svg");

interface SearchField {
  selectedDate: Date | any;
  allSearch: string;
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
interface PopupState {
  open: boolean;
  popupTitle: string;
  popupWidth: string;
  popupType: string;
  defaultCloseBtn: boolean;
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
};
const NewsPage = (props: any): JSX.Element => {
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isfile, setIsile] = useState<boolean>(false);
  const [isDelete, setisDelete] = useState<boolean>(false);
  const [id, setID] = useState<any | null>(null);
  const [searchField, setSearchField] = useState<SearchField>({
    selectedDate: null,
    allSearch: "",
  });
  const [first, setFirst] = useState<number>(0);
  const [rows, setRows] = useState<number>(10);
  const [newsData, setNewsData] = useState<any[]>([]);

  const totalRecords = newsData.length;
  // pagination pange change
  const onPageChange = (event: any): void => {
    setFirst(event.first);
    setRows(event.rows);
  };
  const dispatch = useDispatch();
  // popup properties
  const initialPopupController: PopupState[] = [
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

    {
      open: false,
      popupTitle: "Update News",
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
        successDescription: "The new news 'ABC' has been Updated successfully.",
        errorDescription:
          "An error occured while Updated news, please try again later.",
        inprogress: "Updated new news, please wait...",
      },
    },

    {
      open: false,
      popupTitle: "Delete news",
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
        success: "News Deleted successfully!",
        error: "Something went wrong!",
        successDescription: "The new news 'ABC' has been Deleted successfully.",
        errorDescription:
          "An error occured while Deleting news, please try again later.",
        inprogress: "Deleting new news, please wait...",
      },
    },
  ];

  const [popupController, setPopupController] = useState<PopupState[]>(
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

    debugger;
  };

  const handleSubmit = async (): Promise<any> => {
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
      (await isEdit)
        ? editNews(formData, setPopupController, 1, id, isfile)
        : addNews(formData, setPopupController, 0);
    } else {
      console.log("Form contains errors");
    }
  };
  const popupInputs: any = [
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

    [
      <div key={2}>
        <p>Are you sure you want to delete this news item?</p>
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
        text: "Submit",
        btnType: "primaryGreen",
        endIcon: false,
        startIcon: false,
        disabled: !Object.keys(formData).every((key) => formData[key].isValid),
        size: "large",
        onClick: async () => {
          await handleSubmit();
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
        text: "Update",
        btnType: "primaryGreen",
        endIcon: false,
        startIcon: false,
        disabled: !Object.keys(formData).every((key) => formData[key].isValid),
        size: "large",
        onClick: async () => {
          await handleSubmit();
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
        // disabled: !Object.keys(formData).every(
        //   (key) => formData[key].isValid
        // ),
        size: "large",
        onClick: async () => {
          // await handleSubmit();

          (await isDelete) && deleteNews(id, setPopupController, 2);
          setIsEdit(false);
          setID(null);
          setisDelete(false);
        },
      },
    ],
  ];

  const handleEditClick = async (item: any): Promise<any> => {
    console.log("item: ", item);
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

  useEffect(() => {
    RoleAuth(
      CONFIG.SPGroupName.Pernix_Admin,
      CONFIG.SPGroupName.News_Admin,
      dispatch
    );
    getAllNewsData(dispatch);
  }, []);

  const handleSearch = (val: any): void => {
    let filteredResults = [...newsIntranetData.data];

    // Apply common text search for title, status, and description
    if (val.allSearch) {
      const searchValue = val.allSearch.trim().toLowerCase();
      filteredResults = filteredResults.filter(
        (item: any) =>
          item?.title?.toLowerCase().includes(searchValue) ||
          item?.Status?.toLowerCase().includes(searchValue) ||
          item?.description?.toLowerCase().includes(searchValue)
      );
    }

    // Apply date filter if date is selected
    if (val.selectedDate) {
      const formattedDate = dayjs(val.selectedDate).format("YYYY-MM-DD");
      filteredResults = filteredResults.filter(
        (item: any) =>
          dayjs(item.StartDate).format("YYYY-MM-DD") === formattedDate
      );
    }

    // Update the state with filtered results
    setNewsData(filteredResults);
  };

  const handleRefresh = (): void => {
    setSearchField({
      allSearch: "",
      selectedDate: null,
    });
    objFilter = {
      selectedDate: null,
      allSearch: "",
    };
    setNewsData(newsIntranetData?.data);
  };

  const handleDeleteClick = (id: any): any => {
    setID(id);
    setIsEdit(false);
    togglePopupVisibility(
      setPopupController,
      initialPopupController[2],
      2,
      "open",
      "Delete News"
    );
  };
  useEffect(() => {
    setNewsData(newsIntranetData?.data || []);
  }, [newsIntranetData]);

  const filteredNewsData = !(
    currentUserDetails.role === CONFIG.RoleDetails.User
  )
    ? newsData.filter((item) => item?.Status.toLowerCase() === "active")
    : newsData;

  return (
    <>
      <div className={styles.newsHeaderContainer}>
        <div
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
            style={{ fontSize: "1.5rem", color: "#E0803D" }}
          />
        </div>
        <div className={styles.rightSection}>
          <InputText
            value={searchField.allSearch}
            placeholder="Search"
            onChange={(e) => {
              objFilter.allSearch = e.target.value;
              setSearchField({ ...searchField, allSearch: e.target.value });
              handleSearch({ ...objFilter });
            }}
          />

          <Calendar
            value={searchField.selectedDate ? searchField.selectedDate : null}
            onChange={(data: any) => {
              objFilter.selectedDate = data?.value;

              setSearchField({ ...searchField, selectedDate: data?.value });

              handleSearch({ ...objFilter });
            }}
            showIcon
            monthNavigator
            yearNavigator
            yearRange="2000:2100"
            dateFormat="dd/mm/yy"
            placeholder={"select date"}
            // className={`${styles.d_datepicker}`}
            style={{ width: "200px" }}
          />
          <div className={styles.refreshBtn}>
            <i onClick={handleRefresh} className="pi pi-refresh" />
          </div>
          <div
            style={{
              display:
                currentUserDetails.role === CONFIG.RoleDetails.User
                  ? "none"
                  : "flex",
            }}
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

              setisDelete(false);
              setIsEdit(false);
              setID(null);
              togglePopupVisibility(
                setPopupController,
                initialPopupController[0],
                0,
                "open"
              );
              debugger;
            }}
          >
            <i
              className="pi pi-plus"
              style={{ fontSize: "1rem", color: "#fff" }}
            />
            Add new
          </div>
        </div>
      </div>
      <div className={styles.newsContainer}>
        <SectionHeaderIntranet
          label={"News"}
          removeAdd
          headerAction={() => {
            togglePopupVisibility(
              setPopupController,
              initialPopupController[0],
              0,
              "open"
            );
            resetFormData(formData, setFormData);
            setIsEdit(false);
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
          ) : filteredNewsData.length === 0 ? (
            <div>
              <p>No News Found!!!</p>
            </div>
          ) : (
            filteredNewsData
              ?.slice(first, first + rows)
              .map((item: any, idx: number) => (
                <NewsCard
                  title={item?.title}
                  imageUrl={item?.imageUrl}
                  key={idx}
                  status={item?.Status}
                  currentUserDetails={currentUserDetails}
                  description={item?.description}
                  noActions={false}
                  noStatus={false}
                  setIsEdit={setIsEdit}
                  setisDelete={setisDelete}
                  handleEditClick={handleEditClick}
                  handleDeleteClick={handleDeleteClick}
                  item={item}
                />
              ))
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
              setIsEdit(false);
              setisDelete(false);
              togglePopupVisibility(
                setPopupController,
                initialPopupController[index],
                index,
                "close"
              );
              debugger;
              if (popupData?.isLoading?.success) {
                setIsile(false);
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

      {/* pagination */}
      {newsData.length > 0 ? (
        <div className="card">
          <Paginator
            first={first}
            rows={rows}
            totalRecords={totalRecords}
            onPageChange={onPageChange}
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink "
          />
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default NewsPage;
