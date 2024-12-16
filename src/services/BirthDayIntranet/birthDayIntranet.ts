/* eslint-disable no-debugger */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "react-toastify";
import { CONFIG } from "../../config/config";
import SpServices from "../SPServices/SpServices";
import { MSGraphClient } from "@microsoft/sp-http";
import moment from "moment";
import {
  IBirthdayData,
  IBirthdayRes,
  IBirthdayUsers,
} from "../../interface/interface";
import { sp } from "@pnp/sp/presets/all";

export const fetchAzureUsers = async (
  context: any
): Promise<IBirthdayUsers[]> => {
  const curUser: any = await sp.web.currentUser.get();
  const client: MSGraphClient = await context.msGraphClientFactory.getClient();

  let allUsers: any[] = [];
  let nextPageUrl: string | undefined = undefined;
  const userMailStructure: string = `@${curUser?.Email?.split("@")[1]}`;

  try {
    do {
      const response: any = nextPageUrl
        ? await client.api(nextPageUrl).version("v1.0").top(999).get()
        : await client.api("users/").version("v1.0").top(999).get();

      const data: any = response?.value;

      allUsers = allUsers.concat(data);
      nextPageUrl = response["@odata.nextLink"];
    } while (nextPageUrl);

    const filteredData: any[] = await Promise.all(
      allUsers?.filter((item: any) =>
        item?.userPrincipalName
          ?.toLowerCase()
          .endsWith(userMailStructure?.toLowerCase())
      ) || []
    );

    const userDetailsArray: any[] | null = await Promise.all(
      filteredData?.map(async (user: any) => {
        const userData: any = await client
          .api(`/users/${user.id}?$select=birthday`)
          .version("v1.0")
          .get();

        if (userData?.birthday) {
          return {
            ID: user?.id ?? "",
            Name: user?.displayName ?? "",
            Email: user?.userPrincipalName.toLowerCase() ?? "",
            Birthday:
              moment(userData?.birthday).format("YYYYMMDD") !== "00010101"
                ? moment(userData?.birthday).format()
                : "",
            IsTeams: false,
            IsOutlook: false,
            IsActive: true,
            IsSameUser: false,
            IsShow:
              moment(userData?.birthday).format("MMDD") ===
              moment().format("MMDD")
                ? true
                : false,
            BirthdayUserListDataId: null,
          };
        } else {
          return null;
        }
      }) || []
    );

    const arrUsersMasterData: IBirthdayUsers[] = await Promise.all(
      userDetailsArray?.filter((val: IBirthdayUsers) => val.Birthday) || []
    );

    return [...arrUsersMasterData];
  } catch (err) {
    console.log("err: ", err);

    return [];
  }
};

export const fetchBirthdayData = async (): Promise<IBirthdayData[]> => {
  try {
    const res: any[] = await SpServices.SPReadItems({
      Listname: CONFIG.ListNames.Intranet_BirthDay,
    });

    const BirthdayData: IBirthdayData[] = await Promise.all(
      res?.map((val: any) => {
        return {
          ID: val?.ID,
          UserID: val?.Title ?? "",
          IsActive: val?.IsActive ? false : true,
        };
      }) || []
    );

    return [...BirthdayData];
  } catch (err) {
    return [];
  }
};

export const fetchBirthdayRes = async (): Promise<IBirthdayRes[]> => {
  try {
    const res: any[] = await SpServices.SPReadItems({
      Listname: CONFIG.ListNames.Intranet_BirthdayWishes,
    });

    const BirthdayRes: IBirthdayRes[] = await Promise.all(
      res?.map((val: any) => {
        return {
          ID: val?.ID,
          From: val?.From ?? "",
          To: val?.To ?? "",
          Message: val?.Message ?? "",
          IsTeams: val?.IsTeams ? true : false,
          IsOutlook: val?.IsOutlook ? true : false,
        };
      }) || []
    );

    return [...BirthdayRes];
  } catch (err) {
    return [];
  }
};

export const addBirthdayWish = async (
  data: any,
  selUserName: string,
  curUserName: string
): Promise<void> => {
  const toastId = toast.loading(
    "Responding to the birthday wish is in progress..."
  );

  try {
    await SpServices.SPAddItem({
      Listname: CONFIG.ListNames.Intranet_BirthdayWishes,
      RequestJSON: {
        From: curUserName,
        To: selUserName,
        Message: data?.Message?.value || "",
        IsTeams: data?.isTeams?.value || false,
        IsOutlook: data?.isOutlook?.value || false,
      },
    });

    toast.update(toastId, {
      render: "Birthday wishes sent successfully!",
      type: "success",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  } catch (err) {
    console.log("err: ", err);

    toast.update(toastId, {
      render: "Error adding response. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  }
};

export const addBirthDay = async (userID: string): Promise<any> => {
  // const toastId = toast.loading("Deactivating a birthday...");

  try {
    const res: any = await SpServices.SPAddItem({
      Listname: CONFIG.ListNames.Intranet_BirthDay,
      RequestJSON: {
        Title: userID,
        IsActive: true,
      },
    });

    // toast.update(toastId, {
    //   render: "Successfully deactivated the user!",
    //   type: "success",
    //   isLoading: false,
    //   autoClose: 5000,
    //   hideProgressBar: false,
    // });

    return res?.data?.ID || null;
  } catch (err) {
    console.log("err: ", err);

    // toast.update(toastId, {
    //   render: "Error deactivating the user's birthday. Please try again.",
    //   type: "error",
    //   isLoading: false,
    //   autoClose: 5000,
    //   hideProgressBar: false,
    // });

    return null;
  }
};

export const deleteBirthDay = async (Id: number): Promise<void> => {
  // const toastId = toast.loading("Activating a birthday...");

  try {
    await SpServices.SPDeleteItem({
      Listname: CONFIG.ListNames.Intranet_BirthDay,
      ID: Id,
    });

    // toast.update(toastId, {
    //   render: "Successfully activated the user!",
    //   type: "success",
    //   isLoading: false,
    //   autoClose: 5000,
    //   hideProgressBar: false,
    // });
  } catch (err) {
    console.log("err: ", err);

    // toast.update(toastId, {
    //   render: "Error activating the user's birthday. Please try again.",
    //   type: "error",
    //   isLoading: false,
    //   autoClose: 5000,
    //   hideProgressBar: false,
    // });
  }
};
