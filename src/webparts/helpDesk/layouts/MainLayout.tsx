/* eslint-disable @typescript-eslint/no-explicit-any */
import { Outlet, useLocation, useNavigate } from "react-router-dom";
// import PageHeader from "../../../components/common/PageHeader/PageHeader";
import LeftBar from "../components/LeftBar/LeftBar";
// import MyTickets from "../pages/MyTickets/MyTickets";
import styles from "./MainLayout.module.scss";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import PageHeader from "../../../components/common/PageHeader/PageHeader";
import { CONFIG } from "../../../config/config";

const MainLayout = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentUserDetails = useSelector(
    (state: { MainSPContext: { currentUserDetails: any } }) =>
      state.MainSPContext.currentUserDetails
  );
  const MainSPContext = useSelector((state: any) => state.MainSPContext.value);

  console.log("currentUserDetails: ", currentUserDetails);

  const currentRole: string =
    currentUserDetails?.role === "Pernix_Admin" ||
    // currentUserDetails?.role === "Super Admin" ||
    currentUserDetails?.role === "HelpDesk_Ticket_Managers"
      ? "/helpdesk_manager/dashboard"
      : currentUserDetails?.role === "HelpDesk_IT_Owners"
      ? "/it_owner/dashboard"
      : `/${currentUserDetails?.role}/all_tickets`;

  console.log("currentRole: ", currentRole);
  const isViewRoute: boolean = location.pathname?.includes("/view_ticket");
  // Redirect to the current role path if not centered
  useEffect(() => {
    if (currentUserDetails.email !== "") {
      navigate(currentRole);
    }
  }, [currentRole, currentUserDetails]);

  return (
    <div className={styles.ticketsGrid}>
      {/* //   <div className={styles.ticketHeader}>
    //     <PageHeader title={"Tickets"} />
    //   </div>
     */}
      {/* Page Header */}
      {!isViewRoute && (
        <div className={styles.ticketHeader}>
          <PageHeader
            title="Tickets"
            headerClick={() => {
              window.open(
                MainSPContext?.pageContext.web.absoluteUrl +
                  CONFIG.NavigatePage.PernixIntranet,
                "_self"
              );
            }}
          />
        </div>
      )}
      <div className={styles.contentGrid}>
        {!isViewRoute && (
          <div className={styles.lhsG}>
            <LeftBar />
          </div>
        )}
        <div
          className={`${isViewRoute ? styles.ticketViewWrapper : styles.rhsG}`}
        >
          {/* <MyTickets /> */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
