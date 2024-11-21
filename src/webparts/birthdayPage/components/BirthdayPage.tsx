/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
import { useEffect, useState } from "react";
import styles from "./BirthdayPage.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { setMainSPContext } from "../../../redux/features/MainSPContextSlice";
import {
  addBirthday,
  deleteBirthday,
  getAllBirthdayData,
  getBirthdayCurrentUserRole,
  submitBirthdayWish,
  updateBirthday,
} from "../../../services/BirthDayIntranet/birthDayIntranet";
import { CONFIG } from "../../../config/config";
import {
  IPageSearchFields,
  IPaginationData,
} from "../../../interface/interface";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
import CustomInput from "../../../components/common/CustomInputFields/CustomInput";
import { Paginator } from "primereact/paginator";
import Popup from "../../../components/common/Popups/Popup";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../utils/popupUtils";
import { resetFormData, validateField } from "../../../utils/commonUtils";
import CustomPeoplePicker from "../../../components/common/CustomInputFields/CustomPeoplePicker";
import CustomFileUpload from "../../../components/common/CustomInputFields/CustomFileUpload";
import CustomDateInput from "../../../components/common/CustomInputFields/CustomDateInput";
import FloatingLabelTextarea from "../../../components/common/CustomInputFields/CustomTextArea";
// images
const wishImg: any = require("../../../assets/images/svg/wishImg.svg");
const teamsImg: any = require("../../../assets/images/svg/Birthday/teamsIcon.svg");
const outlookImg: any = require("../../../assets/images/svg/Birthday/outlookIcon.svg");
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import moment from "moment";

const BirthdayPage = (props: any): JSX.Element => {
  const dispatch = useDispatch();
  const searchField: IPageSearchFields = CONFIG.PageSearchFields;
  const initialPopupController = [
    {
      open: false,
      popupTitle: "New birthday",
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
        success: "Birthday sended successfully!",
        error: "Something went wrong!",
        successDescription: "The birtha has been added successfully.",
        errorDescription:
          "An error occured while adding news, please try again later.",
        inprogress: "Adding birthday, please wait...",
      },
    },
    {
      open: false,
      // popupTitle: "Send the wish",
      popupWidth: "800px",
      popupType: "custom",
      defaultCloseBtn: false,
      popupData: "",
      isLoading: {
        inprogress: false,
        error: false,
        success: false,
      },
      messages: {
        success: "Wishes sended successfully!",
        error: "Something went wrong!",
        successDescription: "The wishes 'ABC' has been sended successfully.",
        errorDescription:
          "An error occured while adding news, please try again later.",
        inprogress: "Sending wishes, please wait...",
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
        success: "Birthday deleted successfully!",
        error: "Something went wrong!",
        successDescription: "The birthday has been deleted successfully.",
        errorDescription:
          "An error occured while delete birthday, please try again later.",
        inprogress: "Deleting birthay, please wait...",
      },
    },
  ];
  const initialFormData = {
    EmployeeName: {
      value: "",
      isValid: true,
      errorMsg: "This field is required",
      validationRule: { required: true, type: "array" },
    },
    DateOfBirth: {
      value: "",
      isValid: true,
      errorMsg: "This field is required",
      validationRule: { required: true, type: "string" },
    },
    Image: {
      value: null,
      isValid: true,
      errorMsg: "Invalid file",
      validationRule: { required: true, type: "file" },
    },
    Message: {
      value: "",
      isValid: true,
      errorMsg: "This field is required",
      validationRule: { required: true, type: "string" },
    },
  };
  const birthDaysData: any = useSelector((state: any) => {
    return state.BirthdaysData.value;
  });
  console.log("birthDaysData", birthDaysData);
  const [popupController, setPopupController] = useState(
    initialPopupController
  );
  const [currentUserDetails, setCurrentUserDetails] = useState<any>({
    role: "User",
    email: "",
  });
  const [formData, setFormData] = useState<any>(initialFormData);
  const [handleForm, setHandleForm] = useState<any>({
    BirthDayID: null,
    BirthDayWishID: null,
    Type: "",
  });
  const [birthdays, setBirthdays] = useState<any[]>([]);
  const [typeBirthdays, setTypeBirthdays] = useState<any[]>([]);
  const [showBirthdays, setShowBirthdays] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<string>("");
  const [attachmentObject, setAttachmentObject] = useState<any>({});
  const [pagination, setPagination] = useState<IPaginationData>(
    CONFIG.birthdayPaginationData
  );
  const [commonSearch, setCommonSearch] = useState<IPageSearchFields>({
    ...CONFIG.PageSearchFields,
  });
  console.log("formData", formData);
  console.log("currentUserDetails", currentUserDetails);
  console.log("attachmentObject", attachmentObject);
  console.log(birthdays, typeBirthdays, showBirthdays);

  const totalRecords = showBirthdays?.length || 0;
  const onPageChange = (event: any): void => {
    setPagination({
      first: event?.first || CONFIG.birthdayPaginationData.first,
      rows: event?.rows || CONFIG.birthdayPaginationData.rows,
    });
  };

  const handleSearch = async (datas: any[]): Promise<void> => {
    console.log("datas", datas);

    let temp: any[] = [...datas];
    if (searchField.Search) {
      temp = temp?.filter(
        (val: any) =>
          val?.Message.toLowerCase().includes(
            searchField.Search.toLowerCase()
          ) ||
          val?.EmployeeName?.name
            ?.toLowerCase()
            .includes(searchField.Search.toLowerCase())
      );
    }
    setShowBirthdays([...temp]);
    await onPageChange("");
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

  const handleSubmit = async (sendBy: string): Promise<any> => {
    let hasErrors = false;
    // Validate each field and update the state with error messages
    const updatedFormData = Object.keys(formData).reduce((acc, key) => {
      const fieldData = formData[key];
      const { isValid, errorMsg } = validateField(
        key,
        key === "EmployeeName"
          ? fieldData?.value?.length > 0
            ? fieldData.value
            : fieldData.value
            ? [fieldData.value]
            : []
          : fieldData.value,
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
      if (handleForm?.Type === "New") {
        await addBirthday(formData, setPopupController, 0);
      } else if (handleForm?.Type === "Update") {
        const reponse = await updateBirthday(
          formData,
          handleForm?.BirthDayID,
          attachmentObject,
          setPopupController,
          0
        );
        console.log("reponse", reponse);
      } else {
        let payloadJson = {};
        if (sendBy === "Teams") {
          payloadJson = {
            Message: formData?.Message?.value,
            BirthDayId: handleForm?.BirthDayID,
            isTeams: true,
          };
        } else {
          payloadJson = {
            Message: formData?.Message?.value,
            BirthDayId: handleForm?.BirthDayID,
            isOutlook: true,
          };
        }
        await submitBirthdayWish(
          handleForm?.BirthDayWishID,
          payloadJson,
          setPopupController,
          1
        );
      }
    } else {
      console.log("Form contains errors");
    }
  };

  const popupInputs: any[] = [
    [
      <div className={styles.newBirthdayGrid} key={1}>
        <div className={styles.firstRow}>
          <div className={styles.c1}>
            <CustomPeoplePicker
              labelText="Employee name"
              isValid={formData?.EmployeeName?.isValid}
              errorMsg={formData?.EmployeeName?.errorMsg}
              selectedItem={[formData?.EmployeeName?.value]}
              readOnly={handleForm?.Type === "Update"}
              onChange={(item: any) => {
                const value = item[0];
                console.log("value: ", value);
                const message = `Dear ${value?.name},
Wishing you a very happy birthday! I hope your day is filled with joy, celebration, and memorable moments. May the year ahead bring you great success, good health, and happiness.
Enjoy your special day!`;
                const { isValid, errorMsg } = validateField(
                  "EmployeeName",
                  item,
                  formData?.EmployeeName?.validationRule
                );
                handleInputChange("EmployeeName", value, isValid, errorMsg);
                handleInputChange(
                  "Message",
                  value?.name ? message : "",
                  true,
                  ""
                );
              }}
            />
          </div>
          <div className={styles.c1}>
            <CustomDateInput
              value={formData?.DateOfBirth?.value}
              label="Date of birth"
              isDateController={true}
              minimumDate={new Date()}
              error={!formData?.DateOfBirth?.isValid}
              errorMsg={formData?.DateOfBirth?.errorMsg}
              onChange={(date: any) => {
                const { isValid, errorMsg } = validateField(
                  "DateOfBirth",
                  date,
                  formData?.DateOfBirth?.validationRule
                );
                handleInputChange("DateOfBirth", date, isValid, errorMsg);
              }}
            />
          </div>
          <div className={styles.c1}>
            <CustomFileUpload
              accept="image/png,image/jpeg"
              value={formData?.Image?.value?.name}
              onFileSelect={async (file) => {
                console.log("file: ", file);
                const { isValid, errorMsg } = validateField(
                  "Image",
                  file ? file.name : "",
                  formData?.Image?.validationRule
                );
                await handleInputChange("Image", file, isValid, errorMsg);
              }}
              placeholder="Image (350 x 350)"
              isValid={formData?.Image?.isValid}
              errMsg={formData?.Image?.errorMsg}
            />
          </div>
        </div>
        <FloatingLabelTextarea
          value={formData.Message.value}
          placeholder="Message"
          rows={5}
          isValid={formData.Message.isValid}
          errorMsg={formData.Message.errorMsg}
          onChange={(e: any) => {
            const value = e.trimStart();
            const { isValid, errorMsg } = validateField(
              "Message",
              value,
              formData.Message.validationRule
            );
            handleInputChange("Message", value, isValid, errorMsg);
          }}
        />
      </div>,
    ],
    [
      <div className={styles.messageBox} key={2}>
        <div className={styles.sendWish}>
          <span>Send Wish</span>
          <button
            onClick={() => {
              togglePopupVisibility(
                setPopupController,
                initialPopupController[1],
                1,
                "close"
              );
            }}
          >
            <HighlightOffIcon
              style={{
                fontSize: "30px",
              }}
            />
          </button>
        </div>
        <img
          src={wishImg}
          style={{
            width: "calc(51% - 5px)",
          }}
          alt="wishImg"
        />
        <FloatingLabelTextarea
          customBorderColor="#0B4D53"
          readOnly
          value={formData?.Message?.value}
          placeholder="Message"
          rows={6}
          isValid={formData?.Message?.isValid}
          errorMsg={formData?.Message.errorMsg}
          noBorderInput={false}
          onChange={(e: any) => {
            const value = e;
            const { isValid, errorMsg } = validateField(
              "Message",
              value,
              formData?.Message?.validationRule
            );
            handleInputChange("Message", value, isValid, errorMsg);
          }}
        />

        <div className={styles.actionBtns}>
          {!formData?.isTeams?.value && (
            <button
              className={styles.teams}
              onClick={async () => {
                await handleSubmit("Teams");
              }}
            >
              <img src={teamsImg} /> Send in Teams
            </button>
          )}
          {!formData?.isOutlook?.value && (
            <button
              className={styles.outlook}
              onClick={async () => {
                await handleSubmit("Outlook");
              }}
            >
              <img src={outlookImg} /> Send in Outlook
            </button>
          )}
        </div>
      </div>,
    ],
    [
      <div key={3}>
        <p>Are you sure you want to delete this birthday?</p>
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
          await handleSubmit("");
        },
      },
    ],
    [],
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
        text: "Delete",
        btnType: "primaryGreen",
        endIcon: false,
        startIcon: false,
        disabled: false,
        size: "large",
        onClick: async () => {
          await deleteBirthday(handleForm?.BirthDayID, setPopupController, 2);
        },
      },
    ],
  ];

  const onLoadingFUN = async (curTab: any, data: any[]): Promise<void> => {
    setIsLoading(true);
    let filteredData: any[] = [];
    const today = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate()
    );
    if (curTab === CONFIG.NewHiresPageTabsName[0]) {
      filteredData = data?.filter((obj: any) => {
        return (
          moment(new Date()).format("DD/MM/YYYY") ===
          moment(obj?.DateOfBirth).format("DD/MM/YYYY")
        );
      });
    } else if (curTab === CONFIG.NewHiresPageTabsName[1]) {
      filteredData = data?.filter((obj: any) => {
        const DateOfBirth = new Date(obj?.DateOfBirth);
        return (
          today <
          new Date(
            DateOfBirth.getFullYear(),
            DateOfBirth.getMonth(),
            DateOfBirth.getDate()
          )
        );
      });
    } else {
      filteredData = data?.filter((obj: any) => {
        const DateOfBirth = new Date(obj?.DateOfBirth);
        return (
          today >
          new Date(
            DateOfBirth.getFullYear(),
            DateOfBirth.getMonth(),
            DateOfBirth.getDate()
          )
        );
      });
    }
    setTypeBirthdays([...filteredData]);
    handleSearch([...filteredData]);
    setIsLoading(false);
    setSelectedTab(curTab);
  };

  useEffect(() => {
    if (birthDaysData?.data?.length > 0) {
      setBirthdays(birthDaysData?.data);
      onLoadingFUN(
        selectedTab || CONFIG.NewHiresPageTabsName[0],
        birthDaysData?.data
      );
    }
  }, [birthDaysData]);

  useEffect(() => {
    dispatch(setMainSPContext(props?.context));
    getBirthdayCurrentUserRole(setCurrentUserDetails);
    getAllBirthdayData(dispatch);
  }, [dispatch]);
  return isLoading ? (
    <div className={styles.LoaderContainer}>
      <CircularSpinner />
    </div>
  ) : (
    <div className={styles.boxWrapper}>
      <div className={styles.newsHeaderContainer}>
        <div className={styles.leftSection}>
          <i
            onClick={() => {
              window.open(
                props.context.pageContext.web.absoluteUrl +
                  CONFIG.NavigatePage.PernixIntranet,
                "_self"
              );
            }}
            className="pi pi-arrow-circle-left"
            style={{ fontSize: "1.5rem", color: "#E0803D" }}
          />
          <p>Birthdays</p>
        </div>
        <div className={styles.rightSection}>
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
                handleSearch([...typeBirthdays]);
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
              handleSearch([...typeBirthdays]);
            }}
          >
            <i className="pi pi-refresh" />
          </div>
          {currentUserDetails?.role === "Admin" && (
            <div
              style={{
                display: "flex",
              }}
              className={styles.addNewbtn}
              onClick={() => {
                setHandleForm({
                  BirthDayID: null,
                  BirthDayWishID: null,
                  Type: "New",
                });
                resetFormData(initialFormData, setFormData);
                togglePopupVisibility(
                  setPopupController,
                  initialPopupController[0],
                  0,
                  "open",
                  "New birthday"
                );
              }}
            >
              <i
                className="pi pi-plus"
                style={{ fontSize: "1rem", color: "#fff" }}
              />
              Birthday
            </div>
          )}
        </div>
      </div>
      {/* tabs */}
      <div className={styles.tabsContainer}>
        {CONFIG.NewHiresPageTabsName.map((str: string, i: number) => {
          return (
            <div
              key={i}
              style={{
                borderBottom:
                  selectedTab === str ? "3px solid #e0803d" : "none",
                cursor: "pointer",
              }}
              onClick={(_) => {
                // setPagination(CONFIG.PaginationData);
                // if (selectedTab !== str) {
                //   searchField.Search = "";
                //   searchField.Status = "";
                //   searchField.Date = null;
                //   setCommonSearch({ ...searchField });
                //   getQuestionCeo(dispatch);
                // }
                setSelectedTab(str);
                onLoadingFUN(str, birthdays);
              }}
            >
              {str}
            </div>
          );
        })}
      </div>
      {showBirthdays?.length === 0 ? (
        <div
          style={{
            width: "100%",
            height: "50vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "14px",
            color: "#adadad",
            fontFamily: "osMedium, sans-serif",
          }}
        >
          No questions found.
        </div>
      ) : (
        <div className={styles.bodyContainer}>
          <div className={styles.birthdaySection}>
            {showBirthdays
              ?.slice(pagination.first, pagination.first + pagination.rows)
              ?.map((val: any, index: number) => {
                return (
                  <div key={index} className={styles.contentMain}>
                    <div className={styles.image}>
                      <img src={`${val?.imgUrl}`} alt="" />
                    </div>
                    <div className={styles.content}>
                      <div className={styles.contentwithIconsection}>
                        <div className={styles.Title}>
                          <p className={styles.name}>
                            {val?.EmployeeName?.name}
                          </p>
                          <p className={styles.date}>
                            {moment(new Date()).format("DD/MM/YYYY") ===
                            moment(val?.DateOfBirth).format("DD/MM/YYYY")
                              ? "Birthday today"
                              : `Birthday on ${moment(val?.DateOfBirth).format(
                                  "LL"
                                )}`}
                          </p>
                        </div>

                        <div className={styles.actionSection}>
                          {moment(new Date()).format("DD/MM/YYYY") ===
                            moment(val?.DateOfBirth).format("DD/MM/YYYY") && (
                            <div
                              onClick={() => {
                                setHandleForm({
                                  BirthDayID: val?.ID,
                                  BirthDayWishID: val?.BirthDayWishID
                                    ? val?.BirthDayWishID
                                    : null,
                                  Type: "SendWish",
                                });
                                togglePopupVisibility(
                                  setPopupController,
                                  initialPopupController[1],
                                  1,
                                  "open"
                                );
                                setFormData({
                                  Message: {
                                    value: val?.Message,
                                    isValid: true,
                                    errorMsg: "This field is required",
                                    validationRule: {
                                      required: true,
                                      type: "string",
                                    },
                                  },
                                  isTeams: {
                                    value: val?.isTeams,
                                    isValid: true,
                                    errorMsg: "This field is required",
                                    validationRule: {
                                      required: false,
                                      type: "boolean",
                                    },
                                  },
                                  isOutlook: {
                                    value: val?.isOutlook,
                                    isValid: true,
                                    errorMsg: "This field is required",
                                    validationRule: {
                                      required: false,
                                      type: "boolean",
                                    },
                                  },
                                });
                              }}
                            >
                              <i
                                className="pi pi-send"
                                style={{
                                  color: "#0b4d53",
                                  fontSize: "1.2rem",
                                  cursor: "pointer",
                                }}
                              />
                            </div>
                          )}
                          {currentUserDetails?.role === "Admin" &&
                            selectedTab !== CONFIG.NewHiresPageTabsName[2] &&
                            selectedTab !== CONFIG.NewHiresPageTabsName[0] && (
                              <i
                                onClick={() => {
                                  setHandleForm({
                                    BirthDayID: val?.ID,
                                    BirthDayWishID: val?.BirthDayWishID
                                      ? val?.BirthDayWishID
                                      : null,
                                    Type: "Update",
                                  });
                                  setAttachmentObject(val?.Attachment);
                                  setFormData({
                                    ...initialFormData,
                                    EmployeeName: {
                                      ...initialFormData?.EmployeeName,
                                      value: val?.EmployeeName?.name,
                                    },
                                    DateOfBirth: {
                                      ...initialFormData?.DateOfBirth,
                                      value: new Date(val?.DateOfBirth),
                                    },
                                    Image: {
                                      ...initialFormData?.Image,
                                      value: {
                                        name: val?.Attachment?.FileName,
                                      },
                                    },
                                    Message: {
                                      ...initialFormData?.Message,
                                      value: val?.Message,
                                    },
                                  });
                                  togglePopupVisibility(
                                    setPopupController,
                                    initialPopupController[0],
                                    0,
                                    "open",
                                    "Update birthday"
                                  );
                                }}
                                style={{
                                  color: "#adadad",
                                  fontSize: "1.2rem",
                                  cursor: "pointer",
                                }}
                                className="pi pi-pen-to-square"
                              />
                            )}
                          {currentUserDetails?.role === "Admin" && (
                            <i
                              className="pi pi-trash"
                              style={{
                                color: "#ff1c1c",
                                fontSize: "1.2rem",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                setHandleForm({
                                  BirthDayID: val?.ID,
                                  BirthDayWishID: val?.BirthDayWishID
                                    ? val?.BirthDayWishID
                                    : null,
                                  Type: "Delete",
                                });
                                togglePopupVisibility(
                                  setPopupController,
                                  initialPopupController[2],
                                  2,
                                  "open"
                                );
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
      {showBirthdays.length > 0 && (
        <div
          className="card"
          style={{
            padding: "4px 0px",
          }}
        >
          <Paginator
            first={pagination.first}
            rows={pagination.rows}
            totalRecords={totalRecords}
            onPageChange={onPageChange}
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink "
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
            togglePopupVisibility(
              setPopupController,
              initialPopupController[0],
              index,
              "close"
            );
            resetFormData(formData, setFormData);
            if (popupData?.isLoading?.success) {
              if (handleForm?.type === "Delete") {
                const filteredData = birthdays?.filter(
                  (val: any) => val?.ID !== handleForm?.BirthDayID
                );
                setBirthdays([...filteredData]);
                onLoadingFUN(selectedTab, [...filteredData]);
              } else {
                getAllBirthdayData(dispatch);
              }
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
  );
};
export default BirthdayPage;
