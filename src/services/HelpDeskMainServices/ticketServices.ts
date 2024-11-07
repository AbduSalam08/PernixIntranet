/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { sp } from "@pnp/sp";
import { toast } from "react-toastify";
import { CONFIG } from "../../config/config";
import { generateTicketNumber } from "../../utils/commonUtils";
import SpServices from "../SPServices/SpServices";
import dayjs from "dayjs";

const fetchLastTicketNumber = async (): Promise<string> => {
  try {
    const res = await sp.web.lists
      .getByTitle(CONFIG.ListNames.HelpDesk_AllTickets)
      .items.select("*")
      .get();

    const lastTicketID = Math.max(
      0,
      ...(res ?? [])
        .map((item: any) => item?.ID)
        .filter((id: number | undefined) => id !== undefined && id !== null)
    );

    return generateTicketNumber(lastTicketID + 1);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return "";
  }
};

export const extractPayload = async (
  formData: any,
  excludeKeys: string[],
  updateQuery: boolean
): Promise<any> => {
  // Retrieve the new ticket number asynchronously
  const newTicketNumber = await fetchLastTicketNumber();

  return Object.keys(formData).reduce((payload: any, key: any) => {
    const value = formData[key]?.value;

    if (!excludeKeys.includes(key) && value !== null) {
      // Set TicketNumber to the new ticket number if the key matches
      if (key === "TicketNumber" && !updateQuery) {
        payload[key] = newTicketNumber;
      } else {
        payload[key] =
          value &&
          typeof value === "object" &&
          "email" in value &&
          "id" in value &&
          "name" in value
            ? value.id
            : value;
      }
    }

    return payload;
  }, {});
};

const addAttachmentToTicket = async (
  ticketId: number,
  attachment: File,
  prevToastID: any
): Promise<void> => {
  const toastId = prevToastID || toast.loading("Creating ticket...");
  try {
    await sp.web.lists
      .getByTitle(CONFIG.ListNames.HelpDesk_AllTickets)
      .items.getById(ticketId)
      .attachmentFiles.add(attachment.name, attachment);

    toast.update(toastId, {
      render: "Ticket added successfully!",
      type: "success",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  } catch (error) {
    console.error("Error adding attachment:", error);
    toast.update(toastId, {
      render: "Error adding attachment. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
    throw error;
  }
};

export const copyAttachment = async (
  sourceItemID: number,
  targetItemID: number,
  listName: string
): Promise<void> => {
  try {
    // Step 1: Retrieve attachments from the source item
    const attachments = await sp.web.lists
      .getByTitle(listName)
      .items.getById(sourceItemID)
      .attachmentFiles();

    if (attachments.length === 0) {
      console.log("No attachments found on the source item.");
      return;
    }

    // Step 2: Download each attachment and upload it to the target item
    for (const attachment of attachments) {
      const fileResponse = await fetch(attachment.ServerRelativeUrl);
      const fileBlob = await fileResponse.blob();

      // Step 3: Upload the attachment to the target item
      await sp.web.lists
        .getByTitle(listName)
        .items.getById(targetItemID)
        .attachmentFiles.add(attachment.FileName, fileBlob);
    }

    console.log("Attachments copied successfully.");
  } catch (error) {
    console.error("Error copying attachments: ", error);
    throw error;
  }
};

export const addNewTicket = async (
  formData: any,
  excludeKeys: string[],
  repeatTicket?: boolean
): Promise<any> => {
  console.log("formData: ", formData);
  const payload = await extractPayload(formData, excludeKeys, false);
  const extraPayload = {
    TicketClosedOn: payload?.Status === "Closed" ? dayjs(new Date()) : null,
  };

  const toastId = toast.loading("Creating ticket...");
  try {
    const response = await sp.web.lists
      .getByTitle(CONFIG.ListNames.HelpDesk_AllTickets)
      .items.add({ ...payload, ...extraPayload });

    const ticketId = response.data.Id;

    if (formData?.Attachment?.value) {
      await addAttachmentToTicket(ticketId, formData.Attachment.value, toastId);
    } else {
      toast.update(toastId, {
        render: "Ticket added successfully!",
        type: "success",
        isLoading: false,
        autoClose: 5000,
        hideProgressBar: false,
      });
    }

    if (repeatTicket) {
      await copyAttachment(
        payload?.RepeatedTicketSourceId,
        ticketId,
        CONFIG.ListNames.HelpDesk_AllTickets
      );
    }
  } catch (error) {
    console.error("Error adding ticket:", error);
    toast.update(toastId, {
      render: "Error adding ticket. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
    throw error;
  }
};

export const updateTicket = async (
  ticketID: any,
  formData: any,
  excludeKeys: any
): Promise<any> => {
  console.log("formData: ", formData);
  const payload = await extractPayload(formData, excludeKeys, true);
  console.log("payload: ", payload);
  const extraPayload = {
    TicketClosedOn: payload?.Status === "Closed" ? dayjs(new Date()) : null,
  };

  const toastId = toast.loading("Updating ticket...");
  try {
    await SpServices.SPUpdateItem({
      Listname: CONFIG.ListNames.HelpDesk_AllTickets,
      ID: ticketID,
      RequestJSON: { ...payload, ...extraPayload },
    })
      .then(async (res: any) => {
        console.log("res: ", res);

        // updation of attachment
        const attachments = await sp.web.lists
          .getByTitle(CONFIG.ListNames.HelpDesk_AllTickets)
          .items.getById(ticketID)
          .attachmentFiles();

        if (formData?.Attachment?.value !== null) {
          try {
            // Check if an attachment was provided and if it's different from the existing one
            if (formData?.Attachment?.value?.name) {
              if (
                attachments.length === 0 ||
                (attachments.length > 0 &&
                  attachments[0]?.FileName !==
                    formData?.Attachment?.value?.name)
              ) {
                // Delete existing attachments if there are any
                if (attachments.length !== 0) {
                  await SpServices.SPDeleteAttachments({
                    ListName: CONFIG.ListNames.HelpDesk_AllTickets,
                    ListID: ticketID,
                    AttachmentName: attachments[0]?.FileName,
                  });
                }

                // Add the new attachment if a valid one is provided
                if (formData?.Attachment.value?.type) {
                  await sp.web.lists
                    .getByTitle(CONFIG.ListNames.HelpDesk_AllTickets)
                    .items.getById(ticketID)
                    .attachmentFiles.add(
                      formData?.Attachment.value.name,
                      formData?.Attachment.value
                    );

                  console.log("Attachment updated successfully.");
                }
              } else {
                console.log("No changes detected in the attachment.");
              }
            }
          } catch (err) {
            console.error("Error handling attachments: ", err);
          }
        } else {
          // Handle case when `Attachment` is null (indicating a removal)
          if (attachments.length !== 0) {
            try {
              await SpServices.SPDeleteAttachments({
                ListName: CONFIG.ListNames.HelpDesk_AllTickets,
                ListID: ticketID,
                AttachmentName: attachments[0]?.FileName,
              });

              console.log("Attachment removed!");
            } catch (err) {
              console.error("Error removing attachments: ", err);
            }
          } else {
            console.log("No attachments to remove.");
          }
        }
      })
      .catch((err: any) => {
        console.log("err: ", err);
        toast.update(toastId, {
          render: "Error while updating ticket. Please try again.",
          type: "error",
          isLoading: false,
          autoClose: 5000,
          hideProgressBar: false,
        });
      });

    toast.update(toastId, {
      render: "Ticket updated!",
      type: "success",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  } catch (error) {
    console.error("Error while updating ticket:", error);
    toast.update(toastId, {
      render: "Error while updating ticket. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
    throw error;
  }
};
