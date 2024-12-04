/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "react-toastify";
import { CONFIG } from "../../config/config";
import SpServices from "../SPServices/SpServices";
import { sp } from "@pnp/sp";

export const addComment = async (
  formData: any,
  alltaggedPersons: any
): Promise<any> => {
  const toastId = toast.loading("Adding comment...");
  try {
    await SpServices.SPAddItem({
      Listname: CONFIG.ListNames.HelpDesk_TicketConversations,
      RequestJSON: {
        Comment: formData?.Comment,
        TaggedPersonId: formData?.TaggedPersonId,
        IsEdited: false,
        TicketDetailsId: formData?.TicketDetailsId,
      },
    })
      .then(async (res: any) => {
        await SpServices.SPUpdateItem({
          Listname: CONFIG.ListNames.HelpDesk_AllTickets,
          ID: formData?.TicketDetailsId,
          RequestJSON: {
            TaggedPersonId: {
              results: [
                ...alltaggedPersons,
                ...formData?.TaggedPersonId?.results,
              ]?.filter((item: any) => item !== null && item !== undefined),
            },
          },
        })
          .then((res: any) => {
            console.log("res: ", res);
            toast.update(toastId, {
              render: "Comment added successfully!",
              type: "success",
              isLoading: false,
              autoClose: 5000,
              hideProgressBar: false,
            });
          })
          .catch((err: any) => {
            console.log("err: ", err);
          });
      })
      .catch((err: any) => {
        console.log("err: ", err);
        toast.update(toastId, {
          render: "Error adding comment. Please try again.",
          type: "error",
          isLoading: false,
          autoClose: 5000,
          hideProgressBar: false,
        });
      });
  } catch (err: any) {
    console.log("err: ", err);
    toast.update(toastId, {
      render: "Error adding comment. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  }
};

export const getAllComments = async (
  ticketNumber: any,
  setData: any,
  noLoader: boolean
): Promise<any> => {
  console.log("ticketNumber: ", ticketNumber);
  setData((prev: any) => ({
    ...prev,
    isLoading: !noLoader,
    data: prev?.data,
  }));
  try {
    await SpServices.SPReadItems({
      Listname: CONFIG.ListNames.HelpDesk_TicketConversations,
      Select:
        "*, TaggedPerson/ID, TaggedPerson/EMail, TaggedPerson/Title, TicketDetails/ID, Author/ID, Author/EMail, Author/Title",
      Expand: "TaggedPerson, TicketDetails, Author",
      Filter: [
        {
          FilterValue: ticketNumber,
          FilterKey: "TicketDetails",
          Operator: "eq",
        },
      ],
    })
      .then((res: any) => {
        console.log("res: ", res);
        setData({
          isLoading: false,
          data: res,
        });
      })
      .catch((err: any) => {
        console.log("err: ", err);
        setData({
          isLoading: false,
          isError: true,
          errorMsg:
            "something went wrong while fectching the conversations, please try again!",
        });
      });
  } catch (err: any) {
    console.log("err: ", err);
    setData({
      isLoading: false,
      isError: true,
      errorMsg:
        "something went wrong while fectching the conversations, please try again!",
    });
  }
};

export const deleteComment = async (ticketId: number): Promise<any> => {
  const toastId = toast.loading("deleting comment...");

  try {
    await SpServices.SPDeleteItem({
      Listname: CONFIG.ListNames.HelpDesk_TicketConversations,
      ID: ticketId,
    })
      .then((res: any) => {
        toast.update(toastId, {
          render: "Comment deleted!",
          type: "success",
          isLoading: false,
          autoClose: 5000,
          hideProgressBar: false,
        });
      })
      .catch((err: any) => {
        console.log("err: ", err);
        toast.update(toastId, {
          render: "Unable to delete the comment. Please try again.",
          type: "error",
          isLoading: false,
          autoClose: 5000,
          hideProgressBar: false,
        });
      });
  } catch (err: any) {
    console.log("err: ", err);
    console.log("err: ", err);
    toast.update(toastId, {
      render: "Unable to delete the comment. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  }
};

export const getAttachmentofTicket = async (ticketID: number): Promise<any> => {
  try {
    const attachments = await sp.web.lists
      .getByTitle(CONFIG.ListNames.HelpDesk_AllTickets)
      .items.getById(ticketID)
      .attachmentFiles();
    console.log("Attachments: ", attachments);
    return attachments;
  } catch (error) {
    console.error("Error retrieving attachments: ", error);
    throw error;
  }
};
