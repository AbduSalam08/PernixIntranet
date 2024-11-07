/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo } from "react";
import styles from "./StatusPill.module.scss";

interface Props {
  status?:
    | "Open"
    | "In Progress"
    | "On Hold"
    | "Closed"
    | "Overdue"
    | "Unassigned";
  size?: "SM" | "MD" | "XL";
  customWrapperClass?: string;
}

const StatusPill: React.FC<Props> = ({
  status,
  customWrapperClass = "",
  size = "MD",
}: Props) => {
  const getStatusClassName = (status?: Props["status"]): string => {
    switch (status) {
      case "Open":
        return styles.open; // Assuming you have a corresponding style
      case "In Progress":
        return styles.inProgress; // Assuming you have a corresponding style
      case "On Hold":
        return styles.onHold; // Assuming you have a corresponding style
      case "Closed":
        return styles.closed; // Assuming you have a corresponding style
      case "Unassigned":
        return styles.closed; // Assuming you have a corresponding style
      case "Overdue":
        return styles.overdue; // Assuming you have a corresponding style
      default:
        return "";
    }
  };

  return (
    <div
      className={`${styles.statusPill} ${getStatusClassName(status)} ${
        styles[size]
      } ${customWrapperClass}`}
    >
      {status}
    </div>
  );
};

export default memo(StatusPill);
