/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../../../assets/styles/Style.css";
import moment from "moment";
import styles from "./FooterIntranet.module.scss";
import { RoleAuth } from "../../../services/CommonServices";
import { CONFIG } from "../../../config/config";
import { IUserDetails } from "../../../interface/interface";

/* Global variable creation */
const Linkedin: string = require("../assets/Linkedin.png");
const Twitter: string = require("../assets/Twitter.png");

let isAdmin: boolean = false;

const FooterIntranet = (props: any): JSX.Element => {
  /* Local variable creation */
  const dispatch = useDispatch();
  const currentUserDetails: IUserDetails = useSelector(
    (state: any) => state?.MainSPContext?.currentUserDetails
  );
  isAdmin = currentUserDetails.role === CONFIG.RoleDetails.user ? false : true;

  /* Functions creation */
  const onLoadingFUN = async (): Promise<void> => {
    await RoleAuth(
      CONFIG.SPGroupName.Pernix_Admin,
      {
        highPriorityGroups: [CONFIG.SPGroupName.Header_Admin],
      },
      dispatch
    );
  };

  const displayEditHandler = async (): Promise<void> => {
    const siteHeader = document.querySelector(".sp-pageLayout-horizontalNav");
    const siteContent = document.querySelector(".sp-App-bodyContainer");

    if (siteHeader) {
      if (!isAdmin) {
        siteHeader.setAttribute("data-custom-class", "nonAdmin");
      } else {
        siteHeader.removeAttribute("data-custom-class");
      }
    }

    if (siteContent) {
      if (!isAdmin) {
        siteContent.setAttribute("data-custom-class", "nonAdmin");
      } else {
        siteContent.removeAttribute("data-custom-class");
      }
    }
  };

  useEffect(() => {
    displayEditHandler();
  }, [currentUserDetails]);

  useEffect(() => {
    onLoadingFUN();
  }, []);

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
