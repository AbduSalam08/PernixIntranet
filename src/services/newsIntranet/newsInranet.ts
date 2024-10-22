/* eslint-disable no-debugger */
import dayjs from "dayjs";
import { CONFIG } from "../../config/config";
import SpServices from "../SPServices/SpServices";
import { setNewsIntranetData } from "../../redux/features/NewsIntranetSlice";
import { sp } from "@pnp/sp/presets/all";

/* eslint-disable @typescript-eslint/no-explicit-any */

export const getAllNewsData = async (dispatch: any): Promise<any> => {
  dispatch?.(
    setNewsIntranetData({
      isLoading: true,
    })
  );
  try {
    // Fetch news data
    const response = await SpServices.SPReadItems({
      Listname: CONFIG.ListNames.Intranet_News,
    });
    console.log("response: ", response);

    const attachmentPromises = response?.map(async (item: any) => {
      const attachments = await SpServices.SPGetAttachments({
        Listname: CONFIG.ListNames.Intranet_News,
        ID: item.ID,
      });

      // Process and prepare the item data
      const imageUrl =
        attachments.length > 0 ? attachments[0].ServerRelativeUrl : ""; // Assuming the first attachment is the image
      const FileName = attachments.length > 0 ? attachments[0] : ""; // Assuming the first attachment is the image
      const title = item.Title;
      const description = item.Description;
      const Status = item.Status;
      const StartDate = item.StartDate;
      const EndDate = item.EndDate;
      const ID = item.Id || item.ID;

      return {
        imageUrl,
        title,
        description,
        Status,
        StartDate,
        EndDate,
        FileName,
        ID,
      };
    });

    // Wait for all attachment fetching promises to complete
    const newsData = await Promise.all(attachmentPromises);

    console.log("newsData: ", newsData);
    // Dispatch the data
    dispatch?.(
      setNewsIntranetData({
        isLoading: false,
        data: newsData,
        // error: "Error fetching news data",
      })
    );
  } catch (error) {
    console.error("Error fetching news data:", error);
    dispatch?.(
      setNewsIntranetData({
        isLoading: false,
        data: [],
        error: error.message || "Error fetching news data",
      })
    );
  }
};

export const addNews = async (
  formData: any,
  setLoaderState: any,
  index: number
): Promise<any> => {
  // Start loader for the specific item at the given index
  setLoaderState((prevState: any) => {
    const updatedState = [...prevState]; // Create a copy of the array
    updatedState[index] = {
      ...updatedState[index],
      popupWidth: "450px",
      isLoading: {
        inprogress: true,
        error: false,
        success: false,
      },
    };
    return updatedState;
  });
  try {
    debugger;
    // Prepare payload by omitting thumbnail
    const payload = Object.keys(formData).reduce((acc: any, key: string) => {
      if (key.toLowerCase() !== "thumbnail") {
        acc[key] =
          key.toLowerCase() === "startdate" || key.toLowerCase() === "enddate"
            ? dayjs(formData[key].value).toDate() // Convert directly to Date
            : formData[key].value;
      }
      return acc;
    }, {});

    // Add item to the SharePoint list
    const addItem: any = await SpServices.SPAddItem({
      Listname: CONFIG.ListNames.Intranet_News,
      RequestJSON: payload,
    });

    // Handle thumbnail attachment only if it exists
    if (formData?.thumbnail?.value) {
      await SpServices.SPAddAttachment({
        ListName: CONFIG.ListNames.Intranet_News,
        ListID: addItem?.data?.ID,
        FileName: formData.thumbnail.value?.name,
        Attachments: formData.thumbnail.value,
      });
    }

    // Success state after item and attachment are added
    setLoaderState((prevState: any) => {
      const updatedState = [...prevState]; // Copy state array
      updatedState[index] = {
        ...updatedState[index],
        popupWidth: "450px",
        isLoading: {
          inprogress: false,
          success: true,
          error: false,
        },
        messages: {
          ...updatedState[index].messages,
          successDescription: `The new news '${formData.Title.value}' has been added successfully.`,
        },
      };
      return updatedState;
    });
  } catch (error) {
    console.error("Error while adding news:", error);

    // Handle error state
    setLoaderState((prevState: any) => {
      const updatedState = [...prevState]; // Copy state array
      updatedState[index] = {
        ...updatedState[index],
        popupWidth: "450px",
        isLoading: {
          inprogress: false,
          success: false,
          error: true,
        },
        messages: {
          ...updatedState[index].messages,
          errorDescription:
            "An error occurred while adding news, please try again later.",
        },
      };
      return updatedState;
    });
  }
};

export const editNews = async (
  formData: any,
  setLoaderState: any,
  index: number,
  itemId: number,
  isfile: boolean
): Promise<any> => {
  debugger;
  // Start loader for the specific item at the given index
  setLoaderState((prevState: any) => {
    const updatedState = [...prevState];
    updatedState[index] = {
      ...updatedState[index],
      popupWidth: "450px",
      isLoading: {
        inprogress: true,
        error: false,
        success: false,
      },
    };
    return updatedState;
  });

  try {
    // Prepare payload by omitting thumbnail
    const payload = Object.keys(formData).reduce((acc: any, key: string) => {
      if (key.toLowerCase() !== "thumbnail") {
        acc[key] =
          key.toLowerCase() === "startdate" || key.toLowerCase() === "enddate"
            ? dayjs(formData[key].value).toDate()
            : formData[key].value;
      }
      return acc;
    }, {});

    // Update the item using PnPJS
    const item = await sp.web.lists
      .getByTitle(CONFIG.ListNames.Intranet_News)
      .items.getById(itemId)
      .update(payload);
    console.log("item: ", item);

    if (isfile) {
      if (formData?.thumbnail?.value) {
        const attachments = await sp.web.lists
          .getByTitle(CONFIG.ListNames.Intranet_News)
          .items.getById(itemId)
          .attachmentFiles();

        for (const attachment of attachments) {
          await sp.web.lists
            .getByTitle(CONFIG.ListNames.Intranet_News)
            .items.getById(itemId)
            .attachmentFiles.getByName(attachment.FileName)
            .delete();
        }
        debugger;
        await sp.web.lists
          .getByTitle(CONFIG.ListNames.Intranet_News)
          .items.getById(itemId)
          .attachmentFiles.add(
            formData.thumbnail?.value?.name,
            formData?.thumbnail?.value
          );
      }
    }
    // Success state after item and attachment are updated
    setLoaderState((prevState: any) => {
      const updatedState = [...prevState];
      updatedState[index] = {
        ...updatedState[index],
        popupWidth: "450px",
        isLoading: {
          inprogress: false,
          success: true,
          error: false,
        },
        messages: {
          ...updatedState[index].messages,
          successDescription: `The news '${formData.Title.value}' has been updated successfully.`,
        },
      };
      return updatedState;
    });
  } catch (error) {
    console.error("Error while editing news:", error);

    // Handle error state
    setLoaderState((prevState: any) => {
      const updatedState = [...prevState];
      updatedState[index] = {
        ...updatedState[index],
        popupWidth: "450px",
        isLoading: {
          inprogress: false,
          success: false,
          error: true,
        },
        messages: {
          ...updatedState[index].messages,
          errorDescription:
            "An error occurred while updating the news, please try again later.",
        },
      };
      return updatedState;
    });
  }
};

export const deleteNews = async (
  newsID: number,
  setLoaderState: any,
  index: number
): Promise<any> => {
  // Start loader for the specific item at the given index
  setLoaderState((prevState: any) => {
    const updatedState = [...prevState];
    updatedState[index] = {
      ...updatedState[index],
      popupWidth: "450px",
      isLoading: {
        inprogress: true,
        error: false,
        success: false,
      },
    };
    return updatedState;
  });

  try {
    // Delete item from the SharePoint list
    await SpServices.SPDeleteItem({
      Listname: CONFIG.ListNames.Intranet_News,
      ID: newsID,
    });

    // Success state after the item is deleted
    setLoaderState((prevState: any) => {
      const updatedState = [...prevState];
      updatedState[index] = {
        ...updatedState[index],
        popupWidth: "450px",
        isLoading: {
          inprogress: false,
          success: true,
          error: false,
        },
        messages: {
          ...updatedState[index].messages,
          successDescription: `The news with ID '${newsID}' has been deleted successfully.`,
        },
      };
      return updatedState;
    });
  } catch (error) {
    console.error("Error while deleting news:", error);

    // Handle error state
    setLoaderState((prevState: any) => {
      const updatedState = [...prevState];
      updatedState[index] = {
        ...updatedState[index],
        popupWidth: "450px",
        isLoading: {
          inprogress: false,
          success: false,
          error: true,
        },
        messages: {
          ...updatedState[index].messages,
          errorDescription:
            "An error occurred while deleting news, please try again later.",
        },
      };
      return updatedState;
    });
  }
};
