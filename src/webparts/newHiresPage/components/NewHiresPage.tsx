/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type*/
import { useEffect, useState } from "react";
// import CustomInput from "../../../components/common/CustomInputFields/CustomInput";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
import { CONFIG } from "../../../config/config";
import styles from "./NewHiresPage.module.scss";
import "./Style.css";
import {
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
import { Avatar } from "primereact/avatar";
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
const personImagePlaceholder: any = require("../../../assets/images/svg/personImagePlaceholder.svg");

const NewHiresPage = (props: any): JSX.Element => {
  console.log("props", props);
  const dispatch = useDispatch();
  const searchField: IPageSearchFields = CONFIG.PageSearchFields;
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
  ];
  const newHiresData: any = useSelector((state: any) => {
    return state.NewHiresData.value;
  });
  console.log("newHiresData", newHiresData);
  const [formData, setFormData] = useState<any>({
    Title: {
      value: "",
      isValid: true,
      errorMsg: "This field is required",
      validationRule: { required: true, type: "string" },
    },
    EmployeeName: {
      value: "",
      isValid: true,
      errorMsg: "This field is required",
      validationRule: { required: true, type: "array" },
    },
    StartDate: {
      value: "",
      isValid: true,
      errorMsg: "This field is required",
      validationRule: { required: true, type: "string" },
    },
    EndDate: {
      value: "",
      isValid: true,
      errorMsg: "This field is required",
      validationRule: { required: true, type: "string" },
    },
    Description: {
      value: "",
      isValid: true,
      errorMsg: "This field is required",
      validationRule: { required: true, type: "string" },
    },
    ProfileImage: {
      value: null,
      isValid: true,
      errorMsg: "Invalid file",
      validationRule: { required: true, type: "file" },
    },
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
  console.log("newHires", newHires);
  console.log("formData", formData);

  const totalRecords = showNewHires?.length || 0;
  const onPageChange = (event: any): void => {
    setPagination({
      first: event?.first || CONFIG.PaginationData.first,
      rows: event?.rows || CONFIG.PaginationData.rows,
    });
  };

  const handleSearch = async (datas: any[]): Promise<void> => {
    console.log("datas", datas);

    let temp: any[] = [...datas];
    if (searchField.Search) {
      temp = temp?.filter(
        (val: any) =>
          val?.Title.toLowerCase().includes(searchField.Search.toLowerCase()) ||
          val?.createdName
            .toLowerCase()
            .includes(searchField.Search.toLowerCase()) ||
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
        await addNewHire(formData, setPopupController, 0);
      } else {
        const reponse = await updateHire(
          formData,
          handleForm?.ID,
          attachmentObject,
          setPopupController,
          0
        );
        console.log("reponse", reponse);
      }
    } else {
      console.log("Form contains errors");
    }
  };

  const popupInputs: any[] = [
    [
      <div className={styles.newHiresGrid} key={1}>
        <CustomInput
          value={formData.Title.value}
          placeholder="Title"
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
                  "EmployeeName",
                  item,
                  formData?.EmployeeName?.validationRule
                );
                handleInputChange("EmployeeName", value, isValid, errorMsg);
              }}
            />
            {/* <CustomInput
              value={formData.EmployeeName.value}
              placeholder="Employee name"
              isValid={formData.EmployeeName.isValid}
              errorMsg={formData.EmployeeName.errorMsg}
              onChange={(e) => {
                const value = e.trimStart();
                const { isValid, errorMsg } = validateField(
                  "EmployeeName",
                  value,
                  formData.EmployeeName.validationRule
                );
                handleInputChange("EmployeeName", value, isValid, errorMsg);
              }}
            /> */}
          </div>
          <div className={styles.c1}>
            <CustomFileUpload
              accept="image/png,image/jpeg"
              value={formData?.ProfileImage.value?.name}
              onFileSelect={async (file) => {
                console.log("file: ", file);
                const { isValid, errorMsg } = validateField(
                  "ProfileImage",
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
              placeholder="Profile (1120 x 350)"
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
                  "StartDate",
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
                  "EndDate",
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
          await deleteHire(handleForm?.ID, setPopupController, 1);
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

  useEffect(() => {
    if (newHiresData?.data?.length > 0) {
      setNewHires(newHiresData?.data);
      onLoadingFUN(
        selectedTab || CONFIG.NewHiresPageTabsName[0],
        newHiresData?.data
      );
    }
  }, [newHiresData]);
  useEffect(() => {
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
              window.open(
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
                onLoadingFUN(str, newHires);
              }}
            >
              {str}
            </div>
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
          No questions found.
        </div>
      ) : (
        <div className={styles.bodyContainer}>
          {showNewHires
            ?.slice(pagination.first, pagination.first + pagination.rows)
            ?.map((val: any, index: number) => {
              return (
                <div className={styles.cardSection} key={index}>
                  <div className={styles.cardBody}>
                    <div className={styles.imgAndDecriptionSection}>
                      <div className={styles.imgSection}>
                        <img
                          src={val.imgUrl || personImagePlaceholder}
                          alt=""
                        />
                      </div>
                      <div className={styles.descriptionSection}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            margin: "10px 0px",
                          }}
                        >
                          <p
                            className={styles.employeeName}
                          >{`${val.Title} ${val.EmployeeName?.name}`}</p>
                          <div className={styles.imgandName}>
                            <Avatar
                              image={`/_layouts/15/userphoto.aspx?size=S&username=${val?.createdEmail}`}
                              // size="small"
                              shape="circle"
                              style={{
                                width: "40px !important",
                                height: "40px !important",
                              }}
                              data-pr-tooltip={val.receiverName}
                            />
                            <p>{val.createdName}</p>
                          </div>
                        </div>
                        <p
                          className={styles.description}
                          title={val.Description}
                        >
                          {val.Description}
                        </p>
                      </div>
                    </div>
                    <div className={styles.cardFooter}>
                      <p className={styles.dateSection}>{`${moment(
                        val.StartDate
                      ).format("DD/MM/YYYY")} - ${moment(val.EndDate).format(
                        "DD/MM/YYYY"
                      )}`}</p>
                      {userDetails?.role === "Admin" && (
                        <div style={{ display: "flex", gap: "10px" }}>
                          {selectedTab !== CONFIG.NewHiresPageTabsName[2] && (
                            <i
                              onClick={() => {
                                setHandleForm({ ID: val?.ID, type: "Update" });
                                setAttachmentObject(val?.Attachment);
                                setFormData({
                                  Title: {
                                    ...formData.Title,
                                    value: val?.Title,
                                  },
                                  EmployeeName: {
                                    ...formData.EmployeeName,
                                    value: val?.EmployeeName?.name,
                                  },
                                  StartDate: {
                                    ...formData.StartDate,
                                    value: new Date(val?.StartDate),
                                  },
                                  EndDate: {
                                    ...formData.EndDate,
                                    value: new Date(val?.EndDate),
                                  },
                                  Description: {
                                    ...formData.Description,
                                    value: val?.Description,
                                  },
                                  ProfileImage: {
                                    ...formData.ProfileImage,
                                    value: { name: val?.Attachment?.FileName },
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
                              style={{
                                color: "#adadad",
                                fontSize: "1.2rem",
                                cursor: "pointer",
                              }}
                              className="pi pi-pen-to-square"
                            />
                          )}
                          <i
                            className="pi pi-trash"
                            style={{
                              color: "#ff1c1c",
                              fontSize: "1.2rem",
                              cursor: "pointer",
                            }}
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
                      )}
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
