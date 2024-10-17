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
let objFilter = {
  selectedDate: null,
  allSearch: "",
};
const NewsPage = (props: any): JSX.Element => {
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isDelete, setisDelete] = useState<boolean>(false);
  const [id, setID] = useState<any>(null);
  const [searchField, setSearchField] = useState<any>({
    selectedDate: null,
    allSearch: "",
  });
  const [first, setFirst] = useState<any>(0);
  const [rows, setRows] = useState<any>(2);
  const [newsData, setNewsData] = useState<any[]>([]);

  const totalRecords = newsData.length;

  const onPageChange = (event: any) => {
    setFirst(event.first);
    setRows(event.rows);
  };
  const dispatch = useDispatch();
  // popup properties
  const initialPopupController = [
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
      popupWidth: "400px",
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
    StartDate: {
      value: "",
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
      (await isEdit)
        ? editNews(formData, setPopupController, 1, id)
        : addNews(formData, setPopupController, 0);
    } else {
      console.log("Form contains errors");
    }
  };
  const popupInputs: any[] = [
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
            isEdit ? formData.thumbnail?.value : formData.thumbnail.value?.name
          }
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
            isEdit ? formData.thumbnail?.value : formData.thumbnail.value?.name
          }
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
            isEdit ? formData.thumbnail?.value : formData.thumbnail.value?.name
          }
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
    // [
    //   <div>
    //     <p>Are you sure you want to delete this news item?</p>
    //   </div>,
    // ],
  ];
  // const popupInputs: any[] = [
  //   !isDelete ? (
  //     [
  //       <div className={styles.addNewsGrid} key={1}>
  //         <CustomInput
  //           value={formData.Title.value}
  //           placeholder="Enter title"
  //           isValid={formData.Title.isValid}
  //           errorMsg={formData.Title.errorMsg}
  //           onChange={(e) => {
  //             const value = e;
  //             const { isValid, errorMsg } = validateField(
  //               "Title",
  //               value,
  //               formData.Title.validationRule
  //             );
  //             handleInputChange("Title", value, isValid, errorMsg);
  //           }}
  //         />

  //         <CustomDateInput
  //           value={formData.StartDate.value}
  //           label="Start date"
  //           error={!formData.StartDate.isValid}
  //           errorMsg={formData.StartDate.errorMsg}
  //           onChange={(date: any) => {
  //             const { isValid, errorMsg } = validateField(
  //               "StartDate",
  //               date,
  //               formData.StartDate.validationRule
  //             );
  //             handleInputChange("StartDate", date, isValid, errorMsg);
  //           }}
  //         />

  //         <CustomDateInput
  //           value={formData.EndDate.value}
  //           label="End date"
  //           error={!formData.EndDate.isValid}
  //           errorMsg={formData.EndDate.errorMsg}
  //           onChange={(date: any) => {
  //             const { isValid, errorMsg } = validateField("EndDate", date, {
  //               required: true,
  //               type: "date",
  //             });
  //             handleInputChange("EndDate", date, isValid, errorMsg);
  //           }}
  //         />

  //         <CustomDropDown
  //           value={formData.Status.value}
  //           options={["Active", "In Active"]}
  //           placeholder="Status"
  //           isValid={formData.Status.isValid}
  //           errorMsg={formData.Status.errorMsg}
  //           onChange={(value) => {
  //             const { isValid, errorMsg } = validateField(
  //               "Status",
  //               value,
  //               formData.Status.validationRule
  //             );
  //             handleInputChange("Status", value, isValid, errorMsg);
  //           }}
  //         />

  //         <CustomFileUpload
  //           accept="image/png,image/svg"
  //           value={
  //             isEdit
  //               ? formData.thumbnail?.value
  //               : formData.thumbnail.value?.name
  //           }
  //           onFileSelect={async (file) => {
  //             console.log("file: ", file);
  //             const { isValid, errorMsg } = validateField(
  //               "thumbnail",
  //               file ? file.name : "",
  //               formData.thumbnail.validationRule
  //             );
  //             await handleInputChange("thumbnail", file, isValid, errorMsg);
  //           }}
  //           placeholder="Thumbnail"
  //           isValid={formData.thumbnail.isValid}
  //           errMsg={formData.thumbnail.errorMsg}
  //         />

  //         <FloatingLabelTextarea
  //           value={formData.Description.value}
  //           placeholder="Description"
  //           rows={5}
  //           isValid={formData.Description.isValid}
  //           errorMsg={formData.Description.errorMsg}
  //           onChange={(e: any) => {
  //             const value = e;
  //             const { isValid, errorMsg } = validateField(
  //               "Description",
  //               value,
  //               formData.Description.validationRule
  //             );
  //             handleInputChange("Description", value, isValid, errorMsg);
  //           }}
  //         />
  //       </div>,
  //     ]
  //   ) : (
  //     <div>
  //       <p>Are you sure you want to delete this news item?</p>
  //     </div>
  //   ),
  // ];

  // const popupActions: any[] = [
  //   !isDelete
  //     ? [
  //         {
  //           text: "Cancel",
  //           btnType: "darkGreyVariant",
  //           disabled: false,
  //           endIcon: false,
  //           startIcon: false,
  //           size: "large",
  //           onClick: () => {
  //             togglePopupVisibility(
  //               setPopupController,
  //               initialPopupController[0],
  //               0,
  //               "close"
  //             );
  //             setIsEdit(false);
  //             setisDelete(false);
  //             setID(null);
  //           },
  //         },
  //         {
  //           text: isEdit ? "Update" : "Submit",
  //           btnType: "primaryGreen",
  //           endIcon: false,
  //           startIcon: false,
  //           disabled: !Object.keys(formData).every(
  //             (key) => formData[key].isValid
  //           ),
  //           size: "large",
  //           onClick: async () => {
  //             await handleSubmit();
  //             setisDelete(false);

  //             setIsEdit(false);
  //             setID(null);
  //           },
  //         },
  //       ]
  //     : [
  //         {
  //           text: "Cancel",
  //           btnType: "darkGreyVariant",
  //           disabled: false,
  //           endIcon: false,
  //           startIcon: false,
  //           size: "large",
  //           onClick: () => {
  //             togglePopupVisibility(
  //               setPopupController,
  //               initialPopupController[0],
  //               0,
  //               "close"
  //             );
  //             setIsEdit(false);
  //             setisDelete(false);
  //             setID(null);
  //           },
  //         },
  //         {
  //           text: "Delete",
  //           btnType: "primaryGreen",
  //           endIcon: false,
  //           startIcon: false,
  //           // disabled: !Object.keys(formData).every(
  //           //   (key) => formData[key].isValid
  //           // ),
  //           size: "large",
  //           onClick: async () => {
  //             // await handleSubmit();

  //             await deleteNews(id, setPopupController, 0);
  //             setIsEdit(false);
  //             setID(null);
  //             setisDelete(false);
  //           },
  //         },
  //       ],
  // ];

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

  const handleEditClick = async (item: any) => {
    setID(item.ID);
    setisDelete(false);
    await togglePopupVisibility(
      setPopupController,
      initialPopupController[1],
      1,
      "open"
    );

    await setFormData({
      Title: {
        ...formData.Title,
        value: item.title || "", // Set title value from clicked item
      },
      StartDate: {
        ...formData.StartDate,
        value: new Date(item.StartDate) || null, // Set start date value from clicked item
      },
      EndDate: {
        ...formData.EndDate,
        value: new Date(item.EndDate) || null, // Set end date value from clicked item
      },
      Status: {
        ...formData.Status,
        value: item.Status || "", // Set status value from clicked item
      },
      thumbnail: {
        ...formData.thumbnail,
        value: item.FileName || null, // Set thumbnail value from clicked item
      },
      Description: {
        ...formData.Description,
        value: item.description || "", // Set description value from clicked item
      },
    });
  };

  useEffect(() => {
    RoleAuth(
      CONFIG.SPGroupName.Pernix_Admin,
      CONFIG.SPGroupName.News_Admin,
      dispatch
    );
    getAllNewsData(dispatch);
  }, []);
  // const handleSearch = (value: any) => {
  //   let search = newsIntranetData?.data?.filter(
  //     (val: any) =>
  //       dayjs(val.StartDate).format("YYYY-MM-DD") ===
  //       dayjs(value).format("YYYY-MM-DD")
  //   );
  //   setNewsData(search);
  // };

  const handleSearch = (val: any) => {
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

  const handleRefresh = () => {
    setSearchField({
      allSearch: "",
      selectedDate: null,
    });
    objFilter = {
      selectedDate: null,
      allSearch: "",
    };
    setNewsData(newsIntranetData?.data); // Reset to the original data
  };

  const handleDeleteClick = (id: any) => {
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
    // Fetch news data from the Redux store (or any other API)
    setNewsData(newsIntranetData?.data || []);
  }, [newsIntranetData]);

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "20px",
          // padding: "20px",
        }}
      >
        <div>
          <i
            className="pi pi-arrow-circle-left
"
            style={{ fontSize: "1.5rem", color: "#E0803D" }}
          ></i>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <i
            onClick={handleRefresh}
            style={{ fontSize: "1.5rem", color: "#E0803D" }}
            className="pi pi-refresh
 "
          ></i>
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
          <div
            style={{
              display: "flex",
              alignItems: "Center",
              gap: "10px",
              fontSize: "15px",
              fontWeight: "500",
              background: "#0B4D53",
              width: "114px",
              height: "40px",
              color: "#ffff",
              padding: "4px 8px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={() => {
              setisDelete(false);
              setIsEdit(false);
              setID(null);
              togglePopupVisibility(
                setPopupController,
                initialPopupController[0],
                0,
                "open"
              );
              resetFormData(formData, setFormData);
            }}
          >
            <i
              className="pi pi-plus"
              style={{ fontSize: "1rem", color: "#fff" }}
            ></i>
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
          ) : (
            newsData
              ?.slice(first, first + rows)
              .map((item: any, idx: number) => (
                <NewsCard
                  title={item?.title}
                  imageUrl={item?.imageUrl}
                  key={idx}
                  status={item?.Status}
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
              togglePopupVisibility(
                setPopupController,
                initialPopupController[index],
                index,
                "close"
              );
              debugger;
              if (popupData?.isLoading?.success) {
                getAllNewsData(dispatch);
              }
              resetFormData(formData, setFormData);
              setIsEdit(false);
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
      <div className="card">
        <Paginator
          first={first}
          rows={rows}
          totalRecords={totalRecords}
          onPageChange={onPageChange}
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink "
        />
      </div>
    </>
  );
};

export default NewsPage;
