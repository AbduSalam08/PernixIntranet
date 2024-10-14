/* eslint-disable no-debugger */
import { LISTNAMES } from "../../config/config";
import SpServices from "../SPServices/SpServices";
import { setNewHiresData } from "../../redux/features/NewHiresIntranet";

/* eslint-disable @typescript-eslint/no-explicit-any */

export const getAllNewHiresData = async (dispatch: any): Promise<any> => {
  dispatch?.(
    setNewHiresData({
      isLoading: true,
    })
  );
  try {
    // Fetch news data
    const response: any = await SpServices.SPReadItems({
      Listname: LISTNAMES.Intranet_NewHires,
      Select: "*, Author/EMail, Author/Title, Author/ID",
      Expand: "Author",
    });
    console.log("response: ", response);

    const newhireData: any = response?.map((item: any) => {
      return {
        EmployeeName: item?.EmployeeName,
        Description: item?.Description,
        createEmail: item?.Author?.EMail,
        createdName: item?.Author?.Title,
        imgUrl: null,
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
    debugger;

    const payload = {
      Description: formData.Description?.value,
      EmployeeName: formData.EmployeeName?.value,
    };

    // Add item to the SharePoint list
    await SpServices.SPAddItem({
      Listname: LISTNAMES.Intranet_NewHires,
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
          successDescription: `The new hire '${formData.EmployeeName.value}' has been added successfully.`,
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
