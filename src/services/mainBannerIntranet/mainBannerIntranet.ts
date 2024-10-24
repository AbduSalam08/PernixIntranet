// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { CONFIG } from "../../config/config";
// import { getLastQuoteBasedOnDate } from "../../utils/mainBannerIntranet";
// // import SpServices from "../SPServices/SpServices";
// import { sp } from "@pnp/sp";

// // Helper function to check if a file is an image with specific extensions
// const isValidImage = (filename: string): boolean => {
//   const validExtensions = ["jpeg", "jpg", "png", "svg"];
//   const extension = filename.split(".").pop()?.toLowerCase();
//   return validExtensions.includes(extension ?? "");
// };

// // Function to get the attachment URLs
// const getAttachmentsForItem = async (itemId: number): Promise<string[]> => {
//   try {
//     // Fetch attachments for the given item ID
//     const attachments = await sp.web.lists
//       .getByTitle(CONFIG.ListNames.Intranet_MotivationalQuotes)
//       .items.getById(itemId)
//       .attachmentFiles.get();

//     return attachments
//       .filter((attachment: any) => isValidImage(attachment.FileName))
//       .map((attachment: any) => attachment.ServerRelativeUrl);
//   } catch (err) {
//     console.error("Error fetching attachments:", err);
//     return [];
//   }
// };

// export const getDailyQuote = async (): Promise<any> => {
//   try {
//     // Fetch items from the list
//     const res = await sp.web.lists
//       .getByTitle(CONFIG.ListNames.Intranet_MotivationalQuotes)
//       .items.select("*")
//       .get();

//     if (!res || res.length === 0) {
//       console.log("No items found.");
//       return null; // Return null if no items are found
//     }

//     // Get the latest item based on the date
//     const latestItem = getLastQuoteBasedOnDate(res);

//     if (!latestItem) {
//       console.log("No latest item found.");
//       return null;
//     }

//     // Get attachments for the latest item
//     const attachments = await getAttachmentsForItem(latestItem.Id);

//     if (attachments.length > 0) {
//       // Return the quote data and the URL of the first valid image
//       return {
//         quotesData: latestItem,
//         bannerImage: attachments[0], // Return the first valid image URL
//       };
//     }

//     // If no valid image attachment is found, return null
//     return {
//       quotesData: latestItem,
//       bannerImage: null,
//     };
//   } catch (err) {
//     // Log error and return null if there's an issue
//     console.error("Error fetching daily quote:", err);
//     return null;
//   }
// };

/* eslint-disable @typescript-eslint/no-explicit-any */
import moment from "moment";
import { CONFIG } from "../../config/config";
import SpServices from "../SPServices/SpServices";
import { IAttachDetails, IQuoteDatas } from "../../interface/interface";
import { sp } from "@pnp/sp/presets/all";

interface IFormData {
  [key: string]: { value: any };
}

interface ILoaderStateItem {
  popupWidth: string;
  isLoading: {
    inprogress: boolean;
    error: boolean;
    success: boolean;
  };
  messages?: {
    successDescription?: string;
    errorDescription?: string;
  };
}

const prepareRecords = async (res: any): Promise<IQuoteDatas[]> => {
  let preparedArray: IQuoteDatas[] = [];

  try {
    preparedArray = await Promise.all(
      res?.map(async (val: any) => {
        let arrGetAttach: IAttachDetails[] = [];

        await val?.AttachmentFiles?.forEach((attach: any) => {
          arrGetAttach.push({
            fileName: attach.FileName,
            content: null,
            serverRelativeUrl: attach.ServerRelativeUrl,
          });
        });

        return {
          ID: val?.ID || null,
          Quote: val?.Quote || "",
          StartDate: val.StartDate
            ? moment(val.StartDate).format(CONFIG.DateFormat)
            : null,
          EndDate: val.EndDate
            ? moment(val.EndDate).format(CONFIG.DateFormat)
            : null,
          Attachments: arrGetAttach?.[0]?.serverRelativeUrl || "",
          FileName: arrGetAttach?.[0]?.fileName || "",
          Status: val?.Status || "",
          IsDelete: false,
        };
      })
    );

    return [...preparedArray];
  } catch (err) {
    console.log("err: ", err);
    return [];
  }
};

export const getDailyQuote = async (): Promise<IQuoteDatas[]> => {
  try {
    const res: any = await SpServices.SPReadItems({
      Listname: CONFIG.ListNames.Intranet_MotivationalQuotes,
      Select: "*, AttachmentFiles",
      Expand: "AttachmentFiles",
      Filter: [
        {
          FilterKey: "IsDelete",
          Operator: "ne",
          FilterValue: "1",
        },
      ],
      Topcount: 5000,
      Orderby: "Created",
      Orderbydecorasc: false,
    });

    const latestItem: IQuoteDatas[] = await prepareRecords(res);

    return [...latestItem];
  } catch (err) {
    console.error("Error fetching daily quote:", err);
    return [];
  }
};

export const getChoiceData = async (): Promise<string[]> => {
  try {
    const res: any = await SpServices.SPGetChoices({
      Listname: CONFIG.ListNames.Intranet_MotivationalQuotes,
      FieldName: CONFIG.MotivateColumn.Status,
    });

    const dropData: string[] = res?.Choices || [];

    return [...dropData];
  } catch (err) {
    console.log("err: ", err);
    return [];
  }
};

export const addMotivated = async (
  formData: IFormData,
  fileData: any,
  setLoaderState: React.Dispatch<React.SetStateAction<ILoaderStateItem[]>>,
  index: number
): Promise<any> => {
  setLoaderState((prevState) => {
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
    let fileRes: any;

    const res: any = await SpServices.SPAddItem({
      Listname: CONFIG.ListNames.Intranet_MotivationalQuotes,
      RequestJSON: { ...formData },
    });

    if (fileData?.Attachments?.name) {
      fileRes = await sp.web.lists
        .getByTitle(CONFIG.ListNames.Intranet_MotivationalQuotes)
        .items.getById(res.data.Id)
        .attachmentFiles.add(fileData.Attachments.name, fileData.Attachments);
    }

    const curContent: IQuoteDatas = {
      ID: res?.data?.Id || null,
      Quote: res?.data?.Quote || "",
      StartDate: res.data.StartDate
        ? moment(res?.data?.StartDate).format(CONFIG.DateFormat)
        : null,
      EndDate: res.data.EndDate
        ? moment(res?.data?.EndDate).format(CONFIG.DateFormat)
        : null,
      Attachments: fileRes?.data?.ServerRelativeUrl || "",
      FileName: fileRes?.data?.FileName || "",
      Status: res?.data?.Status || "",
      IsDelete: false,
    };

    setLoaderState((prevState) => {
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
          successDescription: `The motivation has been added successfully.`,
        },
      };

      return updatedState;
    });

    return { ...curContent };
  } catch (err) {
    console.log("err: ", err);

    setLoaderState((prevState) => {
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
            "An error occurred while adding motivation, please try again later.",
        },
      };

      return updatedState;
    });

    return null;
  }
};

export const updateMotivated = async (
  formData: any,
  fileData: any,
  setLoaderState: React.Dispatch<React.SetStateAction<ILoaderStateItem[]>>,
  index: number,
  isFileEdit: boolean,
  curObject: IQuoteDatas
): Promise<any> => {
  setLoaderState((prevState) => {
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
    let fileRes: any;

    await SpServices.SPUpdateItem({
      Listname: CONFIG.ListNames.Intranet_MotivationalQuotes,
      ID: Number(formData?.ID),
      RequestJSON: { ...formData },
    });

    if (!isFileEdit) {
      if (curObject?.FileName) {
        await sp.web.lists
          .getByTitle(CONFIG.ListNames.Intranet_MotivationalQuotes)
          .items.getById(Number(formData?.ID))
          .attachmentFiles.getByName(curObject.FileName)
          .delete();

        if (fileData?.Attachments?.name) {
          fileRes = await sp.web.lists
            .getByTitle(CONFIG.ListNames.Intranet_MotivationalQuotes)
            .items.getById(Number(formData?.ID))
            .attachmentFiles.add(
              fileData.Attachments.name,
              fileData.Attachments
            );
        }
      } else if (fileData?.Attachments?.name) {
        fileRes = await sp.web.lists
          .getByTitle(CONFIG.ListNames.Intranet_MotivationalQuotes)
          .items.getById(Number(formData?.ID))
          .attachmentFiles.add(fileData.Attachments.name, fileData.Attachments);
      }
    }

    const curContent: IQuoteDatas = {
      ID: Number(formData?.ID) || null,
      Quote: formData?.Quote || "",
      StartDate: formData.StartDate
        ? moment(formData.StartDate).format(CONFIG.DateFormat)
        : null,
      EndDate: formData.EndDate
        ? moment(formData.EndDate).format(CONFIG.DateFormat)
        : null,
      Attachments: isFileEdit
        ? curObject?.Attachments
        : !isFileEdit && !curObject?.FileName && fileData?.Attachments?.name
        ? fileRes?.data?.ServerRelativeUrl
        : !isFileEdit && curObject?.FileName && !fileData?.Attachments?.name
        ? null
        : fileRes?.data?.ServerRelativeUrl,
      FileName: isFileEdit
        ? curObject?.FileName
        : !isFileEdit && !curObject?.FileName && fileData?.Attachments?.name
        ? fileRes?.data?.FileName
        : !isFileEdit && curObject?.FileName && !fileData?.Attachments?.name
        ? ""
        : fileRes?.data?.FileName,
      Status: formData?.Status || "",
      IsDelete: false,
    };

    setLoaderState((prevState) => {
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
          successDescription: `The motivation has been updated successfully.`,
        },
      };

      return updatedState;
    });

    return { ...curContent };
  } catch (err) {
    console.log("err: ", err);

    setLoaderState((prevState) => {
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
            "An error occurred while update motivation, please try again later.",
        },
      };

      return updatedState;
    });

    return null;
  }
};

export const deleteMotivated = async (
  formData: any,
  setLoaderState: React.Dispatch<React.SetStateAction<ILoaderStateItem[]>>,
  index: number
): Promise<any> => {
  setLoaderState((prevState) => {
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
    await SpServices.SPUpdateItem({
      Listname: CONFIG.ListNames.Intranet_MotivationalQuotes,
      ID: Number(formData?.ID),
      RequestJSON: { ...formData },
    });

    setLoaderState((prevState) => {
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
          successDescription: `The motivation has been deleted successfully.`,
        },
      };

      return updatedState;
    });

    return true;
  } catch (err) {
    console.log("err: ", err);

    setLoaderState((prevState) => {
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
            "An error occurred while delete motivation, please try again later.",
        },
      };

      return updatedState;
    });

    return false;
  }
};
