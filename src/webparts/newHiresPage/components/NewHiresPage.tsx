/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type*/
import { useEffect, useState } from "react";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
import { CONFIG } from "../../../config/config";
import styles from "./NewHiresPage.module.scss";
import "./Style.css";
import {
  IFormFields,
  IPageSearchFields,
  IPaginationData,
} from "../../../interface/interface";
import { useDispatch, useSelector } from "react-redux";
import {
  addNewHire,
  deleteHire,
  getAllNewHiresData,
  getCurrentUserRole,
  updateHire,
} from "../../../services/newHiresIntranet/newHiresIntranet";
import moment from "moment";
import { Paginator } from "primereact/paginator";
// import { Avatar } from "primereact/avatar";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../utils/popupUtils";
import FloatingLabelTextarea from "../../../components/common/CustomInputFields/CustomTextArea";
import CustomDateInput from "../../../components/common/CustomInputFields/CustomDateInput";
import CustomFileUpload from "../../../components/common/CustomInputFields/CustomFileUpload";
import CustomInput from "../../../components/common/CustomInputFields/CustomInput";
import { resetFormData, validateField } from "../../../utils/commonUtils";
import Popup from "../../../components/common/Popups/Popup";
import CustomPeoplePicker from "../../../components/common/CustomInputFields/CustomPeoplePicker";
import { setMainSPContext } from "../../../redux/features/MainSPContextSlice";
import { Button } from "primereact/button";
import { ToastContainer } from "react-toastify";

/* Images creation */
// const personImagePlaceholder: any = require("../../../assets/images/svg/personImagePlaceholder.svg");
const defaultUserImg: string = require("../../../assets/images/svg/user2.png");

/* Local interfaces */
interface INewHiresField {
  EmployeeName: IFormFields;
  ProfileImage: IFormFields;
  Description: IFormFields;
  StartDate: IFormFields;
  EndDate: IFormFields;
}

let isActivityPage: boolean = false;

const NewHiresPage = (props: any): JSX.Element => {
  /* Local variable creation */
  const dispatch = useDispatch();
  const searchField: IPageSearchFields = CONFIG.PageSearchFields;
  const newHiresData: any = useSelector((state: any) => {
    return state.NewHiresData.value;
  });

  /* popup properties */
  const initialPopupController = [
    {
      open: false,
      popupTitle: "New Hire",
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
        success: "Hire added successfully!",
        error: "Something went wrong!",
        successDescription: "The new hire 'ABC' has been added successfully.",
        errorDescription:
          "An error occured while adding hire, please try again later.",
        inprogress: "Adding new hire, please wait...",
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
        success: "Hire deleted successfully!",
        error: "Something went wrong!",
        successDescription: "The new hire 'ABC' has been deleted successfully.",
        errorDescription:
          "An error occured while delete hire, please try again later.",
        inprogress: "Deleting hire, please wait...",
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
  const initialFormData: INewHiresField = {
    EmployeeName: {
      value: "",
      isValid: true,
      errorMsg: "This field is required",
      validationRule: { required: true, type: "array" },
    },
    ProfileImage: {
      value: null,
      isValid: true,
      errorMsg: "",
      validationRule: { required: false, type: "file" },
    },
    StartDate: {
      value: new Date(),
      isValid: true,
      errorMsg: "",
      validationRule: { required: false, type: "date" },
    },
    EndDate: {
      value: null,
      isValid: true,
      errorMsg: "This field is required",
      validationRule: { required: true, type: "date" },
    },
    Description: {
      value: "",
      isValid: true,
      errorMsg: "This field is required",
      validationRule: { required: true, type: "string" },
    },
  };

  const [formData, setFormData] = useState<INewHiresField | any>({
    ...initialFormData,
  });
  const [handleForm, setHandleForm] = useState<any>({
    ID: null,
    type: "",
  });
  const [attachmentObject, setAttachmentObject] = useState<any>({});
  const [popupController, setPopupController] = useState(
    initialPopupController
  );
  const [newHires, setNewHires] = useState<any[]>([]);
  const [typeNewHires, setTypeNewHires] = useState<any[]>([]);
  const [showNewHires, setShowNewHires] = useState<any[]>([]);
  const [userDetails, setUserDetails] = useState<any>({
    role: "User",
    email: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<string>("");
  const [pagination, setPagination] = useState<IPaginationData>(
    CONFIG.PaginationData
  );
  const [commonSearch, setCommonSearch] = useState<IPageSearchFields>({
    ...CONFIG.PageSearchFields,
  });
  const [curObject, setCurObject] = useState<any>();

  const totalRecords = showNewHires?.length || 0;

  const onPageChange = (event: any): void => {
    setPagination({
      first: event?.first || CONFIG.PaginationData.first,
      rows: event?.rows || CONFIG.PaginationData.rows,
    });
  };

  const handleSearch = async (datas: any[]): Promise<void> => {
    let temp: any[] = [...datas];

    if (searchField.Search) {
      temp = temp?.filter(
        (val: any) =>
          val?.Description.toLowerCase().includes(
            searchField.Search.toLowerCase()
          ) ||
          val?.EmployeeName?.name
            ?.toLowerCase()
            .includes(searchField.Search.toLowerCase())
      );
    }
    setShowNewHires([...temp]);
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
        const startDate = new Date(obj?.StartDate);
        const endDate = new Date(obj?.EndDate);
        return (
          today >=
            new Date(
              startDate.getFullYear(),
              startDate.getMonth(),
              startDate.getDate()
            ) &&
          today <=
            new Date(
              endDate.getFullYear(),
              endDate.getMonth(),
              endDate.getDate()
            )
        );
      });
    } else if (curTab === CONFIG.NewHiresPageTabsName[1]) {
      filteredData = data?.filter((obj: any) => {
        const startDate = new Date(obj?.StartDate);
        const endDate = new Date(obj?.EndDate);
        return (
          today <
            new Date(
              startDate.getFullYear(),
              startDate.getMonth(),
              startDate.getDate()
            ) &&
          today <
            new Date(
              endDate.getFullYear(),
              endDate.getMonth(),
              endDate.getDate()
            )
        );
      });
    } else {
      filteredData = data?.filter((obj: any) => {
        const startDate = new Date(obj?.StartDate);
        const endDate = new Date(obj?.EndDate);
        return (
          today >=
            new Date(
              startDate.getFullYear(),
              startDate.getMonth(),
              startDate.getDate()
            ) &&
          today >
            new Date(
              endDate.getFullYear(),
              endDate.getMonth(),
              endDate.getDate()
            )
        );
      });
    }
    setTypeNewHires([...filteredData]);
    handleSearch([...filteredData]);
    setIsLoading(false);
    setSelectedTab(curTab);
  };

  const handleUserSubmit = async (isNew: boolean): Promise<any> => {
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
      if (isNew) {
        resetFormData(formData, setFormData);
        setFormData({ ...initialFormData });
        togglePopupVisibility(
          setPopupController,
          initialPopupController[0],
          0,
          "close"
        );
        await addNewHire(formData);
        if (handleForm?.type === "Delete") {
          const filteredData = newHires?.filter(
            (val: any) => val?.ID !== handleForm?.ID
          );
          setNewHires([...filteredData]);
          onLoadingFUN(selectedTab, [...filteredData]);
        } else {
          getAllNewHiresData(dispatch);
        }
      } else {
        resetFormData(formData, setFormData);
        setFormData({ ...initialFormData });
        togglePopupVisibility(
          setPopupController,
          initialPopupController[0],
          0,
          "close"
        );
        await updateHire(formData, handleForm?.ID, attachmentObject);
        if (handleForm?.type === "Delete") {
          const filteredData = newHires?.filter(
            (val: any) => val?.ID !== handleForm?.ID
          );
          setNewHires([...filteredData]);
          onLoadingFUN(selectedTab, [...filteredData]);
        } else {
          getAllNewHiresData(dispatch);
        }
      }
    } else {
      console.log("Form contains errors");
    }
  };

  const popupInputs: any[] = [
    [
      <div className={styles.newHiresGrid} key={1}>
        <div className={styles.secondRow}>
          <div className={styles.c1}>
            <CustomPeoplePicker
              labelText="Employee name"
              isValid={formData?.EmployeeName?.isValid}
              errorMsg={formData?.EmployeeName?.errorMsg}
              selectedItem={[formData?.EmployeeName?.value]}
              onChange={(item: any) => {
                const value = item[0];
                console.log("value: ", value);
                const { isValid, errorMsg } = validateField(
                  "Employee name",
                  item,
                  formData?.EmployeeName?.validationRule
                );
                handleInputChange("EmployeeName", value, isValid, errorMsg);
              }}
            />
          </div>
          <div className={styles.c1}>
            <CustomFileUpload
              accept="image/png,image/jpeg"
              value={formData?.ProfileImage.value?.name}
              onFileSelect={async (file) => {
                const { isValid, errorMsg } = validateField(
                  "Profile image",
                  file ? file.name : "",
                  formData.ProfileImage.validationRule
                );
                await handleInputChange(
                  "ProfileImage",
                  file,
                  isValid,
                  errorMsg
                );
              }}
              placeholder="Profile (400 x 400)"
              isValid={formData.ProfileImage.isValid}
              errMsg={formData.ProfileImage.errorMsg}
            />
          </div>
        </div>

        <div className={styles.thirdRow}>
          <div>
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
                  "Start date",
                  date,
                  formData.StartDate.validationRule
                );
                if (formData?.EndDate?.value) {
                  if (new Date(formData.EndDate.value) >= new Date(date)) {
                    // handleInputChange("EndDate", date, isValid, errorMsg);
                    handleInputChange("StartDate", date, isValid, errorMsg);
                  } else {
                    handleInputChange(
                      "StartDate",
                      "",
                      false,
                      "Start date must be before end date"
                    );
                  }
                } else {
                  handleInputChange("StartDate", date, isValid, errorMsg);
                }
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
              disabledInput={!formData?.StartDate?.value}
              error={!formData.EndDate.isValid}
              errorMsg={formData.EndDate.errorMsg}
              onChange={(date: any) => {
                const { isValid, errorMsg } = validateField(
                  "End date",
                  date,
                  formData.EndDate.validationRule
                );
                if (formData?.StartDate?.value) {
                  if (new Date(formData.StartDate.value) <= new Date(date)) {
                    handleInputChange("EndDate", date, isValid, errorMsg);
                  } else {
                    handleInputChange(
                      "EndDate",
                      "",
                      false,
                      "End date must be after start date"
                    );
                  }
                }
                // handleInputChange("EndDate", date, isValid, errorMsg);
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
      </div>,
    ],
    [
      <div key={2}>
        <p>Are you sure you want to delete this hire?</p>
      </div>,
    ],
    [
      <div className={styles.popUpContainer} key={3}>
        <div className={styles.popUpHeaderSec}>
          <img src={curObject?.imgUrl ?? defaultUserImg} alt="User image" />
          <div>
            <div>{curObject?.EmployeeName?.name ?? ""}</div>
            <div>
              {moment(curObject?.StartDate).format("YYYYMMDD") ===
              moment(curObject?.EndDate).format("YYYYMMDD")
                ? moment(curObject?.StartDate).format("DD MMM YYYY")
                : moment(curObject?.StartDate).format("DD MMM YYYY") +
                  " - " +
                  moment(curObject?.EndDate).format("DD MMM YYYY")}
            </div>
          </div>
        </div>
        <div title={curObject?.Description} className={styles.popUpBodySec}>
          {curObject?.Description ?? ""}
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
        disabled: false,
        size: "large",
        onClick: async () => {
          togglePopupVisibility(
            setPopupController,
            initialPopupController[1],
            1,
            "close"
          );
          await deleteHire(handleForm?.ID);
          getAllNewHiresData(dispatch);
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
            initialPopupController[2],
            2,
            "close"
          );
        },
      },
    ],
  ];

  useEffect(() => {
    if (newHiresData?.data?.length > 0) {
      setNewHires(newHiresData?.data);
      onLoadingFUN(
        selectedTab ? selectedTab : CONFIG.NewHiresPageTabsName[0],
        newHiresData?.data
      );
    }
  }, [newHiresData]);

  useEffect(() => {
    const urlObj = new URL(window.location.href);
    const params = new URLSearchParams(urlObj.search);
    isActivityPage = params?.get("Page") === "activity" ? true : false;

    dispatch(setMainSPContext(props?.context));
    getCurrentUserRole(setUserDetails);
    getAllNewHiresData(dispatch);
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
          <p>New hires</p>
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
                handleSearch([...typeNewHires]);
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
              handleSearch([...typeNewHires]);
            }}
          >
            <i className="pi pi-refresh" />
          </div>
          {userDetails?.role === "Admin" && (
            <div
              style={{
                display: "flex",
              }}
              className={styles.addNewbtn}
              onClick={() => {
                setHandleForm({ ID: null, type: "Add" });
                resetFormData(formData, setFormData);
                setFormData({ ...initialFormData });
                togglePopupVisibility(
                  setPopupController,
                  initialPopupController[0],
                  0,
                  "open",
                  "New hire"
                );
              }}
            >
              <i
                className="pi pi-plus"
                style={{ fontSize: "1rem", color: "#fff" }}
              />
              New hire
            </div>
          )}
        </div>
      </div>

      {/* tabs */}
      <div className={styles.tabsContainer}>
        {CONFIG.NewHiresPageTabsName.map((str: string, i: number) => {
          return userDetails?.role === "Admin" ? (
            <div
              key={i}
              style={{
                borderBottom:
                  selectedTab === str ? "3px solid #e0803d" : "none",
                cursor: "pointer",
              }}
              onClick={(_) => {
                setSelectedTab(str);
                onLoadingFUN(str, newHires);
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
                cursor: "pointer",
              }}
              onClick={(_) => {
                setSelectedTab(str);
                onLoadingFUN(str, newHires);
              }}
            >
              {str}
            </div>
          ) : (
            ""
          );
        })}
      </div>

      {showNewHires?.length === 0 ? (
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
          No new hires found!
        </div>
      ) : (
        <div className={styles.bodyContainer}>
          {showNewHires
            ?.slice(pagination.first, pagination.first + pagination.rows)
            ?.map((val: any, index: number) => {
              return (
                <div key={index} className={styles.cardSection}>
                  <div className={styles.cardHeader}>
                    <img src={val?.imgUrl ?? defaultUserImg} alt="User image" />
                    <div>
                      <div>{val?.EmployeeName?.name ?? ""}</div>
                      <div>{moment(val?.StartDate).format("DD MMM YYYY")}</div>
                    </div>
                  </div>
                  <div title={val?.Description} className={styles.cardBodySec}>
                    {val?.Description ?? ""}
                  </div>
                  <div className={styles.cardBTNSec}>
                    <Button
                      label="Read more"
                      onClick={() => {
                        setCurObject({ ...val });
                        togglePopupVisibility(
                          setPopupController,
                          initialPopupController[2],
                          2,
                          "open"
                        );
                      }}
                    />
                    <div
                      style={{
                        display:
                          userDetails?.role === "Admin" ? "flex" : "none",
                      }}
                    >
                      <i
                        style={{
                          display:
                            selectedTab !== CONFIG.NewHiresPageTabsName[2]
                              ? "flex"
                              : "none",
                        }}
                        className="pi pi-pen-to-square"
                        onClick={() => {
                          setHandleForm({
                            ID: val?.ID,
                            type: "Update",
                          });
                          setAttachmentObject(val?.Attachment);
                          setFormData({
                            EmployeeName: {
                              ...initialFormData.EmployeeName,
                              value: val?.EmployeeName?.name,
                            },
                            StartDate: {
                              ...initialFormData.StartDate,
                              value: new Date(val?.StartDate),
                            },
                            EndDate: {
                              ...initialFormData.EndDate,
                              value: new Date(val?.EndDate),
                            },
                            Description: {
                              ...initialFormData.Description,
                              value: val?.Description,
                            },
                            ProfileImage: {
                              ...initialFormData.ProfileImage,
                              value: {
                                name: val?.Attachment?.FileName,
                              },
                            },
                          });
                          togglePopupVisibility(
                            setPopupController,
                            initialPopupController[0],
                            0,
                            "open",
                            "Update hire"
                          );
                        }}
                      />
                      <i
                        className="pi pi-trash"
                        onClick={() => {
                          setHandleForm({ ID: val?.ID, type: "Delete" });
                          togglePopupVisibility(
                            setPopupController,
                            initialPopupController[1],
                            1,
                            "open"
                          );
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {showNewHires.length > 0 && (
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
            resetFormData(formData, setFormData);
            setFormData({ ...initialFormData });
            togglePopupVisibility(
              setPopupController,
              initialPopupController[0],
              index,
              "close"
            );
            if (popupData?.isLoading?.success) {
              if (handleForm?.type === "Delete") {
                const filteredData = newHires?.filter(
                  (val: any) => val?.ID !== handleForm?.ID
                );
                setNewHires([...filteredData]);
                onLoadingFUN(selectedTab, [...filteredData]);
              } else {
                getAllNewHiresData(dispatch);
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
export default NewHiresPage;
