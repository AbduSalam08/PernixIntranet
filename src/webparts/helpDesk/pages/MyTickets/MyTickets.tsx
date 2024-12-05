/* eslint-disable no-debugger */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
// import { Drawer, Switch } from "@mui/material";
import DefaultButton from "../../../../components/common/Buttons/DefaultButton";
import DataTable from "../../../../components/common/DataTable/DataTable";
import PageHeader from "../../../../components/common/PageHeader/PageHeader";
// images
// const reopenTicket: any = require("../../../../assets/images/svg/reopenTicket.svg");
// const reopenTicketFilled: any = require("../../../../assets/images/svg/reopenTicketFilled.svg");
import EditIcon from "@mui/icons-material/Edit";
const infoRed: any = require("../../../helpDesk/assets/images/svg/infoRed.svg");
const fileIcon: any = require("../../assets/images/svg/fileIcon.svg");
import styles from "./MyTickets.module.scss";
import { useEffect, useMemo, useState } from "react";
import {
  Add,
  AttachFile,
  Loop,
  OpenInNew,
  RestartAlt,
} from "@mui/icons-material";
import {
  currentRoleBasedDataUtil,
  downloadFiles,
  filterTicketsByCategory,
  filterTicketsByPriority,
  filterTicketsBySearch,
  formatTicketData,
  generateTicketNumber,
  getCurrentRoleForTicketsRoute,
  getLastTicketNumber,
  getTicketsByKeyValue,
  sortTickets,
  ticketsFilter,
  validateField,
} from "../../../../utils/commonUtils";
import CustomDropDown from "../../../../components/common/CustomInputFields/CustomDropDown";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllTickets,
  getAllTicketsData2,
} from "../../../../services/HelpDeskMainServices/dashboardServices";
import InfoCard from "../../components/InfoCard/InfoCard";
import { toast } from "react-toastify";
import {
  initialData,
  initialRecurrenceFormData,
  priorityLevelIntimations,
  TicketCategories,
  TicketPriority,
  TicketRecurrenceFrequency,
  TicketStatus,
} from "../../../../constants/HelpDeskTicket";
import { ToastContainer } from "react-toastify";
import {
  addNewTicket,
  getRecurrenceConfigDetails,
  updateRecurrenceConfigOfTicket,
} from "../../../../services/HelpDeskMainServices/ticketServices";
import { Avatar } from "primereact/avatar";
import StatusPill from "../../../../components/helpDesk/StatusPill/StatusPill";
// import FloatingLabelTextarea from "../../../../components/common/CustomInputFields/CustomTextArea";
import { useLocation, useNavigate } from "react-router-dom";
import {
  togglePopupVisibility,
  updatePopupController,
} from "../../../../utils/popupUtils";
import Popup from "../../../../components/common/Popups/Popup";
import dayjs from "dayjs";
import { getAttachmentofTicket } from "../../../../services/HelpDeskMainServices/ticketViewServices";
import {
  calculateNextTicketDate,
  handleSubmit,
  mapRowDataToFormData,
  mapRowDataToRecurrenceFormData,
  validateRecurrenceForm,
} from "../../../../utils/helpdeskUtils";
import { IinitialPopupLoaders } from "../../../../interface/interface";
import CustomDateInput from "../../../../components/common/CustomInputFields/CustomDateInput";
import TicketForm from "../../components/TicketForm/TicketForm";
import WeekDaysSelector from "../../../../components/common/WeekDaysSelector/WeekDaysSelector";
// Import SVGs
const myTickets: any = require("../../assets/images/svg/myTickets.svg");
const openTickets: any = require("../../assets/images/svg/openTickets.svg");
const closedTickets: any = require("../../assets/images/svg/closedTickets.svg");
const ticketsCreatedThisWeek: any = require("../../assets/images/svg/ticketsCreatedThisWeek.svg");
const ticketsOnHold: any = require("../../assets/images/svg/ticketsOnHold.svg");

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

  const [recurrenceDetails, setRecurrenceDetails] = useState<any>(
    initialRecurrenceFormData
  );
  console.log("recurrenceDetails: ", recurrenceDetails);
  const [hasRecurrence, setHasRecurrence] = useState(false);

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
        success: "",
        error: "Something went wrong!",
        successDescription: "",
        errorDescription: "",
        inprogress: "",
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

  const isITOwner: boolean = currentUserDetails?.role === "HelpDesk_IT_Owners";

  const HelpDeskTicktesData: any = useSelector(
    (state: any) => state.HelpDeskTicktesData.value
  );

  const currentRole: string = getCurrentRoleForTicketsRoute(currentUserDetails);
  console.log("currentRole: ", currentRole);
  const isUser: boolean = currentRole?.includes("user");

  const currentRoleBasedData = currentRoleBasedDataUtil(
    currentUserDetails,
    HelpDeskTicktesData,
    `${currentRole}${location.pathname}`
  );

  const initialTicketsFormData = initialData(
    isTicketManager,
    isITOwner,
    currentUserDetails,
    openNewTicketSlide
  );

  const [formData, setFormData] = useState<any>(initialTicketsFormData);
  console.log("formData: ", formData);

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [submitClicked, setSubmitClicked] = useState(false);

  const nextTicketIntimationLocal = calculateNextTicketDate(
    recurrenceDetails?.StartDate?.value,
    dayjs().format("DD/MM/YYYY"),
    recurrenceDetails?.EndDate?.value,
    recurrenceDetails?.Frequency?.value
  );
  const [nextTicketIntimation, setNextTicketIntimation] = useState(
    nextTicketIntimationLocal
  );

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
          setHasRecurrence(false);
          setRecurrenceDetails(initialRecurrenceFormData);
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
        disabled:
          submitClicked || recurrenceDetails?.Frequency?.value?.trim() === "",
        onClick: async () => {
          const currentRowData: any = popupController[0]?.popupData;

          const query: "add" | "update" = popupController[0]?.popupData
            ?.RecurrenceConfigDetailsId
            ? "update"
            : "add";

          const ticketBaseDetails = {
            TicketNumber: currentRowData?.TicketNumber,
            Status: currentRowData?.ITOwner?.ID ? "In Progress" : "Open",
            // RepeatedTicketSourceId: currentRowData?.ID,
            // RepeatedTicket: true,
            // TicketRepeatedOn: dayjs(new Date()),
            Category: currentRowData?.Category,
            Priority: currentRowData?.Priority,
            EmployeeNameId: currentRowData?.EmployeeName?.ID,
            TicketSource: currentRowData?.TicketSource,
            TicketDescription: currentRowData?.TicketDescription,
            TicketManagerId: currentRowData?.TicketManagerId
              ? currentRowData?.TicketManager?.ID
              : null,
            ITOwnerId: currentRowData?.ITOwnerId
              ? currentRowData?.ITOwner?.ID
              : null,
          };

          const recurrenceID = currentRowData?.RecurrenceConfigDetailsId;
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
                TicketDescription: {
                  value: currentRowData?.TicketDescription,
                },
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
                TicketDescription: {
                  value: currentRowData?.TicketDescription,
                },
                TicketManagerId: {
                  value: null,
                },
                ITOwnerId: {
                  value: null,
                },
              };

          if (!isUser && !isITOwner) {
            if (
              !hasRecurrence &&
              recurrenceDetails?.Frequency?.value?.toLowerCase() ===
                "repeat once" &&
              recurrenceDetails?.Frequency?.value?.toLowerCase() !==
                "does not repeat"
            ) {
              await addNewTicket(formDataAppended, ["Attachments"], true)
                .then(async (res: any) => {
                  navigate(`${currentRole}/all_tickets`);
                  await getAllTickets(dispatch);
                })
                .catch((err: any) => {
                  console.log("err: ", err);
                });

              if (currentRowData?.RecurrenceConfigDetailsId) {
                await updateRecurrenceConfigOfTicket(
                  {
                    ...ticketBaseDetails,
                    NextTicketDate: dayjs(nextTicketIntimation?.date).toDate(),
                    isActive:
                      recurrenceDetails?.Frequency?.value.toLowerCase() !==
                      "repeat once",
                  },
                  currentRowData?.ID,
                  recurrenceID
                )
                  .then((res: any) => {
                    togglePopupVisibility(
                      setPopupController,
                      initialPopupController[0],
                      0,
                      "close"
                    );
                  })
                  .catch((err: any) => {
                    togglePopupVisibility(
                      setPopupController,
                      initialPopupController[0],
                      0,
                      "close"
                    );
                  });
                await getAllTickets(dispatch);
              } else {
                togglePopupVisibility(
                  setPopupController,
                  initialPopupController[0],
                  0,
                  "close"
                );
              }
            }
            if (
              !hasRecurrence &&
              recurrenceDetails?.Frequency?.value?.toLowerCase() !==
                "repeat once" &&
              recurrenceDetails?.Frequency?.value?.toLowerCase() ===
                "does not repeat"
            ) {
              if (currentRowData?.RecurrenceConfigDetailsId) {
                await updateRecurrenceConfigOfTicket(
                  {
                    ...ticketBaseDetails,
                    NextTicketDate: dayjs(nextTicketIntimation?.date).toDate(),
                    isActive:
                      recurrenceDetails?.Frequency?.value.toLowerCase() !==
                        "repeat once" &&
                      recurrenceDetails?.Frequency?.value.toLowerCase() !==
                        "does not repeat",
                  },
                  currentRowData?.ID,
                  recurrenceID
                )
                  .then((res: any) => {
                    togglePopupVisibility(
                      setPopupController,
                      initialPopupController[0],
                      0,
                      "close"
                    );
                  })
                  .catch((err: any) => {
                    togglePopupVisibility(
                      setPopupController,
                      initialPopupController[0],
                      0,
                      "close"
                    );
                  });
                await getAllTickets(dispatch);
              } else {
                togglePopupVisibility(
                  setPopupController,
                  initialPopupController[0],
                  0,
                  "close"
                );
              }
            }
            if (
              !nextTicketIntimation?.error &&
              recurrenceDetails?.Frequency?.value?.toLowerCase() !==
                "repeat once" &&
              recurrenceDetails?.Frequency?.value?.toLowerCase() !==
                "does not repeat"
            ) {
              validateRecurrenceForm(
                query,
                {
                  ...ticketBaseDetails,
                  NextTicketDate: dayjs(nextTicketIntimation?.date).toDate(),
                },
                {
                  ...recurrenceDetails,
                  TicketDetails: {
                    value: {
                      ID: currentRowData?.ID,
                    },
                    isValid: true,
                    errorMsg: "This field is required",
                    validationRule: { required: false, type: "string" },
                  },
                  IsActive: {
                    value: hasRecurrence,
                    isValid: true,
                    errorMsg: "This field is required",
                    validationRule: { required: false, type: "string" },
                  },
                },
                setRecurrenceDetails,
                popupController[0]?.popupData?.RecurrenceConfigDetailsId,
                setLoadingSubmit,
                setSubmitClicked,
                popupController,
                setPopupController,
                dispatch
              );
            }
          } else {
            await addNewTicket(formDataAppended, ["Attachments"], true)
              .then(async (res: any) => {
                navigate(`${currentRole}/all_tickets`);
                await getAllTickets(dispatch);
                togglePopupVisibility(
                  setPopupController,
                  initialPopupController[0],
                  0,
                  "close"
                );
              })
              .catch((err: any) => {
                console.log("err: ", err);
                togglePopupVisibility(
                  setPopupController,
                  initialPopupController[0],
                  0,
                  "close"
                );
              });
          }
        },
      },
    ],
  ];

  const handleInputChange = (
    field: string,
    value: any,
    isValid: boolean,
    errorMsg: string = "",
    setState?: any
  ): void => {
    if (
      Object.keys(formData)
        .filter((key) => formData[key]?.validationRule?.required)
        .every((key) => formData[key].isValid)
    ) {
      setLoadingSubmit(false);
    }
    if (setState) {
      setState?.((prevData: any) => ({
        ...prevData,
        [field]: {
          ...prevData[field],
          value: value,
          isValid,
          errorMsg: isValid ? "" : errorMsg,
        },
      }));
    } else {
      setFormData((prevData: any) => ({
        ...prevData,
        [field]: {
          ...prevData[field],
          value: value,
          isValid,
          errorMsg: isValid ? "" : errorMsg,
        },
      }));
    }
  };

  const popupInputs: any = [
    <div key={1} className={styles.recurrenceWrapper}>
      <p className={styles.repeatQues}>
        Are you sure want to repeat this ticket &quot;
        {popupController[0]?.popupData?.TicketNumber}&quot;?
      </p>
      {!isUser && !isITOwner && (
        <>
          <div className={styles.recurrenceBtn}>
            <CustomDropDown
              value={recurrenceDetails.Frequency?.value || ""}
              placeholder="Select frequency"
              disabled={isUser}
              options={
                popupController[0]?.popupData?.HasRecurrence
                  ? [
                      "Does not repeat",
                      "Repeat once",
                      ...TicketRecurrenceFrequency,
                    ]
                  : ["Repeat once", ...TicketRecurrenceFrequency]
              }
              highlightDropdown
              onChange={(e: any) => {
                const value = e;

                if (
                  value?.toLowerCase() === "repeat once" ||
                  value?.toLowerCase() === "does not repeat"
                ) {
                  setHasRecurrence(false);
                  setPopupController(
                    updatePopupController(popupController, 0, {
                      popupWidth: "450px",
                    })
                  );
                } else {
                  setHasRecurrence(true);
                  setPopupController(
                    updatePopupController(popupController, 0, {
                      popupWidth: "650px",
                    })
                  );
                }

                const { isValid, errorMsg } = validateField(
                  "Frequency",
                  value,
                  recurrenceDetails?.Frequency?.validationRule
                );
                handleInputChange(
                  "Frequency",
                  value,
                  isValid,
                  errorMsg,
                  setRecurrenceDetails
                );

                if (value?.toLowerCase() === "weekly") {
                  setRecurrenceDetails((prev: any) => ({
                    ...prev,
                    DayOfWeek: {
                      ...prev?.DayOfWeek,
                      validationRule: {
                        ...prev?.DayOfWeek?.validationRule,
                        required: true,
                      },
                    },
                  }));
                } else {
                  setRecurrenceDetails((prev: any) => ({
                    ...prev,
                    DayOfWeek: {
                      ...prev?.DayOfWeek,
                      validationRule: {
                        ...prev?.DayOfWeek?.validationRule,
                        required: false,
                      },
                    },
                  }));
                }
              }}
              // width="50%"
              isValid={recurrenceDetails.Frequency?.isValid}
              errorMsg={recurrenceDetails.Frequency?.errorMsg}
            />
          </div>

          <div
            className={styles.recurrenceOptions}
            style={{ maxHeight: hasRecurrence ? "500px" : "0" }}
          >
            <span className={styles.recurrenceLabel}>
              Recurrence details ({popupController[0]?.popupData?.TicketNumber})
            </span>

            <div className={styles.r1}>
              <CustomDateInput
                maxWidth="50%"
                value={recurrenceDetails.StartDate?.value || ""}
                disablePast
                label="Start date"
                hightLightInput
                onChange={(e: any) => {
                  const value = e;
                  console.log("value: ", value);
                  const { isValid, errorMsg } = validateField(
                    "StartDate",
                    value,
                    recurrenceDetails?.StartDate?.validationRule
                  );
                  handleInputChange(
                    "StartDate",
                    value,
                    isValid,
                    errorMsg,
                    setRecurrenceDetails
                  );
                }}
                error={!recurrenceDetails.StartDate?.isValid}
                errorMsg={recurrenceDetails.StartDate?.errorMsg}
              />
              <CustomDateInput
                maxWidth="50%"
                value={recurrenceDetails.EndDate?.value || ""}
                disablePast
                label="End date"
                hightLightInput
                onChange={(e: any) => {
                  const value = e;
                  console.log("value: ", value);
                  const { isValid, errorMsg } = validateField(
                    "EndDate",
                    value,
                    recurrenceDetails?.EndDate?.validationRule
                  );
                  handleInputChange(
                    "EndDate",
                    value,
                    isValid,
                    errorMsg,
                    setRecurrenceDetails
                  );
                }}
                error={!recurrenceDetails.EndDate?.isValid}
                errorMsg={recurrenceDetails.EndDate?.errorMsg}
              />
            </div>

            <div className={styles.r2}>
              <div
                className={styles.nextTicketIntimation}
                style={{
                  maxHeight:
                    recurrenceDetails?.Frequency?.value !== "Weekly"
                      ? "0px"
                      : "150px",
                  overflow:
                    recurrenceDetails?.Frequency?.value !== "Weekly"
                      ? "hidden"
                      : "visible",
                }}
              >
                <label>Select day</label>
                <WeekDaysSelector
                  multiSelect={false}
                  isValid={recurrenceDetails?.DayOfWeek?.isValid}
                  selectedValue={recurrenceDetails?.DayOfWeek?.value}
                  errorMsg={recurrenceDetails?.DayOfWeek?.errorMsg}
                  onChange={(value: any) => {
                    console.log("value: ", value);
                    const { isValid, errorMsg } = validateField(
                      "DayOfWeek",
                      value,
                      recurrenceDetails?.DayOfWeek?.validationRule
                    );
                    handleInputChange(
                      "DayOfWeek",
                      value,
                      isValid,
                      errorMsg,
                      setRecurrenceDetails
                    );
                  }}
                />
                {recurrenceDetails?.DayOfWeek?.value && (
                  <div className={styles.dayIntimationLabelWrap}>
                    <label>
                      This ticket occurs at every&nbsp;
                      {recurrenceDetails?.DayOfWeek?.value}
                      &nbsp;till&nbsp;
                      {dayjs(recurrenceDetails?.EndDate?.value)?.format(
                        "DD/MM/YYYY"
                      )}
                    </label>
                    {nextTicketIntimation?.error && (
                      <span
                        className={`${
                          nextTicketIntimation?.error
                            ? styles.badgeNextDateError
                            : ""
                        }`}
                      >
                        {nextTicketIntimation?.date || "N/A"}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {recurrenceDetails?.Frequency?.value?.toLowerCase() !==
                "weekly" && (
                <div className={styles.nextTicketIntimation}>
                  <label>Next ticket will repeat on</label>
                  <span
                    className={`${
                      nextTicketIntimation?.error
                        ? styles.badgeNextDateError
                        : ""
                    }`}
                  >
                    {nextTicketIntimation?.date || "N/A"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
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
  console.log("dataGridProps: ", dataGridProps);

  console.log("dataGridProps: ", dataGridProps);

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedCategory, setSelectedCategory] = useState<any>("");
  const [selectedPriority, setSelectedPriority] = useState<any>("");

  const checkIsRecurringTicket = (ticketNumber: string): boolean => {
    return HelpDeskTicktesData?.AllData?.filter((ticket: any) => {
      return ticket?.TicketNumber === ticketNumber;
    })[0]?.HasRecurrence;
  };

  const columns = [
    {
      sortable: true,
      field: "ticket_number",
      headerName: "Ticket Number",
      width: 170,
      renderCell: (params: any) => {
        return params?.value ? (
          <div
            className={styles.ticketNumberWrap}
            onClick={() => {
              navigate(
                `${currentRole}/all_tickets/${params?.row?.ticket_number}/view_ticket`,
                {
                  state: params?.row,
                }
              );
            }}
          >
            <span className={styles.clickableLink}>{params?.value}</span>
            {/* {checkIsRecurringTicket(params?.row?.ticket_number) && (
              <div className={styles.recurringBadge}>Recurred</div>
            )} */}
          </div>
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
                onClick={async () => {
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

                  const currentRecurrenceData: any =
                    await getRecurrenceConfigDetails(
                      currentRowData?.RecurrenceConfigDetailsId || ""
                    );

                  setRecurrenceDetails((prev: any) =>
                    mapRowDataToRecurrenceFormData(currentRecurrenceData, prev)
                  );

                  setNextTicketIntimation({
                    date: dayjs(currentRecurrenceData?.NextTicketDate).format(
                      "MM/DD/YYYY"
                    ),
                    error: false,
                  });

                  setHasRecurrence(currentRowData?.HasRecurrence ?? false);

                  setSubmitClicked(false);
                }}
                className={`${
                  checkIsRecurringTicket(params?.row?.ticket_number)
                    ? styles.reopenTicketFilled
                    : styles.reopenTicket
                }`}
              >
                {/* <img src={checkIsRecurringTicket(params?.row?.ticket_number)?reopenTicketFilled:reopenTicket} /> */}
                <Loop
                  sx={{
                    color: checkIsRecurringTicket(params?.row?.ticket_number)
                      ? "#fff"
                      : "#002b30",
                    fontSize: "20px",
                  }}
                />
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
                  console.log("currentAttachment: ", currentAttachment);

                  setFormData((prev: any) => ({
                    ...prev,
                    Attachment: {
                      ...prev?.Attachment,
                      value: currentAttachment?.length
                        ? [
                            ...currentAttachment?.map((attachment: any) => ({
                              ...attachment,
                              name: attachment?.FileName,
                            })),
                          ]
                        : null,
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
    // currentRoleBasedData?.data?.length,
    JSON.stringify(currentRoleBasedData?.data), //deep checking,
    location.pathname,
  ]);

  // Update dataGridProps when filtered data changes
  useEffect(() => {
    setDataGridProps((prev) => ({
      ...prev,
      data: filteredData,
    }));
  }, [filteredData]);

  useEffect(() => {
    setNextTicketIntimation(nextTicketIntimationLocal);
  }, [JSON.stringify(nextTicketIntimationLocal)]);

  // Handle filtering and navigation on path change
  useEffect(() => {
    ticketsFilter(
      `${currentRole}${location.pathname}`,
      HelpDeskTicktesData,
      currentUserDetails,
      dispatch
    );
    // getAllTicketsData2()
    console.log(
      "getAllTicketsData2(): ",
      getAllTicketsData2().then((res: any) => {
        console.log(res);
      })
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

  useEffect(() => {
    if (
      popupController[0]?.popupWidth === "450px" &&
      popupController[0]?.popupData?.HasRecurrence &&
      recurrenceDetails?.Frequency?.value !== "Repeat once" &&
      recurrenceDetails?.Frequency?.value !== "Does not repeat" &&
      isTicketManager
    ) {
      setPopupController((prev) =>
        updatePopupController(prev, 0, {
          popupWidth: "650px",
        })
      );
    }
  }, [
    popupController[0]?.popupData?.HasRecurrence,
    popupController[0]?.popupWidth,
  ]);

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

      <TicketForm
        openNewTicketSlide={openNewTicketSlide}
        setOpenNewTicketSlide={setOpenNewTicketSlide}
        type={openNewTicketSlide.type}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={async () => {
          await handleSubmit(
            formData,
            setLoadingSubmit,
            setFormData,
            setSubmitClicked,
            openNewTicketSlide,
            setOpenNewTicketSlide,
            currentRole,
            currentUserDetails,
            HelpDeskTicktesData,
            initialTicketsFormData,
            dispatch,
            navigate,
            location
          );
        }}
        validateField={validateField}
        handleInputChange={handleInputChange}
        TicketCategories={TicketCategories}
        TicketPriority={TicketPriority}
        TicketStatus={TicketStatus}
        priorityLevelIntimations={priorityLevelIntimations}
        currentUserDetails={currentUserDetails}
        initialData={initialTicketsFormData}
        loadingSubmit={loadingSubmit}
        isTicketManager={isTicketManager}
        isITOwner={isITOwner}
        fileIcon={fileIcon}
        infoRed={infoRed}
      />

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
            setHasRecurrence(false);
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
