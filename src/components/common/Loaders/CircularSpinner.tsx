/* eslint-disable @typescript-eslint/no-explicit-any */
import { CircularProgress } from "@mui/material";
// styles
import styles from "./Loaders.module.scss";
const CircularSpinner = (pageSpinnerHeight?: any): JSX.Element => {
  return (
    <div
      className={`${styles.flexcenter} ${styles.loaderSection}`}
      style={{
        height: pageSpinnerHeight,
      }}
    >
      <CircularProgress
        sx={{
          width: "40px",
          height: "40px",
          animationDuration: "450ms",
          color: "#adadad",
        }}
        size={"30px"}
        disableShrink
        variant="indeterminate"
        color="inherit"
      />
    </div>
  );
};

export default CircularSpinner;
