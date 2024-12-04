/* eslint-disable @typescript-eslint/no-explicit-any */
export const TicketCategories: string[] = [
  "Software Issue - O365",
  "Software Issue - Other",
  "Software Issue - Vista",
  "Distribution Group Modification",
  "Access/Permission Modification",
  "Hardware Issue",
  "Other",
  "New User Request",
  "User Deactivation",
];
export const TicketPriority: string[] = [
  "Standard",
  "Low Priority",
  "Medium Priority",
  "High Priority",
  "Critical/Impacting Multiple People",
];

export const TicketSource: string[] = ["Web", "Email"];

export const TicketStatus: string[] = [
  "Open",
  "In Progress",
  "Overdue",
  "Closed",
  "On Hold",
];
export const imageURL: string = "/_layouts/15/userphoto.aspx?size=S&username=";

export const TicketRecurrenceFrequency: string[] = [
  "Weekly",
  "Quarterly",
  "Semi Annual",
  "Annual",
];

// A function that returns the initial formdata scema data
export const initialData = (
  isTicketManager: boolean,
  isITOwner: boolean,
  currentUserDetails: any,
  openNewTicketSlide: any
): any => {
  return {
    TicketNumber: {
      value: "",
      isValid: true,
      errorMsg: "Invalid title",
      validationRule: { required: true, type: "string" },
    },
    EmployeeNameId: {
      value: null,
      isValid: true,
      errorMsg: "Invalid input",
      validationRule: { required: true, type: "string" },
    },
    ITOwnerId: {
      value: null,
      isValid: true,
      errorMsg: "Invalid input",
      validationRule: {
        required: isTicketManager,
        type: "string",
      },
    },
    TicketManagerId: {
      value: isTicketManager ? currentUserDetails?.id : null,
      isValid: true,
      errorMsg: "TicketManager is required",
      validationRule: { required: false, type: "array" },
    },
    Attachment: {
      value: null,
      isValid: true,
      errorMsg: "Invalid file",
      validationRule: { required: false, type: "file" },
    },
    Category: {
      value: "",
      isValid: true,
      errorMsg: "This field is required",
      validationRule: { required: true, type: "string" },
    },
    TicketDescription: {
      value: "",
      isValid: true,
      errorMsg: "This field is required",
      validationRule: { required: false, type: "string" },
    },
    Priority: {
      value: "",
      isValid: true,
      errorMsg: "This field is required",
      validationRule: { required: true, type: "string" },
    },
    TicketSource: {
      value: "Web portal",
      isValid: true,
      errorMsg: "This field is required",
      validationRule: { required: false, type: "string" },
    },
    Status: {
      // value: isTicketManager || isITOwner ? "" : "Open",
      // value: "Open",
      value: isTicketManager
        ? "In Progress"
        : openNewTicketSlide?.data?.Status === "Open" &&
          isTicketManager &&
          openNewTicketSlide?.data?.ITOwnerId === null &&
          openNewTicketSlide?.type === "update"
        ? "In Progress"
        : "Open",
      isValid: true,
      errorMsg: "This field is required",
      validationRule: {
        required: isTicketManager || isITOwner,
        type: "string",
      },
    },
    RepeatedTicket: {
      value: false,
      isValid: true,
      errorMsg: "This field is required",
      validationRule: { required: false, type: "boolean" },
    },
    RepeatedTicketSourceId: {
      value: null,
      isValid: true,
      errorMsg: "This field is required",
      validationRule: { required: false, type: "string" },
    },
    Rating: {
      value: null,
      isValid: true,
      errorMsg: "This field is required",
      validationRule: { required: false, type: "number" },
    },
    TicketClosedOn: {
      value: null,
      isValid: true,
      errorMsg: "This field is required",
      validationRule: { required: false, type: "date" },
    },
    TicketRepeatedOn: {
      value: null,
      isValid: true,
      errorMsg: "This field is required",
      validationRule: { required: false, type: "date" },
    },
  };
};

export const initialRecurrenceFormData = {
  StartDate: {
    value: "",
    isValid: true,
    errorMsg: "Start date is required",
    validationRule: { required: true, type: "string" },
  },
  EndDate: {
    value: "",
    isValid: true,
    errorMsg: "End date is required",
    validationRule: { required: true, type: "string" },
  },
  Frequency: {
    value: "",
    isValid: true,
    errorMsg: "Frequency is required",
    validationRule: { required: true, type: "string" },
  },
  DayOfWeek: {
    value: "",
    isValid: true,
    errorMsg: "Day of week is required",
    validationRule: { required: true, type: "string" },
  },
};

export const priorityLevelIntimations: any = {
  Standard: null,
  "Low Priority": "Resolution within 3-5 business days.",
  "Medium Priority": "Resolution within 48 hours.",
  "High Priority":
    "Same-day resolution. (Please only select high priority if necessary. IT may adjust priority based on other business objectives.)",
  "Critical/Impacting Multiple People":
    "Selecting this priority will alert multiple IT personnel and senior managers for immediate resolution. Use this for business-critical issues (e.g., Vista or Internet is down).",
};
