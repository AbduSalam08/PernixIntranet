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
