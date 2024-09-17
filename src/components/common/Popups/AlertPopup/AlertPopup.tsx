/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dialog } from "primereact/dialog";
import DefaultButton from "../../Buttons/DefaultButton";
import { Skeleton } from "primereact/skeleton";
import { CircularProgress } from "@mui/material";
// assets import
const completedImg = require("../../../../../../assets/images/svg/completedSVG.svg");
const errorImg = require("../../../../../../assets/images/svg/errorImg.svg");
// styles
import styles from "../Popup.module.scss";
import { memo } from "react";

// interfaces
interface Props {
  popupTitle: string;
  secondaryText: string;
  defaultCloseBtn?: boolean;
  popupWidth?: string | number;
  onHide: () => void;
  visibility: boolean;
  onClick: any;
  noActionBtn?: any;
  isLoading: any;
}

const AlertPopup = ({
  popupTitle,
  secondaryText,
  defaultCloseBtn,
  onHide,
  visibility,
  popupWidth,
  onClick,
  isLoading,
  noActionBtn,
  ...btnRest
}: Props): JSX.Element => {
  const footerContent: any = (): JSX.Element => (
    <div className={styles.AlertPopupFooter}>
      <DefaultButton
        btnType={isLoading.error ? "secondaryRed" : "primaryDarkGreen"}
        text={isLoading.error ? "Back" : "Okay"}
        onClick={onClick}
        {...btnRest}
      />
    </div>
  );

  return (
    <Dialog
      closable={defaultCloseBtn}
      draggable={false}
      className={`popupWrapper ${styles.popupWrapper}`}
      visible={visibility}
      modal
      //   header={headerElement}
      style={{ width: popupWidth }}
      onHide={onHide}
    >
      <div className={styles.AlertPopupWrapper}>
        <div className={styles.alertBoxContent}>
          {isLoading.inprogress ? (
            <CircularProgress
              sx={{
                width: "60px",
                height: "60px",
                animationDuration: "450ms",
                color: "#555555ac",
              }}
              size={"40px"}
              disableShrink
              variant="indeterminate"
              color="inherit"
            />
          ) : isLoading.error ? (
            <div className={styles.StatusImgWrapper}>
              <img src={errorImg} alt="ErrorImg" />
            </div>
          ) : isLoading.success ? (
            <div className={styles.StatusImgWrapper}>
              <img src={completedImg} alt="completedImg" />
            </div>
          ) : (
            <Skeleton shape="circle" size="4rem" />
          )}
        </div>
        <div className={`${styles.AlertPopupHeader}`}>
          {popupTitle}
          {secondaryText && (
            <span className={`${styles.AlertPopupSecondaryText}`}>
              {secondaryText}
            </span>
          )}
        </div>

        {isLoading?.inprogress ? "" : noActionBtn ? "" : footerContent()}
      </div>
    </Dialog>
  );
};

export default memo(AlertPopup);
