/* eslint-disable no-unused-expressions */
import { sp } from "@pnp/sp";
import { setCurrentUserDetails } from "../redux/features/MainSPContextSlice";
import { CONFIG } from "../config/config";
import { IUserDetails } from "../interface/interface";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const RoleAuth = async (
  superAdmin: string,
  groupAdmin: string,
  dispatch?: any
): Promise<any> => {
  let currentUserDetails: IUserDetails;
  let currentUserID: number | null = null;
  let currentUserEmail: string = "";
  let currentUserName: string = "";
  let _isAdmin: boolean = false;

  try {
    const currentUser: any = await sp.web.currentUser.get();

    currentUserID = currentUser?.Id || null;
    currentUserEmail = currentUser?.Email.toLowerCase() || "";
    currentUserName = currentUser?.Title || "";
  } catch (err) {
    console.log("Error getting current user: ", err);
  }

  try {
    const superAdminUsers: any = await sp.web.siteGroups
      .getByName(superAdmin)
      .users.get();

    const isSuperAdmin: boolean =
      superAdminUsers?.some(
        (item: any) => item.Email.toLowerCase() === currentUserEmail
      ) || false;

    if (isSuperAdmin) {
      currentUserDetails = {
        userName: superAdminUsers[0]?.Title,
        email: superAdminUsers[0]?.Email,
        role: CONFIG.RoleDetails.SuperAdmin,
        id: superAdminUsers[0]?.Id || currentUserID,
      };

      _isAdmin = isSuperAdmin;
    } else {
      const groupAdminUsers: any = await sp.web.siteGroups
        .getByName(groupAdmin)
        .users.get();

      _isAdmin =
        groupAdminUsers?.some(
          (val: any) => val.Email.toLowerCase() === currentUserEmail
        ) || false;

      currentUserDetails = {
        userName: currentUserName,
        email: currentUserEmail,
        role: _isAdmin ? groupAdmin : CONFIG.RoleDetails.User,
        id: currentUserID,
      };
    }

    dispatch && dispatch(setCurrentUserDetails(currentUserDetails));
  } catch (err) {
    console.log("Error fetching user roles: ", err);
  }
};
