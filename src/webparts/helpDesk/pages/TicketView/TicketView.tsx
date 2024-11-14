/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
import { Avatar, Backdrop, CircularProgress } from "@mui/material";
import styles from "./TicketView.module.scss";
import { useLocation, useNavigate } from "react-router-dom";
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
import { getCurrentRoleForTicketsRoute } from "../../../../utils/commonUtils";
import { imageURL, TicketStatus } from "../../../../constants/HelpDeskTicket";
import StatusPill from "../../../../components/helpDesk/StatusPill/StatusPill";
import CustomDropDown from "../../../../components/common/CustomInputFields/CustomDropDown";
import Popup from "../../../../components/common/Popups/Popup";
import { togglePopupVisibility } from "../../../../utils/popupUtils";
import { updateTicket } from "../../../../services/HelpDeskMainServices/ticketServices";
import { getAllTickets } from "../../../../services/HelpDeskMainServices/dashboardServices";
import ErrorElement from "../../../../components/common/ErrorElement/ErrorElement";
// import { getTicketByTicketNumber } from "../../../../services/HelpDeskMainServices/dashboardServices";
const leftArrow = require("../../../../assets/images/svg/headerBack.svg");
const fileIcon: any = require("../../assets/images/svg/fileIcon.svg");

const TicketView = (): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

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

  const ticketNumber: string = location.state?.ticket_number;
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

  const currentRole: string = getCurrentRoleForTicketsRoute(currentUserDetails);

  const currentTicketsDataMain: any = useSelector(
    (state: any) => state.HelpDeskTicktesData.value
  );

  const currentTicketsData = currentTicketsDataMain?.AllData?.filter(
    (item: any) => item?.TicketNumber === ticketNumber
  )[0];

  const [TVBackDrop, setTVBackDrop] = useState(false);

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

  const uniqueUsers = new Set();
  const usersToTag: any = [
    currentTicketsData?.EmployeeName,
    currentTicketsData?.ITOwner,
    currentTicketsData?.TicketManager,
  ]
    ?.map((user: any) => ({
      id: user?.ID,
      name: user?.Title,
      email: user?.EMail,
    }))
    .filter((user) => {
      if (user && !uniqueUsers.has(user.email)) {
        uniqueUsers.add(user.email);
        return true;
      }
      return false;
    });

  const repeatedTicketNumber = currentTicketsDataMain?.AllData?.filter(
    (item: any) => item?.ID === currentTicketsData?.RepeatedTicketSourceId
  )[0]?.TicketNumber;
  console.log("repeatedTicketNumber: ", repeatedTicketNumber);

  useEffect(() => {
    getAllComments(currentTicketsData?.ID, setConversationData, false);

    getAttachmentofTicket(currentTicketsData?.ID)?.then((res: any) => {
      console.log("res: ", res);
      setCurrentAttachment(res || null);
    });
  }, []);

  console.log("currentAttachment: ", currentAttachment);
  return (
    <>
      {location?.state !== null ? (
        <>
          <div className={styles.tcLhs}>
            <div className={styles.ticketHeader}>
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
                  on {dayjs(currentTicketsData?.Created)?.format("DD MMM YYYY HH:MM")}
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

              {currentTicketsData?.Status !== "Closed" ? (
                <CustomDropDown
                  value={currentTicketsData?.Status}
                  options={TicketStatus}
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
            <div className={styles.ticketChats}>
              <div className={styles.heading}>Conversations</div>

              <div className={styles.conversationsWrapper}>
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
                        date={dayjs(item?.Created).format("DD MMM YYYY")}
                        edited={item?.IsEdited}
                        content={item?.Comment}
                        avatarSrc={`/_layouts/15/userphoto.aspx?size=S&username=${item?.Author?.EMail}`}
                      />
                    );
                  })
                )}
              </div>

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
                      suggestionList={usersToTag}
                      getMentionedEmails={(e: any) => {
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
                        await Promise.all([addComment(formData)])
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
                        console.log("success");
                      }
                    }}
                    disabled={commentText.value?.trim() === ""}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.tcRhs}>
            <div className={styles.detailsCard}>
              <div className={styles.heading}>Details</div>
              <div className={styles.details}>
                <div className={styles.detailsLabel}>
                  <label>Ticket ID/Number</label>
                  <span>{ticketNumber ?? "-"}</span>
                </div>

                <div className={styles.detailsLabel}>
                  <label>Created at</label>
                  <span>
                    {dayjs(currentTicketsData?.Created).format("DD MMM YYYY") ??
                      "-"}
                  </span>
                </div>

                <div className={styles.detailsLabel}>
                  <label>Last Modified</label>
                  <span>
                    {dayjs(currentTicketsData?.Modified).format(
                      "DD MMM YYYY"
                    ) ?? "-"}
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

                <div className={styles.detailsLabel}>
                  <label>Repeated ticket</label>
                  <span>
                    {currentTicketsData?.RepeatedTicket ? "Yes" : "No"}
                  </span>
                </div>

                {currentTicketsData?.RepeatedTicket && (
                  <>
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
                  <label>Ticket description</label>
                  <span>{currentTicketsData?.TicketDescription ?? "-"}</span>
                </div>

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
                  <label>Attachment</label>
                  <span>
                    {currentAttachment?.[0] !== null &&
                    currentAttachment?.[0] !== undefined ? (
                      <div
                        className={styles.fileName}
                        onClick={() => {
                          if (currentAttachment) {
                            window.open(
                              `${window.location.origin}${currentAttachment?.[0]?.ServerRelativeUrl}?web=1`
                            );
                          }
                        }}
                      >
                        <img src={fileIcon} />
                        <span>{currentAttachment?.[0]?.FileName}</span>
                      </div>
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
            {/* <div className={styles.detailsCard}>
          <div className={styles.heading}>
            Contributors ({usersToTag?.length})
          </div>
          <div className={styles.ticketPeoples}>
            <AvatarGroup
              max={10}
              spacing="medium"
              sx={{
                "& .MuiAvatar-root": {
                  width: 30,
                  height: 30,
                  // border: "1px solid #eeeeee",
                },
              }}
              total={usersToTag?.length}
            >
              {usersToTag?.map((user: any, index: number) => {
                return (
                  <Avatar
                    key={index}
                    alt={user?.name}
                    src={`${imageURL}${user?.email}`}
                  />
                );
              })}
            </AvatarGroup>
          </div>
        </div> */}
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
