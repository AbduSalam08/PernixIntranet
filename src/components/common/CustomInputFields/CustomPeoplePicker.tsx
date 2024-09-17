/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
import { memo, useEffect, useRef, useState } from "react";
import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
import styles from "./Inputs.module.scss";
import { useSelector } from "react-redux";
import Popup from "../Popups/Popup";
// const editConfigurationImg: any = require("../../../../assets/images/svg/taskConfigurationEditIcon.svg");
// const editConfigurationImg: any = require("../../../../../assets/images/svg/taskConfigurationEditIcon.svg");
import AddIcon from "@mui/icons-material/Add";
import { togglePopupVisibility } from "../../../utils/popupUtils";
import { CONFIG } from "../../../config/config";

interface Props {
  selectedItem?: any;
  onChange?: (value: any[]) => void;
  onSubmit?: any;
  placeholder?: string;
  personSelectionLimit?: number | any;
  size?: "SM" | "MD" | "XL";
  isValid?: boolean;
  errorMsg?: string;
  labelText?: string;
  withLabel?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  minWidth?: any;
  hideErrMsg?: boolean;
  noErrorMsg?: boolean; // if true, no error message will be shown
  noBorderInput?: boolean;
  maxWidth?: any;
  minHeight?: any;
  maxHeight?: any;
  noRemoveBtn?: boolean;
  multiUsers?: boolean;
  mandatory?: boolean;
  popupControl?: boolean;
  hasSubmitBtn?: boolean;
}

const CustomPeoplePicker: React.FC<Props> = ({
  onChange,
  onSubmit,
  placeholder = "User",
  personSelectionLimit,
  selectedItem,
  size,
  withLabel,
  labelText,
  disabled,
  isValid,
  errorMsg,
  minWidth,
  noErrorMsg = false,
  readOnly,
  noBorderInput,
  maxWidth,
  noRemoveBtn,
  minHeight,
  maxHeight,
  mandatory,
  multiUsers = false,
  popupControl = false,
  hasSubmitBtn = false,
}) => {
  const peoplePickerRef = useRef<any>();
  const initialPopupController = [
    {
      open: false,
      popupTitle: "",
      popupWidth: "550px",
      popupType: "custom",
      defaultCloseBtn: false,
      popupData: "",
    },
  ];

  // popup view and actions controller
  const [popupController, setPopupController] = useState(
    initialPopupController
  );

  // util for closing popup
  const handleClosePopup = (index?: any): void => {
    togglePopupVisibility(setPopupController, index, "close");
  };

  const selectedUserItem = (() => {
    if (!multiUsers) {
      return personSelectionLimit > 1 ? [] : [selectedItem];
    } else {
      if (personSelectionLimit >= 1) {
        return (
          selectedItem?.map(
            (item: any) => item.secondaryText || item.Email || item.email
          ) || []
        );
      }
    }
    return [selectedItem];
  })();

  const multiPeoplePickerStyle = {
    root: {
      zIndex: "2",
      minWidth: minWidth ? minWidth : "100%",
      maxWidth: maxWidth ? maxWidth : "100%",
      background: "rgba(218, 218, 218, 0.29)",
      pointerEvents: popupControl && multiUsers ? "none" : "auto",
      ".ms-BasePicker-text": {
        // alignItems: "flex-start",
        // maxHeight: "50px",
        height: size === "SM" ? "34px" : size === "MD" ? "32px" : "43px",
        borderRadius: "4px",
        overflowX: "hidden",
        padding: "0px 4px",
        minHeight: minHeight ? minHeight : "34px",
        maxHeight: maxHeight ? maxHeight : "50px",
        minWidth: minWidth ? minWidth : "290px",
        maxWidth: maxWidth ? maxWidth : "100%",
        background: "#fff",
        border: isValid
          ? "1px solid #ff8585"
          : noBorderInput
          ? "none"
          : "1px solid #adadad50",
        outline: "none",
        fontFamily: "interMedium",
      },
      ".ms-Persona-details": {
        display: multiUsers ? "none" : "block",
      },
      ".ms-BasePicker-input": {
        height: size === "SM" ? "30px" : size === "MD" ? "30px" : "41px",
        fontFamily: "interMedium",
        display:
          popupControl && selectedUserItem?.length !== 0 ? "none" : "block",
      },
      ".ms-BasePicker-input::placeholder": {
        fontFamily: "interMedium",
      },
      ".ms-BasePicker-text:after": {
        display: "none",
      },
      ".ms-BasePicker-text:hover": {
        border:
          !noBorderInput && isValid
            ? "1px solid #ff8585"
            : !noBorderInput
            ? "1px solid #adadad50"
            : "none",
      },
      ".ms-TooltipHost": {
        fontFamily: "interMedium",
        fontSize: "13px",
        color: "#414141",
      },
      ".ms-PickerPersona-container": {
        background: "#e8e8e8",
        maxWidth: "auto",
        minWidth: "auto",
      },
      ".ms-PickerItem-removeButton": {
        display:
          noRemoveBtn || (popupControl && selectedUserItem?.length !== 0)
            ? "none"
            : "block",
      },
      ".ms-PickerItem-removeButton:focus": {
        background: "#555",
      },
      ".ms-BasePicker-itemsWrapper": {
        height: "100%",
        alignItems: "center",
        justifyContent: "flex-start",
        flexWrap: "nowrap",
        gap: "2px",
        overflow: "auto",
        // padding: "3px 0",
      },
    },
  };
  const popupMultiPeoplePickerStyle = {
    root: {
      // minWidth: minWidth ? minWidth : "100%",
      // maxWidth: maxWidth ? maxWidth : "100%",
      background: "rgba(218, 218, 218, 0.29)",
      ".ms-BasePicker-text": {
        // alignItems: "flex-start",
        // maxHeight: "50px",
        // height: size === "SM" ? "34px" : size === "MD" ? "32px" : "43px",
        borderRadius: "4px",
        overflowX: "hidden",
        padding: "10px",
        // minHeight: minHeight ? minHeight : "34px",
        // maxHeight: maxHeight ? maxHeight : "50px",
        minWidth: minWidth ? minWidth : "290px",
        background: "#fff",
        border: isValid
          ? "1px solid #ff8585"
          : noBorderInput
          ? "none"
          : "1px solid #adadad50",
        outline: "none",
        fontFamily: "interMedium",
      },
      ".ms-BasePicker-input": {
        height: size === "SM" ? "30px" : size === "MD" ? "30px" : "41px",
        fontFamily: "interMedium",
      },
      ".ms-BasePicker-input::placeholder": {
        fontFamily: "interMedium",
      },
      ".ms-BasePicker-text:after": {
        display: "none",
      },
      ".ms-BasePicker-text:hover": {
        border:
          !noBorderInput && isValid
            ? "1px solid #ff8585"
            : !noBorderInput
            ? "1px solid #adadad50"
            : "none",
      },
      ".ms-TooltipHost": {
        fontFamily: "interMedium",
        fontSize: "13px",
        color: "#414141",
      },
      ".ms-PickerPersona-container": {
        background: "#e8e8e8",
        maxWidth: "auto",
        minWidth: "auto",
      },
      ".ms-PickerItem-removeButton": {
        display: noRemoveBtn ? "none" : "block",
      },
      ".ms-PickerItem-removeButton:focus": {
        background: "#555",
      },
      ".ms-BasePicker-itemsWrapper": {
        height: "100%",
        alignItems: "center",
        justifyContent: "flex-start",
        // flexWrap: "nowrap",
        gap: "2px",
        overflow: "auto",
        // padding: "3px 0",
      },
    },
  };

  const mainContext: any = useSelector(
    (state: any) => state.MainSPContext.value
  );

  const handleChange = (items: any[]): void => {
    const obj = items?.map((item: any) => {
      return {
        id: item.id,
        email: item?.secondaryText,
        name: item?.text,
      };
    });
    onChange && onChange(obj);
  };
  const handleSubmit = (): any => {
    if (selectedUserItem.length !== 0) {
      onSubmit();
      handleClosePopup(0);
    } else {
      // handleClosePopup(0);
    }
  };

  // array of obj which contains all popup inputs
  const popupInputs: any[] = [
    [
      <div key={1} ref={peoplePickerRef}>
        <PeoplePicker
          context={mainContext}
          webAbsoluteUrl={CONFIG.webURL}
          //   titleText="Select People"
          personSelectionLimit={personSelectionLimit}
          showtooltip={false}
          ensureUser={true}
          placeholder={placeholder}
          // peoplePickerCntrlclassName={styles.}
          onChange={handleChange}
          styles={popupMultiPeoplePickerStyle}
          //   showHiddenInUI={true}
          principalTypes={[PrincipalType.User]}
          defaultSelectedUsers={selectedUserItem}
          resolveDelay={1000}
          disabled={readOnly}
        />
      </div>,
    ],
  ];

  // popup Action state
  const popupActions: any[] = [
    hasSubmitBtn
      ? [
          {
            text: "Close",
            btnType: "darkGreyVariant",
            disabled: false,
            endIcon: false,
            startIcon: false,
            onClick: () => {
              handleClosePopup(0);
            },
          },
          {
            text: "Submit",
            btnType: "primary",
            disabled: selectedUserItem.length === 0 ? true : false,
            endIcon: false,
            startIcon: false,
            onClick: () => {
              handleSubmit();
            },
          },
        ]
      : [
          {
            text: "Close",
            btnType: "darkGreyVariant",
            disabled: false,
            endIcon: false,
            startIcon: false,
            onClick: () => {
              handleClosePopup(0);
            },
          },
        ],
  ];

  useEffect(() => {
    setTimeout(() => {
      if (peoplePickerRef.current && !readOnly) {
        const inputElement = peoplePickerRef.current.querySelector("input");
        if (inputElement) {
          inputElement.focus();
        }
      }
    }, 100);
  }, [popupController[0].open]);

  return (
    <div className={styles.inputMainWrapper}>
      <div
        style={{ zIndex: popupControl ? "100" : "0", pointerEvents: "auto" }}
        className={`${
          withLabel
            ? styles.p_pickerInputWrapperWithLabel
            : styles.p_pickerInputWrapper
        } ${disabled ? styles.disabledInput : ""}`}
        onClick={() => {
          if (popupControl) {
            togglePopupVisibility(
              setPopupController,
              0,
              "open",
              readOnly ? placeholder : "Add people"
            );
          }
        }}
      >
        {withLabel && (
          <p
            className={`${styles.inputLabel} ${
              mandatory ? styles.mandatoryField : ""
            }`}
          >
            {labelText}
          </p>
        )}
        <PeoplePicker
          context={mainContext}
          webAbsoluteUrl={CONFIG.webURL}
          //   titleText="Select People"
          personSelectionLimit={personSelectionLimit}
          showtooltip={false}
          ensureUser={true}
          placeholder={placeholder}
          // peoplePickerCntrlclassName={styles.}
          onChange={handleChange}
          styles={multiPeoplePickerStyle}
          //   showHiddenInUI={true}
          principalTypes={[PrincipalType.User]}
          defaultSelectedUsers={selectedUserItem}
          resolveDelay={1000}
          disabled={readOnly}
        />
        {popupControl && multiUsers && !readOnly && (
          // <button
          //   className={styles.peoplePickerButton}
          //   type="button"
          //   onClick={() => {
          //     togglePopupVisibility(
          //       setPopupController,
          //       0,
          //       "open",
          //       "Add people"
          //     );
          //   }}
          // >
          //   <img src={editConfigurationImg} alt="editConfigurationImg" />
          // </button>
          <AddIcon
            onClick={() => {
              togglePopupVisibility(
                setPopupController,
                0,
                "open",
                "Add people"
              );
            }}
            sx={{
              fontSize: "34px",
              padding: "8px",
              height: "34px",
              background: "#0000001f",
              color: "#555",
              transform: "translateX(-2px)",
              borderRadius: "0px 4px 4px 0px",
            }}
          />
        )}
      </div>

      {isValid && !noErrorMsg && (
        <p
          className={styles.errorMsg}
          style={{
            textAlign: isValid && !withLabel ? "left" : "right",
          }}
        >
          {errorMsg}
        </p>
      )}
      {popupController?.map((popupData: any, index: number) => (
        <Popup
          key={index}
          // isLoading={definitionsData?.isLoading}
          PopupType={popupData.popupType}
          onHide={() =>
            togglePopupVisibility(setPopupController, index, "close")
          }
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
        />
      ))}
    </div>
  );
};

export default memo(CustomPeoplePicker);
