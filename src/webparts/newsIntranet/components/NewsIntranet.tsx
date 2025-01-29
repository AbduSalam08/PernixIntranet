/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import SectionHeaderIntranet from "../../../components/common/SectionHeaderIntranet/SectionHeaderIntranet";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../utils/popupUtils";
import NewsCard from "./NewsCard/NewsCard";
import styles from "./NewsIntranet.module.scss";
import Popup from "../../../components/common/Popups/Popup";
import CustomInput from "../../../components/common/CustomInputFields/CustomInput";
//import CustomDateInput from "../../../components/common/CustomInputFields/CustomDateInput";
// import FloatingLabelTextarea from "../../../components/common/CustomInputFields/CustomTextArea";
//import CustomDropDown from "../../../components/common/CustomInputFields/CustomDropDown";
//import CustomFileUpload from "../../../components/common/CustomInputFields/CustomFileUpload";
import {
  addNews,
  getAllNewsData,
  // getStatusStyles,
} from "../../../services/newsIntranet/newsInranet";
import "./Style.css";
import { resetFormData, validateField } from "../../../utils/commonUtils";
import { useDispatch, useSelector } from "react-redux";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
import ViewAll from "../../../components/common/ViewAll/ViewAll";
import { CONFIG } from "../../../config/config";
import { RoleAuth } from "../../../services/CommonServices";
import moment from "moment";
import { ToastContainer } from "react-toastify";
import useMediaQuery from "@mui/material/useMediaQuery";
import RichText from "../../../components/common/RichText/RichText";
import "./Style.css";
import CustomFilePicker from "../../../components/common/CustomInputFields/CustomFilePicker";

const errorGrey = require("../../../assets/images/svg/errorGrey.svg");

const NewsIntranet = (props: any): JSX.Element => {
  const dispatch = useDispatch();
  const isMobile = useMediaQuery("(max-width:768px)");

  // popup properties
  const initialPopupController = [
    {
      open: false,
      popupTitle: "Add a news",
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
        success: "News added successfully!",
        error: "Something went wrong!",
        successDescription: "The new news 'ABC' has been added successfully.",
        errorDescription:
          "An error occured while adding news, please try again later.",
        inprogress: "Adding new news, please wait...",
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
      validationRule: { required: false, type: "date" },
    },
    EndDate: {
      value: "",
      isValid: true,
      errorMsg: "Invalid input",
      validationRule: { required: false, type: "date" },
    },
    Status: {
      value: "",
      isValid: true,
      errorMsg: "Status is required",
      validationRule: { required: false, type: "string" },
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
  const [shownewsdata, setShownewsdata] = useState<any>([]);
  const [isActive, setisActive] = useState<string>("");

  const newsIntranetData: any = useSelector((state: any) => {
    return state.NewsIntranetData.value;
  });
  const currentUserDetails: any = useSelector(
    (state: any) => state?.MainSPContext?.currentUserDetails
  );

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

  const handleSubmit = async (status: string): Promise<any> => {
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
      resetFormData(formData, setFormData);
      togglePopupVisibility(
        setPopupController,
        initialPopupController[0],
        0,
        "close"
      );

      await addNews(formData, status);
      await getAllNewsData(dispatch);
    } else {
      console.log("Form contains errors");
    }
  };

  const popupInputs: any[] = [
    [
      <div key={1}>
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

        {/* <div
          style={{
            display: "flex",
            gap: "20px",
            alignItems: "center",
            margin: "20px 0px",
          }}
        >
          <div style={{ width: "50%" }}>
            <CustomDateInput
              value={formData.StartDate.value}
              label="Start Date"
              isDateController={true}
              minimumDate={new Date()}
              maximumDate={
                formData?.EndDate?.value
                  ? new Date(formData?.EndDate?.value)
                  : null
              }
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
          </div>
          <div style={{ width: "50%" }}>
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
        <div
          style={{
            display: "flex",
            gap: "20px",
            alignItems: "center",
            margin: "20px 0px",
          }}
        >
          {/* <div style={{ width: "50%" }}>
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

          <div style={{ width: "100%" }}>
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
              value={formData.thumbnail.value?.name}
              onFileSelect={(file) => {
                console.log("file: ", file);
                const { isValid, errorMsg } = validateField(
                  "thumbnail",
                  file ? file.name : "",
                  formData.thumbnail.validationRule
                );
                handleInputChange("thumbnail", file, isValid, errorMsg);
              }}
              placeholder="Thumbnail (1120 x 350)"
              isValid={formData.thumbnail.isValid}
              errMsg={formData.thumbnail.errorMsg}
            /> */}
          </div>
        </div>

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
            } else if (res?.replace(/<(.|\n)*?>/g, "").trim().length === 0) {
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
      </div>,
    ],

    [
      <div key={2}>
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
                  isActive === "Active"
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
                {isActive}
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
                  src={`/_layouts/15/userphoto.aspx?size=L&accountname=${formData?.Author?.value}`}
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
                  src={`/_layouts/15/userphoto.aspx?size=L&accountname=${formData?.Author?.value}`}
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
                  isActive === "Active"
                    ? styles.activepill
                    : styles.inactivepill
                }
              >
                {isActive}
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
          style={{
            lineHeight: "23px",
            fontSize: "14px",
            fontFamily: "osRegular",
          }}
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

        {/* <div
          className={styles.Statuspill}
          style={getStatusStyles(formData?.Status?.value || "default")}
         
        >
          {formData?.Status?.value}
        </div> */}
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
        text: "Save as draft",
        btnType: "primaryGreen",
        endIcon: false,
        startIcon: false,
        disabled: !Object.keys(formData).every((key) => formData[key].isValid),
        size: "large",
        onClick: async () => {
          await handleSubmit("Draft");
          // setisDelete(false);
          // setIsEdit(false);
          // setID(null);
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
      // {
      //   text: "Submit",
      //   btnType: "primaryGreen",
      //   endIcon: false,
      //   startIcon: false,
      //   disabled: !Object.keys(formData).every((key) => formData[key].isValid),
      //   size: "large",
      //   onClick: async () => {
      //     await handleSubmit();
      //   },
      // },
    ],
  ];

  const handlenavigate = (): void => {
    window.open(
      props.context.pageContext.web.absoluteUrl + CONFIG.NavigatePage.NewsPage,
      "_self"
    );
  };

  const prepareData = (item: any): void => {
    let filteredData: any[] = [];

    filteredData = newsIntranetData?.data?.filter(
      (newsItem: any) =>
        Number(moment().format("YYYYMMDD")) >=
          Number(moment(newsItem.StartDate).format("YYYYMMDD")) &&
        Number(moment().format("YYYYMMDD")) <=
          Number(moment(newsItem.EndDate).format("YYYYMMDD")) &&
        newsItem?.Status === "Approved" &&
        newsItem?.isActive
    );

    setShownewsdata(filteredData);
  };

  const handleViewClick = (item: any): void => {
    setisActive(item?.isActive === true ? "Active" : "Inactive");
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
      { highPriorityGroups: [CONFIG.SPGroupName.News_Admin] },
      dispatch
    );
    getAllNewsData(dispatch);
  }, []);

  useEffect(() => {
    prepareData(newsIntranetData?.data);
  }, [newsIntranetData]);

  return (
    <>
      <div className={styles.newsContainer}>
        <SectionHeaderIntranet
          label={"News"}
          title="Add a new news"
          removeAdd={
            currentUserDetails.role === CONFIG.RoleDetails.user ? true : false
          }
          headerAction={() => {
            togglePopupVisibility(
              setPopupController,
              initialPopupController[0],
              0,
              "open"
            );

            resetFormData(formData, setFormData);
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
          ) : shownewsdata?.length === 0 ? (
            <div className="errorWrapper" style={{ height: "50vh" }}>
              <img src={errorGrey} alt="Error" />
              <span className="disabledText">{"No News found."}</span>
            </div>
          ) : (
            shownewsdata
              ?.slice(0, 3)
              ?.map((item: any, idx: number) => (
                <NewsCard
                  title={item?.title}
                  imageUrl={item?.imageUrl}
                  key={idx}
                  description={item?.description}
                  noActions={true}
                  noStatus={true}
                  handleViewClick={handleViewClick}
                  item={item}
                />
              ))
          )}
        </div>

        <ViewAll onClick={handlenavigate} />

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

              if (popupData?.isLoading?.success) {
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
              popupData.popupType !== "custom" ? popupData.popupTitle : ""
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
    </>
  );
};

export default NewsIntranet;
