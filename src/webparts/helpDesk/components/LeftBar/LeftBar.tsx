/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import styles from "./LeftBar.module.scss";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import {
  currentRoleBasedDataUtil,
  getCurrentRoleForTicketsRoute,
  // groupTicketsByPeriod,
} from "../../../../utils/commonUtils";
// import { setHelpDeskTickets } from "../../../../redux/features/HelpDeskSlice";
import { getAllTickets } from "../../../../services/HelpDeskMainServices/dashboardServices";
import { CONFIG } from "../../../../config/config";

interface NavItem {
  label: string;
  path: string;
  onClick?: () => void;
  children?: NavItem[];
}

interface UserDetails {
  role: string;
}

const LeftBar: React.FC = (): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [navItems, setNavItems] = useState<NavItem[]>([]);

  const currentUserDetails = useSelector(
    (state: { MainSPContext: { currentUserDetails: UserDetails } }) =>
      state.MainSPContext.currentUserDetails
  );
  const HelpDeskTicktesData: any = useSelector(
    (state: any) => state.HelpDeskTicktesData.value
  );

  const currentRole: string = getCurrentRoleForTicketsRoute(currentUserDetails);
  console.log("currentRole: ", currentRole);

  const currentRoleBasedData: any = currentRoleBasedDataUtil(
    currentUserDetails,
    HelpDeskTicktesData
  );
  console.log("currentRoleBasedData: ", currentRoleBasedData);

  // Define nav items
  useEffect(() => {
    const items: NavItem[] =
      currentUserDetails?.role === "user" ||
      currentUserDetails?.role === "Super Admin" ||
      currentUserDetails?.role === CONFIG.SPGroupName.Pernix_Admin
        ? [
            {
              label: "My tickets",
              path: `${currentRole}/all_tickets`,
              children: [
                {
                  label: "My tickets in last 7 days",
                  path: `${currentRole}/all_tickets/recent`,
                },
                {
                  label: "@Mentions",
                  path: `${currentRole}/all_tickets/mentions`,
                },
              ],
            },
            {
              label: "Status",
              path: `${currentRole}/tickets/status/open`,
              children: [
                {
                  label: "Open",
                  path: `${currentRole}/tickets/status/open`,
                },
                {
                  label: "On hold",
                  path: `${currentRole}/tickets/status/onhold`,
                },
                {
                  label: "Closed",
                  path: `${currentRole}/tickets/status/closed`,
                },
                {
                  label: "In progress",
                  path: `${currentRole}/tickets/status/inprogress`,
                },
                {
                  label: "Overdue",
                  path: `${currentRole}/tickets/status/overdue`,
                },
              ],
            },
            {
              label: "Ticket source",
              path: `${currentRole}/tickets/source/web`,
              children: [
                {
                  label: "Web portal",
                  path: `${currentRole}/tickets/source/web`,
                },
                {
                  label: "Email",
                  path: `${currentRole}/tickets/source/email`,
                },
              ],
            },
          ]
        : currentUserDetails?.role === "HelpDesk_IT_Owners"
        ? [
            {
              label: "Dashboard",
              path: `${currentRole}/dashboard`,
            },
            {
              label: "All tickets",
              path: `${currentRole}/all_tickets`,
              onClick: async () => {
                await getAllTickets(dispatch);
              },
              children: [
                {
                  label: "Created by me",
                  path: `${currentRole}/all_tickets/created_by_me`,
                },
                {
                  label: "Assigned to me",
                  path: `${currentRole}/all_tickets/assigned_to_me`,
                },
                {
                  label: "My tickets in last 7 days",
                  path: `${currentRole}/all_tickets/recent`,
                },
                {
                  label: "@Mentions",
                  path: `${currentRole}/all_tickets/mentions`,
                },
              ],
            },
            {
              label: "Status",
              path: `${currentRole}/tickets/status/open`,
              children: [
                {
                  label: "Open",
                  path: `${currentRole}/tickets/status/open`,
                },
                {
                  label: "On hold",
                  path: `${currentRole}/tickets/status/onhold`,
                },
                {
                  label: "Closed",
                  path: `${currentRole}/tickets/status/closed`,
                },
                {
                  label: "In progress",
                  path: `${currentRole}/tickets/status/inprogress`,
                },
                {
                  label: "Overdue",
                  path: `${currentRole}/tickets/status/overdue`,
                },
              ],
            },
            {
              label: "Ticket source",
              path: `${currentRole}/tickets/source/web`,
              children: [
                {
                  label: "Web portal",
                  path: `${currentRole}/tickets/source/web`,
                },
                {
                  label: "Email",
                  path: `${currentRole}/tickets/source/email`,
                },
              ],
            },
          ]
        : [
            {
              label: "Dashboard",
              path: `${currentRole}/dashboard`,
            },
            {
              label: "All tickets",
              path: `${currentRole}/all_tickets`,
              onClick: async () => {
                await getAllTickets(dispatch);
              },
              children: [
                {
                  label: "Created by me",
                  path: `${currentRole}/all_tickets/created_by_me`,
                },
                {
                  label: "Unassigned tickets",
                  path: `${currentRole}/all_tickets/unassigned`,
                },
                {
                  label: "Scheduled tickets",
                  path: `${currentRole}/all_tickets/scheduled_tickets`,
                },
                {
                  label: "My tickets in last 7 days",
                  path: `${currentRole}/all_tickets/recent`,
                },
                {
                  label: "@Mentions",
                  path: `${currentRole}/all_tickets/mentions`,
                },
              ],
            },
            {
              label: "Status",
              path: `${currentRole}/tickets/status/open`,
              children: [
                {
                  label: "Open",
                  path: `${currentRole}/tickets/status/open`,
                },
                {
                  label: "On hold",
                  path: `${currentRole}/tickets/status/onhold`,
                },
                {
                  label: "Closed",
                  path: `${currentRole}/tickets/status/closed`,
                },
                {
                  label: "In progress",
                  path: `${currentRole}/tickets/status/inprogress`,
                },
                {
                  label: "Overdue",
                  path: `${currentRole}/tickets/status/overdue`,
                },
              ],
            },
            {
              label: "Ticket source",
              path: `${currentRole}/tickets/source/web`,
              children: [
                {
                  label: "Web portal",
                  path: `${currentRole}/tickets/source/web`,
                },
                {
                  label: "Email",
                  path: `${currentRole}/tickets/source/email`,
                },
              ],
            },
          ];

    // Set the nav items
    setNavItems(items);
  }, [currentUserDetails, currentRole]);

  // Check if the current path matches the item path or any of its children
  const isActive = (item: NavItem): boolean => {
    if (location.pathname === item.path) {
      return true;
    }
    if (item.children) {
      return item.children.some((child) => location.pathname === child.path);
    }
    return false;
  };

  // Determine if the parent is active based on children
  const isParentActive = (item: NavItem): boolean => {
    return item.children
      ? item.children.some((child) => location.pathname === child.path)
      : false;
  };

  const handleNavigation = (item: NavItem): void => {
    if (item.onClick) {
      item.onClick();
    }
    if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <div className={styles.leftBarWrapper}>
      {navItems.map((item, index) => (
        <div key={index} className={styles.navItem}>
          <div
            onClick={() => {
              handleNavigation(item);
              item?.onClick?.();
            }}
            className={`${styles.navLink} ${
              isActive(item) && !isParentActive(item)
                ? styles.activeNavLink
                : ""
            }`}
          >
            <div className={styles.parentLabel}>
              {item.label}
              <ArrowRightIcon
                className={`${
                  item.children && isParentActive(item)
                    ? styles.parentActive
                    : styles.parentInActive
                }`}
              />
            </div>

            <span
              className={`${
                location.pathname === item?.path &&
                currentRoleBasedData?.data?.length &&
                (item?.label?.toLowerCase() === "all tickets" ||
                  item?.label?.toLowerCase() === "my tickets" ||
                  item?.label?.toLowerCase() === "mentioned tickets")
                  ? styles.countBadge
                  : styles.hiddenBadge
              }`}
            >
              {location.pathname === item?.path
                ? currentRoleBasedData?.data?.length || "0"
                : "0"}
            </span>
          </div>
          {item.children && (
            <div className={styles.subNav}>
              {item.children.map((child, childIndex) => (
                <div
                  key={childIndex}
                  onClick={() => {
                    handleNavigation(child);
                    child?.onClick?.();
                  }}
                  className={`${styles.subNavItem} ${
                    location.pathname === child.path ? styles.activeNavLink : ""
                  }`}
                >
                  {child.label}

                  <span
                    className={`${
                      location.pathname === child.path
                        ? styles.countBadge
                        : styles.hiddenBadge
                    }`}
                  >
                    {location.pathname === child.path
                      ? currentRoleBasedData?.data?.length
                      : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default LeftBar;
