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
import { Add } from "@mui/icons-material";
import CustomInput from "../../../../components/common/CustomInputFields/CustomInput";
import {
  currentRoleBasedDataUtil,
  filterTicketsByCategory,
  filterTicketsByPriority,
  filterTicketsBySearch,
  formatTicketData,
  // filterTicketsByTimePeriod,
  generateTicketNumber,
  getCurrentRoleForTicketsRoute,
  getTicketsByKeyValue,
  // sortByCreatedDate,
  sortTickets,
  ticketsFilter,
  validateField,
} from "../../../../utils/commonUtils";
import CustomPeoplePicker from "../../../../components/common/CustomInputFields/CustomPeoplePicker";
import CustomDropDown from "../../../../components/common/CustomInputFields/CustomDropDown";
import CustomFileUpload from "../../../../components/common/CustomInputFields/CustomFileUpload";
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
import { mapRowDataToFormData } from "../../../../utils/helpdeskUtils";
import { togglePopupVisibility } from "../../../../utils/popupUtils";
import Popup from "../../../../components/common/Popups/Popup";
import dayjs from "dayjs";
import { getAttachmentofTicket } from "../../../../services/HelpDeskMainServices/ticketViewServices";
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

  const initialPopupController = [
    {
      open: false,
      popupTitle: "Confirmation",
      popupWidth: "450px",
      popupType: "confirmation",
      defaultCloseBtn: false,
      confirmationTitle: "Are you sure want to repeat this ticket?",
      popupData: "",
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
  const isITOwner: boolean = currentUserDetails?.role === "HelpDesk_IT_Owners";

  const HelpDeskTicktesData: any = useSelector(
    (state: any) => state.HelpDeskTicktesData.value
  );

  const currentRoleBasedData = currentRoleBasedDataUtil(
    currentUserDetails,
    HelpDeskTicktesData
  );

  const currentRole: string = getCurrentRoleForTicketsRoute(currentUserDetails);

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
      value: "Web",
      isValid: true,
      errorMsg: "This field is required",
      validationRule: { required: false, type: "string" },
    },
    Status: {
      value: isTicketManager || isITOwner ? "" : "Open",
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
  console.log("formData: ", formData);

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

          const formDataAppended = {
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
              value: currentRowData?.TicketManagerId
                ? currentRowData?.TicketManager?.ID
                : null,
            },
            ITOwnerId: {
              value: currentRowData?.ITOwnerId
                ? currentRowData?.ITOwner?.ID
                : null,
            },
          };
          console.log("formDataAppended: ", formDataAppended);

          await Promise.all([
            addNewTicket(formDataAppended, ["Attachments"], true),
          ])
            .then(async (res: any) => {
              navigate(`${currentRole}/all_tickets`);
              await Promise.all([getAllTickets(dispatch)]);
            })
            .catch((err: any) => {
              console.log("err: ", err);
            });
        },
      },
    ],
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
  const [searchTerm, setSearchTerm] = useState("");
  console.log("setSearchTerm: ", setSearchTerm);
  const [selectedCategory, setSelectedCategory] = useState<any>("");
  const [selectedPriority, setSelectedPriority] = useState<any>("");

  const columns = [
    {
      sortable: true,
      field: "ticket_number",
      headerName: "Ticket no",
      width: 200,
      renderCell: (params: any) => {
        return (
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
        );
      },
    },
    {
      sortable: false,
      field: "IT_owner",
      headerName: "IT/Business Owner",
      width: 200,
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
      width: 200,
    },
    {
      sortable: false,
      field: "priority",
      headerName: "Priority",
      width: 200,
    },
    {
      sortable: false,
      field: "status",
      headerName: "Status",
      maxWidth: 150,
      renderCell: (params: any) =>
        params?.value ? <StatusPill size="SM" status={params?.value} /> : "-",
    },
    {
      field: "actions",
      sortable: false,
      headerName: "Actions",
      width: 200,
      renderCell: (params: any) => (
        <div className={styles.actionButtons}>
          <button
            title="Repeat this ticket"
            onClick={() => {
              const ticketNumber = params?.row?.ticket_number;
              const currentRowData: any = HelpDeskTicktesData?.AllData?.filter(
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
              const currentRowData: any = HelpDeskTicktesData?.AllData?.filter(
                (item: any) => item?.TicketNumber === ticketNumber
              )?.[0];

              const currentAttachment = await getAttachmentofTicket(
                currentRowData?.ID
              );

              console.log("currentRowData: ", currentRowData);
              setOpenNewTicketSlide({
                open: true,
                type: "update",
                data: currentRowData,
              });

              console.log(
                "currentaAttachment: ",
                currentAttachment[0]?.FileName
              );

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
                  value: {
                    name: currentAttachment[0]?.FileName,
                  },
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
      if (openNewTicketSlide.type === "add") {
        await Promise.all([addNewTicket(formData, ["Attachment"])])
          .then(async (res: any) => {
            await getAllTickets(dispatch);
            navigate(`${currentRole}/all_tickets`);
            setOpenNewTicketSlide({
              open: false,
              type: "add",
            });
            setFormData(initialData);
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
            setOpenNewTicketSlide({
              open: false,
              type: "add",
            });
            setFormData(initialData);
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
    }
  };

  // Info cards array
  const infoCards: any[] = [
    {
      cardName: "My tickets",
      cardImg: myTickets,
      cardValues: currentRoleBasedData?.data?.length || 0,
    },
    {
      cardName: "My open",
      cardImg: openTickets,
      cardValues:
        getTicketsByKeyValue(currentRoleBasedData?.data, "Status", "Open")
          ?.length || 0,
    },
    {
      cardName: "My closed",
      cardImg: closedTickets,
      cardValues:
        getTicketsByKeyValue(currentRoleBasedData?.data, "Status", "Closed")
          ?.length || 0,
    },
    {
      cardName: "Tickets on hold",
      cardImg: ticketsOnHold,
      cardValues:
        getTicketsByKeyValue(currentRoleBasedData?.data, "Status", "On Hold")
          ?.length || 0,
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
    currentRoleBasedData?.data,
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
      dispatch
    );
    navigate(location.pathname, { state: null });
  }, [location.pathname]);
  return (
    <div className={styles.mytickets}>
      <div className={styles.mytickets_header}>
        <PageHeader title={"All tickets"} noBackBtn />

        <div className={styles.topLevelFilter}>
          <DefaultButton
            btnType="primaryGreen"
            onlyIcon
            text={"Reset"}
            onClick={async () => {
              // await getAllTickets(dispatch);
              setSearchTerm("");
              setSelectedCategory("");
              setSelectedPriority("");
            }}
          />
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

          <DefaultButton
            btnType="primaryGreen"
            text={"New ticket"}
            onClick={async () => {
              // await getAllTickets(dispatch);
              setOpenNewTicketSlide({
                open: true,
                type: "add",
              });
              const lastTicketID: number = Math.max(
                0,
                ...(HelpDeskTicktesData?.data ?? [])
                  ?.map((item: any) => item?.ID)
                  ?.filter(
                    (id: number | undefined) => id !== undefined && id !== null
                  )
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

                {(isTicketManager || isITOwner) && (
                  <CustomDropDown
                    disabled={
                      openNewTicketSlide?.data?.Status === "Closed" &&
                      openNewTicketSlide?.type === "update"
                    }
                    value={formData?.Status?.value}
                    options={TicketStatus}
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
                  <CustomFileUpload
                    accept="image/png,image/svg"
                    value={formData?.Attachment?.value?.name}
                    onFileSelect={(file) => {
                      console.log("file: ", file);
                      const { isValid, errorMsg } = validateField(
                        "Attachment",
                        file ? file.name : "",
                        formData?.Attachment
                      );
                      handleInputChange("Attachment", file, isValid, errorMsg);
                    }}
                    placeholder="Attachment"
                    isValid={formData?.Attachment?.isValid}
                    errMsg={formData?.Attachment?.errorMsg}
                  />
                ) : (
                  ""
                  // <span>
                  //   <img src={fileIcon} />
                  //   {formData?.Attachment?.value?.name}
                  // </span>
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
              disabled={
                !Object.keys(formData)
                  .filter((key) => formData[key]?.validationRule?.required)
                  .every((key) => formData[key].isValid)
              }
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
          // content={popupInputs[index]}
          popupWidth={popupData.popupWidth}
          defaultCloseBtn={popupData.defaultCloseBtn || false}
          confirmationTitle={popupData?.confirmationTitle}
          popupHeight={index === 0 ? true : false}
          noActionBtn={false}
        />
      ))}
    </div>
  );
};

export default MyTickets;
