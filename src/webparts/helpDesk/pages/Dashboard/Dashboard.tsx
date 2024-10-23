/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import PageHeader from "../../../../components/common/PageHeader/PageHeader";
import {
  CreatedClosedTickets,
  TicketBySource,
  TicketByStatusChart,
  TicketsByPriority,
} from "../../components/DashboardCharts/DashboardsCharts";
import InfoCard from "../../components/InfoCard/InfoCard";
// images
// Import SVGs
const myTickets: any = require("../../assets/images/svg/myTickets.svg");
const openTickets: any = require("../../assets/images/svg/openTickets.svg");
const closedTickets: any = require("../../assets/images/svg/closedTickets.svg");
const ticketsCreatedThisWeek: any = require("../../assets/images/svg/ticketsCreatedThisWeek.svg");
const ticketsOnHold: any = require("../../assets/images/svg/ticketsOnHold.svg");
// styles
import styles from "./Dashboard.module.scss";
import { getAllTickets } from "../../../../services/HelpDeskMainServices/dashboardServices";
import { useDispatch, useSelector } from "react-redux";
import {
  filterTicketsByTimePeriod,
  getTicketsByKeyValue,
} from "../../../../utils/commonUtils";

const Dashboard = (): JSX.Element => {
  const dispatch = useDispatch();

  const HelpDeskTicktesData: any = useSelector(
    (state: any) => state.HelpDeskTicktesData.value
  );

  // Info cards array
  const infoCards: any[] = [
    {
      cardName: "My Tickets",
      cardImg: myTickets,
      cardValues: HelpDeskTicktesData?.data?.length || 0,
    },
    {
      cardName: "Open",
      cardImg: openTickets,
      cardValues:
        getTicketsByKeyValue(HelpDeskTicktesData?.data, "Status", "Open")
          ?.length || 0,
    },
    {
      cardName: "Closed",
      cardImg: closedTickets,
      cardValues:
        getTicketsByKeyValue(HelpDeskTicktesData?.data, "Status", "Closed")
          ?.length || 0,
    },
    {
      cardName: "This week's tickets",
      cardImg: ticketsCreatedThisWeek,
      cardValues:
        filterTicketsByTimePeriod(HelpDeskTicktesData?.data, "thisWeek")
          ?.length || 0,
    },
    {
      cardName: "Tickets on hold",
      cardImg: ticketsOnHold,
      cardValues:
        getTicketsByKeyValue(HelpDeskTicktesData?.data, "Status", "On Hold")
          ?.length || 0,
    },
  ];

  const currentUserDetails = useSelector(
    (state: { MainSPContext: { currentUserDetails: any } }) =>
      state.MainSPContext.currentUserDetails
  );

  console.log("currentUserDetails: ", currentUserDetails);

  const currentRoleBasedData: any = (() => {
    if (
      currentUserDetails?.role === "Pernix_Admin" ||
      currentUserDetails?.role === "HelpDesk_Ticket_Managers"
    ) {
      return {
        ...HelpDeskTicktesData,
        role: "ticket_manager",
      };
    } else {
      const isUser = HelpDeskTicktesData?.data?.some(
        (item: any) => item?.EmployeeName?.EMail === currentUserDetails?.email
      );

      const isItOwner = HelpDeskTicktesData?.data?.some(
        (item: any) => item?.ITOwner?.EMail === currentUserDetails?.email
      );

      let role = "undefined";

      if (isUser) {
        role = "user";
      }
      if (isItOwner) {
        role = "it_owner";
      }

      return {
        ...HelpDeskTicktesData,
        role,
        data: isUser
          ? HelpDeskTicktesData?.data?.filter(
              (item: any) =>
                item?.EmployeeName?.EMail === currentUserDetails?.email
            )
          : HelpDeskTicktesData?.data,
      };
    }
  })();

  console.log("currentRoleBasedData: ", currentRoleBasedData);

  useEffect(() => {
    getAllTickets(dispatch);
  }, []);

  return (
    <div className={styles.myDashboard}>
      <div className={styles.myDashboard_header}>
        <PageHeader title={"Dashboard"} noBackBtn />
      </div>

      <div className={styles.infoCards}>
        {infoCards?.map((item: any, idx: number) => (
          <InfoCard idx={idx} item={item} key={idx} />
        ))}
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.chartDetails}>Ticket by status</div>
          <div className={styles.chart}>
            <TicketByStatusChart
              AllTickets={currentRoleBasedData}
              Term="This Week"
            />
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.chartDetails}>Tickets by source</div>
          <div className={styles.chart}>
            <TicketBySource
              AllTickets={currentRoleBasedData}
              Term="This Week"
            />
          </div>
        </div>
      </div>

      <div className={styles.metricsGrid2}>
        <div className={styles.metricCard}>
          <div className={styles.chartDetails}>Created & Closed Tickets</div>
          <div className={styles.chart}>
            <CreatedClosedTickets
              AllTickets={currentRoleBasedData}
              Term="This Week"
            />
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.chartDetails}>Tickets by Priority</div>
          <div className={styles.chart}>
            <TicketsByPriority
              AllTickets={currentRoleBasedData}
              Term="This Week"
              Status="Open"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
