/* eslint-disable no-extra-label */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
import { useEffect, useState } from "react";
import "./style.css";
import styles from "./BirthdayPage.module.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  addBirthDay,
  addBirthdayWish,
  deleteBirthDay,
  fetchAzureUsers,
  fetchBirthdayData,
  fetchBirthdayRes,
} from "../../../services/BirthDayIntranet/birthDayIntranet";
import { CONFIG } from "../../../config/config";
import {
  IBirthdayData,
  IBirthdayRes,
  IBirthdayUsers,
  IPaginationData,
  ISelectWish,
  IUserDetails,
} from "../../../interface/interface";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
import CustomInput from "../../../components/common/CustomInputFields/CustomInput";
import { Paginator } from "primereact/paginator";
import Popup from "../../../components/common/Popups/Popup";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../utils/popupUtils";
import { resetFormData, validateField } from "../../../utils/commonUtils";
import FloatingLabelTextarea from "../../../components/common/CustomInputFields/CustomTextArea";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import moment from "moment";
import { Checkbox } from "primereact/checkbox";
import { ToastContainer } from "react-toastify";
import { sp } from "@pnp/sp/presets/all";
import { RoleAuth } from "../../../services/CommonServices";
import { InputSwitch } from "primereact/inputswitch";

/* Global variable creation */
const wishImg: any = require("../../../assets/images/svg/wishImg.svg");
const teamsImg: any = require("../../../assets/images/svg/Birthday/teamsIcon.png");
const outlookImg: any = require("../../../assets/images/svg/Birthday/outlookIcon.png");
const errorGrey = require("../../../assets/images/svg/errorGrey.svg");

let masterUser: IBirthdayUsers[] = [];
let masterData: IBirthdayData[] = [];
let masterRes: IBirthdayRes[] = [];
let filTodayMas: IBirthdayUsers[] = [];
let filUpcomMas: IBirthdayUsers[] = [];
let filPrevMas: IBirthdayUsers[] = [];
let logInUser: any;
let isAdmin: boolean = false;
let isActivityPage: boolean = false;

const BirthdayPage = (props: any): JSX.Element => {
  /* Local variable creation */
  const dispatch = useDispatch();

  const currentUserDetails: IUserDetails = useSelector(
    (state: any) => state?.MainSPContext?.currentUserDetails
  );
  isAdmin = currentUserDetails.role === CONFIG.RoleDetails.user ? false : true;

  /* popup properties */
  const initialPopupController = [
    {
      open: false,
      // popupTitle: "Send birthday wish",
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
        success: "Birthday wish sended successfully!",
        error: "Something went wrong!",
        successDescription:
          "The birthday wish 'ABC' has been sended successfully.",
        errorDescription:
          "An error occured while adding news, please try again later.",
        inprogress: "Sending birthday wish, please wait...",
      },
    },
  ];

  const initialFormData = {
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [popupController, setPopupController] = useState<any[]>(
    initialPopupController
  );
  const [formData, setFormData] = useState<any>(initialFormData);
  const [selectedTab, setSelectedTab] = useState<string>("");
  const [arrUserDatas, setArrUserDatas] = useState<IBirthdayUsers[]>([]);
  const [masterBirthdayData, setMasterBirthdayData] = useState<
    IBirthdayUsers[]
  >([]);
  const [curUser, setCurrentUser] = useState<ISelectWish>({
    ...CONFIG.SelectWish,
  });
  const [searchData, setSearchData] = useState<string>("");
  const [pagination, setPagination] = useState<IPaginationData>(
    CONFIG.birthdayPaginationData
  );

  const totalRecords = arrUserDatas?.length || 0;

  const onPageChange = (event: any): void => {
    setPagination({
      first: event?.first || CONFIG.birthdayPaginationData.first,
      rows: event?.rows || CONFIG.birthdayPaginationData.rows,
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

  const handleSearch = async (value: string): Promise<void> => {
    let temp: IBirthdayUsers[] = [...masterBirthdayData];

    if (value) {
      temp = temp?.filter((val: IBirthdayUsers) => {
        const strDate: string = `${moment(val?.Birthday).format(
          "MMMM D"
        )}, ${moment().format("YYYY")}`;

        return (
          val?.Name?.toLowerCase().includes(value?.toLowerCase()) ||
          strDate?.toLowerCase().includes(value?.toLowerCase())
        );
      });
    }

    setArrUserDatas([...temp]);
    setSearchData(value);
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

  const handleData = async (
    isActive: boolean,
    userID: string,
    ID: number | null,
    Idx: number
  ): Promise<void> => {
    togglePopupVisibility(
      setPopupController,
      initialPopupController[0],
      0,
      "close"
    );

    if (isActive && ID) {
      await deleteBirthDay(ID).then((res: any) => {
        const slicedData: IBirthdayUsers[] = arrUserDatas?.slice(
          pagination.first,
          pagination.first + pagination.rows
        );

        if (slicedData?.[Idx]) {
          slicedData[Idx].BirthdayUserListDataId = null;
          slicedData[Idx].IsActive = true;

          arrUserDatas[pagination.first + Idx] = slicedData[Idx];

          setCurrentUser({ ...CONFIG.SelectWish });
          setArrUserDatas([...arrUserDatas]);
        }
      });
    } else {
      await addBirthDay(userID).then((Id: any) => {
        const slicedData: IBirthdayUsers[] = arrUserDatas?.slice(
          pagination.first,
          pagination.first + pagination.rows
        );

        if (slicedData?.[Idx]) {
          slicedData[Idx].BirthdayUserListDataId = Id;
          slicedData[Idx].IsActive = false;

          arrUserDatas[pagination.first + Idx] = slicedData[Idx];

          setCurrentUser({ ...CONFIG.SelectWish });
          setArrUserDatas([...arrUserDatas]);
        }
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
          <p>Send wishes in :</p>
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

  const selectTab = async (
    curTab: string = CONFIG.BirthDayPageTabsName[0]
  ): Promise<void> => {
    if (curTab === CONFIG.BirthDayPageTabsName[0]) {
      setMasterBirthdayData([...filTodayMas]);
      setArrUserDatas([...filTodayMas]);
      setSelectedTab(curTab);
      setSearchData("");
      setIsLoading(false);
    } else if (curTab === CONFIG.BirthDayPageTabsName[1]) {
      filUpcomMas?.sort(
        (a: IBirthdayUsers, b: IBirthdayUsers) =>
          parseInt(moment(a?.Birthday).format("MMDD")) -
          parseInt(moment(b?.Birthday).format("MMDD"))
      );
      setMasterBirthdayData([...filUpcomMas]);
      setArrUserDatas([...filUpcomMas]);
      setSelectedTab(curTab);
      setSearchData("");
      setIsLoading(false);
    } else {
      filPrevMas?.sort(
        (a: IBirthdayUsers, b: IBirthdayUsers) =>
          parseInt(moment(b?.Birthday).format("MMDD")) -
          parseInt(moment(a?.Birthday).format("MMDD"))
      );
      setMasterBirthdayData([...filPrevMas]);
      setArrUserDatas([...filPrevMas]);
      setSelectedTab(curTab);
      setSearchData("");
      setIsLoading(false);
    }
  };

  const filterData = async (): Promise<void> => {
    const TodayData: IBirthdayUsers[] = isAdmin
      ? masterUser?.filter(
          (val: IBirthdayUsers) =>
            Number(moment().format("MMDD")) ===
            Number(moment(val?.Birthday).format("MMDD"))
        )
      : masterUser?.filter(
          (val: IBirthdayUsers) =>
            Number(moment().format("MMDD")) ===
              Number(moment(val?.Birthday).format("MMDD")) && val?.IsActive
        );

    const UpcomingData: IBirthdayUsers[] = isAdmin
      ? masterUser?.filter(
          (val: IBirthdayUsers) =>
            Number(moment().format("MMDD")) <
            Number(moment(val?.Birthday).format("MMDD"))
        )
      : masterUser?.filter(
          (val: IBirthdayUsers) =>
            Number(moment().format("MMDD")) <
              Number(moment(val?.Birthday).format("MMDD")) && val?.IsActive
        );
    const PreviousData: IBirthdayUsers[] = isAdmin
      ? masterUser?.filter(
          (val: IBirthdayUsers) =>
            Number(moment().format("MMDD")) >
            Number(moment(val?.Birthday).format("MMDD"))
        )
      : masterUser?.filter(
          (val: IBirthdayUsers) =>
            Number(moment().format("MMDD")) >
              Number(moment(val?.Birthday).format("MMDD")) && val?.IsActive
        );

    const [today, upcoming, previous] = await Promise.all([
      TodayData,
      UpcomingData,
      PreviousData,
    ]);

    filTodayMas = today;
    filUpcomMas = upcoming;
    filPrevMas = previous;

    await selectTab(CONFIG.BirthDayPageTabsName[0]);
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

    const roleAuthPromise: any = RoleAuth(
      CONFIG.SPGroupName.Pernix_Admin,
      { highPriorityGroups: [CONFIG.SPGroupName.Birthdays_Admin] },
      dispatch
    );
    const fetchUsersPromise: any = fetchAzureUsers(props?.context);
    const fetchDataPromise: any = fetchBirthdayData();
    const fetchResPromise: any = fetchBirthdayRes();

    const [undefinedVar, users, data, res] = await Promise.all([
      roleAuthPromise,
      fetchUsersPromise,
      fetchDataPromise,
      fetchResPromise,
    ]);
    console.log("undefinedVar: ", undefinedVar);

    masterUser = users;
    masterData = data;
    masterRes = res;

    await prepareData();
  };

  useEffect(() => {
    const urlObj = new URL(window.location.href);
    const params = new URLSearchParams(urlObj.search);
    isActivityPage = params?.get("Page") === "activity" ? true : false;

    initialFetchData();
  }, []);

  return (
    <>
      {isLoading ? (
        <div className={styles.LoaderContainer}>
          <CircularSpinner />
        </div>
      ) : (
        <div className={styles.boxWrapper}>
          <div className={styles.newsHeaderContainer}>
            <div className={styles.leftSection}>
              <i
                onClick={() => {
                  if (isActivityPage) {
                    window.open(
                      props.context.pageContext.web.absoluteUrl +
                        CONFIG.NavigatePage.ApprovalsPage,
                      "_self"
                    );
                  } else {
                    window.open(
                      props.context.pageContext.web.absoluteUrl +
                        CONFIG.NavigatePage.PernixIntranet,
                      "_self"
                    );
                  }
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
                  value={searchData}
                  placeholder="Search"
                  onChange={(e: any) => {
                    const value: string = e.trimStart();
                    handleSearch(value);
                  }}
                  size="SM"
                />
              </div>
              <div
                className={styles.refreshBTN}
                onClick={(_) => {
                  handleSearch("");
                }}
              >
                <i className="pi pi-refresh" />
              </div>
            </div>
          </div>

          {/* tabs */}
          <div className={styles.tabsContainer}>
            {CONFIG.BirthDayPageTabsName.map((str: string, i: number) => {
              return (
                <div
                  key={i}
                  style={{
                    borderBottom:
                      selectedTab === str ? "3px solid #e0803d" : "none",
                    cursor: "pointer",
                  }}
                  onClick={(_) => {
                    setSelectedTab(str);
                    selectTab(str);
                  }}
                >
                  {str}
                </div>
              );
            })}
          </div>

          {!arrUserDatas?.length ? (
            <div className="errorWrapper" style={{ height: "50vh" }}>
              <img src={errorGrey} alt="Error" />
              <span className="disabledText">{"Birthday data not found!"}</span>
            </div>
          ) : (
            // <div
            //   style={{
            //     width: "100%",
            //     height: "50vh",
            //     display: "flex",
            //     justifyContent: "center",
            //     alignItems: "center",
            //     fontSize: "14px",
            //     color: "#adadad",
            //     fontFamily: "osMedium, sans-serif",
            //   }}
            // >
            //   Birthday data not found!
            // </div>
            <div className={styles.bodyContainer}>
              <div className={styles.birthdaySection}>
                {arrUserDatas
                  ?.slice(pagination.first, pagination.first + pagination.rows)
                  ?.map((val: IBirthdayUsers, index: number) => {
                    return (
                      <div key={index} className={styles.contentMain}>
                        <div
                          className={styles.image}
                          style={{
                            width:
                              isAdmin &&
                              moment().format("MMDD") ===
                                moment(val?.Birthday).format("MMDD")
                                ? "50px"
                                : "50px",
                            height:
                              isAdmin &&
                              moment().format("MMDD") ===
                                moment(val?.Birthday).format("MMDD")
                                ? "50px"
                                : "50px",
                          }}
                        >
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

                            <div className={styles.actionSection}>
                              {isAdmin &&
                                moment().format("MMDD") <=
                                  moment(val?.Birthday).format("MMDD") && (
                                  <InputSwitch
                                    checked={val?.IsActive}
                                    className="sectionToggler"
                                    onChange={(e) => {
                                      handleData(
                                        e?.value,
                                        val?.ID.toString(),
                                        val?.BirthdayUserListDataId,
                                        index
                                      );
                                    }}
                                  />
                                )}

                              {val.IsShow &&
                                !val.IsSameUser &&
                                val?.IsActive && (
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
                                      style={{
                                        color: "#0b4d53",
                                        fontSize: "1.2rem",
                                        cursor: "pointer",
                                      }}
                                    /> */}
                                    🎉
                                  </div>
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

          {arrUserDatas.length > 0 && (
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
        </div>
      )}

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
    </>
  );
};

export default BirthdayPage;
