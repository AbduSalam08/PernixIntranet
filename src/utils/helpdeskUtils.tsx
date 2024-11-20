import { Avatar } from "@mui/material";
import StatusPill from "../components/helpDesk/StatusPill/StatusPill";

/* eslint-disable @typescript-eslint/no-explicit-any */
type FormField = {
  value: any;
  isValid: boolean;
  errorMsg: string;
  validationRule: { required: boolean; type: string };
};

export const mapRowDataToFormData = (
  currentRowData: any,
  initialData: Record<string, FormField>,
  isTicketManager: boolean,
  currentUserDetails: any,
  isITOwner: any
): Record<string, FormField> => {
  return {
    ...initialData,
    TicketNumber: {
      ...initialData.TicketNumber,
      value: currentRowData?.TicketNumber,
    },
    EmployeeNameId: {
      ...initialData.EmployeeNameId,
      value: {
        id: currentRowData?.EmployeeName?.ID,
        name: currentRowData?.EmployeeName?.Title,
        email: currentRowData?.EmployeeName?.EMail,
      },
    },
    ITOwnerId: {
      ...initialData.ITOwnerId,
      value:
        currentRowData?.ITOwnerId !== null
          ? {
              id: currentRowData?.ITOwner?.ID,
              name: currentRowData?.ITOwner?.Title,
              email: currentRowData?.ITOwner?.EMail,
            }
          : null,
    },
    TicketManagerId: {
      ...initialData.TicketManagerId,
      value: isTicketManager
        ? currentUserDetails?.id
        : currentRowData?.TicketManagerId !== null
        ? {
            id: currentRowData?.TicketManager?.ID,
            name: currentRowData?.TicketManager?.Title,
            email: currentRowData?.TicketManager?.EMail,
          }
        : null,
    },
    Category: {
      ...initialData.Category,
      value: currentRowData?.Category,
    },
    TicketDescription: {
      ...initialData.TicketDescription,
      value: currentRowData?.TicketDescription,
    },
    Priority: {
      ...initialData.Priority,
      value: currentRowData?.Priority,
    },
    TicketSource: {
      ...initialData.TicketSource,
      value: currentRowData?.TicketSource,
    },
    Status: {
      ...initialData.Status,
      value: currentRowData?.Status
        ? currentRowData?.Status === "Open" &&
          isTicketManager &&
          currentRowData?.ITOwnerId === null
          ? "In Progress"
          : currentRowData?.Status
        : "Open",
    },
    // Add any other fields that need to be mapped.
  };
};

export const renderUserCard = (
  styles: any,
  user: any,
  placeholder: any,
  imageURL: any
): JSX.Element => {
  return user ? (
    <>
      <Avatar
        style={{ width: "35px", height: "35px" }}
        alt={user?.Title || ""}
        src={`${imageURL}${user?.EMail}`}
      />
      <div className={styles.userDetails}>
        <p>{user?.Title}</p>
        <span>{user?.EMail}</span>
      </div>
    </>
  ) : (
    <StatusPill size="SM" status={placeholder} />
  );
};

export const renderAttachments = (
  styles: any,
  currentAttachment: any,
  fileIcon: any
): JSX.Element => {
  return currentAttachment?.length > 0 ? (
    currentAttachment.map((item: any, idx: number) => (
      <a
        href={`${window.location.origin}${item?.ServerRelativeUrl}?web=1`}
        download
        key={idx}
        className={styles.fileName}
        onClick={() =>
          window.open(
            `${window.location.origin}${item?.ServerRelativeUrl}?web=1`
          )
        }
      >
        <img src={fileIcon} alt="file-icon" />
        <span>{item?.FileName}</span>
      </a>
    ))
  ) : (
    <div className={styles.fileName}>
      <span>No attachment</span>
    </div>
  );
};
