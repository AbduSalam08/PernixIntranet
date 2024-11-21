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
  TicketsCreatedByStatsForITOwner,
  TicketsCreatedByUserBasis,
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
  getCurrentRoleForTicketsRoute,
  getTicketsByKeyValue,
} from "../../../../utils/commonUtils";
import CustomDropDown from "../../../../components/common/CustomInputFields/CustomDropDown";
import { getUsersByGroup } from "../../../../services/CommonServices";
import { CONFIG } from "../../../../config/config";
import { useNavigate } from "react-router-dom";

const Dashboard = (): JSX.Element => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const HelpDeskTicktesData: any = useSelector(
    (state: any) => state.HelpDeskTicktesData.value
  );
  console.log("HelpDeskTicktesData: ", HelpDeskTicktesData);

  const [usersByType, setUsersByType] = useState<{
    it_owners: any[];
    helpdesk_managers: any[];
  }>({
    it_owners: [],
    helpdesk_managers: [],
  });

  const filterTerms = [
    "This Week",
    "This Month",
    "Last 3 months",
    "Last 6 months",
  ];

  const [filters, setFilters] = useState({
    TicketByStatus: {
      options: filterTerms,
      selectedValue: "This Month",
    },
    TicketBySource: {
      options: filterTerms,
      selectedValue: "This Month",
    },
    CreatedClosedTickets: {
      options: filterTerms,
      selectedValue: "This Month",
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
      termsSelectedValue: "This Month",
      statusSelectedValue: "Open",
    },
    TicketsCreatedByUserBasis: {
      termsOptions: filterTerms,
      termsSelectedValue: "This Month",
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

  const currentRole: string = getCurrentRoleForTicketsRoute(currentUserDetails);

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
      onclick: () => {
        navigate(`${currentRole}/all_tickets`);
      },
    },
    {
      // cardName: "Open",
      cardName:
        currentRoleBasedData?.role === "ticket_manager" ? "Open" : "My open",
      cardImg: openTickets,
      cardValues:
        getTicketsByKeyValue(currentRoleBasedData?.data, "Status", "Open")
          ?.length || 0,
      onclick: () => {
        navigate(`${currentRole}/tickets/status/open`);
      },
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
      onclick: () => {
        navigate(`${currentRole}/tickets/status/closed`);
      },
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
      onclick: () => {
        if (currentRoleBasedData?.role === "ticket_manager") {
          navigate(`${currentRole}/all_tickets/unassigned`);
        } else {
          navigate(`${currentRole}/all_tickets/recent`);
        }
      },
    },
    {
      cardName: "Tickets on hold",
      cardImg: ticketsOnHold,
      cardValues:
        getTicketsByKeyValue(currentRoleBasedData?.data, "Status", "On Hold")
          ?.length || 0,
      onclick: () => {
        navigate(`${currentRole}/tickets/status/onhold`);
      },
    },
  ];

  useEffect(() => {
    // Trigger any required actions on mount
    getAllTickets(dispatch);

    // IIFE to handle async logic
    (async () => {
      try {
        // Fetch IT Owners
        const itOwners = await getUsersByGroup(
          CONFIG.SPGroupName.HelpDesk_IT_Owners
        );
        console.log("itOwners: ", itOwners);

        setUsersByType((prev: any) => ({
          ...prev,
          it_owners: itOwners,
        }));

        // Fetch Helpdesk Managers
        const helpdeskManagers = await getUsersByGroup(
          CONFIG.SPGroupName.HelpDesk_Ticket_Managers
        );
        console.log("helpdesk_managers: ", helpdeskManagers);

        setUsersByType((prev: any) => ({
          ...prev,
          helpdesk_managers: helpdeskManagers,
        }));
      } catch (err: any) {
        console.error("Error fetching users: ", err);
      }
    })();
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
            infoCardClick={item?.onclick}
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

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.chartDetails}>
            <span>
              {currentRoleBasedData?.role === "ticket_manager"
                ? // || currentRoleBasedData?.role === "Super Admin"
                  "Tickets created by (user basis)"
                : "Tickets created by users & myself"}
            </span>
            <div className={styles.filters}>
              <CustomDropDown
                floatingLabel={false}
                size="SM"
                width={"150px"}
                value={filters.TicketsCreatedByUserBasis.termsSelectedValue}
                options={filters.TicketsCreatedByUserBasis.termsOptions}
                noErrorMsg
                placeholder="select term"
                onChange={(value) => {
                  setFilters((prev: any) => ({
                    ...prev,
                    TicketsCreatedByUserBasis: {
                      ...prev.TicketsCreatedByUserBasis,
                      termsSelectedValue: value,
                    },
                  }));
                }}
              />
            </div>
          </div>
          <div className={styles.chart}>
            {currentRoleBasedData?.role === "ticket_manager" ? (
              // || currentRoleBasedData?.role === "Super Admin" ? (
              <TicketsCreatedByUserBasis
                isLoading={HelpDeskTicktesData?.isLoading}
                AllTickets={currentRoleBasedData}
                Term={filters.TicketsCreatedByUserBasis.termsSelectedValue}
                helpdeskManagers={usersByType.helpdesk_managers?.map(
                  (res: any) => res?.Email
                )}
                itOwners={usersByType.it_owners?.map((res: any) => res?.Email)}
              />
            ) : (
              <TicketsCreatedByStatsForITOwner
                currentUserEmail={currentUserDetails?.email}
                isLoading={HelpDeskTicktesData?.isLoading}
                AllTickets={HelpDeskTicktesData}
                Term={filters.TicketsCreatedByUserBasis.termsSelectedValue}
                helpdeskManagers={usersByType.helpdesk_managers?.map(
                  (res: any) => res?.Email
                )}
                itOwners={usersByType.it_owners?.map((res: any) => res?.Email)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
