/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Carousel } from "primereact/carousel";
import styles from "../Shoutout/ShoutOutsIntranet.module.scss";
import { Avatar } from "primereact/avatar";
import "../../../../assets/styles/style.css";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { resetFormData, validateField } from "../../../../utils/commonUtils";
import {
  addShoutOut,
  getAllShoutOutsData,
} from "../../../../services/shoutOutIntranet/shoutOutIntranet";
import CustomPeoplePicker from "../../../../components/common/CustomInputFields/CustomPeoplePicker";
import FloatingLabelTextarea from "../../../../components/common/CustomInputFields/CustomTextArea";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../../utils/popupUtils";
import { setMainSPContext } from "../../../../redux/features/MainSPContextSlice";
import { CONFIG } from "../../../../config/config";
import CircularSpinner from "../../../../components/common/Loaders/CircularSpinner";
import SectionHeaderIntranet from "../../../../components/common/SectionHeaderIntranet/SectionHeaderIntranet";
import ViewAll from "../../../../components/common/ViewAll/ViewAll";
import Popup from "../../../../components/common/Popups/Popup";
// import { ToastContainer } from "react-toastify";

const img: any = require("../../../../assets/images/svg/Shoutouts/bronze.png");
const errorGrey = require("../../../../assets/images/svg/errorGrey.svg");

const ShoutOutsIntranet = ({ props }: any): JSX.Element => {
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

  const [popupController, setPopupController] = useState(
    initialPopupController
  );
  const [shoutOutsData, setShoutOutsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
      togglePopupVisibility(
        setPopupController,
        initialPopupController[0],
        0,
        "close"
      );
      await addShoutOut(formData, dispatch);
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
              onChange={(item: any) => {
                const value = item?.[0];
                const { isValid, errorMsg } = validateField(
                  "Send towards",
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
          className={styles.suggestions}
          style={{
            display: formData?.SendTowards?.value ? "flex" : "none",
          }}
        >
          {[
            {
              emoji: "🎉",
              text: `Great job, ${formData?.SendTowards?.value?.name ?? ""}!`,
            },
            { emoji: "👏", text: "Kudos for the amazing work!" },
            {
              emoji: "🌟",
              text: `Shoutout to ${
                formData?.SendTowards?.value?.name ?? ""
              } for outstanding effort!`,
            },
            {
              emoji: "🏆",
              text: `Congrats on the milestone, ${
                formData?.SendTowards?.value?.name ?? ""
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
      const filteredData = shoutOutData?.data
        ?.filter((item: any) => item.isActive)
        .reverse()
        .slice(0, 5);
      setShoutOutsData([...filteredData]);
      setIsLoading(false);
    }
  }, [shoutOutData]);

  useEffect(() => {
    setIsLoading(true);
    dispatch(setMainSPContext(props?.context));
    getAllShoutOutsData(dispatch);
  }, [dispatch]);

  return isLoading ? (
    <div className={styles.LoaderContainer}>
      <CircularSpinner />
    </div>
  ) : (
    <div className={`Shoutout ${styles.ShoutoutContainer}`}>
      <SectionHeaderIntranet
        label={"Shout-outs"}
        title="Add a new shout-out"
        headerAction={() => {
          resetFormData(formData, setFormData);
          togglePopupVisibility(
            setPopupController,
            initialPopupController[0],
            0,
            "open",
            "New Shout-outs"
          );
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
              autoplayInterval={shoutOutsData?.length > 1 ? 6000 : 8.64e7}
              circular
              itemTemplate={shoutOutTemplate}
            />
          )}
        </div>
      </div>

      <ViewAll
        onClick={() => {
          window.open(
            props.context.pageContext.web.absoluteUrl +
              CONFIG.NavigatePage.ShoutOutsPage,
            "_self"
          );
        }}
      />

      {/* Toast message section */}
      {/* <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      /> */}

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
