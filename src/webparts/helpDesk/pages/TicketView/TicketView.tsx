/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
import { Avatar, AvatarGroup, Backdrop, CircularProgress } from "@mui/material";
import styles from "./TicketView.module.scss";
import styles2 from "../MyTickets/MyTickets.module.scss";
import { useNavigate, useParams } from "react-router-dom";
import CommentCard from "../../components/CommentCard/CommentCard";
import QuillEditor from "../../../../components/common/QuillEditor/QuillEditor";
import { useEffect, useState } from "react";
import DefaultButton from "../../../../components/common/Buttons/DefaultButton";
// import { ArrowRight } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import {
  addComment,
  deleteComment,
  getAllComments,
  getAttachmentofTicket,
} from "../../../../services/HelpDeskMainServices/ticketViewServices";
import { ToastContainer } from "react-toastify";
import dayjs from "dayjs";
import {
  downloadFiles,
  getCurrentRoleForTicketsRoute,
  validateField,
} from "../../../../utils/commonUtils";
import {
  imageURL,
  initialData,
  initialRecurrenceFormData,
  priorityLevelIntimations,
  TicketCategories,
  TicketPriority,
  TicketRecurrenceFrequency,
  TicketStatus,
} from "../../../../constants/HelpDeskTicket";
import StatusPill from "../../../../components/helpDesk/StatusPill/StatusPill";
import CustomDropDown from "../../../../components/common/CustomInputFields/CustomDropDown";
import Popup from "../../../../components/common/Popups/Popup";
import {
  togglePopupVisibility,
  updatePopupController,
} from "../../../../utils/popupUtils";
import {
  getRecurrenceConfigDetails,
  updateRecurrenceConfigOfTicket,
  // getAllUsersList,
  updateTicket,
} from "../../../../services/HelpDeskMainServices/ticketServices";
import { getAllTickets } from "../../../../services/HelpDeskMainServices/dashboardServices";
import ErrorElement from "../../../../components/common/ErrorElement/ErrorElement";
import { ArrowRight, Edit } from "@mui/icons-material";
import CircularSpinner from "../../../../components/common/Loaders/CircularSpinner";
import TicketForm from "../../components/TicketForm/TicketForm";
import {
  calculateNextTicketDate,
  handleSubmit,
  mapRowDataToFormData,
  mapRowDataToRecurrenceFormData,
  validateRecurrenceForm,
} from "../../../../utils/helpdeskUtils";
import CustomDateInput from "../../../../components/common/CustomInputFields/CustomDateInput";
import WeekDaysSelector from "../../../../components/common/WeekDaysSelector/WeekDaysSelector";
// import { getTicketByTicketNumber } from "../../../../services/HelpDeskMainServices/dashboardServices";
const leftArrow = require("../../../../assets/images/svg/headerBack.svg");
const fileIcon: any = require("../../assets/images/svg/fileIcon.svg");
const infoRed: any = require("../../assets/images/svg/infoRed.svg");

const TicketView = (): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const pageParams = useParams();
  console.log("pageParams: ", pageParams);

  const initialPopupController = [
    {
      open: false,
      popupTitle: "Confirmation",
      popupWidth: "450px",
      popupType: "confirmation",
      defaultCloseBtn: false,
      confirmationTitle: "Are you sure want to change the status?",
      popupData: "",
      isLoading: {
        inprogress: false,
        error: false,
        success: false,
      },
      messages: {
        success: "News Deleted successfully!",
        error: "Something went wrong!",
        successDescription: "",
        errorDescription: "",
        inprogress: "",
      },
    },
    {
      open: false,
      popupTitle: "Modify recurrence details",
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

  const [popupController, setPopupController] = useState<any>(
    initialPopupController
  );

  const [openNewTicketSlide, setOpenNewTicketSlide] = useState<{
    open: boolean;
    type: "view" | "add" | "update";
    data?: any;
  }>({
    open: false,
    type: "add",
    data: [],
  });

  const [currentAttachment, setCurrentAttachment] = useState<any>(null);

  const ticketNumber: string | any = pageParams?.ticketid;
  // const [localProperties, setLocalProperties] = useState({
  //   expandCommentBar:true
  // });
  const [conversationData, setConversationData] = useState<{
    isLoading: boolean;
    data: any[];
  }>({
    isLoading: true,
    data: [],
  });

  const currentUserDetails = useSelector(
    (state: any) => state.MainSPContext.currentUserDetails
  );

  const AllUsersData = useSelector((state: any) => state.AllUsersData?.value);

  const currentRole: string = getCurrentRoleForTicketsRoute(currentUserDetails);

  const currentTicketsDataMain: any = useSelector(
    (state: any) => state.HelpDeskTicktesData.value
  );

  const isTicketManager: boolean =
    currentUserDetails?.role === "HelpDesk_Ticket_Managers";

  const isITOwner: boolean = currentUserDetails?.role === "HelpDesk_IT_Owners";

  const initialTicketsFormData = initialData(
    isTicketManager,
    isITOwner,
    currentUserDetails,
    openNewTicketSlide
  );

  const [formData, setFormData] = useState<any>(initialTicketsFormData);

  const HelpDeskTicktesData: any = useSelector(
    (state: any) => state.HelpDeskTicktesData.value
  );

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [submitClicked, setSubmitClicked] = useState(false);

  const verifyTicketWithCurrentUser: any = !isTicketManager
    ? currentTicketsDataMain?.AllData?.filter(
        (item: any) =>
          item?.EmployeeName?.EMail === currentUserDetails?.email ||
          item?.ITOwner?.EMail === currentUserDetails?.email ||
          item?.TicketManager?.EMail === currentUserDetails?.email ||
          item?.TaggedPerson?.some(
            (item: any) => item?.EMail === currentUserDetails?.email
          )
      )
    : currentTicketsDataMain?.AllData;

  const currentTicketsData = verifyTicketWithCurrentUser?.filter(
    (item: any) => item?.TicketNumber === ticketNumber
  )[0];
  console.log("currentTicketsData: ", currentTicketsData);

  const [recurrenceConfigData, setRecurrenceConfigData] = useState<any>();
  console.log("recurrenceConfigData: ", recurrenceConfigData);

  const [TVBackDrop, setTVBackDrop] = useState(false);
  const [toggles, setToggles] = useState({
    showDescription: true,
  });

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

  const [hasRecurrence, setHasRecurrence] = useState(false);
  const [recurrenceDetails, setRecurrenceDetails] = useState<any>(
    initialRecurrenceFormData
  );
  const isUser: boolean = currentRole?.includes("user");

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
          const formData = {
            Status: { value: popupController[0]?.popupData },
          };
          await Promise.all([
            updateTicket(currentTicketsData?.ID, formData, ["Attachments"]),
          ])
            .then(async (res: any) => {
              setTVBackDrop(true);
              await Promise.all([getAllTickets(dispatch)]);
              setTVBackDrop(false);
            })
            .catch((err: any) => {
              console.log("err: ", err);
            });
        },
      },
    ],
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
            initialPopupController[1],
            1,
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
          const currentRowData: any = popupController[1]?.popupData;

          const query: "add" | "update" = popupController[1]?.popupData
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

          if (
            !hasRecurrence &&
            recurrenceDetails?.Frequency?.value?.toLowerCase() ===
              "does not repeat"
          ) {
            togglePopupVisibility(
              setPopupController,
              initialPopupController[1],
              1,
              "close"
            );
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
              );
              // .then((res: any) => {
              //   togglePopupVisibility(
              //     setPopupController,
              //     initialPopupController[1],
              //     1,
              //     "close"
              //   );
              // })
              // .catch((err: any) => {
              //   togglePopupVisibility(
              //     setPopupController,
              //     initialPopupController[1],
              //     1,
              //     "close"
              //   );
              // });
              await getAllTickets(dispatch);
            }
            // else {
            //   togglePopupVisibility(
            //     setPopupController,
            //     initialPopupController[1],
            //     1,
            //     "close"
            //   );
            // }
          }
          if (
            !nextTicketIntimation?.error &&
            recurrenceDetails?.Frequency?.value?.toLowerCase() !==
              "repeat once" &&
            recurrenceDetails?.Frequency?.value?.toLowerCase() !==
              "does not repeat"
          ) {
            togglePopupVisibility(
              setPopupController,
              initialPopupController[1],
              1,
              "close"
            );
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
              popupController[1]?.popupData?.RecurrenceConfigDetailsId,
              setLoadingSubmit,
              setSubmitClicked,
              popupController,
              setPopupController,
              dispatch
            );
          }
        },
      },
    ],
  ];

  const popupInputs: any = [
    [],
    <div key={1} className={styles2.recurrenceWrapper}>
      {/* <p className={styles2.repeatQues}>
        Are you sure want to repeat this ticket &quot;
        {popupController[0]?.popupData?.TicketNumber}&quot;?
      </p> */}
      {!isUser && !isITOwner && (
        <>
          <div className={styles2.recurrenceBtn}>
            <CustomDropDown
              value={recurrenceDetails.Frequency?.value || ""}
              placeholder="Select frequency"
              disabled={isUser}
              options={["Does not repeat", ...TicketRecurrenceFrequency]}
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
            className={styles2.recurrenceOptions}
            style={{ maxHeight: hasRecurrence ? "500px" : "0" }}
          >
            <span className={styles2.recurrenceLabel}>
              Recurrence details ({popupController[0]?.popupData?.TicketNumber})
            </span>

            <div className={styles2.r1}>
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

            <div className={styles2.r2}>
              <div
                className={styles2.nextTicketIntimation}
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
                  <div className={styles2.dayIntimationLabelWrap}>
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
                            ? styles2.badgeNextDateError
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
                <div className={styles2.nextTicketIntimation}>
                  <label>Next ticket will repeat on</label>
                  <span
                    className={`${
                      nextTicketIntimation?.error
                        ? styles2.badgeNextDateError
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

  const [commentText, setCommentText] = useState({
    isValid: true,
    isEdited: false,
    value: "",
  });

  const [taggedPerson, setTaggedPerson] = useState({
    results: [],
  });

  const uniqueUsers = new Set<string>();

  const contributors: any = [
    ...conversationData?.data?.flatMap((item: any) => item?.TaggedPerson || []), // Handle taggedPerson array
    currentTicketsData?.EmployeeName,
    currentTicketsData?.ITOwner,
    currentTicketsData?.TicketManager,
  ]?.filter((user: any) => {
    if (user?.EMail && !uniqueUsers.has(user.EMail)) {
      uniqueUsers.add(user.EMail);
      return true;
    }
    return false;
  });

  const repeatedTicketNumber = currentTicketsDataMain?.AllData?.filter(
    (item: any) => item?.ID === currentTicketsData?.RepeatedTicketSourceId
  )[0]?.TicketNumber;

  const combinedUsers = [
    currentTicketsData?.EmployeeName,
    currentTicketsData?.ITOwner,
    currentTicketsData?.TicketManager,
  ];

  const isUserTagged = combinedUsers.some(
    (user: any) => user?.EMail === currentUserDetails?.email
  );

  const isValidTicket = (value: any): boolean =>
    value !== null &&
    value !== undefined &&
    typeof value === "string" &&
    value?.trim() !== "";

  const hasValidTicketId =
    isValidTicket(pageParams?.ticketid) &&
    isValidTicket(ticketNumber) &&
    currentTicketsData !== null &&
    currentTicketsData !== undefined;

  useEffect(() => {
    if (pageParams?.ticketid && ticketNumber) {
      const currentTicketsDataLocal = verifyTicketWithCurrentUser?.find(
        (item: any) => item?.TicketNumber === ticketNumber
      );

      if (!currentTicketsDataLocal) {
        console.warn("No ticket data found for the provided ticket number.");
        return;
      }

      // Fetch comments
      getAllComments(currentTicketsDataLocal?.ID, setConversationData, false);

      // Fetch attachments
      getAttachmentofTicket(currentTicketsDataLocal?.ID)?.then((res: any) => {
        setCurrentAttachment(res || null);
      });
    }
  }, [pageParams?.ticketid, ticketNumber, verifyTicketWithCurrentUser?.length]);

  useEffect(() => {
    setNextTicketIntimation(nextTicketIntimationLocal);
  }, [JSON.stringify(nextTicketIntimationLocal)]);

  useEffect(() => {
    // Fetch all tickets on initial load
    getAllTickets(dispatch);
  }, [dispatch]);

  useEffect(() => {
    if (currentTicketsData?.HasRecurrence) {
      getRecurrenceConfigDetails(currentTicketsData?.RecurrenceConfigDetailsId)
        .then((res: any) => {
          console.log("res: ", res);
          setRecurrenceConfigData(res || []);
        })
        .catch((err: any) => {
          console.log("err: ", err);
        });
    }
  }, [currentTicketsData?.RecurrenceConfigDetailsId]);

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
      popupController[1]?.popupWidth === "450px" &&
      recurrenceDetails?.Frequency?.value !== "Does not repeat"
    ) {
      setPopupController((prev: any) =>
        updatePopupController(prev, 1, {
          popupWidth: "650px",
        })
      );
    }
  }, [popupController[1]?.popupWidth]);

  return (
    <>
      {currentTicketsDataMain?.isLoading && !hasValidTicketId ? (
        <CircularSpinner />
      ) : hasValidTicketId ? (
        <>
          <div className={styles.tcLhs}>
            <div className={styles.ticketHeader}>
              <div className={styles.headerTopRowWraper}>
                <div className={styles.ticketHeaderMain}>
                  <div
                    className={styles.ticketName}
                    onClick={() => {
                      navigate(`${currentRole}/all_tickets`, { state: null });
                    }}
                  >
                    <img src={leftArrow} />
                    <span>{ticketNumber}</span>
                  </div>

                  <div className={styles.ticketOneLine}>
                    {currentTicketsData?.EmployeeName?.Title} raised this ticket
                    on
                    {dayjs(currentTicketsData?.Created)?.format("DD MMM YYYY")}
                    <span className={styles.splitterDot} />
                    {conversationData?.data?.length} comments
                    {currentTicketsData?.TicketClosedOn !== null && (
                      <span className={styles.splitterDot} />
                    )}
                    {currentTicketsData?.TicketClosedOn !== null &&
                      `closed on ${dayjs(
                        currentTicketsData?.TicketClosedOn
                      )?.format("DD MMM YYYY")}`}
                  </div>
                  {currentTicketsData?.HasRecurrence && (
                    <div
                      style={{
                        paddingRight: isTicketManager ? "5px" : "10px",
                      }}
                      className={styles.ticketOneLineNote}
                    >
                      This is a scheduled ticket that occurs{" "}
                      {recurrenceConfigData?.Frequency}
                      &nbsp;till{" "}
                      {dayjs(recurrenceConfigData?.EndDate).format(
                        "DD/MM/YYYY"
                      )}
                      {isTicketManager && (
                        <button
                          className={styles.ticketOneLineButton}
                          onClick={async () => {
                            const currentRowData: any =
                              HelpDeskTicktesData?.AllData?.filter(
                                (item: any) =>
                                  item?.TicketNumber === ticketNumber
                              )?.[0];

                            togglePopupVisibility(
                              setPopupController,
                              initialPopupController[1],
                              1,
                              "open",
                              "",
                              currentRowData,
                              `Modify recurrence details - "${ticketNumber}"`
                            );

                            const currentRecurrenceData: any =
                              await getRecurrenceConfigDetails(
                                currentRowData?.RecurrenceConfigDetailsId || ""
                              );

                            setRecurrenceDetails((prev: any) =>
                              mapRowDataToRecurrenceFormData(
                                currentRecurrenceData,
                                prev
                              )
                            );

                            setNextTicketIntimation({
                              date: dayjs(
                                currentRecurrenceData?.NextTicketDate
                              ).format("MM/DD/YYYY"),
                              error: false,
                            });

                            setHasRecurrence(
                              currentRowData?.HasRecurrence ?? false
                            );

                            setSubmitClicked(false);
                          }}
                        >
                          Modify recurrence
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {currentTicketsData?.Status !== "Closed" && isUserTagged ? (
                  <CustomDropDown
                    value={currentTicketsData?.Status}
                    options={
                      currentRole === "/user"
                        ? [currentTicketsData?.Status, "Closed"]
                        : currentTicketsData?.Status?.toLowerCase() ===
                            "in progress" ||
                          currentTicketsData?.ITOwnerId !== null
                        ? TicketStatus?.filter((item: any) => item !== "Open")
                        : TicketStatus
                    }
                    placeholder="Update status"
                    noErrorMsg
                    width={"180px"}
                    highlightDropdown
                    onChange={(value) => {
                      console.log("value: ", value);
                      togglePopupVisibility(
                        setPopupController,
                        initialPopupController[0],
                        0,
                        "open",
                        "Confimation",
                        value,
                        `Are you sure want to change the ticket's status to "${value}"?`
                      );
                    }}
                  />
                ) : (
                  <StatusPill size="MD" status={currentTicketsData?.Status} />
                )}
              </div>
            </div>
            <div className={styles.ticketChats}>
              <div className={styles.heading}>Conversations</div>

              <div
                className={styles.conversationsWrapper}
                style={{
                  maxHeight:
                    currentTicketsData?.Status === "Closed" ||
                    conversationData?.data?.length === 0
                      ? "100%"
                      : "calc(100% - 300px)",
                  overflow: "auto",
                }}
              >
                {conversationData?.isLoading ? (
                  <div className={styles.loaderElement}>
                    <CircularProgress
                      sx={{
                        width: "20px",
                        height: "20px",
                        animationDuration: "450ms",
                        color: "#adadad",
                      }}
                      size="20px"
                      disableShrink
                      variant="indeterminate"
                      color="inherit"
                    />
                    <span className={styles.loaderText}>
                      fetching conversations...
                    </span>
                  </div>
                ) : conversationData?.data?.length === 0 ? (
                  <div className={styles.loaderElement}>
                    <span className={styles.loaderText}>
                      No conversations found!
                    </span>
                  </div>
                ) : (
                  conversationData?.data?.map((item: any, index: number) => {
                    return (
                      <CommentCard
                        data={item}
                        handleDelete={async (data: any) => {
                          await Promise.all([deleteComment(data?.ID)])
                            .then(async (res: any) => {
                              await getAllComments(
                                currentTicketsData?.ID,
                                setConversationData,
                                true
                              );
                            })
                            .catch((err: any) => {
                              console.log("err: ", err);
                            });
                        }}
                        lastItem={conversationData?.data?.length === index + 1}
                        index={index}
                        key={index}
                        ownComment={
                          currentUserDetails?.email === item?.Author?.EMail
                        }
                        isAuthor={
                          currentTicketsData?.EmployeeName?.EMail ===
                          item?.Author?.EMail
                        }
                        role={
                          currentUserDetails?.email ===
                          currentTicketsData?.ITOwner?.EMail
                            ? "IT/Business owner"
                            : currentUserDetails?.email ===
                              currentTicketsData?.TicketManager?.EMail
                            ? "Helpdesk manager"
                            : currentTicketsData?.EmployeeName?.EMail ===
                              item?.Author?.EMail
                            ? "Ticket owner"
                            : ""
                        }
                        author={item?.Author?.Title}
                        date={dayjs(item?.Created).format("DD MMM YYYY HH:mm")}
                        edited={item?.IsEdited}
                        content={item?.Comment}
                        avatarSrc={`/_layouts/15/userphoto.aspx?size=S&username=${item?.Author?.EMail}`}
                      />
                    );
                  })
                )}
              </div>

              {currentTicketsData?.Status !== "Closed" && (
                <div
                  // className={`${styles.commentBox} ${localProperties?.expandCommentBar ? styles.expand : ''}`}
                  className={`${styles.commentBox}`}
                >
                  <span
                    className={styles.commentBoxTitle}
                    // onClick={() => {
                    // setLocalProperties((prev) => ({
                    //   ...prev,
                    //   expandCommentBar:!prev?.expandCommentBar
                    // }))
                    // }}
                  >
                    {/* <ArrowRight className={styles.openArrow} /> */}
                    Add a comment
                  </span>
                  <div className={styles.comment}>
                    <div className="inputWrap">
                      <QuillEditor
                        onChange={(commentText: any) => {
                          console.log("commentText: ", commentText);
                          setCommentText((prev: any) => ({
                            ...prev,
                            isValid: true,
                            value: commentText,
                          }));
                        }}
                        placeHolder={"Enter Comments and @ to mention..."}
                        defaultValue={commentText.value}
                        suggestionList={AllUsersData ?? []}
                        getMentionedEmails={(e: any) => {
                          console.log("e: ", e);
                          setTaggedPerson((prev: any) => ({
                            ...prev,
                            results: e?.map((item: any) => item?.id),
                          }));
                        }}
                      />
                      {!commentText?.isValid && (
                        <p className={styles.errorMsg}>Comment is required.</p>
                      )}
                    </div>
                    <DefaultButton
                      btnType="primaryGreen"
                      text={"Comment"}
                      style={{
                        marginLeft: "auto",
                      }}
                      onClick={async () => {
                        if (
                          commentText?.value?.replace(/<(.|\n)*?>/g, "").trim()
                            .length === 0
                        ) {
                          setCommentText((prev) => ({
                            ...prev,
                            isValid: false,
                          }));
                        } else {
                          const formData = {
                            Comment: commentText.value,
                            TaggedPersonId: taggedPerson,
                            TicketDetailsId: currentTicketsData?.ID,
                            IsEdited: commentText.isEdited,
                          };
                          const alltaggedPersons =
                            conversationData?.data?.flatMap((item: any) =>
                              item?.TaggedPersonId?.map((ID: any) => ID)
                            );
                          await Promise.all([
                            addComment(formData, alltaggedPersons),
                          ])
                            .then(async (res: any) => {
                              setCommentText((prev: any) => ({
                                ...prev,
                                isValid: true,
                                value: "",
                                isEdited: false,
                              }));
                              await getAllComments(
                                currentTicketsData?.ID,
                                setConversationData,
                                true
                              );
                            })
                            .catch((err: any) => {
                              console.log("err: ", err);
                            });
                        }
                      }}
                      disabled={commentText.value?.trim() === ""}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={styles.tcRhs}>
            <div className={styles.detailsCard}>
              <div className={styles.heading}>
                <div className={styles.title}>Details</div>
                <div
                  className={styles.editBtn}
                  onClick={async () => {
                    const currentAttachment = await getAttachmentofTicket(
                      currentTicketsData?.ID
                    );

                    setLoadingSubmit(false);
                    setSubmitClicked(false);
                    setOpenNewTicketSlide({
                      open: true,
                      type: "update",
                      data: currentTicketsData,
                    });

                    setFormData((prev: any) =>
                      mapRowDataToFormData(
                        currentTicketsData,
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
                  }}
                >
                  <Edit
                    sx={{
                      fontSize: "20px",
                      color: "var(--primary-pernix-green)",
                    }}
                  />
                </div>
              </div>
              <div className={styles.details}>
                <div className={styles.detailsLabel}>
                  <label>Ticket Number</label>
                  <span>{ticketNumber ?? "-"}</span>
                </div>

                <div className={styles.headerDetailsLabel}>
                  <label
                    onClick={() => {
                      setToggles((prev: any) => ({
                        ...prev,
                        showDescription: !prev.showDescription,
                      }));
                    }}
                  >
                    <ArrowRight
                      sx={{
                        color: "#adadad",
                        fontSize: "22px",
                        transition: "all .2s",
                        transform: toggles?.showDescription
                          ? `rotate(90deg)`
                          : `rotate(0deg)`,
                      }}
                    />
                    <span>Description</span>
                  </label>
                  <span
                    style={{
                      transition: "all .2s",
                      height: toggles.showDescription ? `100%` : `0px`,
                      overflow: "hidden",
                    }}
                  >
                    {currentTicketsData?.TicketDescription ?? "-"}
                  </span>
                </div>

                <div className={styles.detailsLabel}>
                  <label>Status</label>
                  <span>
                    <StatusPill size="SM" status={currentTicketsData?.Status} />
                  </span>
                </div>

                <div className={styles.detailsLabel}>
                  <label>Priority</label>
                  <span>{currentTicketsData?.Priority ?? "-"}</span>
                </div>

                <div className={styles.detailsLabel}>
                  <label>Category</label>
                  <span>{currentTicketsData?.Category ?? "-"}</span>
                </div>

                <div className={styles.detailsLabel}>
                  <label>Ticket source</label>
                  <span>{currentTicketsData?.TicketSource ?? "-"}</span>
                </div>

                {currentTicketsData?.RepeatedTicket && (
                  <>
                    <div className={styles.detailsLabel}>
                      <label>Repeated ticket</label>
                      <span>
                        {currentTicketsData?.RepeatedTicket ? "Yes" : "No"}
                      </span>
                    </div>

                    <div className={styles.detailsLabel}>
                      <label>Repeated ticket source</label>
                      <span
                        className={styles.routeLink}
                        onClick={() => {
                          navigate(
                            `${currentRole}/all_tickets/${repeatedTicketNumber}/view_ticket`
                          );
                        }}
                      >
                        {repeatedTicketNumber ?? "-"}
                      </span>
                    </div>

                    <div className={styles.detailsLabel}>
                      <label>Ticket repeated on</label>
                      <span>
                        {dayjs(currentTicketsData?.TicketRepeatedOn)?.format(
                          "DD MMM YYYY"
                        ) ?? "-"}
                      </span>
                    </div>
                  </>
                )}

                {conversationData?.data?.length ? (
                  <div className={styles.detailsLabel}>
                    <label>Last commented on</label>
                    <span>
                      {conversationData?.data?.length
                        ? dayjs(
                            conversationData?.data?.[
                              conversationData?.data?.length - 1
                            ]?.Created
                          ).format("DD MMM YYYY")
                        : "-"}
                    </span>
                  </div>
                ) : (
                  ""
                )}

                <div className={styles.detailsLabel}>
                  <label>
                    Attachments ({currentAttachment?.length || "0"})
                    {currentAttachment?.length > 1 && (
                      <span
                        className={styles.downloadText}
                        onClick={async () => {
                          const files = currentAttachment?.map((item: any) => {
                            return {
                              name: item?.FileName,
                              content: `${window.location.origin}${item?.ServerRelativeUrl}?web=1`,
                            };
                          });
                          console.log("files: ", files);
                          await downloadFiles(
                            `${currentTicketsData?.TicketNumber}-Attachments.zip`,
                            files
                          );
                        }}
                      >
                        Download all
                      </span>
                    )}
                  </label>
                  <span className={styles.attachmentsWrapper}>
                    {currentAttachment?.length > 0 ? (
                      currentAttachment?.map((item: any, idx: number) => (
                        <a
                          href={`${window.location.origin}${item?.ServerRelativeUrl}?web=1`}
                          download
                          key={idx}
                          className={styles.fileName}
                          onClick={() => {
                            if (currentAttachment) {
                              window.open(
                                `${window.location.origin}${item?.ServerRelativeUrl}?web=1`
                              );
                            }
                          }}
                        >
                          <img src={fileIcon} />
                          <span>{item?.FileName}</span>
                        </a>
                      ))
                    ) : (
                      <div className={styles.fileName}>
                        <span>No attachment</span>
                      </div>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.detailsCard}>
              <div className={styles.heading}>Responsibilities</div>
              <div className={styles.details}>
                <div className={styles.detailsLabel2}>
                  <span>Ticket created by</span>
                  <div className={styles.userCard}>
                    <Avatar
                      style={{
                        width: "35px",
                        height: "35px",
                      }}
                      alt="Remy Sharp"
                      src={`${imageURL}${currentTicketsData?.EmployeeName?.EMail}`}
                    />
                    <div className={styles.userDetails}>
                      <p>{currentTicketsData?.EmployeeName?.Title}</p>
                      <span>{currentTicketsData?.EmployeeName?.EMail}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.detailsLabel2}>
                  <span>IT/Business owner</span>
                  <div className={styles.userCard}>
                    {currentTicketsData?.ITOwnerId !== null ? (
                      <>
                        <Avatar
                          style={{
                            width: "35px",
                            height: "35px",
                          }}
                          alt="Remy Sharp"
                          src={`${imageURL}${currentTicketsData?.ITOwner?.EMail}`}
                        />
                        <div className={styles.userDetails}>
                          <p>{currentTicketsData?.ITOwner?.Title}</p>
                          <span>{currentTicketsData?.ITOwner?.EMail}</span>
                        </div>
                      </>
                    ) : (
                      <StatusPill size="SM" status="Unassigned" />
                    )}
                  </div>
                </div>
                <div className={styles.detailsLabel2}>
                  <span>Helpdesk manager</span>
                  <div className={styles.userCard}>
                    {currentTicketsData?.TicketManagerId !== null ? (
                      <>
                        <Avatar
                          style={{
                            width: "35px",
                            height: "35px",
                          }}
                          alt="Remy Sharp"
                          src={`${imageURL}${currentTicketsData?.TicketManager?.EMail}`}
                        />
                        <div className={styles.userDetails}>
                          <p>{currentTicketsData?.TicketManager?.Title}</p>
                          <span>
                            {currentTicketsData?.TicketManager?.EMail}
                          </span>
                        </div>
                      </>
                    ) : (
                      <StatusPill size="SM" status="Unassigned" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.detailsCard}>
              <div className={styles.heading}>
                Contributors ({contributors?.length})
              </div>
              <div className={styles.ticketPeoples}>
                <AvatarGroup
                  max={10}
                  spacing="small"
                  sx={{
                    "& .MuiAvatar-root": {
                      width: 30,
                      height: 30,
                      // border: "1px solid #eeeeee",
                    },
                  }}
                  total={contributors?.length}
                >
                  {contributors?.map((user: any, index: number) => {
                    return (
                      <Avatar
                        key={index}
                        title={user?.Title}
                        alt={user?.Title}
                        src={`${imageURL}${user?.EMail}`}
                      />
                    );
                  })}
                </AvatarGroup>
              </div>
            </div>
          </div>

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
              confirmationTitle={popupData?.confirmationTitle}
              popupHeight={index === 0 ? true : false}
              noActionBtn={true}
              centerActionBtn={true}
            />
          ))}

          <Backdrop
            sx={(theme: any) => ({
              color: "#eff5ff",
              zIndex: theme.zIndex.drawer + 1,
            })}
            open={TVBackDrop}
          >
            <CircularProgress
              sx={{
                width: "25px !important",
                height: "25px !important",
                fontSize: "24px",
                animationDuration: "450ms",
                color: "#eff5ff",
              }}
              disableShrink
              variant="indeterminate"
              color="inherit"
            />
            <span className={styles.disabledText}>Fetching ticket data...</span>
          </Backdrop>
        </>
      ) : (
        <ErrorElement
          message="Page Not Found"
          description="The page you're looking for could not be found, or the route may be incorrect. Please check the URL and try again."
        />
      )}

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
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default TicketView;
