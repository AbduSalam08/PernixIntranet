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
  currentRoleBasedDataUtil,
  filterTicketsByTimePeriod,
  getTicketsByKeyValue,
} from "../../../../utils/commonUtils";
import CustomDropDown from "../../../../components/common/CustomInputFields/CustomDropDown";

const Dashboard = (): JSX.Element => {
  const dispatch = useDispatch();

  const HelpDeskTicktesData: any = useSelector(
    (state: any) => state.HelpDeskTicktesData.value
  );
  console.log("HelpDeskTicktesData: ", HelpDeskTicktesData);

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
      termsOptions: filterTerms,
      statusOptions: [
        "Open",
        "Closed",
        "On Hold",
        "Overdue",
        "Un assigned",
        "In Progress",
      ],
      termsSelectedValue: "This Week",
      statusSelectedValue: "Open",
    },
  });

  const currentUserDetails = useSelector(
    (state: { MainSPContext: { currentUserDetails: any } }) =>
      state.MainSPContext.currentUserDetails
  );

  const currentRoleBasedData = currentRoleBasedDataUtil(
    currentUserDetails,
    HelpDeskTicktesData
  );

  console.log("currentRoleBasedData: ", currentRoleBasedData);

  // Info cards array
  const infoCards: any[] = [
    {
      // cardName: "All Tickets",
      cardName:
        currentRoleBasedData?.role === "ticket_manager"
          ? "All tickets"
          : "My tickets",
      cardImg: myTickets,
      cardValues: currentRoleBasedData?.data?.length || 0,
    },
    {
      // cardName: "Open",
      cardName:
        currentRoleBasedData?.role === "ticket_manager" ? "Open" : "My open",
      cardImg: openTickets,
      cardValues:
        getTicketsByKeyValue(currentRoleBasedData?.data, "Status", "Open")
          ?.length || 0,
    },
    {
      // cardName: "Closed",
      cardName:
        currentRoleBasedData?.role === "ticket_manager"
          ? "Closed"
          : "My closed",
      cardImg: closedTickets,
      cardValues:
        getTicketsByKeyValue(currentRoleBasedData?.data, "Status", "Closed")
          ?.length || 0,
    },
    {
      cardName:
        currentRoleBasedData?.role === "ticket_manager"
          ? "Unassigned"
          : "This week's tickets",
      cardImg: ticketsCreatedThisWeek,
      cardValues:
        currentRoleBasedData?.role === "ticket_manager"
          ? currentRoleBasedData?.data?.filter(
              (item: any) => item?.ITOwnerId === null
            )?.length
          : filterTicketsByTimePeriod(currentRoleBasedData?.data, "thisWeek")
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
          <InfoCard
            idx={idx}
            item={item}
            isLoading={HelpDeskTicktesData?.isLoading}
            key={idx}
          />
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
              isLoading={HelpDeskTicktesData?.isLoading}
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
              isLoading={HelpDeskTicktesData?.isLoading}
              AllTickets={currentRoleBasedData}
              Term={filters.TicketBySource.selectedValue}
            />
          </div>
        </div>
      </div>

      <div className={styles.metricsGrid2}>
        {currentRoleBasedData?.role !== "it_owner" && (
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
                isLoading={HelpDeskTicktesData?.isLoading}
                AllTickets={currentRoleBasedData}
                Term={filters.CreatedClosedTickets.selectedValue}
              />
            </div>
          </div>
        )}
        <div className={styles.metricCard}>
          <div className={styles.chartDetails}>
            <span>Tickets by Priority</span>
            <div className={styles.filters}>
              <CustomDropDown
                floatingLabel={false}
                size="SM"
                width={"150px"}
                value={filters.TicketByPriority.termsSelectedValue}
                options={filters.TicketByPriority.termsOptions}
                noErrorMsg
                placeholder="select term"
                onChange={(value) => {
                  setFilters((prev: any) => ({
                    ...prev,
                    TicketByPriority: {
                      ...prev.TicketByPriority,
                      termsSelectedValue: value,
                    },
                  }));
                }}
              />

              <CustomDropDown
                floatingLabel={false}
                size="SM"
                width={"150px"}
                value={filters.TicketByPriority.statusSelectedValue}
                options={filters.TicketByPriority.statusOptions}
                noErrorMsg
                placeholder="select status"
                onChange={(value) => {
                  setFilters((prev: any) => ({
                    ...prev,
                    TicketByPriority: {
                      ...prev.TicketByPriority,
                      statusSelectedValue: value,
                    },
                  }));
                }}
              />
            </div>
          </div>
          <div className={styles.chart}>
            <TicketsByPriority
              isLoading={HelpDeskTicktesData?.isLoading}
              AllTickets={currentRoleBasedData}
              Term={filters.TicketByPriority.termsSelectedValue}
              Status={filters.TicketByPriority.statusSelectedValue}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
