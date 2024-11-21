/* eslint-disable no-debugger */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Drawer } from "@mui/material";
import DefaultButton from "../../../../components/common/Buttons/DefaultButton";
import DataTable from "../../../../components/common/DataTable/DataTable";
import PageHeader from "../../../../components/common/PageHeader/PageHeader";
// images
const reopenTicket: any = require("../../../../assets/images/svg/reopenTicket.svg");
import EditIcon from "@mui/icons-material/Edit";
const infoRed: any = require("../../../helpDesk/assets/images/svg/infoRed.svg");

import styles from "./MyTickets.module.scss";
import { useEffect, useMemo, useState } from "react";
import { Add, AttachFile, OpenInNew, RestartAlt } from "@mui/icons-material";
import CustomInput from "../../../../components/common/CustomInputFields/CustomInput";
import {
  currentRoleBasedDataUtil,
  downloadFiles,
  filterTicketsByCategory,
  filterTicketsByPriority,
  filterTicketsBySearch,
  formatTicketData,
  // filterTicketsByTimePeriod,
  generateTicketNumber,
  getCurrentRoleForTicketsRoute,
  getLastTicketNumber,
  getTicketsByKeyValue,
  // sortByCreatedDate,
  sortTickets,
  ticketsFilter,
  validateField,
} from "../../../../utils/commonUtils";
import CustomPeoplePicker from "../../../../components/common/CustomInputFields/CustomPeoplePicker";
import CustomDropDown from "../../../../components/common/CustomInputFields/CustomDropDown";
// import CustomFileUpload from "../../../../components/common/CustomInputFields/CustomFileUpload";
import { useDispatch, useSelector } from "react-redux";
import { getAllTickets } from "../../../../services/HelpDeskMainServices/dashboardServices";
import InfoCard from "../../components/InfoCard/InfoCard";
import { toast } from "react-toastify";
import {
  TicketCategories,
  TicketPriority,
  TicketStatus,
} from "../../../../constants/HelpDeskTicket";
import { ToastContainer } from "react-toastify";
import {
  addNewTicket,
  updateTicket,
} from "../../../../services/HelpDeskMainServices/ticketServices";
import { Avatar } from "primereact/avatar";
import StatusPill from "../../../../components/helpDesk/StatusPill/StatusPill";
import FloatingLabelTextarea from "../../../../components/common/CustomInputFields/CustomTextArea";
import { useLocation, useNavigate } from "react-router-dom";
import { togglePopupVisibility } from "../../../../utils/popupUtils";
import Popup from "../../../../components/common/Popups/Popup";
import dayjs from "dayjs";
import { getAttachmentofTicket } from "../../../../services/HelpDeskMainServices/ticketViewServices";
import CustomMultipleFileUpload from "../../../../components/common/CustomInputFields/CustomMultipleFileUpload";
import { mapRowDataToFormData } from "../../../../utils/helpdeskUtils";
import { IinitialPopupLoaders } from "../../../../interface/interface";
// import CustomDateInput from "../../../../components/common/CustomInputFields/CustomDateInput";
// Import SVGs
const myTickets: any = require("../../assets/images/svg/myTickets.svg");
const openTickets: any = require("../../assets/images/svg/openTickets.svg");
const closedTickets: any = require("../../assets/images/svg/closedTickets.svg");
const ticketsCreatedThisWeek: any = require("../../assets/images/svg/ticketsCreatedThisWeek.svg");
const ticketsOnHold: any = require("../../assets/images/svg/ticketsOnHold.svg");
const fileIcon: any = require("../../assets/images/svg/fileIcon.svg");

const MyTickets = (): JSX.Element => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const [openNewTicketSlide, setOpenNewTicketSlide] = useState<{
    open: boolean;
    type: "view" | "add" | "update";
    data?: any;
  }>({
    open: false,
    type: "add",
    data: [],
  });

  const [recurrenceDetails, setRecurrenceDetails] = useState({
    isRecurrence: false,
    StartDate: "",
    EndDate: "",
    Frequency: "",
    TicketDetails: "",
  });
  console.log("recurrenceDetails: ", recurrenceDetails);
  console.log("setRecurrenceDetails: ", setRecurrenceDetails);

  const initialPopupController: IinitialPopupLoaders[] = [
    {
      open: false,
      popupTitle: "Confirmation",
      popupWidth: "450px",
      // popupWidth: "650px",
      popupType: "custom",
      defaultCloseBtn: false,
      // confirmationTitle: "Are you sure want to repeat this ticket?",
      popupData: [],
      isLoading: {
        inprogress: false,
        error: false,
        success: false,
      },
      messages: {
        success: "News Deleted successfully!",
        error: "Something went wrong!",
        successDescription: "The new news 'ABC' has been Deleted successfully.",
        errorDescription:
          "An error occured while Deleting news, please try again later.",
        inprogress: "Deleting new news, please wait...",
      },
    },
  ];

  const [popupController, setPopupController] = useState(
    initialPopupController
  );

  const currentUserDetails = useSelector(
    (state: any) => state.MainSPContext.currentUserDetails
  );

  const isTicketManager: boolean =
    currentUserDetails?.role === "HelpDesk_Ticket_Managers";
  // || currentUserDetails?.role === "Super Admin";

  const isITOwner: boolean = currentUserDetails?.role === "HelpDesk_IT_Owners";
  // || currentUserDetails?.role === "Super Admin";

  const HelpDeskTicktesData: any = useSelector(
    (state: any) => state.HelpDeskTicktesData.value
  );
  console.log("HelpDeskTicktesData: ", HelpDeskTicktesData);

  const currentRole: string = getCurrentRoleForTicketsRoute(currentUserDetails);

  const currentRoleBasedData = currentRoleBasedDataUtil(
    currentUserDetails,
    HelpDeskTicktesData,
    `${currentRole}${location.pathname}`
  );

  const initialData = {
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

  const [formData, setFormData] = useState<any>(initialData);

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [submitClicked, setSubmitClicked] = useState(false);

  const popupActions: any = [
    [
      {
        text: "No",
        btnType: "darkGreyVariant",
        disabled: false,
        endIcon: false,
        startIcon: false,
        size: "large",
        onClick: () => {
          togglePopupVisibility(
            setPopupController,
            initialPopupController[0],
            0,
            "close"
          );
        },
      },
      {
        text: "Yes",
        btnType: "primaryGreen",
        endIcon: false,
        startIcon: false,
        size: "large",
        onClick: async () => {
          // await handleSubmit();
          togglePopupVisibility(
            setPopupController,
            initialPopupController[0],
            0,
            "close"
          );
          const currentRowData: any = popupController[0]?.popupData;

          const formDataAppended = isTicketManager
            ? {
                TicketNumber: {
                  value: currentRowData?.TicketNumber,
                },
                Status: {
                  value: currentRowData?.ITOwner?.ID ? "In Progress" : "Open",
                },
                RepeatedTicketSourceId: { value: currentRowData?.ID },
                RepeatedTicket: { value: true },
                TicketRepeatedOn: { value: dayjs(new Date()) },
                Category: { value: currentRowData?.Category },
                Priority: { value: currentRowData?.Priority },
                EmployeeNameId: { value: currentRowData?.EmployeeName?.ID },
                TicketSource: { value: currentRowData?.TicketSource },
                TicketDescription: { value: currentRowData?.TicketDescription },
                TicketManagerId: {
                  value: currentRowData?.TicketManagerId
                    ? currentRowData?.TicketManager?.ID
                    : null,
                },
                ITOwnerId: {
                  value: currentRowData?.ITOwnerId
                    ? currentRowData?.ITOwner?.ID
                    : null,
                },
              }
            : {
                TicketNumber: {
                  value: currentRowData?.TicketNumber,
                },
                Status: { value: "Open" },
                RepeatedTicketSourceId: { value: currentRowData?.ID },
                RepeatedTicket: { value: true },
                TicketRepeatedOn: { value: dayjs(new Date()) },
                Category: { value: currentRowData?.Category },
                Priority: { value: currentRowData?.Priority },
                EmployeeNameId: { value: currentRowData?.EmployeeName?.ID },
                TicketSource: { value: currentRowData?.TicketSource },
                TicketDescription: { value: currentRowData?.TicketDescription },
                TicketManagerId: {
                  value: null,
                },
                ITOwnerId: {
                  value: null,
                },
              };

          console.log("formDataAppended: ", formDataAppended);

          // await Promise.all([
          // ])
          await addNewTicket(formDataAppended, ["Attachments"], true)
            .then(async (res: any) => {
              // navigate(`${currentRole}/all_tickets`);
              await Promise.all([getAllTickets(dispatch)]);
            })
            .catch((err: any) => {
              console.log("err: ", err);
            });
        },
      },
    ],
  ];

  const popupInputs: any = [
    <div key={1} className={styles.recurrenceWrapper}>
      <p className={styles.repeatQues}>
        Are you sure want to repeat this ticket &quot;
        {popupController[0]?.popupData?.TicketNumber}&quot;?
      </p>
      {/* <div className={styles.recurrenceBtn}>
        <p>Set recurrence</p>
        <Switch
          sx={{
            color: "#2d4b51",
          }}
        />
      </div>

      <div className={styles.recurrenceOptions}>
        <span className={styles.recurrenceLabel}>
          Recurrence details ({popupController[0]?.popupData?.TicketNumber})
        </span>
        <div className={styles.r1}>
          <CustomDateInput
            maxWidth="50%"
            value={""}
            disablePast
            label="Start date"
            hightLightInput
          />
          <CustomDateInput
            maxWidth="50%"
            value={""}
            disablePast
            label="End date"
            hightLightInput
          />
        </div>

        <div className={styles.r1}>
          <CustomDropDown
            value={""}
            placeholder="Select frequency"
            options={TicketRecurrenceFrequency}
            highlightDropdown
            width={"50%"}
          />
          <div className={styles.nextTicketIntimation}>
            <label>Next ticket on</label>
            <span>20/12/2024</span>
          </div>
        </div>
      </div> */}
    </div>,
  ];

  const [dataGridProps, setDataGridProps] = useState<{
    data: any[];
    sortedBy: "Old to new" | "New to old";
    sortedByOptions: ["Old to new", "New to old"];
  }>({
    data: [],
    sortedBy: "New to old",
    sortedByOptions: ["Old to new", "New to old"],
  });

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedCategory, setSelectedCategory] = useState<any>("");
  const [selectedPriority, setSelectedPriority] = useState<any>("");

  const columns = [
    {
      sortable: true,
      field: "ticket_number",
      headerName: "Ticket Number",
      width: 170,
      renderCell: (params: any) => {
        return params?.value ? (
          <span
            className={styles.clickableLink}
            onClick={() => {
              navigate(
                `${currentRole}/all_tickets/${params?.row?.ticket_number}/view_ticket`,
                {
                  state: params?.row,
                }
              );
            }}
          >
            {params?.value}
          </span>
        ) : (
          ""
        );
      },
    },
    {
      sortable: false,
      field: "IT_owner",
      headerName: "IT/Business Owner",
      width: 300,
      renderCell: (params: any) => {
        return (
          <>
            {params?.value ? (
              <>
                <Avatar
                  image={`/_layouts/15/userphoto.aspx?size=S&username=${params?.value?.EMail}`}
                  shape="circle"
                  size="normal"
                  style={{
                    margin: "0 !important",
                    border: "1px solid #adadad70",
                    width: "23px",
                    height: "23px",
                    marginRight: "10px",
                  }}
                />
                <span
                  title={params?.value?.Title}
                  className={styles.userNamePill}
                >
                  {params?.value?.Title}
                </span>
              </>
            ) : (
              <StatusPill size="SM" status="Unassigned" />
            )}
          </>
        );
      },
    },
    {
      sortable: false,
      field: "category",
      headerName: "Category",
      width: 150,
    },
    {
      sortable: false,
      field: "priority",
      headerName: "Priority",
      width: 150,
    },
    {
      sortable: false,
      field: "status",
      headerName: "Status",
      maxWidth: 120,
      renderCell: (params: any) =>
        params?.value ? <StatusPill size="SM" status={params?.value} /> : "-",
    },
    {
      sortable: false,
      field: "attachments",
      headerName: "Attachment",
      maxWidth: 120,
      renderCell: (params: any) => (
        <span
          style={{
            width: "80%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={async () => {
            console.log("params: ", params);
            const files: any = await getAttachmentofTicket(params?.row?.id);
            console.log("files: ", files);
            const mappedFiles: any = files?.map((item: any) => {
              return {
                name: item?.FileName,
                content: `${window.location.origin}${item?.ServerRelativeUrl}?web=1`,
              };
            });
            console.log("mappedFiles: ", mappedFiles);
            await downloadFiles(
              `${params?.row?.ticket_number} - Attachments`,
              mappedFiles
            );
            if (mappedFiles?.length !== 0) {
              toast.success("Attachment downloaded!", {
                position: "top-center",
                autoClose: 3500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: false,
              });
            } else {
              toast.warning("No Attachments found!", {
                position: "top-center",
                autoClose: 3500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: false,
              });
            }
          }}
        >
          <AttachFile
            sx={{
              color: "#0a3622",
              fontSize: "18px",
              cursor: "pointer",
              transform: "rotate(40deg)",
            }}
          />
        </span>
      ),
    },
    {
      field: "actions",
      sortable: false,
      headerName: "Actions",
      width: 160,
      renderCell: (params: any) => (
        <div className={styles.actionButtons}>
          {!`${currentRole}${location.pathname}`?.includes("mentions") ? (
            <>
              <button
                title="Repeat this ticket"
                onClick={() => {
                  const ticketNumber = params?.row?.ticket_number;
                  const currentRowData: any =
                    HelpDeskTicktesData?.AllData?.filter(
                      (item: any) => item?.TicketNumber === ticketNumber
                    )?.[0];
                  togglePopupVisibility(
                    setPopupController,
                    initialPopupController[0],
                    0,
                    "open",
                    "",
                    currentRowData,
                    `Are you sure want to repeat this ticket "${ticketNumber}" ?`
                  );
                }}
                className={styles.reopenTicket}
              >
                <img src={reopenTicket} />
              </button>
              <button
                title="Edit this ticket"
                onClick={async () => {
                  const ticketNumber = params?.row?.ticket_number;
                  const currentRowData: any =
                    HelpDeskTicktesData?.AllData?.filter(
                      (item: any) => item?.TicketNumber === ticketNumber
                    )?.[0];

                  const currentAttachment = await getAttachmentofTicket(
                    currentRowData?.ID
                  );

                  setLoadingSubmit(false);
                  setSubmitClicked(false);
                  setOpenNewTicketSlide({
                    open: true,
                    type: "update",
                    data: currentRowData,
                  });

                  setFormData((prev: any) =>
                    mapRowDataToFormData(
                      currentRowData,
                      prev,
                      isTicketManager,
                      currentUserDetails,
                      isITOwner
                    )
                  );

                  setFormData((prev: any) => ({
                    ...prev,
                    Attachment: {
                      ...prev?.Attachment,
                      value: [
                        ...currentAttachment?.map((attachment: any) => ({
                          ...attachment,
                          name: attachment?.FileName,
                        })),
                      ],
                    },
                  }));

                  // handleView(params);
                }}
                className={styles.reopenTicket}
              >
                <EditIcon
                  sx={{
                    color: "#2b4d51",
                    fontSize: "16px",
                  }}
                />
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                navigate(
                  `${currentRole}/all_tickets/${params?.row?.ticket_number}/view_ticket`,
                  {
                    state: params?.row,
                  }
                );
              }}
              className={styles.reopenTicket}
            >
              <OpenInNew
                sx={{
                  fontSize: "18px",
                  color: "#0a3622",
                }}
              />
            </button>
          )}
        </div>
      ),
    },
  ];

  const priorityLevelIntimations: any = {
    Standard: null,
    "Low Priority": "Resolution within 3-5 business days.",
    "Medium Priority": "Resolution within 48 hours.",
    "High Priority":
      "Same-day resolution. (Please only select high priority if necessary. IT may adjust priority based on other business objectives.)",
    "Critical/Impacting Multiple People":
      "Selecting this priority will alert multiple IT personnel and senior managers for immediate resolution. Use this for business-critical issues (e.g., Vista or Internet is down).",
  };

  const handleInputChange = (
    field: string,
    value: any,
    isValid: boolean,
    errorMsg: string = ""
  ): void => {
    if (
      Object.keys(formData)
        .filter((key) => formData[key]?.validationRule?.required)
        .every((key) => formData[key].isValid)
    ) {
      setLoadingSubmit(false);
    }

    setFormData((prevData: any) => ({
      ...prevData,
      [field]: {
        ...prevData[field],
        value: value,
        isValid,
        errorMsg: isValid ? "" : errorMsg,
      },
    }));
  };

  const handleSubmit = async (): Promise<any> => {
    let hasErrors = false;
    if (
      !Object.keys(formData)
        .filter((key) => formData[key]?.validationRule?.required)
        .every((key) => formData[key].isValid)
    ) {
      setLoadingSubmit(true);
    }
    // Validate each field and update the state with error messages
    const updatedFormData = Object.keys(formData).reduce((acc, key) => {
      const fieldData = formData[key];
      const { isValid, errorMsg } = validateField(
        key,
        fieldData?.value,
        fieldData?.validationRule
      );

      if (!isValid) {
        hasErrors = true;
      }

      return {
        ...acc,
        [key]: {
          ...fieldData,
          isValid,
          errorMsg,
        },
      };
    }, {} as typeof formData);

    setFormData(updatedFormData);
    console.log("hasErrors: ", hasErrors);
    if (!hasErrors) {
      console.log("formData: ", formData);
      setLoadingSubmit(true);
      setSubmitClicked(true);
      debugger;
      console.log("loadingSubmit: ", loadingSubmit);
      if (openNewTicketSlide.type === "add") {
        await Promise.all([addNewTicket(formData, ["Attachment"])])
          .then(async (res: any) => {
            await getAllTickets(dispatch);
            navigate(location.pathname);
            ticketsFilter(
              `${currentRole}${location.pathname}`,
              HelpDeskTicktesData,
              currentUserDetails,
              dispatch
            );
            console.log("location.pathname: ", location.pathname);
            setFormData(initialData);
            setOpenNewTicketSlide((prev: any) => ({
              ...prev,
              open: false,
              type: "add",
            }));
          })
          ?.catch((err: any) => {
            console.log("err: ", err);
          });
      } else {
        await Promise.all([
          updateTicket(openNewTicketSlide?.data?.ID, formData, ["Attachment"]),
        ])
          .then(async (res: any) => {
            await getAllTickets(dispatch);
            navigate(`${currentRole}/all_tickets`);
            setFormData(initialData);
            setOpenNewTicketSlide((prev: any) => ({
              ...prev,
              open: false,
              type: "add",
            }));
          })
          ?.catch((err: any) => {
            console.log("err: ", err);
          });
      }
    } else {
      toast.warning("Please fill out all fields!", {
        position: "top-center",
        autoClose: 3500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
      });
      setLoadingSubmit(true);
    }
  };

  // Info cards array
  const infoCards: any[] = [
    {
      cardName: "My tickets",
      cardImg: myTickets,
      cardValues: currentRoleBasedData?.data?.length || 0,
      onclick: () => {
        navigate(`${currentRole}/all_tickets`);
      },
    },
    {
      cardName: "My open",
      cardImg: openTickets,
      cardValues:
        getTicketsByKeyValue(currentRoleBasedData?.data, "Status", "Open")
          ?.length || 0,
      onclick: () => {
        navigate(`${currentRole}/tickets/status/open`);
      },
    },
    {
      cardName: "My closed",
      cardImg: closedTickets,
      cardValues:
        getTicketsByKeyValue(currentRoleBasedData?.data, "Status", "Closed")
          ?.length || 0,
      onclick: () => {
        navigate(`${currentRole}/tickets/status/closed`);
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
    {
      cardName: "Tickets in progress",
      cardImg: ticketsCreatedThisWeek,
      cardValues:
        getTicketsByKeyValue(
          currentRoleBasedData?.data,
          "Status",
          "In Progress"
        )?.length || 0,
      onclick: () => {
        navigate(`${currentRole}/tickets/status/inprogress`);
      },
    },
  ];

  // Apply filters and sorting
  const filteredData = useMemo(() => {
    let formattedData = formatTicketData(currentRoleBasedData?.data || []);

    // Apply global search, category, and priority filters
    formattedData = filterTicketsBySearch(formattedData, searchTerm);
    formattedData = filterTicketsByCategory(formattedData, selectedCategory);
    formattedData = filterTicketsByPriority(formattedData, selectedPriority);

    // Sort by priority and date based on sortBy state
    return sortTickets(formattedData, dataGridProps.sortedBy, true);
  }, [
    searchTerm,
    selectedCategory,
    selectedPriority,
    dataGridProps.sortedBy,
    currentRoleBasedData?.data?.length,
  ]);

  // Update dataGridProps when filtered data changes
  useEffect(() => {
    setDataGridProps((prev) => ({
      ...prev,
      data: filteredData,
    }));
  }, [filteredData]);

  // Handle filtering and navigation on path change
  useEffect(() => {
    ticketsFilter(
      `${currentRole}${location.pathname}`,
      HelpDeskTicktesData,
      currentUserDetails,
      dispatch
    );
    // navigate(location.pathname, { state: null });
  }, [location.pathname]);

  useEffect(() => {
    if (
      Object.keys(formData)
        .filter((key) => formData[key]?.validationRule?.required)
        .every((key) => formData[key].isValid)
    ) {
      setLoadingSubmit(false);
    }

    if (submitClicked) {
      setLoadingSubmit(true);
    }
  }, [formData]);

  return (
    <div className={styles.mytickets}>
      <div className={styles.mytickets_header}>
        <div className={styles.leftHeader}>
          <PageHeader title={"All tickets"} noBackBtn />
          {HelpDeskTicktesData?.ticketType?.toLowerCase() !== "all tickets" &&
            HelpDeskTicktesData?.ticketType?.toLowerCase() !== "my tickets" && (
              <span className={styles.pillText}>
                ({HelpDeskTicktesData?.ticketType})
              </span>
            )}
        </div>

        <div className={styles.topLevelFilter}>
          <CustomDropDown
            floatingLabel={false}
            size="SM"
            highlightDropdown
            width={"150px"}
            value={dataGridProps.sortedBy}
            options={dataGridProps?.sortedByOptions}
            noErrorMsg
            placeholder="Sort by"
            onChange={(value) => {
              setDataGridProps((prev: any) => ({
                ...prev,
                sortedBy: value,
              }));
            }}
          />
          <input
            onChange={(e: any) => {
              setSearchTerm(e?.target?.value);
            }}
            className={"basicSMInput"}
            style={{
              width: "150px",
            }}
            value={searchTerm}
            placeholder="Search"
          />
          <CustomDropDown
            floatingLabel={false}
            size="SM"
            highlightDropdown
            width={"150px"}
            value={selectedCategory}
            options={TicketCategories}
            noErrorMsg
            placeholder="Category"
            onChange={(value) => {
              setSelectedCategory(value);
            }}
          />
          <CustomDropDown
            floatingLabel={false}
            size="SM"
            highlightDropdown
            width={"150px"}
            value={selectedPriority}
            options={TicketPriority}
            noErrorMsg
            placeholder="Priority"
            onChange={(value) => {
              setSelectedPriority(value);
            }}
          />

          {(searchTerm || selectedPriority || selectedCategory) && (
            <div className="slideUpFade">
              <DefaultButton
                btnType="primaryGreen"
                onlyIcon
                text={<RestartAlt />}
                onClick={async () => {
                  // await getAllTickets(dispatch);
                  setSearchTerm("");
                  setSelectedCategory("");
                  setSelectedPriority("");
                }}
              />
            </div>
          )}

          <DefaultButton
            btnType="primaryGreen"
            text={"New ticket"}
            onClick={async () => {
              // await getAllTickets(dispatch);
              setLoadingSubmit(false);
              setSubmitClicked(false);
              setOpenNewTicketSlide({
                open: true,
                type: "add",
              });
              // const lastTicketID: number = Math.max(
              //   0,
              //   ...(HelpDeskTicktesData?.data ?? [])
              //     ?.map((item: any) => item?.ID)
              //     ?.filter(
              //       (id: number | undefined) => id !== undefined && id !== null
              //     )
              // );
              const lastTicketID = getLastTicketNumber(
                HelpDeskTicktesData?.AllData
              );

              const newTicketNumber = generateTicketNumber(lastTicketID + 1);

              setFormData((prev: any) => ({
                ...prev,
                EmployeeNameId: {
                  ...prev.EmployeeNameId,
                  value: currentUserDetails?.id
                    ? {
                        id: currentUserDetails?.id,
                        email: currentUserDetails?.email,
                        name: currentUserDetails?.userName,
                      }
                    : "",
                },
                TicketNumber: {
                  ...prev.TicketNumber,
                  value: newTicketNumber,
                },
              }));
            }}
            startIcon={<Add />}
          />
        </div>
      </div>

      {currentRoleBasedData?.role === "user" && (
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
      )}

      <DataTable
        rows={dataGridProps?.data ?? []}
        // rows={dataGridProps?.sortedBy==="Asc (Old)"? currentRoleBasedData?.data:dataGridProps?.sortedBy==="Desc (Latest)"?DescData:[]}
        columns={columns}
        emptyMessage="No tickets found!"
        isLoading={HelpDeskTicktesData?.isLoading}
        pageSize={10}
        checkboxSelection={false}
      />

      {/* new ticket slide */}
      <Drawer
        anchor={"right"}
        open={openNewTicketSlide.open}
        onClose={() => {
          setOpenNewTicketSlide({
            open: false,
            type: "add",
          });
          setFormData(initialData);
        }}
        sx={{
          "& .MuiPaper-root.MuiPaper-elevation": {
            borderTopLeftRadius: "10px",
            borderBottomLeftRadius: "10px",
            backgroundColor: "#F7F7F7",
          },
        }}
      >
        <div className={styles.newTicketSlide}>
          <>
            <PageHeader
              title={
                openNewTicketSlide?.type === "add"
                  ? "New ticket"
                  : "Update ticket details"
              }
              headerClick={() => {
                setOpenNewTicketSlide({ open: false, type: "add" });
              }}
              centered
              underlined
            />
            <div className={styles.inputs}>
              <>
                <CustomInput
                  value={formData?.TicketNumber?.value}
                  // disabled
                  readOnly
                  placeholder="Ticket number"
                  isValid={formData?.TicketNumber?.isValid}
                  errorMsg={formData?.TicketNumber?.errorMsg}
                  onChange={(e) => {
                    const value = e;
                    const { isValid, errorMsg } = validateField(
                      "TicketNumber",
                      value,
                      formData?.TicketNumber?.validationRule
                    );
                    handleInputChange("TicketNumber", value, isValid, errorMsg);
                  }}
                />

                <CustomPeoplePicker
                  labelText="Employee Name"
                  isValid={formData?.EmployeeNameId?.isValid}
                  errorMsg={formData?.EmployeeNameId?.errorMsg}
                  noErrorMsg
                  readOnly
                  selectedItem={[formData?.EmployeeNameId?.value?.email]}
                  onChange={(item: any) => {
                    const value = item[0];
                    console.log("value: ", value);
                    const { isValid, errorMsg } = validateField(
                      "EmployeeNameId",
                      value,
                      formData?.EmployeeNameId?.validationRule
                    );
                    handleInputChange(
                      "EmployeeNameId",
                      value,
                      isValid,
                      errorMsg
                    );
                  }}
                />

                {isTicketManager && (
                  <CustomPeoplePicker
                    labelText="IT Owner"
                    groupName={"HelpDesk_IT_Owners"}
                    isValid={formData?.ITOwnerId?.isValid}
                    errorMsg={formData?.ITOwnerId?.errorMsg}
                    selectedItem={[formData?.ITOwnerId?.value?.email]}
                    onChange={(item: any) => {
                      const value = item[0];
                      console.log("value: ", value);
                      const { isValid, errorMsg } = validateField(
                        "ITOwnerId",
                        value,
                        formData?.ITOwnerId?.validationRule
                      );
                      handleInputChange("ITOwnerId", value, isValid, errorMsg);
                    }}
                  />
                )}

                <CustomDropDown
                  value={formData?.Category?.value}
                  options={TicketCategories}
                  placeholder="Category"
                  isValid={formData?.Category?.isValid}
                  errorMsg={formData?.Category?.errorMsg}
                  onChange={(value) => {
                    const { isValid, errorMsg } = validateField(
                      "Category",
                      value,
                      formData?.Category?.validationRule
                    );
                    handleInputChange("Category", value, isValid, errorMsg);
                  }}
                />

                <div className={styles.priorityWrapper}>
                  <div className={styles.priorityInputWrapper}>
                    <CustomDropDown
                      value={formData?.Priority?.value}
                      options={TicketPriority}
                      placeholder="Priority"
                      width={"100%"}
                      isValid={formData?.Priority?.isValid}
                      errorMsg={formData?.Priority?.errorMsg}
                      onChange={(value) => {
                        const { isValid, errorMsg } = validateField(
                          "Priority",
                          value,
                          formData?.Priority?.validationRule
                        );
                        handleInputChange("Priority", value, isValid, errorMsg);
                      }}
                    />
                    {priorityLevelIntimations[formData?.Priority?.value] && (
                      <img src={infoRed} />
                    )}
                  </div>
                  {priorityLevelIntimations[formData?.Priority?.value] ? (
                    <span className={styles.priorityIntimation}>
                      Note:{" "}
                      {priorityLevelIntimations[formData?.Priority?.value] ??
                        ""}
                    </span>
                  ) : (
                    ""
                  )}
                </div>

                {(isTicketManager || isITOwner) &&
                  openNewTicketSlide?.type === "update" &&
                  openNewTicketSlide?.data?.ITOwnerId !== null && (
                    <CustomDropDown
                      disabled={
                        openNewTicketSlide?.data?.Status === "Closed" &&
                        openNewTicketSlide?.type === "update"
                      }
                      value={formData?.Status?.value}
                      options={
                        openNewTicketSlide?.data?.Status === "In Progress"
                          ? TicketStatus.filter((item: any) => item !== "Open")
                          : TicketStatus
                      }
                      placeholder="Status"
                      isValid={formData?.Status?.isValid}
                      errorMsg={formData?.Status?.errorMsg}
                      onChange={(value) => {
                        const { isValid, errorMsg } = validateField(
                          "Status",
                          value,
                          formData?.Status?.validationRule
                        );
                        handleInputChange("Status", value, isValid, errorMsg);
                      }}
                    />
                  )}

                <FloatingLabelTextarea
                  value={formData.TicketDescription.value}
                  placeholder="Description"
                  rows={5}
                  isValid={formData.TicketDescription.isValid}
                  errorMsg={formData.TicketDescription.errorMsg}
                  readOnly={currentUserDetails?.role !== "user"}
                  onChange={(e: any) => {
                    const value = e.trimStart();
                    const { isValid, errorMsg } = validateField(
                      "TicketDescription",
                      value,
                      formData.TicketDescription.validationRule
                    );
                    handleInputChange(
                      "TicketDescription",
                      value,
                      isValid,
                      errorMsg
                    );
                  }}
                />

                {openNewTicketSlide?.type === "add" ||
                (openNewTicketSlide?.type === "update" &&
                  openNewTicketSlide?.data?.EmployeeName?.EMail ===
                    currentUserDetails?.email) ? (
                  // <CustomFileUpload
                  //   accept="image/png,image/svg"
                  //   value={formData?.Attachment?.value?.name}
                  //   onFileSelect={(file) => {
                  //     console.log("file: ", file);
                  //     const { isValid, errorMsg } = validateField(
                  //       "Attachment",
                  //       file ? file.name : "",
                  //       formData?.Attachment
                  //     );
                  //     handleInputChange("Attachment", file, isValid, errorMsg);
                  //   }}
                  //   placeholder="Attachment"
                  //   isValid={formData?.Attachment?.isValid}
                  //   errMsg={formData?.Attachment?.errorMsg}
                  // />
                  <CustomMultipleFileUpload
                    accept="image/svg, image/png, image/jpg"
                    placeholder="Click to upload attachment(s)"
                    multiple
                    customFileNameWidth={"370px"}
                    // value={formData?.Attachment?.value?.name || null}
                    value={formData?.Attachment?.value ?? []}
                    onFileSelect={(file) => {
                      console.log("file: ", file);
                      const { isValid, errorMsg } = validateField(
                        "Attachment",
                        file ? file?.[0]?.name : "",
                        formData?.Attachment
                      );
                      handleInputChange("Attachment", file, isValid, errorMsg);
                    }}
                    isValid={formData.Attachment.isValid}
                    errMsg={formData.Attachment.errorMsg}
                  />
                ) : formData?.Attachment?.value?.length > 0 ? (
                  <>
                    <p>Attachments ({formData?.Attachment?.value?.length})</p>
                    <div className={styles.attachmentsWrapper}>
                      {formData?.Attachment?.value?.map(
                        (item: any, idx: number) => (
                          <a
                            key={idx}
                            href={`${window.location.origin}${item?.ServerRelativeUrl}?web=1`}
                            download
                            className={styles.fileSource}
                            onClick={() => {
                              window.open(
                                `${window.location.origin}${item?.ServerRelativeUrl}?web=1`
                              );
                            }}
                          >
                            <div className={styles.fileName} title={item?.name}>
                              <img src={fileIcon} />
                              <span>{item?.name}</span>
                            </div>
                          </a>
                        )
                      )}
                    </div>
                  </>
                ) : (
                  <span className={styles.fileSource}>
                    <p>Attachment</p>
                    <div className={styles.fileName}>
                      <span>No attachment found.</span>
                    </div>
                  </span>
                )}
              </>
            </div>
          </>

          <div className={styles.actions}>
            <DefaultButton
              btnType="darkGreyVariant"
              text={"Cancel"}
              onClick={() => {
                setOpenNewTicketSlide({ open: false, type: "add" });
                setFormData(initialData);
              }}
            />
            <DefaultButton
              btnType="primaryGreen"
              text={"Submit"}
              disabled={loadingSubmit}
              onClick={handleSubmit}
            />
          </div>
        </div>
      </Drawer>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* popup */}
      {popupController?.map((popupData: any, index: number) => (
        <Popup
          popupCustomBgColor="#fff"
          key={index}
          isLoading={popupData?.isLoading}
          messages={popupData?.messages}
          // resetPopup={() => {
          // setPopupController((prev: any): any => {
          //    resetPopupController(prev, index, true);
          // });
          // }}
          PopupType={popupData.popupType}
          onHide={() => {
            togglePopupVisibility(
              setPopupController,
              initialPopupController[0],
              index,
              "close"
            );
            // resetFormData(formData, setFormData);
          }}
          popupTitle={
            popupData.popupType !== "confimation" && popupData.popupTitle
          }
          popupActions={popupActions[index]}
          visibility={popupData.open}
          content={popupInputs[index]}
          popupWidth={popupData.popupWidth}
          defaultCloseBtn={popupData.defaultCloseBtn || false}
          confirmationTitle={popupData?.confirmationTitle ?? ""}
          centerActionBtn
          popupHeight={index === 0 ? true : false}
          noActionBtn={true}
        />
      ))}
    </div>
  );
};

export default MyTickets;
