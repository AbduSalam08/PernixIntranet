/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
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
import CustomDropDown from "../../../../components/common/CustomInputFields/CustomDropDown";

const Dashboard = (): JSX.Element => {
  const dispatch = useDispatch();

  const HelpDeskTicktesData: any = useSelector(
    (state: any) => state.HelpDeskTicktesData.value
  );

  const filterTerms = [
    "This Week",
    "This Month",
    "Last 3 months",
    "Last 6 months",
  ];

  const [filters, setFilters] = useState({
    TicketByStatus: {
      options: filterTerms,
      selectedValue: "This Week",
    },
    TicketBySource: {
      options: filterTerms,
      selectedValue: "This Week",
    },
    CreatedClosedTickets: {
      options: filterTerms,
      selectedValue: "This Week",
    },
    TicketByPriority: {
      options: filterTerms,
      selectedValue: "This Week",
    },
  });
  console.log("filters: ", filters);

  const currentUserDetails = useSelector(
    (state: { MainSPContext: { currentUserDetails: any } }) =>
      state.MainSPContext.currentUserDetails
  );

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

  // Info cards array
  const infoCards: any[] = [
    {
      cardName: "My Tickets",
      cardImg: myTickets,
      cardValues: currentRoleBasedData?.data?.length || 0,
    },
    {
      cardName: "Open",
      cardImg: openTickets,
      cardValues:
        getTicketsByKeyValue(currentRoleBasedData?.data, "Status", "Open")
          ?.length || 0,
    },
    {
      cardName: "Closed",
      cardImg: closedTickets,
      cardValues:
        getTicketsByKeyValue(currentRoleBasedData?.data, "Status", "Closed")
          ?.length || 0,
    },
    {
      cardName: "This week's tickets",
      cardImg: ticketsCreatedThisWeek,
      cardValues:
        filterTicketsByTimePeriod(currentRoleBasedData?.data, "thisWeek")
          ?.length || 0,
    },
    {
      cardName: "Tickets on hold",
      cardImg: ticketsOnHold,
      cardValues:
        getTicketsByKeyValue(currentRoleBasedData?.data, "Status", "On Hold")
          ?.length || 0,
    },
  ];

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
          <div className={styles.chartDetails}>
            <span>Ticket by status</span>
            <CustomDropDown
              floatingLabel={false}
              size="SM"
              width={"150px"}
              value={filters.TicketByStatus.selectedValue}
              options={filters.TicketByStatus.options}
              noErrorMsg
              placeholder="select term"
              onChange={(value) => {
                setFilters((prev: any) => ({
                  ...prev,
                  TicketByStatus: {
                    ...prev.TicketByStatus,
                    selectedValue: value,
                  },
                }));
              }}
            />
          </div>
          <div className={styles.chart}>
            <TicketByStatusChart
              AllTickets={currentRoleBasedData}
              Term={filters.TicketByStatus.selectedValue}
            />
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.chartDetails}>
            <span>Tickets by source</span>
            <CustomDropDown
              floatingLabel={false}
              size="SM"
              width={"150px"}
              value={filters.TicketBySource.selectedValue}
              options={filters.TicketBySource.options}
              noErrorMsg
              placeholder="select term"
              onChange={(value) => {
                setFilters((prev: any) => ({
                  ...prev,
                  TicketBySource: {
                    ...prev.TicketBySource,
                    selectedValue: value,
                  },
                }));
              }}
            />
          </div>
          <div className={styles.chart}>
            <TicketBySource
              AllTickets={currentRoleBasedData}
              Term={filters.TicketBySource.selectedValue}
            />
          </div>
        </div>
      </div>

      <div className={styles.metricsGrid2}>
        <div className={styles.metricCard}>
          <div className={styles.chartDetails}>
            <span>Created & Closed Tickets</span>
            <CustomDropDown
              floatingLabel={false}
              size="SM"
              width={"150px"}
              value={filters.CreatedClosedTickets.selectedValue}
              options={filters.CreatedClosedTickets.options}
              noErrorMsg
              placeholder="select term"
              onChange={(value) => {
                setFilters((prev: any) => ({
                  ...prev,
                  CreatedClosedTickets: {
                    ...prev.CreatedClosedTickets,
                    selectedValue: value,
                  },
                }));
              }}
            />
          </div>
          <div className={styles.chart}>
            <CreatedClosedTickets
              AllTickets={currentRoleBasedData}
              Term={filters.CreatedClosedTickets.selectedValue}
            />
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.chartDetails}>
            <span>Tickets by Priority</span>
            <CustomDropDown
              floatingLabel={false}
              size="SM"
              width={"150px"}
              value={filters.TicketByPriority.selectedValue}
              options={filters.TicketByPriority.options}
              noErrorMsg
              placeholder="select term"
              onChange={(value) => {
                setFilters((prev: any) => ({
                  ...prev,
                  TicketByPriority: {
                    ...prev.TicketByPriority,
                    selectedValue: value,
                  },
                }));
              }}
            />
          </div>
          <div className={styles.chart}>
            <TicketsByPriority
              AllTickets={currentRoleBasedData}
              // Term={filters.TicketByPriority.selectedValue}
              Status="Un assigned"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
