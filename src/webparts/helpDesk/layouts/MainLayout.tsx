/* eslint-disable @typescript-eslint/no-explicit-any */
import { Outlet, useNavigate } from "react-router-dom";
// import PageHeader from "../../../components/common/PageHeader/PageHeader";
import LeftBar from "../components/LeftBar/LeftBar";
// import MyTickets from "../pages/MyTickets/MyTickets";
import styles from "./MainLayout.module.scss";
import { useSelector } from "react-redux";
import { useEffect } from "react";

const MainLayout = (): JSX.Element => {
  const navigate = useNavigate();

  const currentUserDetails = useSelector(
    (state: { MainSPContext: { currentUserDetails: any } }) =>
      state.MainSPContext.currentUserDetails
  );

  const currentRole: string =
    currentUserDetails?.role === "Pernix_Admin"
      ? "/admin"
      : currentUserDetails?.role === "HelpDesk_Ticket_Managers"
      ? "/ticket_manager/dashboard"
      : currentUserDetails?.role;
  console.log("currentRole: ", currentRole);

  // Redirect to the current role path if not centered
  useEffect(() => {
    navigate(currentRole);
  }, [currentRole]);

  return (
    // <div className={styles.ticketsGrid}>
    //   <div className={styles.ticketHeader}>
    //     <PageHeader title={"Tickets"} />
    //   </div>

    <div className={styles.contentGrid}>
      <div className={styles.lhsG}>
        <LeftBar />
      </div>
      <div className={styles.rhsG}>
        {/* <MyTickets /> */}
        <Outlet />
      </div>
    </div>
    // </div>
  );
};

export default MainLayout;
