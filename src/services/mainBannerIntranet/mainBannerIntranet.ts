/* eslint-disable @typescript-eslint/no-explicit-any */
import moment from "moment";
import { CONFIG } from "../../config/config";
import SpServices from "../SPServices/SpServices";
import { IAttachDetails, IQuoteDatas } from "../../interface/interface";
import { sp } from "@pnp/sp/presets/all";
import { toast } from "react-toastify";

interface IFormData {
  [key: string]: { value: any };
}

const prepareRecords = async (res: any): Promise<IQuoteDatas[]> => {
  let preparedArray: IQuoteDatas[] = [];

  try {
    preparedArray = await Promise.all(
      res?.map(async (val: any) => {
        const arrGetAttach: IAttachDetails[] = [];

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
  fileData: any
): Promise<any> => {
  const toastId = toast.loading("Creating a motivation quote...");

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

    toast.update(toastId, {
      render: "Quote added successfully!",
      type: "success",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });

    return { ...curContent };
  } catch (err) {
    console.log("err: ", err);

    toast.update(toastId, {
      render: "Error motivation quote. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });

    return null;
  }
};

export const updateMotivated = async (
  formData: any,
  fileData: any,
  isFileEdit: boolean,
  curObject: IQuoteDatas
): Promise<any> => {
  const toastId = toast.loading("Udating a motivation quote...");

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

    toast.update(toastId, {
      render: "Quote updated successfully!",
      type: "success",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });

    return { ...curContent };
  } catch (err) {
    console.log("err: ", err);

    toast.update(toastId, {
      render: "Error motivation quote. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });

    return null;
  }
};

export const deleteMotivated = async (formData: any): Promise<any> => {
  const toastId = toast.loading("deleting a motivation quote...");

  try {
    await SpServices.SPUpdateItem({
      Listname: CONFIG.ListNames.Intranet_MotivationalQuotes,
      ID: Number(formData?.ID),
      RequestJSON: { ...formData },
    });

    toast.update(toastId, {
      render: "Quote deleted successfully!",
      type: "success",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });

    return true;
  } catch (err) {
    console.log("err: ", err);

    toast.update(toastId, {
      render: "Error motivation quote. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });

    return false;
  }
};
