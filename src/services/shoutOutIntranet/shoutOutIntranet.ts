/* eslint-disable no-debugger */
import { CONFIG } from "../../config/config";
import SpServices from "../SPServices/SpServices";
import { setShoutOutsData } from "../../redux/features/ShoutOutsSlice";
import { sp } from "@pnp/sp";

/* eslint-disable @typescript-eslint/no-explicit-any */

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
    });
    console.log("response: ", response);

    const shoutOutData: any = response?.map((item: any) => {
      return {
        ID: item?.ID,
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

export const shoutOutsCurrentUserRole = async (
  setUserRole: any
): Promise<any> => {
  const userData = { userRole: "", email: "" };
  const currentUser: any = await sp.web.currentUser.get();
  const currentUserEmail = currentUser?.Email.toLowerCase() || "";

  const ShoutoutsAdminData: any = await sp.web.siteGroups
    .getByName(CONFIG.SPGroupName.Shoutouts_Admin)
    .users.get();

  const isAdmin = ShoutoutsAdminData?.some(
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
      console.log("res", res);
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
  setLoaderState: React.Dispatch<React.SetStateAction<LoaderStateItem[]>>,
  index: number,
  dispath: any
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

    const payload = {
      Description: formData.Description?.value,
      SendTowardsId: formData.SendTowards?.value?.id,
      Status: "Pending",
    };

    // Add item to the SharePoint list
    await SpServices.SPAddItem({
      Listname: CONFIG.ListNames.Intranet_ShoutOuts,
      RequestJSON: payload,
    })
      .then(async (res: any) => {
        await getAllShoutOutsData(dispath);
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
              successDescription: `The new shout-out to '${formData.SendTowards.value?.name}' has been added successfully.`,
            },
          };
          return updatedState;
        });
      })
      .catch((err: any) => {
        console.error("Error while adding shout-out:", err);
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
                "An error occurred while adding shout-out, please try again later.",
            },
          };
          return updatedState;
        });
      });
  } catch (error) {
    console.error("Error while adding shout-out:", error);
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
            "An error occurred while adding shout-out, please try again later.",
        },
      };
      return updatedState;
    });
  }
};
export const updateShoutOut = async (
  formData: FormData,
  setLoaderState: React.Dispatch<React.SetStateAction<LoaderStateItem[]>>,
  index: number,
  dispath: any
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
    const payload = formData.SendTowards?.value?.id
      ? {
          Description: formData.Description?.value,
          SendTowardsId: formData.SendTowards?.value?.id,
        }
      : { Description: formData.Description?.value };

    // Add item to the SharePoint list
    await SpServices.SPUpdateItem({
      Listname: CONFIG.ListNames.Intranet_ShoutOuts,
      ID: formData.ID.value,
      RequestJSON: payload,
    }).then(async (res: any) => {
      await getAllShoutOutsData(dispath);
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
            success: "Shout out update successfully!",
            successDescription: `The new shout-out to '${
              formData.SendTowards.value?.name
                ? formData.SendTowards.value?.name
                : formData.SendTowards.value
            }' has been updated successfully.`,
          },
        };
        return updatedState;
      });
    });
  } catch (error) {
    console.error("Error while updating shout-out:", error);
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
            "An error occurred while updating shout-out, please try again later.",
        },
      };
      return updatedState;
    });
  }
};
