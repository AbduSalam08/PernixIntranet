/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Avatar } from "primereact/avatar";
import "../../../assets/styles/Style.css";
import "./style.css";
import styles from "./ShoutOutsPage.module.scss";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
import { useDispatch, useSelector } from "react-redux";
import {
  addShoutOut,
  changeShoutOutActiveStatus,
  deleteShoutOut,
  getAllShoutOutsData,
  // getShoutOutsOptions,
  // handleShoutOutStatus,
  shoutOutsCurrentUserRole,
  updateShoutOut,
} from "../../../services/shoutOutIntranet/shoutOutIntranet";
import { CONFIG } from "../../../config/config";
import {
  IPageSearchFields,
  IPaginationData,
} from "../../../interface/interface";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../utils/popupUtils";
import { Paginator } from "primereact/paginator";
import FloatingLabelTextarea from "../../../components/common/CustomInputFields/CustomTextArea";
import CustomPeoplePicker from "../../../components/common/CustomInputFields/CustomPeoplePicker";
import { resetFormData, validateField } from "../../../utils/commonUtils";
import Popup from "../../../components/common/Popups/Popup";
import { setMainSPContext } from "../../../redux/features/MainSPContextSlice";
import { InputSwitch } from "primereact/inputswitch";
import CustomInput from "../../../components/common/CustomInputFields/CustomInput";
import { ToastContainer } from "react-toastify";

const img: any = require("../../../assets/images/svg/Shoutouts/bronze.png");

interface PopupState {
  open: boolean;
  popupTitle: string;
  popupWidth: string;
  popupType: string;
  defaultCloseBtn: boolean;
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

let isActivityPage: boolean = false;

const ShoutOutsPage = (props: any): JSX.Element => {
  const dispatch = useDispatch();
  const searchField: IPageSearchFields = CONFIG.PageSearchFields;
  const ShoutOutsStoreData: any = useSelector((state: any) => {
    return state.ShoutOutsData.value;
  });
  const [shoutOutsData, setShoutOutsData] = useState<any[]>([]);
  const [showShoutOutsData, setShowShoutOutsData] = useState<any[]>([]);
  const [currentUserData, setCurrentUserData] = useState<any>({});
  const [selectedTab, setSelectedTab] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<IPaginationData>(
    CONFIG.PaginationData
  );
  const [commonSearch, setCommonSearch] = useState<IPageSearchFields>({
    ...CONFIG.PageSearchFields,
  });
  const [handleForm, setHandleForm] = useState<any>({
    ID: null,
    type: "",
  });
  const [formData, setFormData] = useState<any>({
    SendTowards: {
      value: [],
      isValid: true,
      errorMsg: "Send person is required",
      validationRule: { required: true, type: "array" },
    },
    Description: {
      value: "",
      isValid: true,
      errorMsg: "Description is required",
      validationRule: { required: true, type: "string" },
    },
  });

  const totalRecords = showShoutOutsData?.length || 0;

  const onPageChange = (event: any): void => {
    setPagination({
      first: event?.first || CONFIG.PaginationData.first,
      rows: event?.rows || CONFIG.PaginationData.rows,
    });
  };

  const handleSearch = async (masterArray: any[]): Promise<void> => {
    let temp: any[] = [...masterArray];
    if (searchField.Search) {
      temp = temp?.filter(
        (val: any) =>
          val?.message
            .toLowerCase()
            .includes(searchField.Search.toLowerCase()) ||
          val?.receiverName
            .toLowerCase()
            .includes(searchField.Search.toLowerCase()) ||
          val?.senderName
            .toLowerCase()
            .includes(searchField.Search.toLowerCase())
      );
    }
    setShowShoutOutsData([...temp]);
    await onPageChange("");
  };

  // popup properties
  const initialPopupController: PopupState[] = [
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
        success: "Shout out added successfully!",
        error: "Something went wrong!",
        successDescription: "The shout out added successfully.",
        errorDescription:
          "An error occured while adding shout out, please try again later.",
        inprogress: "Adding shout out, please wait...",
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
        success: "Shout out deleted successfully!",
        error: "Something went wrong!",
        successDescription:
          "The new Shout out 'ABC' has been deleted successfully.",
        errorDescription:
          "An error occured while delete Shout out, please try again later.",
        inprogress: "Delete Shout out, please wait...",
      },
    },
  ];

  const [popupController, setPopupController] = useState<PopupState[]>(
    initialPopupController
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

  const handleUserSubmit = async (isNew: boolean): Promise<any> => {
    let hasErrors = false;

    // Validate each field and update the state with error messages
    const updatedFormData = Object.keys(formData).reduce((acc, key) => {
      const fieldData = formData[key];
      const { isValid, errorMsg } = validateField(
        key,
        key !== "SendTowards" ? fieldData.value : [fieldData.value],
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
      if (isNew) {
        togglePopupVisibility(
          setPopupController,
          initialPopupController[0],
          0,
          "close"
        );
        await addShoutOut(formData, dispatch);
      } else {
        togglePopupVisibility(
          setPopupController,
          initialPopupController[0],
          0,
          "close"
        );
        await updateShoutOut(formData, handleForm?.ID, dispatch);
      }
    } else {
      console.log("Form contains errors");
    }
  };

  const popupInputs: any[] = [
    [
      <div className={styles.addShoutOutGrid} key={1}>
        <div style={{ width: "100%" }}>
          <div style={{ width: "50%" }}>
            <CustomPeoplePicker
              labelText="Shout-out to"
              isValid={formData.SendTowards.isValid}
              errorMsg={formData.SendTowards.errorMsg}
              selectedItem={[formData.SendTowards.value]}
              readOnly={handleForm?.type === "Update"}
              onChange={(item: any) => {
                const value = item?.[0];
                const { isValid, errorMsg } = validateField(
                  "SendTowards",
                  item,
                  formData.SendTowards.validationRule
                );
                handleInputChange("SendTowards", value, isValid, errorMsg);
                if (!value) {
                  handleInputChange("Description", "", true, "");
                }
              }}
            />
          </div>
        </div>

        <FloatingLabelTextarea
          value={formData.Description.value}
          placeholder="Description"
          rows={5}
          isValid={formData.Description.isValid}
          errorMsg={formData.Description.errorMsg}
          // disabled={formData.Status.value !== "Pending"}
          onChange={(e: any) => {
            const value = e.trimStart();
            const { isValid, errorMsg } = validateField(
              "Description",
              value,
              formData.Description.validationRule
            );
            handleInputChange("Description", value, isValid, errorMsg);
          }}
        />

        <div
          className={styles.suggestion}
          style={{
            display: formData?.SendTowards?.value ? "flex" : "none",
          }}
        >
          {[
            {
              emoji: "🎉",
              text: `Great job, ${
                formData?.SendTowards?.value?.name
                  ? formData?.SendTowards?.value?.name
                  : formData?.SendTowards?.value
                  ? formData?.SendTowards?.value
                  : ""
              }!`,
            },
            { emoji: "👏", text: "Kudos for the amazing work!" },
            {
              emoji: "🌟",
              text: `Shoutout to ${
                formData?.SendTowards?.value?.name
                  ? formData?.SendTowards?.value?.name
                  : formData?.SendTowards?.value
                  ? formData?.SendTowards?.value
                  : ""
              } for outstanding effort!`,
            },
            {
              emoji: "🏆",
              text: `Congrats on the milestone, ${
                formData?.SendTowards?.value?.name
                  ? formData?.SendTowards?.value?.name
                  : formData?.SendTowards?.value
                  ? formData?.SendTowards?.value
                  : ""
              }!`,
            },
            { emoji: "🎊", text: "Celebrating your success today!" },
            { emoji: "🎯", text: "Well done on this achievement!" },
            { emoji: "💪", text: "Exceptional service, well done!" },
            { emoji: "💖", text: "Shoutout for making a customer’s day!" },
          ].map((sug: any, idx: number) => {
            return (
              <button
                key={idx}
                onClick={() => {
                  const message: string = `${sug.emoji} ${sug.text}`;
                  const { isValid, errorMsg } = validateField(
                    "Description",
                    message,
                    formData.Description.validationRule
                  );
                  handleInputChange("Description", message, isValid, errorMsg);
                }}
              >{`${sug.emoji} ${sug.text}`}</button>
            );
          })}
        </div>
      </div>,
    ],
    [
      <div key={2}>
        <p>Are you sure you want to delete this shout out?</p>
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
        text: handleForm?.type === "Add" ? "Submit" : "Update",
        btnType: "primaryGreen",
        endIcon: false,
        startIcon: false,
        disabled: !Object.keys(formData).every((key) => formData[key].isValid),
        size: "large",
        onClick: async () => {
          if (handleForm?.type === "Add") {
            await handleUserSubmit(true);
          } else {
            await handleUserSubmit(false);
          }
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
        text: "Delete",
        btnType: "primaryGreen",
        endIcon: false,
        startIcon: false,
        disabled: !Object.keys(formData).every((key) => formData[key].isValid),
        size: "large",
        onClick: async () => {
          togglePopupVisibility(
            setPopupController,
            initialPopupController[1],
            1,
            "close"
          );
          await deleteShoutOut(handleForm?.ID, dispatch);
        },
      },
    ],
  ];

  const onLoadingFUN = async (curTab: any): Promise<void> => {
    let filteredData: any[] = [];
    const userData = await shoutOutsCurrentUserRole(setCurrentUserData);

    if (userData.userRole === "Admin") {
      if (curTab === CONFIG.ShoutOutsPageTabsName[0]) {
        filteredData = ShoutOutsStoreData?.data?.filter((newsItem: any) => {
          return newsItem;
        });
      } else {
        filteredData = ShoutOutsStoreData?.data?.filter((newsItem: any) => {
          return (
            newsItem.senderImage.toLowerCase() === userData.email.toLowerCase()
          );
        });
      }
    } else {
      if (curTab === CONFIG.ShoutOutsPageTabsName[0]) {
        filteredData = ShoutOutsStoreData?.data?.filter((newsItem: any) => {
          return newsItem.isActive;
        });
      } else {
        filteredData = ShoutOutsStoreData?.data?.filter((newsItem: any) => {
          return (
            newsItem.senderImage.toLowerCase() === userData.email.toLowerCase()
          );
        });
      }
    }

    setSelectedTab(curTab);
    setShoutOutsData([...filteredData].reverse());
    setShowShoutOutsData([...filteredData].reverse());
    setIsLoading(false);
  };

  useEffect(() => {
    if (ShoutOutsStoreData?.data?.length > 0) {
      onLoadingFUN(selectedTab || CONFIG.ShoutOutsPageTabsName[0]);
    }
  }, [ShoutOutsStoreData]);

  useEffect(() => {
    const urlObj = new URL(window.location.href);
    const params = new URLSearchParams(urlObj.search);
    isActivityPage = params?.get("Page") === "activity" ? true : false;

    setIsLoading(true);
    dispatch(setMainSPContext(props?.context));
    getAllShoutOutsData(dispatch);
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
          <p>Shout-outs</p>
        </div>
        <div className={styles.rightSection}>
          <div>
            <CustomInput
              noErrorMsg
              value={commonSearch?.Search}
              size="SM"
              placeholder="Search"
              onChange={(e: any) => {
                const value: string = e.trimStart();
                searchField.Search = value;
                setCommonSearch((prev: IPageSearchFields) => ({
                  ...prev,
                  Search: value,
                }));
                handleSearch([...shoutOutsData]);
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
              handleSearch([...shoutOutsData]);
            }}
          >
            <i className="pi pi-refresh" />
          </div>
          <div
            style={{
              display: "flex",
            }}
            className={styles.addNewbtn}
            onClick={() => {
              setHandleForm({ ID: null, type: "Add" });
              resetFormData(formData, setFormData);
              togglePopupVisibility(
                setPopupController,
                initialPopupController[0],
                0,
                "open",
                "New Shout-out"
              );
            }}
          >
            <i
              className="pi pi-plus"
              style={{ fontSize: "1rem", color: "#fff" }}
            />
            Add shout-out
          </div>
        </div>
      </div>

      {/* tabs */}
      <div className={styles.tabsContainer}>
        {CONFIG.ShoutOutsPageTabsName.map((str: string, i: number) => {
          return (
            <div
              key={i}
              style={{
                borderBottom:
                  selectedTab === str ? "3px solid #e0803d" : "none",
                cursor: "pointer",
              }}
              onClick={(_) => {
                setIsLoading(true);
                setPagination(CONFIG.PaginationData);
                if (selectedTab !== str) {
                  searchField.Search = "";
                  searchField.Status = "";
                  searchField.Date = null;
                  setCommonSearch({ ...searchField });
                  getAllShoutOutsData(dispatch);
                }
                setSelectedTab(str);
                onLoadingFUN(str);
              }}
            >
              {str}
            </div>
          );
        })}
      </div>

      {showShoutOutsData?.length === 0 ? (
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
          No shout outs found.
        </div>
      ) : (
        <div className={styles.bodyContainer}>
          {showShoutOutsData
            ?.slice(pagination.first, pagination.first + pagination.rows)
            ?.map((val: any, index: number) => {
              return (
                <div key={index} className={styles.cardSection}>
                  <div
                    style={{
                      minHeight:
                        currentUserData.userRole !== "User"
                          ? "306px"
                          : val?.isActive
                          ? "330px"
                          : "306px",
                      maxHeight:
                        currentUserData.userRole !== "User"
                          ? "306px"
                          : val?.isActive
                          ? "330px"
                          : "306px",
                    }}
                    className={styles.cardBody}
                  >
                    <div className={styles.Container}>
                      <p className={styles.shoutOutHeader}>
                        <span className={styles.sender}>{val?.senderName}</span>{" "}
                        <span className={styles.recogonized}>recognized </span>
                        <span className={styles.receiver}>
                          {val?.receiverName}
                        </span>
                      </p>

                      <div className={styles.iconSection}>
                        <Avatar
                          image={`/_layouts/15/userphoto.aspx?size=S&username=${val?.senderImage}`}
                          shape="circle"
                          style={{
                            width: "40px !important",
                            height: "40px !important",
                          }}
                          data-pr-tooltip={val.receiverName}
                        />
                        <img src={`${img}`} alt="" className={styles.img} />
                        <i
                          className="pi pi-caret-right"
                          style={{ fontSize: "20px" }}
                        />
                        <Avatar
                          image={`/_layouts/15/userphoto.aspx?size=S&username=${val?.receiverImage}`}
                          shape="circle"
                          data-pr-tooltip={val.receiverName}
                        />
                      </div>

                      <p className={styles.message}>{val.message}</p>
                    </div>
                  </div>
                  <div className={styles.cardFooter}>
                    {currentUserData.userRole === "Admin" ? (
                      <div
                        className={
                          val.isActive
                            ? styles.approvedPill
                            : styles.rejectedPill
                        }
                      >
                        {val.isActive ? "Active" : "In Active"}
                      </div>
                    ) : (
                      <div />
                    )}
                    <div className={styles.actionBtns}>
                      {currentUserData.userRole === "Admin" && (
                        <InputSwitch
                          checked={val.isActive}
                          className="sectionToggler"
                          onChange={(e: any) => {
                            setShowShoutOutsData((prevItems) =>
                              prevItems.map((item: any, idx: number) =>
                                val?.ID === item?.ID
                                  ? { ...item, isActive: e.value }
                                  : item
                              )
                            );
                            changeShoutOutActiveStatus(val.ID, e.value);
                          }}
                        />
                      )}

                      {val?.senderImage?.toLowerCase() ===
                        currentUserData?.email?.toLowerCase() &&
                        !val.isActive && (
                          <i
                            onClick={() => {
                              setHandleForm({ ID: val.ID, type: "Update" });
                              setFormData({
                                SendTowards: {
                                  ...formData.SendTowards,
                                  isValid: true,
                                  value: val.receiverName || {},
                                },
                                Description: {
                                  ...formData.Description,
                                  isValid: true,
                                  value: val?.message || "",
                                },
                              });
                              togglePopupVisibility(
                                setPopupController,
                                initialPopupController[0],
                                0,
                                "open",
                                "Update shout-out"
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

                      {val?.senderImage?.toLowerCase() ===
                        currentUserData?.email?.toLowerCase() &&
                        !val.isActive && (
                          <i
                            className="pi pi-trash"
                            style={{
                              color: "#ff1c1c",
                              fontSize: "1.2rem",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              setHandleForm({ ID: val.ID, type: "Update" });
                              togglePopupVisibility(
                                setPopupController,
                                initialPopupController[1],
                                1,
                                "open"
                              );
                            }}
                          />
                        )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {showShoutOutsData.length > 0 && (
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
            if (popupData?.isLoading?.success) {
              // setIsile(false);
              // getAllNewsData(dispatch);
            }
            // resetFormData(formData, setFormData);
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
  );
};

export default ShoutOutsPage;
