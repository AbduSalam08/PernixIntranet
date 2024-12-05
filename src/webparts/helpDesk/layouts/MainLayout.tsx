/* eslint-disable @typescript-eslint/no-explicit-any */
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
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
  const pageParams = useParams();

  const currentUserDetails = useSelector(
    (state: { MainSPContext: { currentUserDetails: any } }) =>
      state.MainSPContext.currentUserDetails
  );
  const MainSPContext = useSelector((state: any) => state.MainSPContext.value);

  const currentRole: string =
    // currentUserDetails?.role === CONFIG.SPGroupName.Pernix_Admin ||
    currentUserDetails?.role === "HelpDesk_Ticket_Managers"
      ? "/helpdesk_manager/dashboard"
      : currentUserDetails?.role === "HelpDesk_IT_Owners"
      ? "/it_owner/dashboard"
      : currentUserDetails?.role === "Super Admin" ||
        currentUserDetails?.role === CONFIG.SPGroupName.Pernix_Admin
      ? `/user/all_tickets`
      : `/${currentUserDetails?.role}/all_tickets`;

  const currentRoleInitial: string =
    currentUserDetails?.role === CONFIG.SPGroupName.Pernix_Admin ||
    currentUserDetails?.role === "HelpDesk_Ticket_Managers"
      ? "helpdesk_manager"
      : currentUserDetails?.role === "HelpDesk_IT_Owners"
      ? "it_owner"
      : currentUserDetails?.role === "Super Admin" ||
        currentUserDetails?.role === CONFIG.SPGroupName.Pernix_Admin
      ? `/user/all_tickets`
      : `${currentUserDetails?.role}`;

  const isViewRoute: boolean = location.pathname?.includes("/view_ticket");

  useEffect(() => {
    if (currentUserDetails.email) {
      if (pageParams?.ticketid) {
        navigate(
          `/${currentRoleInitial || "user"}/all_tickets/${
            pageParams?.ticketid
          }/view_ticket`,
          { replace: true }
        );
      } else if (currentUserDetails.email && !pageParams?.ticketid) {
        navigate(currentRole);
      }
    }
  }, [currentRole, currentUserDetails.email]);

  return (
    <div className={styles.ticketsGrid}>
      {/* Page Header */}
      {!isViewRoute && (
        <div className={styles.ticketHeader}>
          <PageHeader
            title="Helpdesk"
            backbtnTitle={"Back to home"}
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
