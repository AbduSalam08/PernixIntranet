/* eslint-disable @typescript-eslint/no-explicit-any */
import { CONFIG } from "../../config/config";
import { getLastQuoteBasedOnDate } from "../../utils/mainBannerIntranet";
// import SpServices from "../SPServices/SpServices";
import { sp } from "@pnp/sp";

// Helper function to check if a file is an image with specific extensions
const isValidImage = (filename: string): boolean => {
  const validExtensions = ["jpeg", "jpg", "png", "svg"];
  const extension = filename.split(".").pop()?.toLowerCase();
  return validExtensions.includes(extension ?? "");
};

// Function to get the attachment URLs
const getAttachmentsForItem = async (itemId: number): Promise<string[]> => {
  try {
    // Fetch attachments for the given item ID
    const attachments = await sp.web.lists
      .getByTitle(CONFIG.ListNames.Intranet_MotivationalQuotes)
      .items.getById(itemId)
      .attachmentFiles.get();

    return attachments
      .filter((attachment: any) => isValidImage(attachment.FileName))
      .map((attachment: any) => attachment.ServerRelativeUrl);
  } catch (err) {
    console.error("Error fetching attachments:", err);
    return [];
  }
};

export const getDailyQuote = async (): Promise<any> => {
  try {
    // Fetch items from the list
    const res = await sp.web.lists
      .getByTitle(CONFIG.ListNames.Intranet_MotivationalQuotes)
      .items.select("*")
      .get();

    if (!res || res.length === 0) {
      console.log("No items found.");
      return null; // Return null if no items are found
    }

    // Get the latest item based on the date
    const latestItem = getLastQuoteBasedOnDate(res);

    if (!latestItem) {
      console.log("No latest item found.");
      return null;
    }

    // Get attachments for the latest item
    const attachments = await getAttachmentsForItem(latestItem.Id);

    if (attachments.length > 0) {
      // Return the quote data and the URL of the first valid image
      return {
        quotesData: latestItem,
        bannerImage: attachments[0], // Return the first valid image URL
      };
    }

    // If no valid image attachment is found, return null
    return {
      quotesData: latestItem,
      bannerImage: null,
    };
  } catch (err) {
    // Log error and return null if there's an issue
    console.error("Error fetching daily quote:", err);
    return null;
  }
};
