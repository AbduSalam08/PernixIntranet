/* eslint-disable @microsoft/spfx/import-requires-chunk-name */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-floating-promises */
import React, { lazy, Suspense, useEffect } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { useDispatch } from "react-redux";
import MainLayout from "../layouts/MainLayout";
import AppLoader from "../../../components/common/Loaders/AppLoader/AppLoader";
// import PageHeader from "../../../components/common/PageHeader/PageHeader";
import { CONFIG } from "../../../config/config";
import { RoleAuth } from "../../../services/CommonServices";
// import styles from "./HelpDesk.module.scss";
import { setMainSPContext } from "../../../redux/features/MainSPContextSlice";
import "../assets/styles/styles.css";
// pages
const TicketView = lazy(() => import("../pages/TicketView/TicketView"));
const Dashboard = lazy(() => import("../pages/Dashboard/Dashboard"));
const MyTickets = lazy(() => import("../pages/MyTickets/MyTickets"));
import ErrorElement from "../../../components/common/ErrorElement/ErrorElement";
import { getAllUsersList } from "../../../services/HelpDeskMainServices/ticketServices";
// Define the Props interface explicitly
interface HelpDeskProps {
  [key: string]: any; // If you expect additional dynamic props, otherwise refine this based on expected props
}

const HelpDesk: React.FC<HelpDeskProps> = (props) => {
  console.log("props: ", props);
  const dispatch = useDispatch();

  // Effect for handling role-based authentication
  useEffect(() => {
    dispatch(setMainSPContext(props?.context));
    getAllUsersList(dispatch);
    RoleAuth(
      CONFIG.SPGroupName.Pernix_Admin,
      {
        highPriorityGroups: [CONFIG.SPGroupName.HelpDesk_Ticket_Managers],
        lowPriorityGroups: [CONFIG.SPGroupName.HelpDesk_IT_Owners],
      },
      dispatch
    );
  }, [dispatch]);

  return (
    <HashRouter>
      {/* <div className={styles.ticketsGrid}> */}

      {/* Main Routes with Suspense for Lazy Loading */}
      <Suspense fallback={<AppLoader />}>
        <Routes>
          {/* Invalid Route Fallback */}
          <Route path="*" element={<ErrorElement />} />

          {/* ADMIN ROUTES */}
          <Route path="/admin" Component={MainLayout} />
          <Route path="/" Component={MainLayout} />

          {/* Ticket Manager ROUTES */}
          <Route index Component={MainLayout} />
          <Route path="/helpdesk_manager" Component={MainLayout}>
            <Route index Component={Dashboard} />
            <Route path="dashboard" Component={Dashboard} />

            <Route
              path="all_tickets/:ticketid/view_ticket"
              Component={TicketView}
            />

            <Route path="tickets" Component={MyTickets}>
              <Route index Component={MyTickets} />
              <Route path="all" Component={MyTickets} />
              <Route path="status" Component={MyTickets}>
                <Route path="open" Component={MyTickets} />
                <Route path="closed" Component={MyTickets} />
                <Route path="onhold" Component={MyTickets} />
                <Route path="inprogress" Component={MyTickets} />
                <Route path="overdue" Component={MyTickets} />
              </Route>
              <Route path="source" Component={MyTickets}>
                <Route path="web" Component={MyTickets} />
                <Route path="email" Component={MyTickets} />
              </Route>
            </Route>

            <Route path="all_tickets" Component={MyTickets}>
              <Route index Component={MyTickets} />
              <Route path="mentions" Component={MyTickets} />
              <Route path="created_by_me" Component={MyTickets} />
              <Route path="all" Component={MyTickets} />
              <Route path="open" Component={MyTickets} />
              <Route path="unassigned" Component={MyTickets} />
              <Route path="recent" Component={MyTickets} />
            </Route>
          </Route>

          {/* user routes */}
          <Route path="/user" Component={MainLayout}>
            {/* <Route index Component={Dashboard} /> */}
            {/* <Route path="dashboard" Component={Dashboard} /> */}
            <Route index Component={MyTickets} />
            <Route path="tickets" Component={MyTickets}>
              <Route index Component={MyTickets} />
              <Route path="all" Component={MyTickets} />
              <Route path="status" Component={MyTickets}>
                <Route path="open" Component={MyTickets} />
                <Route path="closed" Component={MyTickets} />
                <Route path="onhold" Component={MyTickets} />
                <Route path="inprogress" Component={MyTickets} />
                <Route path="overdue" Component={MyTickets} />
              </Route>
              <Route path="source" Component={MyTickets}>
                <Route path="web" Component={MyTickets} />
                <Route path="email" Component={MyTickets} />
              </Route>
            </Route>
            <Route
              path="all_tickets/:ticketid/view_ticket"
              Component={TicketView}
            />
            <Route path="all_tickets" Component={MyTickets}>
              <Route index Component={MyTickets} />
              <Route path="mentions" Component={MyTickets} />
              <Route path="all" Component={MyTickets} />
              {/* <Route path="open" Component={MyTickets} /> */}
              <Route path="unassigned" Component={MyTickets} />
              <Route path="recent" Component={MyTickets} />
            </Route>
          </Route>

          {/* it owner routes */}
          <Route path="/it_owner" Component={MainLayout}>
            <Route index Component={Dashboard} />
            <Route path="dashboard" Component={Dashboard} />

            <Route index Component={MyTickets} />
            <Route path="tickets" Component={MyTickets}>
              <Route index Component={MyTickets} />
              <Route path="all" Component={MyTickets} />
              <Route path="status" Component={MyTickets}>
                <Route path="open" Component={MyTickets} />
                <Route path="closed" Component={MyTickets} />
                <Route path="onhold" Component={MyTickets} />
                <Route path="inprogress" Component={MyTickets} />
                <Route path="overdue" Component={MyTickets} />
              </Route>
              <Route path="source" Component={MyTickets}>
                <Route path="web" Component={MyTickets} />
                <Route path="email" Component={MyTickets} />
              </Route>
            </Route>
            <Route
              path="all_tickets/:ticketid/view_ticket"
              Component={TicketView}
            />
            <Route path="all_tickets" Component={MyTickets}>
              <Route index Component={MyTickets} />
              <Route path="mentions" Component={MyTickets} />
              <Route path="created_by_me" Component={MyTickets} />
              <Route path="assigned_to_me" Component={MyTickets} />
              <Route path="all" Component={MyTickets} />
              {/* <Route path="open" Component={MyTickets} /> */}
              <Route path="unassigned" Component={MyTickets} />
              <Route path="recent" Component={MyTickets} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
      {/* </div> */}
    </HashRouter>
  );
};

export default HelpDesk;
