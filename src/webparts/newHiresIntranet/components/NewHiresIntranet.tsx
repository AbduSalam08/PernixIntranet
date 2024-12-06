/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import SectionHeaderIntranet from "../../../components/common/SectionHeaderIntranet/SectionHeaderIntranet";
import styles from "./NewHiresIntranet.module.scss";
import "../../../assets/styles/style.css";
import { Carousel } from "primereact/carousel";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../utils/popupUtils";
import Popup from "../../../components/common/Popups/Popup";
import { resetFormData, validateField } from "../../../utils/commonUtils";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addNewHire,
  getAllNewHiresData,
  getCurrentUserRole,
} from "../../../services/newHiresIntranet/newHiresIntranet";
import FloatingLabelTextarea from "../../../components/common/CustomInputFields/CustomTextArea";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
import CustomDateInput from "../../../components/common/CustomInputFields/CustomDateInput";
import CustomFileUpload from "../../../components/common/CustomInputFields/CustomFileUpload";
import ViewAll from "../../../components/common/ViewAll/ViewAll";
import { CONFIG } from "../../../config/config";
import CustomPeoplePicker from "../../../components/common/CustomInputFields/CustomPeoplePicker";
import { setMainSPContext } from "../../../redux/features/MainSPContextSlice";
import moment from "moment";
import { IFormFields } from "../../../interface/interface";
import { Button } from "primereact/button";
import { ToastContainer } from "react-toastify";

/* Images creation */
const errorGrey = require("../../../assets/images/svg/errorGrey.svg");
const defaultUserImg: string = require("../../../assets/images/svg/user2.png");

/* Local interfaces */
interface INewHiresField {
  EmployeeName: IFormFields;
  ProfileImage: IFormFields;
  Description: IFormFields;
  StartDate: IFormFields;
  EndDate: IFormFields;
}

const NewHiresIntranet = (props: any): JSX.Element => {
  /* Local variable creation */
  const dispatch = useDispatch();

  const newHiresData: any = useSelector((state: any) => {
    return state.NewHiresData.value;
  });

  /* popup properties */
  const initialPopupController: any[] = [
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

  const [popupController, setPopupController] = useState<any[]>(
    initialPopupController
  );
  const [curObject, setCurObject] = useState<any>();
  console.log("setCurObject: ", setCurObject);
  const [newHires, setNewHires] = useState<any[]>([]);
  const [currentUserDetails, setCurrentUserDetails] = useState<any>({
    role: "User",
    email: "",
  });
  const [formData, setFormData] = useState<INewHiresField | any>({
    ...initialFormData,
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

  const handleSubmit = async (): Promise<any> => {
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
      resetFormData(formData, setFormData);
      setFormData({ ...initialFormData });
      togglePopupVisibility(
        setPopupController,
        initialPopupController[0],
        0,
        "close"
      );
      await addNewHire(formData);
      await getAllNewHiresData(dispatch);
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
                console.log("file: ", file);
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
              errorMsg={formData?.StartDate?.errorMsg}
              onChange={(date: any) => {
                const { isValid, errorMsg } = validateField(
                  "Start date",
                  date,
                  formData.StartDate.validationRule
                );
                if (formData?.EndDate?.value) {
                  if (new Date(formData.EndDate.value) >= new Date(date)) {
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
              error={!formData?.EndDate?.isValid}
              errorMsg={formData?.EndDate?.errorMsg}
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
      <div className={styles.popUpContainer} key={2}>
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
        text: "Submit",
        btnType: "primaryGreen",
        endIcon: false,
        startIcon: false,
        disabled: !Object.keys(formData).every((key) => formData[key].isValid),
        size: "large",
        onClick: async () => {
          await handleSubmit();
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
            initialPopupController[1],
            1,
            "close"
          );
        },
      },
    ],
  ];

  const productTemplate = (val: any): JSX.Element => {
    return (
      <div className={styles.cardContainer}>
        <div className={styles.cardHeaderSec}>
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
                initialPopupController[1],
                1,
                "open"
              );
            }}
          />
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (newHiresData?.data?.length > 0) {
      const filteredData = newHiresData?.data?.filter((obj: any) => {
        return (
          Number(moment().format("YYYYMMDD")) >=
            Number(moment(obj?.StartDate).format("YYYYMMDD")) &&
          Number(moment().format("YYYYMMDD")) <=
            Number(moment(obj?.EndDate).format("YYYYMMDD"))
        );
      });
      setNewHires([...filteredData]);
    }
  }, [newHiresData]);

  useEffect(() => {
    dispatch(setMainSPContext(props?.context));
    getCurrentUserRole(setCurrentUserDetails);
    getAllNewHiresData(dispatch);
  }, [dispatch]);

  return (
    <div className={styles.newhireContainer}>
      <SectionHeaderIntranet
        label="New Hires"
        title="Add a new hire"
        removeAdd={currentUserDetails?.role === "Admin" ? false : true}
        headerAction={() => {
          resetFormData(formData, setFormData);
          setFormData({ ...initialFormData });
          togglePopupVisibility(
            setPopupController,
            initialPopupController[0],
            0,
            "open"
          );
        }}
      />

      <div className={styles.contentSection}>
        {newHiresData?.isLoading ? (
          <CircularSpinner />
        ) : newHiresData?.error ? (
          <div className="errorWrapper">
            <img src={errorGrey} alt="Error" />
            <span className="disabledText">{newHiresData?.error}</span>
          </div>
        ) : (
          <Carousel
            value={newHires}
            numScroll={1}
            numVisible={1}
            showIndicators={true}
            showNavigators={false}
            circular
            autoplayInterval={newHires.length > 1 ? 6000 : 8.64e7}
            // circular
            itemTemplate={productTemplate}
          />
        )}
      </div>

      {!newHiresData?.isLoading && newHires.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <ViewAll
            onClick={() => {
              window.open(
                props.context.pageContext.web.absoluteUrl +
                  CONFIG.NavigatePage.NewHiresPage,
                "_self"
              );
            }}
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
              getAllNewHiresData(dispatch);
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
export default NewHiresIntranet;
