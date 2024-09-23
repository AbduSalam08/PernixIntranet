/* eslint-disable no-debugger */
import { LISTNAMES } from "../../config/config";
import SpServices from "../SPServices/SpServices";
import { setShoutOutsData } from "../../redux/features/ShoutOutsSlice";

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
      Listname: LISTNAMES.Intranet_ShoutOuts,
      Select:
        "*, SendTowards/ID, SendTowards/Title, SendTowards/EMail, Author/ID, Author/Title, Author/EMail",
      Expand: "SendTowards, Author",
    });
    console.log("response: ", response);

    const shoutOutData: any = response?.map((item: any) => {
      return {
        receiverName: item?.SendTowards?.Title,
        receiverImage: item?.SendTowards?.EMail,
        senderName: item?.Author?.Title,
        senderImage: item?.Author?.EMail,
        message: item?.Description,
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
    successDescription?: string;
    errorDescription?: string;
  };
}

export const addShoutOut = async (
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

    const payload = {
      Description: formData.Description?.value,
      SendTowardsId: formData.SendTowards?.value?.id,
    };

    // Add item to the SharePoint list
    await SpServices.SPAddItem({
      Listname: LISTNAMES.Intranet_ShoutOuts,
      RequestJSON: payload,
    });

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
