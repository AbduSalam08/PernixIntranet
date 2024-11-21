/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
import "../../../assets/styles/Style.css";
import moment from "moment";
import styles from "./FooterIntranet.module.scss";
import { CONFIG } from "../../../config/config";

/* Global variable creation */
const Linkedin: string = require("../assets/Linkedin.png");
const Twitter: string = require("../assets/Twitter.png");

const FooterIntranet = (props: any): JSX.Element => {
  return (
    <div className={styles.container}>
      <div className={styles.firstRow}>
        <div className={styles.firstRowLable}>{`2014-${moment().format(
          "YYYY"
        )} Pernix Group, Inc.All Rights Reserved.`}</div>
        <div className={styles.firstRowIcon}>
          <img
            src={Linkedin}
            alt="Linkedin"
            onClick={() => {
              window.open(CONFIG.LinkdinURL + "?web=1");
            }}
          />
          <img
            src={Twitter}
            alt="Twitter"
            onClick={() => {
              window.open(CONFIG.TwitterURL + "?web=1");
            }}
          />
        </div>
      </div>
      <div className={styles.secondRow}>
        PERNIX, PERNIX GROUP and the Pernix Logo are registered trademarks of
        Pernix Group Inc, formerly Telesource International
      </div>
    </div>
  );
};

export default FooterIntranet;
