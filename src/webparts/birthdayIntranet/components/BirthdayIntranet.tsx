/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */

import styles from "./BirthdayIntranet.module.scss";
const image1: any = require("../../../assets/images/svg/Birthday/Frame_1010107467.png");
const image2: any = require("../../../assets/images/svg/Birthday/Frame_1010107468.png");
const image3: any = require("../../../assets/images/svg/Birthday/Frame_1010107469.png");
// const share: any = require("../../../assets/images/svg/Birthday/send.png");
import "../../../assets/styles/style.css";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";

// require("../../../node_modules/primereact/resources/primereact.min.css");

import SectionHeaderIntranet from "../../../components/common/SectionHeaderIntranet/SectionHeaderIntranet";
import { resetFormData, validateField } from "../../../utils/commonUtils";
import { useState } from "react";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../utils/popupUtils";
import FloatingLabelTextarea from "../../../components/common/CustomInputFields/CustomTextArea";
import Popup from "../../../components/common/Popups/Popup";
// images
const wishImg: any = require("../../../assets/images/svg/wishImg.svg");
const teamsImg: any = require("../../../assets/images/svg/Birthday/teamsIcon.svg");
const outlookImg: any = require("../../../assets/images/svg/Birthday/outlookIcon.svg");
// icons
import HighlightOffIcon from "@mui/icons-material/HighlightOff";

interface IBirthday {
  name: string;
  birthday: string;
  isToday: boolean;
  imageUrl: string;
}
const BirthdayIntranet = (): JSX.Element => {
  // popup properties
  const initialPopupController = [
    {
      open: false,
      // popupTitle: "Send the wish",
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

  const [formData, setFormData] = useState<any>({
    Message: {
      value: `Dear Anne smith,
Wishing you a very happy birthday! I hope your day is filled with joy, celebration, and memorable moments. May the year ahead bring you great success, good health, and happiness.
Enjoy your special day!`,
      isValid: false,
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

  // const handleSubmit = async (): Promise<any> => {
  //   let hasErrors = false;

  //   // Validate each field and update the state with error messages
  //   const updatedFormData = Object.keys(formData).reduce((acc, key) => {
  //     const fieldData = formData[key];
  //     const { isValid, errorMsg } = validateField(
  //       key,
  //       fieldData.value,
  //       fieldData?.validationRule
  //     );

  //     if (!isValid) {
  //       hasErrors = true;
  //     }

  //     return {
  //       ...acc,
  //       [key]: {
  //         ...fieldData,
  //         isValid,
  //         errorMsg,
  //       },
  //     };
  //   }, {} as typeof formData);

  //   setFormData(updatedFormData);
  //   if (!hasErrors) {
  //     // await addNews(formData, setPopupController, 0);
  //   } else {
  //     console.log("Form contains errors");
  //   }
  // };

  const popupInputs: any[] = [
    [
      <div className={styles.messageBox} key={1}>
        <div className={styles.sendWish}>
          <span>Send Wish</span>
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
              style={{
                fontSize: "30px",
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
          // value={formData.Message?.value}
          value={`Dear Anne smith,
Wishing you a very happy birthday! I hope your day is filled with joy, celebration, and memorable moments. May the year ahead bring you great success, good health, and happiness.
Enjoy your special day!`}
          placeholder="Message"
          rows={6}
          isValid={formData.Message.isValid}
          errorMsg={formData.Message.errorMsg}
          noBorderInput={false}
          onChange={(e: any) => {
            const value = e;
            const { isValid, errorMsg } = validateField(
              "Message",
              value,
              formData.Message.validationRule
            );
            handleInputChange("Message", value, isValid, errorMsg);
          }}
        />

        <div className={styles.actionBtns}>
          <button className={styles.teams}>
            <img src={teamsImg} /> Send in Teams
          </button>
          <button className={styles.outlook}>
            <img src={outlookImg} /> Send in Outlook
          </button>
        </div>
      </div>,
    ],
  ];

  // const popupActions: any[] = [
  //   [
  //     {
  //       text: "Cancel",
  //       btnType: "darkGreyVariant",
  //       disabled: false,
  //       endIcon: false,
  //       startIcon: false,
  //       size: "large",
  //       onClick: () => {
  //         togglePopupVisibility(
  //           setPopupController,
  //           initialPopupController[0],
  //           0,
  //           "close"
  //         );
  //       },
  //     },
  //     {
  //       text: "Submit",
  //       btnType: "primaryGreen",
  //       endIcon: false,
  //       startIcon: false,
  //       disabled: !Object.keys(formData).every((key) => formData[key].isValid),
  //       size: "large",
  //       onClick: async () => {
  //         await handleSubmit();
  //       },
  //     },
  //   ],
  // ];

  const birthdays: IBirthday[] = [
    {
      name: "Anne Smith",
      birthday: "March 1, 2024",
      isToday: true,
      imageUrl: image1,
    },
    {
      name: "John Doe",
      birthday: "April 19, 2024",
      isToday: false,
      imageUrl: image2,
    },
    {
      name: "Jane Doe",
      birthday: "May 1, 2024",
      isToday: false,
      imageUrl: image3,
    },
    {
      name: "Jane Doe",
      birthday: "May 1, 2024",
      isToday: false,
      imageUrl: image3,
    },
  ];

  return (
    <div className={styles.container}>
      <SectionHeaderIntranet label={"BirthDay"} removeAdd />

      <div className={styles.contentSection}>
        {birthdays?.map((val: any, index: number) => (
          <div key={index} className={styles.contentMain}>
            <div className={styles.image}>
              <img src={`${val.imageUrl}`} alt="" />
            </div>
            <div className={styles.content}>
              <div className={styles.contentwithIconsection}>
                <div className={styles.Title}>
                  <p className={styles.name}>{val.name}</p>
                  <p className={styles.date}>
                    {val.isToday
                      ? "Birthday today"
                      : `Birthday on ${val.birthday}`}
                  </p>
                </div>

                {val?.isToday && (
                  <div
                    onClick={() => {
                      togglePopupVisibility(
                        setPopupController,
                        initialPopupController[0],
                        0,
                        "open"
                      );
                      resetFormData(formData, setFormData);
                    }}
                  >
                    <i
                      className="pi pi-send"
                      style={{ color: "#E0803D", fontSize: "24px" }}
                    />
                    {/* <img
                    src={`${share}`}
                    alt=""
                    onClick={() => {
                      setVisible(true);
                    }}
                  /> */}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {popupController?.map((popupData: any, index: number) => (
        <Popup
          popupCustomBgColor="#fff"
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
          }}
          popupTitle={
            popupData.popupType !== "confimation" && popupData.popupTitle
          }
          popupActions={[]}
          visibility={popupData.open}
          content={popupInputs[index]}
          popupWidth={popupData.popupWidth}
          defaultCloseBtn={popupData.defaultCloseBtn || false}
          confirmationTitle={
            popupData.popupType !== "custom" ? popupData.popupTitle : ""
          }
          popupHeight={index === 0 ? true : false}
          noActionBtn={false}
        />
      ))}
    </div>
  );
};
export default BirthdayIntranet;
