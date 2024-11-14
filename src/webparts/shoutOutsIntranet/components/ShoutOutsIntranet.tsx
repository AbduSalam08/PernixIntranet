/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */

import SectionHeaderIntranet from "../../../components/common/SectionHeaderIntranet/SectionHeaderIntranet";
import { Carousel } from "primereact/carousel";
import styles from "./ShoutOutsIntranet.module.scss";
import { Avatar } from "primereact/avatar";
import "../../../assets/styles/style.css";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import { useDispatch, useSelector } from "react-redux";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../utils/popupUtils";
import { resetFormData, validateField } from "../../../utils/commonUtils";
import { useEffect, useState } from "react";
import FloatingLabelTextarea from "../../../components/common/CustomInputFields/CustomTextArea";
import Popup from "../../../components/common/Popups/Popup";
import CustomPeoplePicker from "../../../components/common/CustomInputFields/CustomPeoplePicker";
import { setMainSPContext } from "../../../redux/features/MainSPContextSlice";
import {
  addShoutOut,
  getAllShoutOutsData,
} from "../../../services/shoutOutIntranet/shoutOutIntranet";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
import ViewAll from "../../../components/common/ViewAll/ViewAll";
import { CONFIG } from "../../../config/config";
// images
const img: any = require("../../../assets/images/svg/Shoutouts/bronze.png");
const errorGrey = require("../../../assets/images/svg/errorGrey.svg");

const ShoutOutsIntranet = (props: any): JSX.Element => {
  const dispatch = useDispatch();
  console.log("dispatch: ", dispatch);
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
        success: "Shout-out added successfully!",
        error: "Something went wrong!",
        successDescription:
          "The shout-out to person email has been added successfully.",
        errorDescription:
          "An error occured while adding news, please try again later.",
        inprogress: "Adding Shout-out, please wait...",
      },
    },
  ];

  const shoutOutData: any = useSelector((state: any) => {
    return state.ShoutOutsData.value;
  });
  console.log("shoutOutData: ", shoutOutData);

  const [popupController, setPopupController] = useState(
    initialPopupController
  );

  const [shoutOutsData, setShoutOutsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  console.log("shoutOutsData", shoutOutsData);

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
  console.log("formData: ", formData);

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
      await addShoutOut(formData, setPopupController, 0, dispatch);
    } else {
      console.log("Form contains errors");
    }
  };

  const popupInputs: any[] = [
    [
      <div className={styles.addShoutOutGrid} key={1}>
        <CustomPeoplePicker
          labelText="Shout-out to"
          isValid={formData.SendTowards.isValid}
          errorMsg={formData.SendTowards.errorMsg}
          selectedItem={[formData.SendTowards.value]}
          onChange={(item: any) => {
            const value = item[0];
            console.log("value: ", value);
            const { isValid, errorMsg } = validateField(
              "SendTowards",
              item,
              formData.SendTowards.validationRule
            );
            handleInputChange("SendTowards", value, isValid, errorMsg);
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
            handleInputChange(
              "Description",
              value.trimStart(),
              isValid,
              errorMsg
            );
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

  // const responsiveOptions = [
  //   {
  //     breakpoint: "1400px",
  //     numVisible: 2,
  //     numScroll: 1,
  //   },
  //   {
  //     breakpoint: "1199px",
  //     numVisible: 3,
  //     numScroll: 1,
  //   },
  //   {
  //     breakpoint: "767px",
  //     numVisible: 2,
  //     numScroll: 1,
  //   },
  //   {
  //     breakpoint: "575px",
  //     numVisible: 1,
  //     numScroll: 1,
  //   },
  // ];

  const shoutOutTemplate = (val: any): any => {
    return (
      <div className={styles.Container}>
        <p className={styles.shoutOutHeader}>
          <span className={styles.sender}>{val?.senderName}</span>{" "}
          <span className={styles.recogonized}>recognized </span>
          <span className={styles.receiver}>{val?.receiverName}</span>
        </p>

        <div className={styles.iconSection}>
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
          <img src={`${img}`} alt="" className={styles.img} />
          <i className="pi pi-caret-right" style={{ fontSize: "20px" }} />
          <Avatar
            image={`/_layouts/15/userphoto.aspx?size=S&username=${val?.receiverImage}`}
            // size="large"
            shape="circle"
            data-pr-tooltip={val.receiverName}
          />
        </div>

        <p className={styles.message}>{val.message}</p>
      </div>
    );
  };

  useEffect(() => {
    if (shoutOutData?.data?.length > 0) {
      setIsLoading(true);
      const filteredData = shoutOutData?.data
        ?.filter((item: any) => item.isActive)
        .reverse()
        .slice(0, 5);
      setShoutOutsData([...filteredData]);
      setIsLoading(false);
    }
  }, [shoutOutData]);
  useEffect(() => {
    dispatch(setMainSPContext(props?.context));
    getAllShoutOutsData(dispatch);
  }, [dispatch]);

  const handlenavigate = (): void => {
    window.open(
      props.context.pageContext.web.absoluteUrl +
        CONFIG.NavigatePage.ShoutOutsPage,
      "_self"
    );
  };

  return isLoading ? (
    <div className={styles.LoaderContainer}>
      <CircularSpinner />
    </div>
  ) : (
    <div className={`Shoutout ${styles.ShoutoutContainer}`}>
      <SectionHeaderIntranet
        label={"Shout-outs"}
        headerAction={() => {
          togglePopupVisibility(
            setPopupController,
            initialPopupController[0],
            0,
            "open",
            "New Shout-outs"
          );
          resetFormData(formData, setFormData);
        }}
      />

      <div className={styles.carouselWrapper}>
        <div className={styles.carousel}>
          {shoutOutData?.isLoading ? (
            <CircularSpinner />
          ) : shoutOutData?.error ? (
            <div className="errorWrapper">
              <img src={errorGrey} alt="Error" />
              <span className="disabledText">{shoutOutData?.error}</span>
            </div>
          ) : (
            <Carousel
              value={shoutOutsData}
              numScroll={1}
              numVisible={1}
              showIndicators={true}
              showNavigators={false}
              autoplayInterval={shoutOutsData?.length > 1 ? 3000 : 8.64e7}
              circular
              // responsiveOptions={responsiveOptions}
              itemTemplate={shoutOutTemplate}
            />
          )}
        </div>
      </div>
      <ViewAll onClick={handlenavigate} />

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
              getAllShoutOutsData(dispatch);
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
export default ShoutOutsIntranet;
