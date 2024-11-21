/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
import { Avatar, AvatarGroup, Backdrop, CircularProgress } from "@mui/material";
import styles from "./TicketView.module.scss";
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
} from "../../../../utils/commonUtils";
import { imageURL, TicketStatus } from "../../../../constants/HelpDeskTicket";
import StatusPill from "../../../../components/helpDesk/StatusPill/StatusPill";
import CustomDropDown from "../../../../components/common/CustomInputFields/CustomDropDown";
import Popup from "../../../../components/common/Popups/Popup";
import { togglePopupVisibility } from "../../../../utils/popupUtils";
import {
  // getAllUsersList,
  updateTicket,
} from "../../../../services/HelpDeskMainServices/ticketServices";
import { getAllTickets } from "../../../../services/HelpDeskMainServices/dashboardServices";
import ErrorElement from "../../../../components/common/ErrorElement/ErrorElement";
import { ArrowRight } from "@mui/icons-material";
import CircularSpinner from "../../../../components/common/Loaders/CircularSpinner";
// import { getTicketByTicketNumber } from "../../../../services/HelpDeskMainServices/dashboardServices";
const leftArrow = require("../../../../assets/images/svg/headerBack.svg");
const fileIcon: any = require("../../assets/images/svg/fileIcon.svg");

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
  // || currentUserDetails?.role === "Super Admin";

  const isITOwner: boolean = currentUserDetails?.role === "HelpDesk_IT_Owners";
  console.log("isITOwner: ", isITOwner);

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

  console.log("verifyTicketWithCurrentUser: ", verifyTicketWithCurrentUser);

  const currentTicketsData = verifyTicketWithCurrentUser?.filter(
    (item: any) => item?.TicketNumber === ticketNumber
  )[0];

  const [TVBackDrop, setTVBackDrop] = useState(false);
  const [toggles, setToggles] = useState({
    showDescription: true,
  });

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

  // 	emp name
  // hd manager
  // it owner
  // taggedperson

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
    getAllTickets(dispatch);

    if (pageParams?.ticketid) {
      getAllComments(currentTicketsData?.ID, setConversationData, false);

      getAttachmentofTicket(currentTicketsData?.ID)?.then((res: any) => {
        setCurrentAttachment(res || null);
      });
    }
  }, [pageParams?.ticketid, ticketNumber]);

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
                    on{" "}
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
                </div>

                {currentTicketsData?.Status !== "Closed" && isUserTagged ? (
                  <CustomDropDown
                    value={currentTicketsData?.Status}
                    options={
                      currentRole === "/user"
                        ? [currentTicketsData?.Status, "Closed"]
                        : currentTicketsData?.Status?.toLowerCase() ===
                          "in progress"
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
              <div className={styles.heading}>Details</div>
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
                      <label>Repeated ticket from</label>
                      <span>{repeatedTicketNumber ?? "-"}</span>
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

                <div className={styles.detailsLabel}>
                  <label>
                    Attachments ({currentAttachment?.length})
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
    </>
  );
};

export default TicketView;
