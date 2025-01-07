/* eslint-disable no-debugger */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CONFIG } from "../../config/config";
import SpServices from "../SPServices/SpServices";
import { setShoutOutsData } from "../../redux/features/ShoutOutsSlice";
import { sp } from "@pnp/sp";
import { toast } from "react-toastify";

export const getShoutOutsOptions = async (
  setShoutOutsOptions: any
): Promise<any> => {
  try {
    const response: any = await SpServices.SPReadItems({
      Listname: CONFIG.ListNames.Intranet_ShoutOutsOptions,
      Select: "*",
      Expand: "",
    });

    const shoutOutOptions: any = response?.map((item: any) => {
      return {
        ID: item?.ID,
        Title: item?.Title,
        Description: item?.Description,
      };
    });
    setShoutOutsOptions(shoutOutOptions);
  } catch (error) {
    console.error("Error fetching shout-outs options:", error);
  }
};

export const getAllShoutOutsData = async (dispatch: any): Promise<any> => {
  dispatch?.(
    setShoutOutsData({
      isLoading: true,
    })
  );
  try {
    // Fetch news data
    const response: any = await SpServices.SPReadItems({
      Listname: CONFIG.ListNames.Intranet_ShoutOuts,
      Select:
        "*, SendTowards/ID, SendTowards/Title, SendTowards/EMail, Author/ID, Author/Title, Author/EMail",
      Expand: "SendTowards, Author",
      Topcount: 5000,
    });

    const shoutOutData: any = response?.map((item: any) => {
      return {
        ID: item?.ID,
        Template: item?.Title,
        receiverDetails: {
          id: item?.SendTowards?.ID,
          email: item?.SendTowards?.EMail,
          name: item?.SendTowards?.Title,
        },
        receiverName: item?.SendTowards?.Title,
        receiverImage: item?.SendTowards?.EMail,
        senderName: item?.Author?.Title,
        senderImage: item?.Author?.EMail,
        message: item?.Description,
        Status: item?.Status,
        isActive: item?.isActive ? true : false,
      };
    });

    // Dispatch the data
    dispatch?.(
      setShoutOutsData({
        isLoading: false,
        data: shoutOutData,
        // error: "Error fetching news data",
      })
    );
  } catch (error) {
    console.error("Error fetching shout-outs data:", error);
    dispatch?.(
      setShoutOutsData({
        isLoading: false,
        data: [],
        error: error.message || "Error fetching shout-outs data",
      })
    );
  }
};

interface FormData {
  [key: string]: { value: any };
}

export const shoutOutsCurrentUserRole = async (
  setUserRole: any
): Promise<any> => {
  const userData = { userRole: "", email: "" };
  const currentUser: any = await sp.web.currentUser.get();
  const currentUserEmail = currentUser?.Email.toLowerCase() || "";

  const superAdmin: any = await sp.web.siteGroups
    .getByName(CONFIG.SPGroupName.Pernix_Admin)
    .users.get();

  const ShoutoutsAdminData: any = await sp.web.siteGroups
    .getByName(CONFIG.SPGroupName.Shoutouts_Admin)
    .users.get();

  const masUserArray: any[] = [...superAdmin, ...ShoutoutsAdminData];

  const isAdmin = masUserArray?.some(
    (val: any) => val.Email.toLowerCase() === currentUserEmail
  );

  if (isAdmin) {
    setUserRole({ userRole: "Admin", email: currentUserEmail });
    userData.userRole = "Admin";
    userData.email = currentUserEmail;
  } else {
    setUserRole({ userRole: "User", email: currentUserEmail });
    userData.userRole = "User";
    userData.email = currentUserEmail;
  }
  return userData;
};

export const handleShoutOutStatus = async (
  formData: any,
  type: string,
  setLoaderState: any,
  index: number,
  dispath: any
): Promise<any> => {
  debugger;
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
  await SpServices.SPUpdateItem({
    Listname: CONFIG.ListNames.Intranet_ShoutOuts,
    ID: formData.ID.value,
    RequestJSON: { Status: type },
  })
    .then(async (res) => {
      await getAllShoutOutsData(dispath);
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
            success: `Shout out ${
              type === "Approved" ? "approved" : "rejected"
            } successfully!`,
            successDescription: `The shout out has been ${
              type === "Approved" ? "approved" : "rejected"
            } successfully.`,
          },
        };
        return updatedState;
      });
    })
    .catch((err: any) => {
      console.log("Error : ", err);
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
              "An error occurred while updating answer, please try again later.",
          },
        };
        return updatedState;
      });
    });
};

export const changeShoutOutActiveStatus = async (
  qusId: number,
  isActive: boolean
): Promise<void> => {
  await SpServices.SPUpdateItem({
    Listname: CONFIG.ListNames.Intranet_ShoutOuts,
    ID: qusId,
    RequestJSON: { isActive: isActive },
  });
};

export const addShoutOut = async (
  formData: FormData,
  dispath: any
): Promise<void> => {
  const toastId = toast.loading("Creating a new shout-out...");

  try {
    const payload = {
      // Title: formData.Template?.value,
      Description: formData.Description?.value,
      SendTowardsId: formData.SendTowards?.value?.id,
    };

    // Add item to the SharePoint list
    await SpServices.SPAddItem({
      Listname: CONFIG.ListNames.Intranet_ShoutOuts,
      RequestJSON: payload,
    })
      .then(async (res: any) => {
        await getAllShoutOutsData(dispath);

        toast.update(toastId, {
          render: "Shout-out added successfully!",
          type: "success",
          isLoading: false,
          autoClose: 5000,
          hideProgressBar: false,
        });
      })
      .catch((err: any) => {
        console.error("Error while adding shout-out:", err);

        toast.update(toastId, {
          render: "Error adding new shout-out. Please try again.",
          type: "error",
          isLoading: false,
          autoClose: 5000,
          hideProgressBar: false,
        });
      });
  } catch (error) {
    console.error("Error while adding shout-out:", error);

    toast.update(toastId, {
      render: "Error adding new shout-out. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  }
};

export const updateShoutOut = async (
  formData: FormData,
  ID: number,
  dispath: any
): Promise<void> => {
  const toastId = toast.loading("Updating the shout-out in progress...");

  try {
    const payload = formData.SendTowards?.value?.id
      ? {
          // Title: formData.Template?.value,
          Description: formData.Description?.value,
          SendTowardsId: formData.SendTowards?.value?.id,
        }
      : {
          // Title: formData.Template?.value,
          Description: formData.Description?.value,
        };

    // Add item to the SharePoint list
    await SpServices.SPUpdateItem({
      Listname: CONFIG.ListNames.Intranet_ShoutOuts,
      ID: ID,
      RequestJSON: payload,
    }).then(async (res: any) => {
      await getAllShoutOutsData(dispath);

      toast.update(toastId, {
        render: "Shout-out updated successfully!",
        type: "success",
        isLoading: false,
        autoClose: 5000,
        hideProgressBar: false,
      });
    });
  } catch (error) {
    console.error("Error while updating shout-out:", error);

    toast.update(toastId, {
      render:
        "An error occurred while updating this shout-out. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  }
};

export const deleteShoutOut = async (
  ID: number,
  dispath: any
): Promise<void> => {
  const toastId = toast.loading("Deleting the shout-out in progress...");

  try {
    await SpServices.SPDeleteItem({
      Listname: CONFIG.ListNames.Intranet_ShoutOuts,
      ID: ID,
    }).then(async (res: any) => {
      debugger;
      await getAllShoutOutsData(dispath);

      toast.update(toastId, {
        render: "Shout-out deleted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 5000,
        hideProgressBar: false,
      });
    });
  } catch (error) {
    console.error("Error while updating shout-out:", error);

    toast.update(toastId, {
      render:
        "An error occurred while deleting this shout-out. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  }
};
