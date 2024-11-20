import SpServices from "../SPServices/SpServices";
import { sp } from "@pnp/sp/presets/all";
import { toast } from "react-toastify";
import {
  ICamlQuery,
  IFeedbackQusType,
  IFeedbackResType,
  IUserData,
} from "../../interface/interface";
import { CONFIG } from "../../config/config";
import moment from "moment";
import { FeedBackCamlJSON } from "../../camlQuery/feedback/FeedCamlQueryJSON";

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

const getDataLooping = async (
  data: any[],
  nextRef: any,
  filCamlJSON: ICamlQuery
): Promise<any[]> => {
  try {
    await sp.web.lists
      .getByTitle(filCamlJSON?.ListName)
      .renderListDataAsStream({
        ViewXml: filCamlJSON?.CamlQuery,
        Paging: nextRef.substring(1),
      })
      .then(async (res: any) => {
        data.push(...res.Row);

        if (res.NextHref) {
          await getDataLooping(data, res.NextHref, filCamlJSON);
        }
      });

    return [...data];
  } catch (err) {
    console.log("Looping datas fetching error for feedback: ", err);
    return [...data];
  }
};

export const getFeedBackDatas = async (listName: string): Promise<any[]> => {
  let data: any[] = [];

  let filCamlJSON: ICamlQuery = FeedBackCamlJSON?.CamlQuery?.filter(
    (val: ICamlQuery) => val.ListName === listName
  )?.[0];

  try {
    await sp.web.lists
      .getByTitle(filCamlJSON?.ListName)
      .renderListDataAsStream({
        ViewXml: filCamlJSON?.CamlQuery,
      })
      .then(async (res: any) => {
        data.push(...res.Row);

        if (res.NextHref) {
          await getDataLooping(data, res.NextHref, filCamlJSON);
        }
      });

    return [...data];
  } catch (err) {
    console.log("Datas fetching error for feedback: ", err);
    return [...data];
  }
};

export const addFeedbackQus = async (
  formData: IFormData,
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
    const res: any = await SpServices.SPAddItem({
      Listname: CONFIG.ListNames.Intranet_feedbackQuestion,
      RequestJSON: { ...formData },
    });

    const curContent: IFeedbackQusType = {
      ID: res?.data?.Id ?? null,
      Title: res?.data?.Title ?? "",
      StartDate: res.data.StartDate
        ? moment(res?.data?.StartDate).format(CONFIG.DateFormat)
        : null,
      EndDate: res.data.EndDate
        ? moment(res?.data?.EndDate).format(CONFIG.DateFormat)
        : null,
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
          successDescription:
            "The feedback question has been added successfully.",
        },
      };
      return updatedState;
    });

    return { ...curContent };
  } catch (err) {
    console.log("Feedback question add error: ", err);

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
          successDescription:
            "An error occurred while adding feedback question, please try again later.",
        },
      };
      return updatedState;
    });

    return null;
  }
};

export const updateFeedbackQus = async (
  formData: IFormData,
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
      Listname: CONFIG.ListNames.Intranet_feedbackQuestion,
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
          successDescription:
            "The feedback question has been updated successfully.",
        },
      };
      return updatedState;
    });

    return { ...formData };
  } catch (err) {
    console.log("Feedback question update error: ", err);
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
          successDescription:
            "An error occurred while updating feedback question, please try again later.",
        },
      };
      return updatedState;
    });

    return null;
  }
};

export const deleteFeedbackQus = async (
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
    await SpServices.SPDeleteItem({
      Listname: CONFIG.ListNames.Intranet_feedbackQuestion,
      ID: Number(formData?.ID),
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
          successDescription:
            "The feedback question has been deleted successfully.",
        },
      };
      return updatedState;
    });

    return true;
  } catch (err) {
    console.log("Feedback question deleted error: ", err);

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
            "An error occurred while delete feedback question, please try again later.",
        },
      };
      return updatedState;
    });

    return false;
  }
};

export const addFeedbackRes = async (
  formData: IFormData,
  curUserData: IUserData
): Promise<any> => {
  const toastId = toast.loading("Creating ticket...");

  try {
    const res: any = await SpServices.SPAddItem({
      Listname: CONFIG.ListNames.Intranet_feedbackResponse,
      RequestJSON: { ...formData },
    });

    const curContent: IFeedbackResType = {
      ID: res?.data?.Id ?? null,
      Answer: res?.data?.Answer ?? "",
      Date: moment().format("DD MMM YYYY"),
      FeedbackQuestionId: res?.data?.FeedbackQuestionId ?? null,
      CreatedBy: { ...curUserData },
    };

    toast.update(toastId, {
      render: "Feedback response added successfully!",
      type: "success",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });

    return { ...curContent };
  } catch (err) {
    console.log("Feedback response add error: ", err);

    toast.update(toastId, {
      render: "Error feedback response. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });

    return null;
  }
};
