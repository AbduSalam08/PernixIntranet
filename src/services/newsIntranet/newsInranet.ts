/* eslint-disable no-debugger */
/* eslint-disable @typescript-eslint/no-explicit-any */
import dayjs from "dayjs";
import { CONFIG } from "../../config/config";
import SpServices from "../SPServices/SpServices";
import { setNewsIntranetData } from "../../redux/features/NewsIntranetSlice";
import { sp } from "@pnp/sp/presets/all";
import { toast } from "react-toastify";

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
      Select: "*, Author/EMail, Author/Title",
      Expand: "Author",
      Filter: [
        {
          FilterKey: "isDelete",
          Operator: "ne",
          FilterValue: "1",
        },
      ],
      Topcount: 5000,
      Orderby: "Created",
      Orderbydecorasc: false,
    });

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
      const Author = item?.Author?.EMail || "";
      const AuthorName = item?.Author?.Title || "";

      return {
        imageUrl,
        title,
        description,
        Status,
        StartDate,
        EndDate,
        FileName,
        Author,
        AuthorName,
        ID,
      };
    });

    // Wait for all attachment fetching promises to complete
    const newsData = await Promise.all(attachmentPromises);

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

export const addNews = async (formData: any): Promise<any> => {
  const toastId = toast.loading("Creating news...");

  try {
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

    toast.update(toastId, {
      render: "The new news has been added successfully!",
      type: "success",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  } catch (error) {
    console.error("Error while adding news:", error);

    toast.update(toastId, {
      render: "Error adding new news. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  }
};

export const editNews = async (
  formData: any,
  itemId: number,
  isfile: boolean
): Promise<any> => {
  const toastId = toast.loading("Updating the news in progress...");

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
    await sp.web.lists
      .getByTitle(CONFIG.ListNames.Intranet_News)
      .items.getById(itemId)
      .update(payload);

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
        await sp.web.lists
          .getByTitle(CONFIG.ListNames.Intranet_News)
          .items.getById(itemId)
          .attachmentFiles.add(
            formData.thumbnail?.value?.name,
            formData?.thumbnail?.value
          );
      }
    }

    toast.update(toastId, {
      render: "This news has been successfully updated!",
      type: "success",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  } catch (error) {
    console.error("Error while editing news:", error);

    toast.update(toastId, {
      render: "An error occurred while updating this news. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  }
};

export const deleteNews = async (newsID: number): Promise<any> => {
  const toastId = toast.loading("Deleting the news in progress...");

  try {
    // Delete item from the SharePoint list
    await SpServices.SPUpdateItem({
      Listname: CONFIG.ListNames.Intranet_News,
      ID: newsID,
      RequestJSON: {
        isDelete: true,
      },
    });

    toast.update(toastId, {
      render: "This news has been successfully deleted!",
      type: "success",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  } catch (error) {
    console.error("Error while deleting news:", error);

    toast.update(toastId, {
      render: "An error occurred while deleting this news. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  }
};
