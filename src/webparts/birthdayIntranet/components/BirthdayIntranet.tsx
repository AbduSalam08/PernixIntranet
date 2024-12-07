/* eslint-disable no-extra-label */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
import styles from "./BirthdayIntranet.module.scss";
import { Checkbox } from "primereact/checkbox";
import "../../../assets/styles/style.css";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import SectionHeaderIntranet from "../../../components/common/SectionHeaderIntranet/SectionHeaderIntranet";
import { resetFormData, validateField } from "../../../utils/commonUtils";
import { useEffect, useState } from "react";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../utils/popupUtils";
import FloatingLabelTextarea from "../../../components/common/CustomInputFields/CustomTextArea";
import Popup from "../../../components/common/Popups/Popup";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import {
  addBirthdayWish,
  fetchAzureUsers,
  fetchBirthdayData,
  fetchBirthdayRes,
} from "../../../services/BirthDayIntranet/birthDayIntranet";
import moment from "moment";
import ViewAll from "../../../components/common/ViewAll/ViewAll";
import { CONFIG } from "../../../config/config";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
import { ToastContainer } from "react-toastify";
import {
  IBirthdayData,
  IBirthdayRes,
  IBirthdayUsers,
  ISelectWish,
} from "../../../interface/interface";
import { sp } from "@pnp/sp/presets/all";

/* Global variable creation */
const errorGrey = require("../../../assets/images/svg/errorGrey.svg");
const wishImg: any = require("../../../assets/images/svg/wishImg.svg");
const teamsImg: any = require("../../../assets/images/svg/Birthday/teamsIcon.png");
const outlookImg: any = require("../../../assets/images/svg/Birthday/outlookIcon.png");

let masterUser: IBirthdayUsers[] = [];
let masterData: IBirthdayData[] = [];
let masterRes: IBirthdayRes[] = [];
let filMasterUser: IBirthdayUsers[] = [];
let logInUser: any;

const BirthdayIntranet = (props: any): JSX.Element => {
  /* popup properties */
  const initialPopupController: any[] = [
    {
      open: false,
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

  const initialFormData: any = {
    Message: {
      value: "",
      isValid: true,
      errorMsg: "This field is required",
      validationRule: { required: true, type: "string" },
    },
    isTeams: {
      value: false,
      isValid: true,
      errorMsg: "",
      validationRule: {
        required: false,
        type: "boolean",
      },
    },
    isOutlook: {
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
  const [popupController, setPopupController] = useState<any[]>(
    initialPopupController
  );
  const [formData, setFormData] = useState<any>(initialFormData);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [arrUserDatas, setArrUserDatas] = useState<IBirthdayUsers[]>([]);
  const [curUser, setCurrentUser] = useState<ISelectWish>({
    ...CONFIG.SelectWish,
  });

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

  const handleSubmit = async (): Promise<void> => {
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
      togglePopupVisibility(
        setPopupController,
        initialPopupController[0],
        0,
        "close"
      );
      await addBirthdayWish(
        updatedFormData,
        curUser?.Email,
        logInUser?.Email?.toLowerCase()
      ).then(() => {
        const idx: number = Number(curUser.Idx);
        arrUserDatas[idx].IsShow = false;
        setCurrentUser({ ...CONFIG.SelectWish });
        setArrUserDatas([...arrUserDatas]);
      });
    }
  };

  const isFormValid = (): boolean => {
    const isMessageValid: boolean =
      formData?.Message?.isValid && formData?.Message?.value.trim() !== "";
    const isAnyCheckboxChecked: boolean =
      formData?.isTeams?.value || formData?.isOutlook?.value;

    return isMessageValid && isAnyCheckboxChecked;
  };

  const popupInputs: any[] = [
    [
      <div className={styles.messageBox} key={2}>
        <div className={styles.sendWish}>
          <span>Send birthday wish</span>
          <button
            onClick={() => {
              togglePopupVisibility(
                setPopupController,
                initialPopupController[0],
                0,
                "close"
              );
            }}
          >
            <HighlightOffIcon
              sx={{
                fontSize: "30px",
                color: "var(--primary-pernix-green)",
              }}
            />
          </button>
        </div>
        <img
          src={wishImg}
          style={{
            width: "calc(51% - 5px)",
            // width: "30%",
            // height: "105px",
          }}
          alt="wishImg"
        />
        {/* <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "10px",
          }}
        > */}
        <FloatingLabelTextarea
          customBorderColor="#0B4D53"
          disabled={false}
          value={formData?.Message?.value}
          placeholder="Message"
          rows={6}
          isValid={formData?.Message?.isValid}
          errorMsg={formData?.Message.errorMsg}
          noBorderInput={false}
          onChange={(e: any) => {
            const value = e.trimStart();
            const { isValid, errorMsg } = validateField(
              "Message",
              value,
              formData?.Message?.validationRule
            );
            handleInputChange("Message", value, isValid, errorMsg);
          }}
        />
        {/* </div> */}

        <div className={styles.suggestions}>
          {[
            {
              text: `Happy Birthday ${curUser?.Name ? curUser?.Name : ""} `,
              emoji: "🎂",
            },
            { text: "Wishing you a fantastic year ahead !", emoji: "🎉" },
            // { text: "Cheers to another amazing year !", emoji: "🥂" },
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
          <p>Send wishes in </p>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                margin: "15px 0px 0px 0px",
                background: "#e9e8f4",
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
                Teams
              </label>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                margin: "15px 0px 0px 0px",
                background: "#e9e8f4",
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
                Outlook
              </label>
            </div>
          </div>
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
        disabled: !isFormValid(),
        size: "large",
        onClick: async () => {
          await handleSubmit();
        },
      },
    ],
  ];

  const filterData = async (): Promise<void> => {
    filMasterUser = await Promise?.all(
      masterUser?.filter(
        (val: IBirthdayUsers) =>
          Number(moment().format("MMDD")) <=
            Number(moment(val?.Birthday).format("MMDD")) && val?.IsActive
      ) || []
    );

    filMasterUser?.sort(
      (a: IBirthdayUsers, b: IBirthdayUsers) =>
        parseInt(moment(a?.Birthday).format("MMDD")) -
        parseInt(moment(b?.Birthday).format("MMDD"))
    );
    setArrUserDatas([...filMasterUser]);
    setIsLoading(false);
  };

  const resDataPrepare = async (): Promise<void> => {
    logInUser = await sp.web.currentUser.get();

    for (let i: number = 0; masterUser.length > i; i++) {
      let isCheck: boolean = false;

      if (masterRes.length) {
        _looping: for (let j: number = 0; masterRes.length > j; j++) {
          if (
            masterUser[i].Email === masterRes[j].To &&
            logInUser?.Email?.toLowerCase() === masterRes[j].From
          ) {
            isCheck = true;
            break _looping;
          }
          if (masterUser[i].Email === logInUser?.Email?.toLowerCase()) {
            isCheck = true;
            break _looping;
          }
        }

        masterUser[i].IsSameUser = isCheck;
        if (masterUser.length === i + 1) {
          await filterData();
        }
      } else {
        if (masterUser[i].Email === logInUser?.Email?.toLowerCase()) {
          isCheck = true;
          masterUser[i].IsSameUser = isCheck;
        }
        if (masterUser.length === i + 1) {
          await filterData();
        }
      }
    }
  };

  const prepareData = async (): Promise<void> => {
    if (masterUser.length) {
      for (let i: number = 0; masterUser.length > i; i++) {
        if (masterData.length) {
          _looping: for (let j: number = 0; masterData.length > j; j++) {
            if (masterUser[i].ID === masterData[j].UserID) {
              masterUser[i].BirthdayUserListDataId = masterData[j].ID;
              masterUser[i].IsActive = false;
              break _looping;
            } else {
              masterUser[i].BirthdayUserListDataId = null;
              masterUser[i].IsActive = true;
            }
          }

          if (masterUser.length === i + 1) {
            await resDataPrepare();
          }
        } else {
          await resDataPrepare();
        }
      }
    } else {
      setArrUserDatas([]);
      setIsLoading(false);
    }
  };

  const initialFetchData = async (): Promise<void> => {
    setIsLoading(true);

    const fetchUsersPromise: any = fetchAzureUsers(props?.context);
    const fetchDataPromise: any = fetchBirthdayData();
    const fetchResPromise: any = fetchBirthdayRes();

    const [users, data, res] = await Promise.all([
      fetchUsersPromise,
      fetchDataPromise,
      fetchResPromise,
    ]);

    masterUser = users;
    masterData = data;
    masterRes = res;

    await prepareData();
  };

  useEffect(() => {
    initialFetchData();
  }, []);

  return (
    <div className={styles.container}>
      <SectionHeaderIntranet
        label="Birthday"
        removeAdd={true}
        headerAction={() => {
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
        {isLoading ? (
          <CircularSpinner />
        ) : !arrUserDatas.length ? (
          <div className="errorWrapper">
            <img src={errorGrey} alt="Error" />
            <span className="disabledText">Birthday data not found!</span>
          </div>
        ) : (
          arrUserDatas
            ?.slice(0, 5)
            ?.map((val: IBirthdayUsers, index: number) => {
              return (
                <div key={index} className={styles.contentMain}>
                  <div className={styles.image}>
                    <img
                      src={`/_layouts/15/userphoto.aspx?size=S&username=${val?.Email}`}
                      alt="User"
                    />
                  </div>
                  <div className={styles.content}>
                    <div className={styles.contentwithIconsection}>
                      <div className={styles.Title}>
                        <p className={styles.name}>{val?.Name}</p>
                        <p className={styles.date}>
                          {moment().format("MMDD") ===
                          moment(val?.Birthday).format("MMDD")
                            ? "Birthday today"
                            : `Birthday on ${moment(val?.Birthday).format(
                                "MMMM D"
                              )}, ${moment().format("YYYY")}`}
                        </p>
                      </div>

                      {val.IsShow && !val.IsSameUser && val?.IsActive && (
                        <div
                          className={styles.sendBtn}
                          style={{
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setCurrentUser({
                              Idx: index,
                              ID: val?.ID.toString(),
                              Email: val?.Email,
                              Name: val?.Name,
                            });
                            setFormData({ ...initialFormData });
                            togglePopupVisibility(
                              setPopupController,
                              initialPopupController[0],
                              0,
                              "open"
                            );
                          }}
                        >
                          {/* <i
                            className="pi pi-send"
                            style={{ color: "#fff", fontSize: "18px" }}
                          /> */}
                          🎉
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
        )}
      </div>

      {arrUserDatas.length > 0 && (
        <ViewAll
          onClick={() => {
            window.open(
              props.context.pageContext.web.absoluteUrl +
                CONFIG.NavigatePage.BirthdayPage,
              "_self"
            );
          }}
        />
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
            resetFormData(initialFormData, setFormData);
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

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default BirthdayIntranet;
