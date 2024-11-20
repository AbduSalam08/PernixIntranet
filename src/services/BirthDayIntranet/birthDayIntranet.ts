/* eslint-disable no-debugger */
import { CONFIG } from "../../config/config";
import { setBirthdaysData } from "../../redux/features/BirthdayIntranet";
import SpServices from "../SPServices/SpServices";
import { sp } from "@pnp/sp";

/* eslint-disable @typescript-eslint/no-explicit-any */

export const getBirthdayCurrentUserRole = async (
  setCurrentUserDetails: any
): Promise<any> => {
  let userDetails = {};
  const currentUser: any = await sp.web.currentUser.get();
  const currentUserEmail = currentUser?.Email.toLowerCase() || "";

  const questionCEOAdminData: any = await sp.web.siteGroups
    .getByName(CONFIG.SPGroupName.Birthdays_Admin)
    .users.get();
  const isAdmin = questionCEOAdminData?.some(
    (val: any) => val.Email.toLowerCase() === currentUserEmail
  );
  if (isAdmin) {
    // setCurrentUserDetails({ role: "User", email: currentUserEmail });
    setCurrentUserDetails({ role: "Admin", email: currentUserEmail });
    userDetails = { role: "Admin", email: currentUserEmail };
  } else {
    setCurrentUserDetails({ role: "User", email: currentUserEmail });
    userDetails = { role: "User", email: currentUserEmail };
  }
  console.log(userDetails);
};

export const getAllBirthdayData = async (dispatch: any): Promise<any> => {
  dispatch?.(
    setBirthdaysData({
      isLoading: true,
    })
  );
  try {
    const currentUser: any = await sp.web.currentUser.get();
    const currentUserEmail = currentUser?.Email.toLowerCase() || "";
    // Fetch news data
    const birthdayResponse: any = await SpServices.SPReadItems({
      Listname: CONFIG.ListNames.Intranet_BirthDay,
      Select:
        "*, Author/EMail, Author/Title, Author/ID,EmployeeName/EMail, EmployeeName/Title, EmployeeName/ID,AttachmentFiles",
      Expand: "Author,EmployeeName,AttachmentFiles",
      Filter: [
        {
          FilterKey: "IsDelete",
          Operator: "ne",
          FilterValue: "1",
        },
      ],
      Topcount: 5000,
      Orderby: "DateOfBirth",
      Orderbydecorasc: true,
    });
    const wishesResponse: any = await SpServices.SPReadItems({
      Listname: CONFIG.ListNames.Intranet_BirthdayWishes,
      Select: "*, Author/EMail, Author/Title, Author/ID,BirthDay/ID",
      Expand: "Author,BirthDay",
      Filter: [
        {
          FilterKey: "Author",
          Operator: "ne",
          FilterValue: currentUserEmail,
        },
      ],
      Topcount: 5000,
      Orderby: "Created",
      Orderbydecorasc: false,
    });
    console.log("birthdayResponse: ", birthdayResponse);
    console.log("wishesResponse: ", wishesResponse);
    const newhireData: any = birthdayResponse?.map((item: any) => {
      const birthdayWish = wishesResponse?.filter(
        (obj: any) =>
          obj?.Author?.EMail.toLowerCase() === currentUserEmail &&
          obj?.BirthDayId === item?.ID
      );
      return {
        ID: item?.ID,
        EmployeeName: {
          id: item?.EmployeeName?.ID,
          email: item?.EmployeeName?.EMail,
          name: item?.EmployeeName?.Title,
        },
        DateOfBirth: item?.DateOfBirth,
        Message: birthdayWish[0]?.Message
          ? birthdayWish[0]?.Message
          : item?.Message,
        BirthDayWishID: birthdayWish[0]?.ID ? birthdayWish[0]?.ID : null,
        isTeams: birthdayWish[0]?.isTeams ? true : false,
        isOutlook: birthdayWish[0]?.isOutlook ? true : false,
        createdEmail: item?.Author?.EMail,
        createdName: item?.Author?.Title,
        imgUrl: item?.AttachmentFiles[0]?.ServerRelativeUrl,
        Attachment: item?.AttachmentFiles[0],
      };
    });

    // Dispatch the data
    dispatch?.(
      newhireData?.length === 0
        ? setBirthdaysData({
            isLoading: false,
            data: newhireData,
            error: "No new hires data found!",
          })
        : setBirthdaysData({
            isLoading: false,
            data: newhireData,
          })
    );
  } catch (error) {
    console.error("Error fetching new hire data:", error);
    dispatch?.(
      setBirthdaysData({
        isLoading: false,
        data: [],
        error: error.message || "Error fetching new hire data",
      })
    );
  }
};

interface FormData {
  [key: string]: { value: any };
}

interface LoaderStateItem {
  popupWidth: string;
  isLoading: {
    inprogress: boolean;
    error: boolean;
    success: boolean;
  };
  messages?: {
    success?: string;
    successDescription?: string;
    errorDescription?: string;
  };
}

export const addBirthday = async (
  formData: FormData,
  setLoaderState: React.Dispatch<React.SetStateAction<LoaderStateItem[]>>,
  index: number
): Promise<void> => {
  // Start loader for the specific item at the given index
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
    debugger;
    let fileRes: any;
    const payload = {
      EmployeeNameId: formData.EmployeeName?.value?.id,
      Message: formData.Message?.value,
      DateOfBirth: formData.DateOfBirth?.value,
    };

    // Add item to the SharePoint list
    const res: any = await SpServices.SPAddItem({
      Listname: CONFIG.ListNames.Intranet_BirthDay,
      RequestJSON: payload,
    });
    if (formData?.Image?.value?.name) {
      fileRes = await sp.web.lists
        .getByTitle(CONFIG.ListNames.Intranet_BirthDay)
        .items.getById(res.data.Id)
        .attachmentFiles.add(
          formData?.Image?.value?.name,
          formData?.Image?.value
        );
    }
    console.log("fileRes", fileRes);

    // Success state after item and attachment are added
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
          success: "Birthday Added Successfully",
          successDescription: `'${formData.EmployeeName.value.name}' birthday has been added successfully.`,
        },
      };
      return updatedState;
    });
  } catch (error) {
    console.error("Error while adding birthday:", error);

    // Handle error state
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
            "An error occurred while adding birthday, please try again later.",
        },
      };
      return updatedState;
    });
  }
};
export const submitBirthdayWish = async (
  ID: number,
  payloadJson: any,
  setLoaderState: React.Dispatch<React.SetStateAction<LoaderStateItem[]>>,
  index: number
): Promise<void> => {
  // Start loader for the specific item at the given index
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
    debugger;
    // Add item to the SharePoint list
    if (ID) {
      await SpServices.SPUpdateItem({
        Listname: CONFIG.ListNames.Intranet_BirthdayWishes,
        ID: ID,
        RequestJSON: payloadJson,
      });
    } else {
      await SpServices.SPAddItem({
        Listname: CONFIG.ListNames.Intranet_BirthdayWishes,
        RequestJSON: payloadJson,
      });
    }
    // Success state after item and attachment are added
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
          success: "Birthday wishes sended successfully",
          successDescription: `Birthday wishes sended by ${
            payloadJson?.isTeams ? "teams." : "outlook."
          }`,
        },
      };
      return updatedState;
    });
  } catch (error) {
    console.error("Error while adding birthday:", error);

    // Handle error state
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
            "An error occurred while sending birthday wish, please try again later.",
        },
      };
      return updatedState;
    });
  }
};
export const updateHire = async (
  formData: FormData,
  ID: number,
  attachmentObject: any,
  setLoaderState: React.Dispatch<React.SetStateAction<LoaderStateItem[]>>,
  index: number
): Promise<void> => {
  // Start loader for the specific item at the given index
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
    debugger;
    let fileRes: any;
    const payload = formData.EmployeeName?.value?.id
      ? {
          Description: formData.Description?.value,
          EmployeeNameId: formData.EmployeeName?.value?.id,
          Title: formData.Title?.value,
          StartDate: formData.StartDate?.value,
          EndDate: formData.EndDate?.value,
        }
      : {
          Description: formData.Description?.value,
          Title: formData.Title?.value,
          StartDate: formData.StartDate?.value,
          EndDate: formData.EndDate?.value,
        };

    // update item to the SharePoint list
    const res: any = await SpServices.SPUpdateItem({
      Listname: CONFIG.ListNames.Intranet_NewHires,
      ID: ID,
      RequestJSON: payload,
    });
    console.log("res", res);

    if (formData?.ProfileImage?.value?.type) {
      await sp.web.lists
        .getByTitle(CONFIG.ListNames.Intranet_NewHires)
        .items.getById(Number(ID))
        .attachmentFiles.getByName(attachmentObject.FileName)
        .delete();
      if (formData?.ProfileImage?.value?.name) {
        fileRes = await sp.web.lists
          .getByTitle(CONFIG.ListNames.Intranet_NewHires)
          .items.getById(Number(ID))
          .attachmentFiles.add(
            formData?.ProfileImage?.value?.name,
            formData?.ProfileImage?.value
          );
      }
    }
    console.log("fileRes", fileRes);

    const responseData: any = {
      ID: ID,
      Title: formData.Title?.value,
      EmployeeName: formData.EmployeeName?.value,
      StartDate: formData.StartDate?.value,
      EndDate: formData.EndDate?.value,
      Description: formData.Description?.value,
      createdEmail: res?.Author?.EMail,
      createdName: res?.Author?.Title,
      imgUrl: formData?.ProfileImage?.value?.type
        ? fileRes?.data?.ServerRelativeUrl
        : attachmentObject?.ServerRelativeUrl,
      Attachment: formData?.ProfileImage?.value?.type
        ? fileRes?.data
        : attachmentObject,
    };

    // Success state after item and attachment are added
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
          success: "Hire updated successfully!",
          successDescription: `The hire '${
            formData.EmployeeName?.value?.name
              ? formData.EmployeeName.value.name
              : formData.EmployeeName.value
          }' has been updated successfully.`,
        },
      };
      return updatedState;
    });
    return { ...responseData };
  } catch (error) {
    console.error("Error while updating new hire:", error);

    // Handle error state
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
            "An error occurred while updating hire, please try again later.",
        },
      };
      return updatedState;
    });
  }
};

export const deleteHire = async (
  ID: number,
  setLoaderState: any,
  index: number
): Promise<void> => {
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
    await SpServices.SPUpdateItem({
      Listname: CONFIG.ListNames.Intranet_NewHires,
      ID: ID,
      RequestJSON: { IsDelete: true },
    });
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
          success: "Hire deleted successfully!",
          successDescription: `The hire has been deleted successfully.`,
        },
      };
      return updatedState;
    });
  } catch (error) {
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
            "An error occurred while deleting hire, please try again later.",
        },
      };
      return updatedState;
    });
  }
};
