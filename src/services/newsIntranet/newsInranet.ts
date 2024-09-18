/* eslint-disable no-debugger */
import dayjs from "dayjs";
import { LISTNAMES } from "../../config/config";
import SpServices from "../SPServices/SpServices";
import { setNewsIntranetData } from "../../redux/features/NewsIntranetSlice";

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
      Listname: LISTNAMES.Intranet_News,
    });
    console.log("response: ", response);

    // Prepare an array to hold promises for fetching attachments
    const attachmentPromises = response?.map(async (item: any) => {
      // Fetch attachments for the current news item
      const attachments = await SpServices.SPGetAttachments({
        Listname: LISTNAMES.Intranet_News,
        ID: item.ID,
      });

      // Process and prepare the item data
      const imageUrl =
        attachments.length > 0 ? attachments[0].ServerRelativeUrl : ""; // Assuming the first attachment is the image
      const title = item.Title;
      const description = item.Description;

      return {
        imageUrl,
        title,
        description,
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
      Listname: LISTNAMES.Intranet_News,
      RequestJSON: payload,
    });

    // Handle thumbnail attachment only if it exists
    if (formData?.thumbnail?.value) {
      await SpServices.SPAddAttachment({
        ListName: LISTNAMES.Intranet_News,
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
