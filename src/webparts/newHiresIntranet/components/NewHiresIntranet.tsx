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
} from "../../../services/newHiresIntranet/newHiresIntranet";
import CustomInput from "../../../components/common/CustomInputFields/CustomInput";
import FloatingLabelTextarea from "../../../components/common/CustomInputFields/CustomTextArea";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
// images
const personImagePlaceholder: any = require("../../../assets/images/svg/personImagePlaceholder.svg");
const errorGrey = require("../../../assets/images/svg/errorGrey.svg");

const NewHiresIntranet = (props: any): JSX.Element => {
  const dispatch = useDispatch();
  // popup properties
  const initialPopupController = [
    {
      open: false,
      popupTitle: "Add News",
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

  const newHiresData: any = useSelector((state: any) => {
    return state.NewHiresData.value;
  });

  const [formData, setFormData] = useState<any>({
    EmployeeName: {
      value: "",
      isValid: true,
      errorMsg: "Invalid employee name",
      validationRule: { required: true, type: "string" },
    },
    Description: {
      value: "",
      isValid: true,
      errorMsg: "This field is required",
      validationRule: { required: true, type: "string" },
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
      await addNewHire(formData, setPopupController, 0);
    } else {
      console.log("Form contains errors");
    }
  };

  const popupInputs: any[] = [
    [
      <div className={styles.newHiresGrid} key={1}>
        <CustomInput
          value={formData.EmployeeName.value}
          placeholder="Enter employee name"
          isValid={formData.EmployeeName.isValid}
          errorMsg={formData.EmployeeName.errorMsg}
          onChange={(e) => {
            const value = e;
            const { isValid, errorMsg } = validateField(
              "EmployeeName",
              value,
              formData.EmployeeName.validationRule
            );
            handleInputChange("EmployeeName", value, isValid, errorMsg);
          }}
        />

        <FloatingLabelTextarea
          value={formData.Description.value}
          placeholder="Description"
          rows={5}
          isValid={formData.Description.isValid}
          errorMsg={formData.Description.errorMsg}
          onChange={(e: any) => {
            const value = e;
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
      <div>
        <p
          className={styles.employeeName}
        >{`Welcomes to the Team  "${val.EmployeeName}"`}</p>
        <div className={styles.imgandName}>
          <Avatar
            image={`/_layouts/15/userphoto.aspx?size=S&username=${val?.senderImage}`}
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
        <p className={styles.description}>{val.Description}</p>

        <div className={styles.imgSection}>
          <img src={val.imgUrl || personImagePlaceholder} alt="" />
        </div>
      </div>
    );
  };

  useEffect(() => {
    getAllNewHiresData(dispatch);
  }, []);

  return (
    <div className={styles.newhireContainer}>
      <SectionHeaderIntranet
        label="New Hires"
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
            value={newHiresData?.data?.slice(-3)}
            numScroll={1}
            numVisible={1}
            showIndicators={true}
            showNavigators={false}
            autoplayInterval={newHiresData.length > 1 ? 3000 : 8.64e7}
            circular
            itemTemplate={productTemplate}
          />
        )}
      </div>
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
