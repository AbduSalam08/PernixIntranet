/* eslint-disable no-debugger */
import { CONFIG } from "../../config/config";
import SpServices from "../SPServices/SpServices";
import { setNewHiresData } from "../../redux/features/NewHiresIntranet";
import { sp } from "@pnp/sp";

/* eslint-disable @typescript-eslint/no-explicit-any */

export const getCurrentUserRole = async (
  setCurrentUserDetails: any
): Promise<any> => {
  // let userDetails = {};
  const currentUser: any = await sp.web.currentUser.get();
  const currentUserEmail = currentUser?.Email.toLowerCase() || "";

  const superAdmin: any = await sp.web.siteGroups
    .getByName(CONFIG.SPGroupName.Pernix_Admin)
    .users.get();

  const newHiresAdminData: any = await sp.web.siteGroups
    .getByName(CONFIG.SPGroupName.Newhire_Admin)
    .users.get();

  const usersArray: any[] = [...superAdmin, ...newHiresAdminData];
  const isAdmin = usersArray?.some(
    (val: any) => val.Email.toLowerCase() === currentUserEmail
  );

  if (isAdmin) {
    setCurrentUserDetails({ role: "Admin", email: currentUserEmail });
    // userDetails = { role: "Admin", email: currentUserEmail };
  } else {
    setCurrentUserDetails({ role: "User", email: currentUserEmail });
    // userDetails = { role: "User", email: currentUserEmail };
  }
};

export const getAllNewHiresData = async (dispatch: any): Promise<any> => {
  dispatch?.(
    setNewHiresData({
      isLoading: true,
    })
  );
  try {
    // Fetch news data
    const response: any = await SpServices.SPReadItems({
      Listname: CONFIG.ListNames.Intranet_NewHires,
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
      Orderby: "Created",
      Orderbydecorasc: false,
    });
    console.log("response: ", response);
    const newhireData: any = response?.map((item: any) => {
      return {
        ID: item?.ID,
        Title: item?.Title,
        EmployeeName: {
          id: item?.EmployeeName?.ID,
          email: item?.EmployeeName?.EMail,
          name: item?.EmployeeName?.Title,
        },
        StartDate: item?.StartDate,
        EndDate: item?.EndDate,
        Description: item?.Description,
        createdEmail: item?.Author?.EMail,
        createdName: item?.Author?.Title,
        imgUrl: item?.AttachmentFiles[0]?.ServerRelativeUrl,
        Attachment: item?.AttachmentFiles[0],
      };
    });

    // Dispatch the data
    dispatch?.(
      newhireData?.length === 0
        ? setNewHiresData({
            isLoading: false,
            data: newhireData,
            error: "No new hires data found!",
          })
        : setNewHiresData({
            isLoading: false,
            data: newhireData,
          })
    );
  } catch (error) {
    console.error("Error fetching new hire data:", error);
    dispatch?.(
      setNewHiresData({
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

export const addNewHire = async (
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
    let fileRes: any;

    const payload = {
      Description: formData?.Description?.value,
      EmployeeNameId: formData?.EmployeeName?.value?.id,
      // Title: formData.Title?.value ?? "",
      StartDate: formData?.StartDate?.value,
      EndDate: formData?.EndDate?.value,
    };

    // Add item to the SharePoint list
    const res: any = await SpServices.SPAddItem({
      Listname: CONFIG.ListNames.Intranet_NewHires,
      RequestJSON: payload,
    });

    if (formData?.ProfileImage?.value?.name) {
      fileRes = await sp.web.lists
        .getByTitle(CONFIG.ListNames.Intranet_NewHires)
        .items.getById(res.data.Id)
        .attachmentFiles.add(
          formData?.ProfileImage?.value?.name,
          formData?.ProfileImage?.value
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
          success: "New Hire Added Successfully",
          successDescription: `The new hire '${formData.EmployeeName.value.name}' has been added successfully.`,
        },
      };
      return updatedState;
    });
  } catch (error) {
    console.error("Error while adding new hire:", error);

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
            "An error occurred while adding new hire, please try again later.",
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
    let fileRes: any;
    const payload = formData.EmployeeName?.value?.id
      ? {
          Description: formData.Description?.value,
          EmployeeNameId: formData.EmployeeName?.value?.id,
          // Title: formData.Title?.value,
          StartDate: formData.StartDate?.value,
          EndDate: formData.EndDate?.value,
        }
      : {
          Description: formData.Description?.value,
          // Title: formData.Title?.value,
          StartDate: formData.StartDate?.value,
          EndDate: formData.EndDate?.value,
        };

    // update item to the SharePoint list
    const res: any = await SpServices.SPUpdateItem({
      Listname: CONFIG.ListNames.Intranet_NewHires,
      ID: ID,
      RequestJSON: payload,
    });

    if (formData?.ProfileImage?.value?.type) {
      if (attachmentObject?.FileName) {
        await sp.web.lists
          .getByTitle(CONFIG.ListNames.Intranet_NewHires)
          .items.getById(Number(ID))
          .attachmentFiles.getByName(attachmentObject?.FileName)
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
      } else if (formData?.ProfileImage?.value?.name) {
        fileRes = await sp.web.lists
          .getByTitle(CONFIG.ListNames.Intranet_NewHires)
          .items.getById(Number(ID))
          .attachmentFiles.add(
            formData?.ProfileImage?.value?.name,
            formData?.ProfileImage?.value
          );
      }
    } else {
      if (attachmentObject?.FileName) {
        await sp.web.lists
          .getByTitle(CONFIG.ListNames.Intranet_NewHires)
          .items.getById(Number(ID))
          .attachmentFiles.getByName(attachmentObject?.FileName)
          .delete();
      }
    }

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
        : attachmentObject?.ServerRelativeUrl
        ? attachmentObject?.ServerRelativeUrl
        : "",
      Attachment: formData?.ProfileImage?.value?.type
        ? fileRes?.data
        : attachmentObject
        ? attachmentObject
        : null,
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
