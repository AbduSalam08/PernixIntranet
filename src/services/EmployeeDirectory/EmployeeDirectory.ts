/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-debugger */
/* eslint-disable prefer-const */
import { MSGraphClient } from "@microsoft/sp-http";
import { CONFIG } from "../../config/config";
import { sp } from "@pnp/sp/presets/all";
import moment from "moment";
import SpServices from "../SPServices/SpServices";
import {
  IActiveUserDatas,
  IEmployeeDirectoryUsersData,
} from "../../interface/interface";

export const fetchAzureUsers = async (
  context: any
): Promise<IEmployeeDirectoryUsersData[]> => {
  const curUser: any = await sp.web.currentUser.get();
  const client: MSGraphClient = await context.msGraphClientFactory.getClient();

  let allUsers: any[] = [];
  let nextPageUrl: string | undefined = undefined;
  const userMailStructure: string = `@${curUser?.Email?.split("@")[1]}`;

  try {
    do {
      const response: any = nextPageUrl
        ? await client
            .api(nextPageUrl)
            .version("v1.0")
            .top(999)
            .select(
              "accountEnabled, department, skill, accountEnabled, Country, mail, id, displayName, Country, jobTitle, mobilePhone, manager, ext, givenName, surname, userPrincipalName, userType, businessPhones, officeLocation, identities"
            )
            .expand("manager, extensions")
            .filter("accountEnabled eq true")
            .get()
        : await client
            .api("users/")
            .version("v1.0")
            .top(999)
            .select(
              "accountEnabled, department, skill, accountEnabled, Country, mail, id, displayName, Country, jobTitle, mobilePhone, manager, ext, givenName, surname, userPrincipalName, userType, businessPhones, officeLocation, identities"
            )
            .expand("manager, extensions")
            .filter("accountEnabled eq true")
            .get();

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

    const userDetailsArray: any[] = await Promise.all(
      filteredData?.map(async (user: any, idx: number) => {
        try {
          const userData: any = await client
            .api(`/users/${user.id}?$select=birthday,skills`)
            .version("v1.0")
            .get();

          return {
            id: idx,
            ListId: null,
            IsActive: false,
            UserId: user?.id ?? "",
            Name: user?.displayName ?? "",
            SureName: user?.surname ?? "",
            Email: user?.userPrincipalName.toLowerCase() ?? "",
            JobTitle: user?.jobTitle ?? "",
            Manager: {
              Name: user?.manager?.displayName ?? "",
              Email: user?.manager?.userPrincipalName.toLowerCase() ?? "",
            },
            Department: user?.department ?? "",
            OfficeLocation: user?.officeLocation ?? "",
            BusinessPhones: user?.businessPhones?.[0] ?? "",
            MobilePhone: user?.mobilePhone ?? "",
            Birthday:
              moment(userData?.birthday).format("YYYYMMDD") !== "00010101"
                ? moment(userData?.birthday).format()
                : "",
            Skills: userData?.skills?.length
              ? userData.skills.toString()?.split(",")
              : [],
            Experience: user?.extensions?.[0]?.Experience ?? "",
            Qualifications: user?.extensions?.[0]?.Qualifications ?? "",
            IsExtension: user?.extensions?.length ? true : false,
          };
        } catch (err: any) {
          console.log("Error fetching user data: ", err);
          return null;
        }
      }) || []
    );

    return [...userDetailsArray];
  } catch (err) {
    console.log("err: ", err);

    return [];
  }
};

export const fetchAzureAdmins = async (context: any): Promise<any[]> => {
  const client: MSGraphClient = await context.msGraphClientFactory.getClient();
  let roleIds: string[] = [];
  let allAdmins: any[] = [];

  try {
    const overAllAdmins: any = await client
      .api(`/directoryRoles`)
      .version("v1.0")
      .header("Content-Type", "application/json")
      .get();

    const filterADEditAdminsData: any[] = overAllAdmins?.value?.filter(
      (val: any) =>
        val?.displayName?.toLowerCase() === "global administrator" ||
        val?.displayName?.toLowerCase() === "user administrator"
    );

    filterADEditAdminsData?.map((val: any) => {
      roleIds.push(val?.id ?? "");
    });

    for (const roleId of roleIds) {
      const roleMembersResponse: any = await client
        .api(`/directoryRoles/${roleId}/members`)
        .version("v1.0")
        .header("Content-Type", "application/json")
        .get();

      allAdmins = allAdmins.concat(roleMembersResponse?.value || []);
    }

    return [...allAdmins];
  } catch (err) {
    console.log("err: ", err);
    return [];
  }
};

export const fetchActiveUserDatas = async (): Promise<IActiveUserDatas[]> => {
  try {
    const res: any[] = await SpServices.SPReadItems({
      Listname: CONFIG.ListNames.EmployeeDirectory_Config,
      Topcount: 5000,
    });

    const userDatas: IActiveUserDatas[] = await Promise.all(
      res?.map((val: any) => {
        return {
          ID: val?.ID,
          UserId: val?.Userid ?? "",
          IsActive: val?.isActive ? true : false,
        };
      }) || []
    );

    return [...userDatas];
  } catch (err) {
    console.log("err: ", err);
    return [];
  }
};
