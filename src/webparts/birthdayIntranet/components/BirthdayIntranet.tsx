/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
//import { MSGraphClient } from "@microsoft/sp-http";
// import { graph } from "@pnp/graph";

import styles from "./BirthdayIntranet.module.scss";
import { Checkbox } from "primereact/checkbox";

const errorGrey = require("../../../assets/images/svg/errorGrey.svg");
import "../../../assets/styles/style.css";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
// require("../../../node_modules/primereact/resources/primereact.min.css");
import SectionHeaderIntranet from "../../../components/common/SectionHeaderIntranet/SectionHeaderIntranet";
import { resetFormData, validateField } from "../../../utils/commonUtils";
import { useEffect, useState } from "react";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../utils/popupUtils";
import FloatingLabelTextarea from "../../../components/common/CustomInputFields/CustomTextArea";
import Popup from "../../../components/common/Popups/Popup";
// images
const wishImg: any = require("../../../assets/images/svg/wishImg.svg");
const teamsImg: any = require("../../../assets/images/svg/Birthday/teamsIcon.png");
const outlookImg: any = require("../../../assets/images/svg/Birthday/outlookIcon.png");
// icons
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { setMainSPContext } from "../../../redux/features/MainSPContextSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  addBirthday,
  getAllBirthdayData,
  getBirthdayCurrentUserRole,
  submitBirthdayWish,
} from "../../../services/BirthDayIntranet/birthDayIntranet";
import CustomPeoplePicker from "../../../components/common/CustomInputFields/CustomPeoplePicker";
import CustomFileUpload from "../../../components/common/CustomInputFields/CustomFileUpload";
import CustomDateInput from "../../../components/common/CustomInputFields/CustomDateInput";
import moment from "moment";
import ViewAll from "../../../components/common/ViewAll/ViewAll";
import { CONFIG } from "../../../config/config";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";

const BirthdayIntranet = (props: any): JSX.Element => {
  let _curuser: string = props?.context._pageContext._user.email;
  console.log(_curuser, "curuser");

  const today = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  );
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

    isTeams: {
      value: false,
      isValid: true,
      errorMsg: "This field is required",
      validationRule: {
        required: false,
        type: "boolean",
      },
    },
    isOutlook: {
      value: false,
      isValid: true,
      errorMsg: "This field is required",
      validationRule: {
        required: false,
        type: "boolean",
      },
    },
  };
  const dispatch = useDispatch();
  const birthDaysData: any = useSelector((state: any) => {
    return state.BirthdaysData.value;
  });
  console.log("birthDaysData", birthDaysData);

  // popup properties
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
  ];

  const [popupController, setPopupController] = useState(
    initialPopupController
  );
  const [birthdays, setBirthdays] = useState<any[]>([]);
  const [curuser, setCurrentuser] = useState<any>("");

  const [currentUserDetails, setCurrentUserDetails] = useState<any>({
    role: "User",
    email: "",
  });

  console.log("currentUserDetails", currentUserDetails);

  const [formData, setFormData] = useState<any>(initialFormData);
  const [handleForm, setHandleForm] = useState<any>({
    BirthDayID: null,
    BirthDayWishID: null,
    Type: "",
  });
  console.log("formData", formData);

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
      } else {
        let payloadJson = {};
        if (sendBy === "Teams") {
          payloadJson = {
            Message: formData?.Message?.value,
            BirthDayId: handleForm?.BirthDayID,
            isTeams: formData.isTeams?.value,
            isOutlook: formData.isOutlook?.value,
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
          // readOnly
          disabled={false}
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

        <div className={styles.suggestions}>
          {[
            { text: `Happy Birthday ${curuser ? curuser : ""} `, emoji: "🎂" },

            { text: "Wishing you a fantastic year ahead !", emoji: "🎉" },
            { text: "Cheers to another amazing year !", emoji: "🥂" },
            { text: "Hope your day is as special as you are !", emoji: "🌟" },
            { text: "Have a blast on your birthday !", emoji: "🎈" },
          ].map((suggestion, index) => (
            <button
              key={index}
              className={styles.suggestionItem}
              onClick={() => {
                const message = `${suggestion.emoji} ${suggestion.text} `;
                handleInputChange("Message", message, true, "");
              }}
            >
              {suggestion.emoji} {suggestion.text}
            </button>
          ))}
        </div>

        <div
          style={{ display: "flex", flexDirection: "column", width: "100%" }}
        >
          <p>Send wishes in :</p>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                margin: "15px 0px 0px 0px",
                background: "#e9e8f4",
                // border: "1px solid #7b83eb",
                borderRadius: "4px",
                padding: "8px",
              }}
            >
              <Checkbox
                inputId="teamsOption"
                value="Teams"
                onChange={(e: any) => {
                  const { isValid, errorMsg } = validateField(
                    "isTeams",
                    e.checked,
                    formData?.Message?.validationRule
                  );
                  handleInputChange("isTeams", e.checked, isValid, errorMsg);
                }}
                checked={formData?.isTeams?.value}
              />
              <label
                htmlFor="teamsOption"
                className="ml-2"
                style={{
                  display: "flex",
                  gap: "5px",
                  fontSize: "14px",
                  fontWeight: 500,
                  alignItems: "center",
                  color: "#7b83eb",
                }}
              >
                <img
                  src={teamsImg}
                  alt="teamsimg"
                  style={{ width: "20px", height: "20px" }}
                />
                Send in Teams
              </label>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                margin: "15px 0px 0px 0px",
                background: "#e9e8f4",
                // border: "1px solid #7b83eb",
                borderRadius: "4px",
                padding: "8px",
              }}
            >
              <Checkbox
                inputId="outlookOption"
                value="Outlook"
                onChange={(e: any) => {
                  const { isValid, errorMsg } = validateField(
                    "isOutlook",
                    e.checked,
                    formData?.Message?.validationRule
                  );
                  handleInputChange("isOutlook", e.checked, isValid, errorMsg);
                }}
                checked={formData?.isOutlook?.value}
              />
              <label
                htmlFor="outlookOption"
                className="ml-2"
                style={{
                  display: "flex",
                  gap: "5px",
                  fontSize: "14px",
                  fontWeight: 500,
                  alignItems: "center",
                  color: "#117ad6",
                }}
              >
                <img
                  src={outlookImg}
                  alt=""
                  style={{ width: "20px", height: "20px" }}
                />
                Send in Outlook
              </label>
            </div>
          </div>
        </div>
        {/* 
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
        </div> */}
      </div>,
    ],
  ];
  const isFormValid = (): boolean => {
    const isMessageValid =
      formData?.Message?.isValid && formData?.Message?.value.trim() !== "";
    const isAnyCheckboxChecked =
      formData?.isTeams?.value || formData?.isOutlook?.value;

    return isMessageValid && isAnyCheckboxChecked;
  };

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
        disabled: !isFormValid(),
        // disabled: !Object.keys(formData).every((key) => formData[key].isValid),
        size: "large",
        onClick: async () => {
          await handleSubmit("Teams");
        },
      },
    ],
  ];

  useEffect(() => {
    if (birthDaysData?.data?.length > 0) {
      const filteredData = birthDaysData?.data
        .filter(
          (val: any) =>
            moment(today).format("DD/MM/YYYY") <=
            moment(val?.DateOfBirth).format("DD/MM/YYYY")
        )
        .slice(0, 5);

      setBirthdays(filteredData);
    }
  }, [birthDaysData]);

  useEffect(() => {
    dispatch(setMainSPContext(props?.context));
    getBirthdayCurrentUserRole(setCurrentUserDetails);
    getAllBirthdayData(dispatch);
  }, [dispatch]);

  const handlenavigate = (): void => {
    window.open(
      props.context.pageContext.web.absoluteUrl +
        CONFIG.NavigatePage.BirthdayPage,
      "_self"
    );
  };

  // async function fetchUserBirthdays(context: any, filterSuffix: string) {
  //   const client: MSGraphClient =
  //     await context.msGraphClientFactory.getClient();

  //   let allUsers: any[] = [];
  //   let nextPageUrl: string | undefined = undefined;

  //   try {
  //     // Step 1: Fetch all users with basic details (ID, mail, displayName)
  //     do {
  //       const response: any = nextPageUrl
  //         ? await client
  //             .api(nextPageUrl)
  //             .version("v1.0")
  //             .top(999)
  //             .select("id,displayName,mail")
  //             .get()
  //         : await client
  //             .api("/users")
  //             .version("v1.0")
  //             .top(999)
  //             .select("id,displayName,mail")
  //             .get();

  //       allUsers = allUsers.concat(response.value);

  //       nextPageUrl = response["@odata.nextLink"];
  //     } while (nextPageUrl);

  //     console.log(allUsers, "Fetched all users");

  //     // Step 2: Fetch birthday extension for each user
  //     const usersWithBirthdays = await Promise.all(
  //       allUsers.map(async (user: any) => {
  //         try {
  //           // Fetch extensions for the user
  //           const userDetails = await client
  //             .api(`/users/${user.id}?$select=birthday`)
  //             .version("v1.0")
  //             .get();

  //           // Check if birthday exists
  //           if (userDetails?.birthday) {
  //             return {
  //               id: user.id,
  //               name: user.displayName,
  //               mail: user.mail,
  //               birthday: userDetails.birthday, // Directly map birthday
  //             };
  //           }

  //           return null; // Skip users without a birthday property
  //         } catch (error) {
  //           console.error(
  //             `Error fetching birthday for user ${user.id}:`,
  //             error
  //           );
  //           return null;
  //         }
  //       })
  //     );

  //     // Step 3: Filter results based on email suffix and remove null entries
  //     const filteredUsers = usersWithBirthdays.filter(
  //       (user) => user && user.mail?.endsWith(filterSuffix) // Match email suffix
  //     );

  //     console.log(filteredUsers, "Users with birthdays");

  //     return filteredUsers;
  //   } catch (error) {
  //     console.error("Error fetching user birthdays:", error);
  //     return [];
  //   }
  // }

  // let x = fetchUserBirthdays(props.context, "@technorucs.com");
  // console.log(x, "birthday user");

  return (
    <div className={styles.container}>
      <SectionHeaderIntranet
        label={"Birthday"}
        removeAdd={currentUserDetails?.role === "Admin" ? false : true}
        headerAction={() => {
          setHandleForm({
            BirthDayID: null,
            BirthDayWishID: null,
            Type: "New",
          });
          togglePopupVisibility(
            setPopupController,
            initialPopupController[0],
            0,
            "open"
          );
          resetFormData(initialFormData, setFormData);
        }}
      />
      <div className={styles.contentSection}>
        {birthDaysData?.isLoading ? (
          <CircularSpinner />
        ) : birthDaysData?.error ? (
          <div className="errorWrapper">
            <img src={errorGrey} alt="Error" />
            <span className="disabledText">{birthDaysData?.error}</span>
          </div>
        ) : (
          birthdays?.map((val: any, index: number) => (
            <div key={index} className={styles.contentMain}>
              <div className={styles.image}>
                <img src={`${val?.imgUrl}`} alt="" />
              </div>
              <div className={styles.content}>
                <div className={styles.contentwithIconsection}>
                  <div className={styles.Title}>
                    <p className={styles.name}>{val?.EmployeeName?.name}</p>
                    <p className={styles.date}>
                      {moment(today).format("DD/MM/YYYY") ===
                      moment(val?.DateOfBirth).format("DD/MM/YYYY")
                        ? "Birthday today"
                        : `Birthday on ${moment(val?.DateOfBirth).format(
                            "LL"
                          )}`}
                    </p>
                  </div>

                  {!(val?.isTeams || val?.isOutlook) &&
                    !val.sameuser &&
                    moment(today).format("DD/MM/YYYY") ===
                      moment(val?.DateOfBirth).format("DD/MM/YYYY") && (
                      <div
                        onClick={() => {
                          setCurrentuser(val?.EmployeeName?.name);
                          // setSameuser(val?.sameuser);
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
                              value: "",
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
                          style={{ color: "#0b4d53", fontSize: "24px" }}
                        />
                      </div>
                    )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {!birthDaysData?.isLoading && birthdays.length > 0 && (
        <ViewAll onClick={handlenavigate} />
      )}
      {popupController?.map((popupData: any, index: number) => (
        <Popup
          // popupCustomBgColor="#fff"
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
            getAllBirthdayData(dispatch);
            resetFormData(initialFormData, setFormData);
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
export default BirthdayIntranet;
