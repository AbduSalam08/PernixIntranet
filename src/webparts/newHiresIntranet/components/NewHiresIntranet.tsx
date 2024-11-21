/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import SectionHeaderIntranet from "../../../components/common/SectionHeaderIntranet/SectionHeaderIntranet";
import styles from "./NewHiresIntranet.module.scss";
import "../../../assets/styles/style.css";
import { Carousel } from "primereact/carousel";
import { Avatar } from "primereact/avatar";
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
import CustomInput from "../../../components/common/CustomInputFields/CustomInput";
import FloatingLabelTextarea from "../../../components/common/CustomInputFields/CustomTextArea";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
import CustomDateInput from "../../../components/common/CustomInputFields/CustomDateInput";
import CustomFileUpload from "../../../components/common/CustomInputFields/CustomFileUpload";
import ViewAll from "../../../components/common/ViewAll/ViewAll";
import { CONFIG } from "../../../config/config";
import CustomPeoplePicker from "../../../components/common/CustomInputFields/CustomPeoplePicker";
import { setMainSPContext } from "../../../redux/features/MainSPContextSlice";
// images
const personImagePlaceholder: any = require("../../../assets/images/svg/personImagePlaceholder.svg");
const errorGrey = require("../../../assets/images/svg/errorGrey.svg");

const NewHiresIntranet = (props: any): JSX.Element => {
  const dispatch = useDispatch();
  // popup properties
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
  ];

  const [popupController, setPopupController] = useState(
    initialPopupController
  );

  const newHiresData: any = useSelector((state: any) => {
    return state.NewHiresData.value;
  });
  console.log("newHiresData", newHiresData);

  const [newHires, setNewHires] = useState<any[]>([]);
  const [currentUserDetails, setCurrentUserDetails] = useState<any>({
    role: "User",
    email: "",
  });
  console.log("currentUserDetails", currentUserDetails);
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
      await addNewHire(formData, setPopupController, 0);
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
              maximumDate={new Date(formData.EndDate.value) || ""}
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
          <div>
            <CustomDateInput
              value={formData.EndDate.value}
              label="End Date"
              isDateController={true}
              minimumDate={new Date(formData.StartDate.value)}
              disabledInput={formData.StartDate.value === ""}
              error={!formData.EndDate.isValid}
              errorMsg={formData.EndDate.errorMsg}
              onChange={(date: any) => {
                const { isValid, errorMsg } = validateField(
                  "EndDate",
                  date,
                  formData.EndDate.validationRule
                );
                handleInputChange("EndDate", date, isValid, errorMsg);
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
  ];

  const productTemplate = (val: any): JSX.Element => {
    return (
      <div
        className={styles.Container}
        style={{
          height: currentUserDetails.role === "Admin" ? "350px" : "365px",
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
        <p className={styles.description} title={val.Description}>
          {val.Description}
        </p>
        <div className={styles.imgSection}>
          <img src={val.imgUrl || personImagePlaceholder} alt="" />
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (newHiresData?.data?.length > 0) {
      const filteredData = newHiresData?.data?.filter((obj: any) => {
        return (
          new Date() >= new Date(obj?.StartDate) &&
          new Date() <= new Date(obj?.EndDate)
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

  const handlenavigate = (): void => {
    window.open(
      props.context.pageContext.web.absoluteUrl +
        CONFIG.NavigatePage.NewHiresPage,
      "_self"
    );
  };

  return (
    <div className={styles.newhireContainer}>
      <SectionHeaderIntranet
        label="New Hires"
        removeAdd={currentUserDetails?.role === "Admin" ? false : true}
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
            autoplayInterval={newHires.length > 1 ? 3000 : 8.64e7}
            // circular
            itemTemplate={productTemplate}
          />
        )}
      </div>
      {!newHiresData?.isLoading && newHires.length > 0 && (
        <ViewAll onClick={handlenavigate} />
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
