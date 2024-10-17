import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import { useSelector } from "react-redux";
import styles from "./LeftBar.module.scss";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

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
  const location = useLocation(); // Get current location to determine active link
  const [activePath, setActivePath] = useState(location.pathname); // Active path state

  const defaultOnClick = (label: string): void => {
    console.log(`${label} clicked!`);
  };

  const currentUserDetails = useSelector(
    (state: { MainSPContext: { currentUserDetails: UserDetails } }) =>
      state.MainSPContext.currentUserDetails
  );

  const currentRole: string =
    currentUserDetails?.role === "Pernix_Admin"
      ? "/admin"
      : currentUserDetails?.role === "HelpDesk_Ticket_Managers"
      ? "/ticket_manager"
      : currentUserDetails?.role;

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      path: `${currentRole}/dashboard`,
      onClick: () => console.log("Dashboard clicked!"),
    },
    {
      label: "All tickets",
      path: `${currentRole}/all_tickets`,
      children: [
        {
          label: "Tickets to handle",
          path: `${currentRole}/all_tickets/handle`,
        },
        {
          label: "My open tickets",
          path: `${currentRole}/all_tickets/open`,
        },
        {
          label: "My tickets in last 7 days",
          path: `${currentRole}/all_tickets/recent`,
        },
      ],
    },
    {
      label: "Status",
      path: `${currentRole}/tickets/status`,
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
          label: "Close",
          path: `${currentRole}/tickets/status/closed`,
        },
      ],
    },
  ];

  const handleNavigation = (item: NavItem): void => {
    const itemOnClick = item.onClick || (() => defaultOnClick(item.label));
    itemOnClick();
    if (item.path) {
      setActivePath(item.path); // Set active path when item is clicked
      navigate(item.path);
    }
  };

  // Check if any of the children paths match the active path
  const isChildActive = (children: NavItem[]): boolean => {
    return children.some((child) => activePath === child.path);
  };

  return (
    <div className={styles.leftBarWrapper}>
      {navItems.map((item, index) => (
        <div key={index} className={styles.navItem}>
          <div
            onClick={() => handleNavigation(item)}
            className={`${styles.navLink} ${
              activePath === item.path ? styles.activeNavLink : ""
            } `}
          >
            {item.label}
            <ArrowRightIcon
              className={`${
                item.children && isChildActive(item.children)
                  ? styles.parentActive
                  : styles.parentInActive
              }`}
            />
          </div>
          {item.children && item.children.length > 0 && (
            <div className={styles.subNav}>
              {item.children.map((child, childIndex) => (
                <div
                  key={childIndex}
                  onClick={() => handleNavigation(child)}
                  className={`${styles.subNavItem} ${
                    activePath === child.path ? styles.activeNavLink : ""
                  }`}
                >
                  {child.label}
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
