/* eslint-disable no-debugger */
/* eslint-disable @typescript-eslint/no-explicit-any */
// import dayjs from "dayjs";
import { CONFIG } from "../../config/config";
import SpServices from "../SPServices/SpServices";
import { setNewsIntranetData } from "../../redux/features/NewsIntranetSlice";
import { sp } from "@pnp/sp/presets/all";
import { toast } from "react-toastify";

export const getStatusStyles = (status: string | any) => {
  const statusColors: {
    [key: string]: { background: string; color: string };
  } = {
    [CONFIG.blogStatus.Draft]: { background: "#51515136", color: "#515151" },
    [CONFIG.blogStatus.Pending]: {
      background: "#cec41936",
      color: "#484502",
    },
    [CONFIG.blogStatus.Approved]: {
      background: "#00bb0436",
      color: "#00bb04",
    },
    default: { background: "#bb000036", color: "#bb0000" }, // Default for rejected or unknown status
  };

  return statusColors[status] || statusColors.default;
};

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
      Select: "*, Author/EMail, Author/Title,Author/ID",
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
      const StartDate = item.StartDate ? item?.StartDate : null;
      const EndDate = item.EndDate ? item?.EndDate : null;
      const ID = item.Id || item.ID;
      const Author = item?.Author?.EMail || "";
      const AuthorName = item?.Author?.Title || "";
      const AuthorId = item?.Author?.ID || null;
      const isActive = item?.isActive || false;

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
        AuthorId,
        isActive,
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

export const addNews = async (formData: any, status?: string): Promise<any> => {
  const toastId = toast.loading("Creating news...");

  try {
    // Prepare payload by omitting thumbnail
    const payload = Object.keys(formData).reduce((acc: any, key: string) => {
      if (
        key.toLowerCase() !== "thumbnail" &&
        !(key.toLowerCase() === "startdate" || key.toLowerCase() === "enddate")
      ) {
        acc[key] =
          // key.toLowerCase() === "startdate" || key.toLowerCase() === "enddate"
          //   ? null
          //   :  ? dayjs(formData[key].value).toDate()
          key == "Status" ? status : formData[key].value;
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
      render: "News added successfully!",
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
  isfile: boolean,
  status?: string
): Promise<any> => {
  const toastId = toast.loading("Updating the news in progress...");

  try {
    // Prepare payload by omitting thumbnail
    const payload = Object.keys(formData).reduce((acc: any, key: string) => {
      if (key.toLowerCase() !== "thumbnail") {
        acc[key] =
          key.toLowerCase() === "startdate" || key.toLowerCase() === "enddate"
            ? null
            : // ? dayjs(formData[key].value).toDate()
            key == "Status"
            ? status
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
      render: "News updated successfully!",
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
      render: "News deleted successfully!",
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

export const inActive = async (
  newsID: number,
  status: string
): Promise<any> => {
  try {
    // Delete item from the SharePoint list
    await SpServices.SPUpdateItem({
      Listname: CONFIG.ListNames.Intranet_News,
      ID: newsID,
      RequestJSON: {
        isActive: status,
      },
    });

    // toast.update(toastId, {
    //   render: "News deleted successfully!",
    //   type: "success",
    //   isLoading: false,
    //   autoClose: 5000,
    //   hideProgressBar: false,
    // });
  } catch (error) {
    console.error("Error while deleting news:", error);

    // toast.update(toastId, {
    //   render: "An error occurred while deleting this news. Please try again.",
    //   type: "error",
    //   isLoading: false,
    //   autoClose: 5000,
    //   hideProgressBar: false,
    // });
  }
};
// export const handleApprove = async (
//   newsID: number,
//   status?: any,
//   formdata?: any,
//   approveorReject?: any
// ): Promise<any> => {
//   if (approveorReject == "Reject") {
//     try {
//       // Delete item from the SharePoint list
//       await SpServices.SPUpdateItem({
//         Listname: CONFIG.ListNames.Intranet_News,
//         ID: newsID,
//         RequestJSON: {
//           Status: "Rejected",
//           // StartDate: new Date(formdata.StartDate.value),
//           // EndDate: new Date(formdata.EndDate.value),
//         },
//       });

//       // toast.update(toastId, {
//       //   render: "News deleted successfully!",
//       //   type: "success",
//       //   isLoading: false,
//       //   autoClose: 5000,
//       //   hideProgressBar: false,
//       // });
//     } catch (error) {
//       console.error("Error while deleting news:", error);

//       // toast.update(toastId, {
//       //   render: "An error occurred while deleting this news. Please try again.",
//       //   type: "error",
//       //   isLoading: false,
//       //   autoClose: 5000,
//       //   hideProgressBar: false,
//       // });
//     }
//   }

//    else {
//     const toastId = toast.loading("Deleting the news in progress...");

//     try {
//       // Delete item from the SharePoint list
//       await SpServices.SPUpdateItem({
//         Listname: CONFIG.ListNames.Intranet_News,
//         ID: newsID,
//         RequestJSON: {
//           Status: status ? "Approved" : "",
//           StartDate: new Date(formdata.StartDate.value),
//           EndDate: new Date(formdata.EndDate.value),
//         },
//       });

//       toast.update(toastId, {
//         render: "News Approved successfully!",
//         type: "success",
//         isLoading: false,
//         autoClose: 5000,
//         hideProgressBar: false,
//       });
//     } catch (error) {
//       console.error("Error while deleting news:", error);

//       toast.update(toastId, {
//         render: "An error occurred while deleting this news. Please try again.",
//         type: "error",
//         isLoading: false,
//         autoClose: 5000,
//         hideProgressBar: false,
//       });
//     }
//   }
// };
export const handleApproveReject = async (
  newsID: number,
  status?: boolean,
  formdata?: any,
  approveOrReject?: string
): Promise<any> => {
  const isReject = approveOrReject === "Reject";
  const toastMessage = isReject
    ? "Rejecting the news..."
    : "Approving the news...";
  const successMessage = isReject
    ? "News rejected successfully!"
    : "News approved successfully!";
  const errorMessage = `An error occurred while ${
    isReject ? "rejecting" : "approving"
  } this news. Please try again.`;

  const toastId = toast.loading(toastMessage);

  try {
    await SpServices.SPUpdateItem({
      Listname: CONFIG.ListNames.Intranet_News,
      ID: newsID,
      RequestJSON: {
        Status: isReject ? "Rejected" : status ? "Approved" : "",
        ...(isReject
          ? {}
          : {
              StartDate: new Date(formdata?.StartDate?.value),
              EndDate: new Date(formdata?.EndDate?.value),
            }),
      },
    });

    toast.update(toastId, {
      render: successMessage,
      type: "success",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  } catch (error) {
    console.error(
      `Error while ${isReject ? "rejecting" : "approving"} news:`,
      error
    );

    toast.update(toastId, {
      render: errorMessage,
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  }
};
