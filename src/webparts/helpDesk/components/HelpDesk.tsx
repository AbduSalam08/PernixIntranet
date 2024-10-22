/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-floating-promises */
import React, { Suspense, useEffect } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { useDispatch } from "react-redux";
import MainLayout from "../layouts/MainLayout";
import AppLoader from "../../../components/common/Loaders/AppLoader/AppLoader";
import ErrorElement from "../../../components/common/ErrorElement/ErrorElement";
import PageHeader from "../../../components/common/PageHeader/PageHeader";
import { CONFIG } from "../../../config/config";
import { RoleAuth } from "../../../services/CommonServices";
import styles from "./HelpDesk.module.scss";
import MyTickets from "../pages/MyTickets/MyTickets";
import Dashboard from "../pages/Dashboard/Dashboard";
// Define the Props interface explicitly
interface HelpDeskProps {
  [key: string]: any; // If you expect additional dynamic props, otherwise refine this based on expected props
}

const HelpDesk: React.FC<HelpDeskProps> = (props) => {
  console.log("props: ", props);
  const dispatch = useDispatch();

  // Effect for handling role-based authentication
  useEffect(() => {
    RoleAuth(
      CONFIG.SPGroupName.Pernix_Admin,
      CONFIG.SPGroupName.HelpDesk_Ticket_Managers,
      dispatch
    );
  }, [dispatch]);

  return (
    <HashRouter>
      <div className={styles.ticketsGrid}>
        {/* Page Header */}
        <div className={styles.ticketHeader}>
          <PageHeader title="Tickets" />
        </div>

        {/* Main Routes with Suspense for Lazy Loading */}
        <Suspense fallback={<AppLoader />}>
          <Routes>
            {/* Invalid Route Fallback */}
            <Route path="*" Component={ErrorElement} />

            {/* ADMIN ROUTES */}
            <Route path="/admin" Component={MainLayout} />
            <Route path="/" Component={MainLayout} />

            {/* Ticket Manager ROUTES */}
            <Route index Component={MainLayout} />
            <Route path="/ticket_manager" Component={MainLayout}>
              <Route index Component={Dashboard} />
              <Route path="dashboard" Component={Dashboard} />

              <Route path="tickets" Component={MyTickets}>
                <Route index Component={MyTickets} />
                <Route path="all" Component={MyTickets} />
                <Route path="status" Component={MyTickets}>
                  <Route path="open" Component={MyTickets} />
                  <Route path="closed" Component={MyTickets} />
                  <Route path="onhold" Component={MyTickets} />
                </Route>
              </Route>

              <Route path="all_tickets" Component={MyTickets}>
                <Route index Component={MyTickets} />
                <Route path="all" Component={MyTickets} />
                <Route path="open" Component={MyTickets} />
                <Route path="handle" Component={MyTickets} />
                <Route path="recent" Component={MyTickets} />
              </Route>
            </Route>

            {/* <Route path="my_views" Component={MainLayout}>
              <Route index Component={MyTickets} />
              <Route path="recent" Component={MyTickets} />
            </Route> */}
          </Routes>
        </Suspense>
      </div>
    </HashRouter>
  );
};

export default HelpDesk;
