/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import CommentCard from "../../../components/CommentCard/CommentCard";
import dayjs from "dayjs";
import SpServices from "../../../../../services/SPServices/SpServices";
import { CONFIG } from "../../../../../config/config";
import { toast } from "react-toastify";
import styles from "./CommentList.module.scss";

interface Comment {
  ID: number;
  TaggedPerson: { ID: number }[];
  Author: { ID: number; Title: string; EMail: string };
  IsPrivateComment: boolean;
  Created: string;
  IsEdited: boolean;
  Comment: string;
}

interface CommentsListProps {
  conversationData: { data: Comment[] };
  currentTicketsData: any;
  currentUserDetails: { id: number; email: string };
  isTicketManager: boolean;
  isITOwner: boolean;
  deleteComment: (id: number) => Promise<void>;
  getAllComments: (
    ticketId: number,
    setConversationData: (data: any) => void,
    refresh?: boolean
  ) => Promise<void>;
  setConversationData: any;
}

const CommentsList = ({
  conversationData,
  currentTicketsData,
  currentUserDetails,
  isTicketManager,
  isITOwner,
  deleteComment,
  getAllComments,
  setConversationData,
}: CommentsListProps): JSX.Element => {
  const [localComments, setLocalComments] = useState<Comment[]>(
    conversationData?.data || []
  );
  console.log("localComments: ", localComments);

  useEffect(() => {
    setLocalComments(conversationData?.data || []);
  }, [JSON.stringify(conversationData?.data)]);

  const handleCommentChange = async (
    updatedComment: Comment,
    updatedCommentType: any
  ): Promise<void> => {
    const updatedCommentWithType = {
      ...updatedComment,
      IsPrivateComment: updatedCommentType === "Private",
    };

    // Update local state
    setLocalComments((prevComments) =>
      prevComments.map((comment) =>
        comment.ID === updatedComment.ID ? updatedCommentWithType : comment
      )
    );

    try {
      // Simulate API call
      await SpServices.SPUpdateItem({
        Listname: CONFIG.ListNames.HelpDesk_TicketConversations,
        ID: updatedComment?.ID,
        RequestJSON: {
          IsPrivateComment: updatedCommentType === "Private",
        },
      })
        .then(async (res: any) => {
          toast.success("Comment visibility updated!", {
            position: "top-center",
            autoClose: 3500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: false,
          });

          await SpServices.SPReadItemUsingId({
            Listname: CONFIG.ListNames.HelpDesk_TicketConversations,
            SelectedId: updatedComment?.ID,
            Select:
              "*, TaggedPerson/ID, TaggedPerson/EMail, TaggedPerson/Title, TicketDetails/ID, Author/ID, Author/EMail, Author/Title",
            Expand: "TaggedPerson, TicketDetails, Author",
          })
            .then((res: any) => {
              setLocalComments((prevComments) =>
                prevComments.map((comment) =>
                  comment.ID === updatedComment.ID ? res : comment
                )
              );
              setConversationData((prevComments: any) => ({
                ...prevComments,
                isLoading: false,
                data: conversationData?.data?.map((comment: any) =>
                  comment.ID === updatedComment.ID ? res : comment
                ),
              }));
            })
            .catch((err: any) => {
              console.log("err: ", err);
            });
        })
        .catch((err: any) => {
          toast.error("Something went wrong!", {
            position: "top-center",
            autoClose: 3500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: false,
          });
          console.log("err: ", err);
        });
    } catch (error) {
      setLocalComments((prevComments) =>
        prevComments.map((comment) =>
          comment.ID === updatedComment.ID ? updatedComment : comment
        )
      );
    }
  };

  const hasPublicComments =
    localComments?.length > 0 &&
    localComments?.some((comment) => !comment.IsPrivateComment);

  const userHasMentions = localComments.some((comment) =>
    // !comment.IsPrivateComment &&
    comment.TaggedPerson?.some(
      (user: any) => user?.ID === currentUserDetails?.id
    )
  );

  return (
    <>
      {!isITOwner && !isTicketManager ? (
        userHasMentions ? (
          localComments?.map((item, index) => {
            const CurrentUserIsMetioned = item?.TaggedPerson?.some(
              (user: any) => user?.ID === currentUserDetails?.id
            );

            const isAgents =
              // item?.Author?.ID === currentUserDetails?.id &&
              isTicketManager || isITOwner;

            if (item?.IsPrivateComment) {
              if (isAgents || CurrentUserIsMetioned) {
                return (
                  <CommentCard
                    key={item.ID}
                    data={item}
                    commentTypeOnChange={async (value: boolean) => {
                      await handleCommentChange(item, value);
                    }}
                    commentTypeValue={
                      item?.IsPrivateComment ? "Private" : "Public"
                    }
                    lastItem={localComments.length === index + 1}
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
                    isPrivateComment={item?.IsPrivateComment}
                    content={item?.Comment}
                    avatarSrc={`/_layouts/15/userphoto.aspx?size=S&username=${item?.Author?.EMail}`}
                    enableUtilDropDown={
                      item?.Author?.ID === currentUserDetails?.id
                    }
                  />
                );
              }
            } else {
              return (
                <CommentCard
                  key={item.ID}
                  data={item}
                  commentTypeOnChange={async (value: boolean) => {
                    await handleCommentChange(item, value);
                  }}
                  commentTypeValue={
                    item?.IsPrivateComment ? "Private" : "Public"
                  }
                  lastItem={localComments.length === index + 1}
                  ownComment={currentUserDetails?.email === item?.Author?.EMail}
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
                  isPrivateComment={item?.IsPrivateComment}
                  content={item?.Comment}
                  avatarSrc={`/_layouts/15/userphoto.aspx?size=S&username=${item?.Author?.EMail}`}
                  enableUtilDropDown={
                    item?.Author?.ID === currentUserDetails?.id &&
                    (isITOwner || isTicketManager)
                  }
                />
              );
            } // end of else
          })
        ) : hasPublicComments ? (
          localComments?.map((item, index) => {
            const CurrentUserIsMetioned = item?.TaggedPerson?.some(
              (user: any) => user?.ID === currentUserDetails?.id
            );

            const isAgents =
              // item?.Author?.ID === currentUserDetails?.id &&
              isTicketManager || isITOwner;

            if (item?.IsPrivateComment) {
              if (isAgents || CurrentUserIsMetioned) {
                return (
                  <CommentCard
                    key={item.ID}
                    data={item}
                    commentTypeOnChange={async (value: boolean) => {
                      await handleCommentChange(item, value);
                    }}
                    commentTypeValue={
                      item?.IsPrivateComment ? "Private" : "Public"
                    }
                    lastItem={localComments.length === index + 1}
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
                    isPrivateComment={item?.IsPrivateComment}
                    content={item?.Comment}
                    avatarSrc={`/_layouts/15/userphoto.aspx?size=S&username=${item?.Author?.EMail}`}
                    enableUtilDropDown={
                      item?.Author?.ID === currentUserDetails?.id
                    }
                  />
                );
              }
            } else {
              return (
                <CommentCard
                  key={item.ID}
                  data={item}
                  commentTypeOnChange={async (value: boolean) => {
                    await handleCommentChange(item, value);
                  }}
                  commentTypeValue={
                    item?.IsPrivateComment ? "Private" : "Public"
                  }
                  lastItem={localComments.length === index + 1}
                  ownComment={currentUserDetails?.email === item?.Author?.EMail}
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
                  isPrivateComment={item?.IsPrivateComment}
                  content={item?.Comment}
                  avatarSrc={`/_layouts/15/userphoto.aspx?size=S&username=${item?.Author?.EMail}`}
                  enableUtilDropDown={
                    item?.Author?.ID === currentUserDetails?.id &&
                    (isITOwner || isTicketManager)
                  }
                />
              );
            } // end of else
          })
        ) : (
          <div className={styles.loaderElement}>
            <span className={styles.loaderText}>No conversations found!</span>
          </div>
        )
      ) : isITOwner || isTicketManager ? (
        localComments?.map((item, index) => {
          const CurrentUserIsMetioned = item?.TaggedPerson?.some(
            (user: any) => user?.ID === currentUserDetails?.id
          );

          const isAgents =
            // item?.Author?.ID === currentUserDetails?.id &&
            isTicketManager || isITOwner;

          if (item?.IsPrivateComment) {
            if (isAgents || CurrentUserIsMetioned) {
              return (
                <CommentCard
                  key={item.ID}
                  data={item}
                  commentTypeOnChange={async (value: boolean) => {
                    await handleCommentChange(item, value);
                  }}
                  commentTypeValue={
                    item?.IsPrivateComment ? "Private" : "Public"
                  }
                  lastItem={localComments.length === index + 1}
                  ownComment={currentUserDetails?.email === item?.Author?.EMail}
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
                  isPrivateComment={item?.IsPrivateComment}
                  content={item?.Comment}
                  avatarSrc={`/_layouts/15/userphoto.aspx?size=S&username=${item?.Author?.EMail}`}
                  enableUtilDropDown={
                    item?.Author?.ID === currentUserDetails?.id
                  }
                />
              );
            }
          } else {
            return (
              <CommentCard
                key={item.ID}
                data={item}
                commentTypeOnChange={async (value: boolean) => {
                  await handleCommentChange(item, value);
                }}
                commentTypeValue={item?.IsPrivateComment ? "Private" : "Public"}
                lastItem={localComments.length === index + 1}
                ownComment={currentUserDetails?.email === item?.Author?.EMail}
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
                isPrivateComment={item?.IsPrivateComment}
                content={item?.Comment}
                avatarSrc={`/_layouts/15/userphoto.aspx?size=S&username=${item?.Author?.EMail}`}
                enableUtilDropDown={
                  item?.Author?.ID === currentUserDetails?.id &&
                  (isITOwner || isTicketManager)
                }
              />
            );
          } // end of else
        })
      ) : (
        <div className={styles.loaderElement}>
          <span className={styles.loaderText}>No conversations found!</span>
        </div>
      )}
    </>
  );
};

export default CommentsList;
