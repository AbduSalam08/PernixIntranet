/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import styles from "./PageHeader.module.scss";

// images
const headerBack: any = require("../../../assets/images/svg/headerBack.svg");

interface PageHeaderProps {
  title: string;
  noBackBtn?: boolean;
  centered?: boolean;
  underlined?: boolean;
  backbtnTitle?: any;
  headerClick?: () => any;
}

interface UserDetails {
  role: string;
}

const PageHeader = ({
  title = "Page Title",
  noBackBtn = false,
  centered = false,
  underlined = false,
  headerClick,
  backbtnTitle,
}: PageHeaderProps): JSX.Element => {
  // const navigate = useNavigate();

  const currentUserDetails = useSelector(
    (state: { MainSPContext: { currentUserDetails: UserDetails } }) =>
      state.MainSPContext.currentUserDetails
  );
  console.log("currentUserDetails: ", currentUserDetails);

  // const currentRole: string =
  //   currentUserDetails?.role === "Pernix_Admin"
  //     ? "/helpdesk_manager/dashboard"
  //     : currentUserDetails?.role === "HelpDesk_Ticket_Managers"
  //     ? "/helpdesk_manager/dashboard"
  //     : currentUserDetails?.role;

  // Redirect to the current role path if not centered
  // useEffect(() => {
  //   navigate(currentRole);
  // }, [currentRole]);

  const handleHeaderClick = (): void => {
    if (!centered && headerClick) {
      headerClick();
    }
  };

  return (
    <div
      className={styles.pageHeader}
      style={{
        justifyContent: centered ? "center" : "flex-start",
        width: centered ? "100%" : "auto",
      }}
      onClick={handleHeaderClick}
    >
      {!noBackBtn && (
        <img
          src={headerBack}
          title={backbtnTitle}
          onClick={headerClick}
          alt="Back"
        />
      )}
      <span
        style={{
          marginLeft: centered ? "auto" : "0",
          marginRight: centered ? "auto" : "0",
          textDecoration: underlined ? "underline" : "none",
        }}
      >
        {title}
      </span>
    </div>
  );
};

export default PageHeader;
