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

export const addFeedbackQus = async (formData: IFormData): Promise<any> => {
  const toastId = toast.loading("Creating a new feedback question...");

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

    toast.update(toastId, {
      render: "Feedback form added successfully!",
      type: "success",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });

    return { ...curContent };
  } catch (err) {
    console.log("Feedback question add error: ", err);

    toast.update(toastId, {
      render: "Error adding new feedback question. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });

    return null;
  }
};

export const updateFeedbackQus = async (formData: IFormData): Promise<any> => {
  const toastId = toast.loading(
    "Updating the feedback question in progress..."
  );

  try {
    await SpServices.SPUpdateItem({
      Listname: CONFIG.ListNames.Intranet_feedbackQuestion,
      ID: Number(formData?.ID),
      RequestJSON: { ...formData },
    });

    toast.update(toastId, {
      render: "Feedback form updated successfully!",
      type: "success",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });

    return { ...formData };
  } catch (err) {
    console.log("Feedback question update error: ", err);

    toast.update(toastId, {
      render:
        "An error occurred while updating this feedback question. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });

    return null;
  }
};

export const deleteFeedbackQus = async (formData: any): Promise<any> => {
  const toastId = toast.loading(
    "Deleting the feedback question in progress..."
  );

  try {
    await SpServices.SPDeleteItem({
      Listname: CONFIG.ListNames.Intranet_feedbackQuestion,
      ID: Number(formData?.ID),
    });

    toast.update(toastId, {
      render: "Feedback form deleted successfully!",
      type: "success",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });

    return true;
  } catch (err) {
    console.log("Feedback question deleted error: ", err);

    toast.update(toastId, {
      render:
        "An error occurred while deleting this feedback question. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });

    return false;
  }
};

export const addFeedbackRes = async (
  formData: IFormData,
  curUserData: IUserData
): Promise<any> => {
  const toastId = toast.loading(
    "Responding to the feedback question is in progress..."
  );

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
      render: "Response submitted successfully!",
      type: "success",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });

    return { ...curContent };
  } catch (err) {
    console.log("Feedback response add error: ", err);

    toast.update(toastId, {
      render: "Error adding response. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });

    return null;
  }
};
