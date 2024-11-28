/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dialog } from "primereact/dialog";
import DefaultButton from "../Buttons/DefaultButton";
import { CircularProgress } from "@mui/material";
import styles from "./Popup.module.scss";
import { memo } from "react";
// images
const successImg: any = require("../../../assets/images/svg/successImg.svg");
const errorImg: any = require("../../../assets/images/svg/errorImg.svg");
interface Props {
  popupTitle?: string;
  PopupType: "custom" | "confirmation";
  popupActions: PopupActionBtn[];
  defaultCloseBtn?: boolean;
  content?: React.ReactNode;
  popupWidth?: string | number;
  onHide: () => void;
  resetPopup?: () => void;
  visibility: boolean;
  confirmationTitle?: string;
  isLoading?: loadingProps | any;
  messages?: loadingProps | any;
  popupHeight?: boolean;
  secondaryText?: string;
  centerActionBtn?: boolean;
  noActionBtn?: boolean;
  popupCustomBgColor?: string;
}

interface loadingProps {
  inprogress: boolean | string;
  error: boolean | string;
  success: boolean | string;
}

interface PopupActionBtn {
  text: string;
  endIcon?: React.ReactNode;
  startIcon?: React.ReactNode;
  disabled?: boolean;
  size?: any;
  btnType: "button" | "submit" | "reset"; // More specific button types
  onClick: () => void;
}

const Popup = ({
  popupCustomBgColor,
  PopupType,
  popupActions,
  centerActionBtn,
  popupTitle,
  defaultCloseBtn,
  onHide,
  visibility,
  content,
  popupWidth,
  confirmationTitle,
  isLoading = { inprogress: false, error: false, success: false }, // Default values for loading states
  messages = { inprogress: "", error: "", success: "" }, // Default messages as empty strings
  popupHeight,
  secondaryText,
  noActionBtn,
  resetPopup,
}: Props): JSX.Element => {
  const headerElement = (
    <div
      className={`${
        !defaultCloseBtn
          ? styles.popupHeaderWithoutCloseIcon
          : styles.popupHeader
      }`}
    >
      {popupTitle}
    </div>
  );

  const footerContent = (): JSX.Element => (
    <div
      className={
        PopupType === "confirmation"
          ? styles.popupFooterConfirmation
          : styles.popupFooter
      }
      style={{
        justifyContent: centerActionBtn ? "center" : "flex-end",
      }}
    >
      {popupActions?.map((btn: any, id: number) => (
        <DefaultButton
          style={{
            minWidth: PopupType === "confirmation" ? "85px" : "auto",
          }}
          key={id}
          btnType={btn.btnType}
          text={btn.text}
          disabled={btn.disabled}
          endIcon={btn.endIcon}
          startIcon={btn.startIcon}
          onClick={btn.onClick}
          size={btn.size}
        />
      ))}
    </div>
  );

  return (
    <Dialog
      closable={defaultCloseBtn}
      draggable={false}
      className={`popupWrapper ${styles.popupWrapper}`}
      visible={visibility}
      modal
      header={defaultCloseBtn && headerElement}
      style={{ width: popupWidth }}
      onHide={onHide}
    >
      {isLoading?.inprogress ? (
        <div className={styles.loaderElement}>
          <CircularProgress
            sx={{
              width: "20px",
              height: "20px",
              animationDuration: "450ms",
              color: "#adadad",
            }}
            size="20px"
            disableShrink
            variant="indeterminate"
            color="inherit"
          />
          <span className={styles.loaderText}>
            {messages?.inprogress || ""}
          </span>
        </div>
      ) : isLoading?.error ? (
        <div className={`${styles.messageWrapper}`}>
          <div className={styles.StatusImgWrapper}>
            <img src={errorImg} alt="Error" />
          </div>
          <div className={styles.messageFooter}>
            <span className={styles.errorText}>
              <p>{messages?.error || "default error message"}</p>
              <span>
                {messages?.errorDescription || "default success message"}
              </span>
            </span>
            <div className={styles.msgfooterActions}>
              <DefaultButton
                btnType="lightGreyVariant"
                text={"Retry"}
                onClick={resetPopup}
              />
              <DefaultButton
                btnType="secondaryRed"
                text={"Close"}
                onClick={onHide}
              />
            </div>
          </div>
        </div>
      ) : isLoading?.success ? (
        <div className={`${styles.messageWrapper}`}>
          <div className={styles.StatusImgWrapper}>
            <img src={successImg} alt="Completed" />
          </div>
          <div className={styles.messageFooter}>
            <span className={styles.successText}>
              <p>{messages?.success || "default success message"}</p>
              <span>
                {messages?.successDescription || "default success message"}
              </span>
            </span>
            <div className={styles.msgfooterActions}>
              <DefaultButton
                btnType="secondaryGreen"
                text={"Okay"}
                onClick={onHide}
              />
            </div>
          </div>
        </div>
      ) : (
        <div
          className={styles.AlertPopupWrapper}
          style={{
            backgroundColor: popupCustomBgColor,
          }}
        >
          <div className={styles.alertBoxContent}>
            {popupTitle && (
              <div className={`${styles.AlertPopupHeader}`}>
                {popupTitle}
                {secondaryText && (
                  <span className={`${styles.AlertPopupSecondaryText}`}>
                    {secondaryText}
                  </span>
                )}
              </div>
            )}
            {PopupType === "confirmation" ? (
              <div className={styles.contentWrapper}>
                <div className={styles.contentContainer}>
                  <span className={styles.confirmTitleText}>
                    {confirmationTitle}
                  </span>
                </div>
                {footerContent()}
              </div>
            ) : (
              <div className={styles.contentWrapper}>
                <div className={styles.contentContainer}>{content}</div>
                {footerContent()}
              </div>
            )}
            {!isLoading?.inprogress && !noActionBtn && footerContent()}
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default memo(Popup);
