/* eslint-disable no-unused-expressions */
import { sp } from "@pnp/sp";
import { setCurrentUserDetails } from "../redux/features/MainSPContextSlice";
import { CONFIG } from "../config/config";
import { IUserDetails } from "../interface/interface";

/* eslint-disable @typescript-eslint/no-explicit-any */
// export const RoleAuth = async (
//   superAdmin: string,
//   groupAdmin: any,
//   dispatch?: any
// ): Promise<any> => {
//   let currentUserDetails: IUserDetails;
//   let currentUserID: number | null = null;
//   let currentUserEmail: string = "";
//   let currentUserName: string = "";
//   let _isAdmin: boolean = false;

//   try {
//     const currentUser: any = await sp.web.currentUser.get();

//     currentUserID = currentUser?.Id || null;
//     currentUserEmail = currentUser?.Email.toLowerCase() || "";
//     currentUserName = currentUser?.Title || "";
//   } catch (err) {
//     console.log("Error getting current user: ", err);
//   }

//   try {
//     const superAdminUsers: any = await sp.web.siteGroups
//       .getByName(superAdmin)
//       .users.get();

//     const isSuperAdmin: boolean =
//       superAdminUsers?.some(
//         (item: any) => item.Email.toLowerCase() === currentUserEmail
//       ) || false;

//     if (isSuperAdmin) {
//       currentUserDetails = {
//         userName: superAdminUsers[0]?.Title,
//         email: superAdminUsers[0]?.Email,
//         role: CONFIG.RoleDetails.SuperAdmin,
//         id: superAdminUsers[0]?.Id || currentUserID,
//       };

//       _isAdmin = isSuperAdmin;
//     } else {
//       // first map & check all the high priority groups
//       groupAdmin?.highPriorityGroups?.map(async (group: any) => {
//         const groupAdminUsers: any = await sp.web.siteGroups
//           .getByName(group)
//           .users.get();

//         _isAdmin =
//           groupAdminUsers?.some(
//             (val: any) => val.Email.toLowerCase() === currentUserEmail
//           ) || false;

//         currentUserDetails = {
//           userName: currentUserName,
//           email: currentUserEmail,
//           role: _isAdmin ? group : CONFIG.RoleDetails.user,
//           id: currentUserID,
//         };
//         dispatch && dispatch(setCurrentUserDetails(currentUserDetails));
//       });

//       // then map & check all the low priority groups
//       groupAdmin?.lowPriorityGroups?.map(async (group: any) => {
//         const groupAdminUsers: any = await sp.web.siteGroups
//           .getByName(group)
//           .users.get();

//         _isAdmin =
//           groupAdminUsers?.some(
//             (val: any) => val.Email.toLowerCase() === currentUserEmail
//           ) || false;

//         currentUserDetails = {
//           userName: currentUserName,
//           email: currentUserEmail,
//           role: _isAdmin ? group : CONFIG.RoleDetails.user,
//           id: currentUserID,
//         };
//         dispatch && dispatch(setCurrentUserDetails(currentUserDetails));
//       });
//     }
//   } catch (err) {
//     console.log("Error fetching user roles: ", err);
//   }
// };

export const RoleAuth = async (
  superAdmin: string,
  groupAdmin: any,
  dispatch?: any
): Promise<any> => {
  console.log("superAdmin:", superAdmin);
  let currentUserDetails: IUserDetails;
  let currentUserID: number | null = null;
  let currentUserEmail: string = "";
  let currentUserName: string = "";
  let _isAdmin: boolean = false;

  try {
    const currentUser: any = await sp.web.currentUser.get();
    currentUserID = currentUser?.Id || null;
    currentUserEmail = currentUser?.Email || "";
    currentUserName = currentUser?.Title || "";
  } catch (err) {
    console.log("Error getting current user: ", err);
  }

  try {
    // Check if user is a Super Admin
    const superAdminUsers: any = await sp.web.siteGroups
      .getByName(superAdmin)
      .users.get();

    const isSuperAdmin: boolean =
      superAdminUsers?.some(
        (item: any) =>
          item.Email.toLowerCase() === currentUserEmail?.toLowerCase()
      ) || false;

    if (isSuperAdmin) {
      currentUserDetails = {
        userName: superAdminUsers[0]?.Title,
        email: superAdminUsers[0]?.Email,
        role:
          superAdmin === CONFIG.SPGroupName.Pernix_Admin
            ? CONFIG.RoleDetails.SuperAdmin
            : superAdmin,
        id: superAdminUsers[0]?.Id || currentUserID,
      };

      _isAdmin = true;
      dispatch && dispatch(setCurrentUserDetails(currentUserDetails));
      return;
    }

    // If not a Super Admin, check high priority groups
    for (const group of groupAdmin?.highPriorityGroups || []) {
      const groupAdminUsers: any = await sp.web.siteGroups
        .getByName(group)
        .users.get();

      _isAdmin = groupAdminUsers?.some(
        (val: any) =>
          val.Email.toLowerCase() === currentUserEmail?.toLowerCase()
      );

      if (_isAdmin) {
        currentUserDetails = {
          userName: currentUserName,
          email: currentUserEmail,
          role: group,
          id: currentUserID,
        };
        dispatch && dispatch(setCurrentUserDetails(currentUserDetails));
        return;
      }
    }

    // If not found in high priority groups, check low priority groups
    for (const group of groupAdmin?.lowPriorityGroups || []) {
      const groupAdminUsers: any = await sp.web.siteGroups
        .getByName(group)
        .users.get();

      _isAdmin = groupAdminUsers?.some(
        (val: any) =>
          val.Email.toLowerCase() === currentUserEmail?.toLowerCase()
      );

      if (_isAdmin) {
        currentUserDetails = {
          userName: currentUserName,
          email: currentUserEmail,
          role: group,
          id: currentUserID,
        };
        dispatch && dispatch(setCurrentUserDetails(currentUserDetails));
        return;
      }
    }

    // If not found in any group, set as a normal user
    currentUserDetails = {
      userName: currentUserName,
      email: currentUserEmail,
      role: CONFIG.RoleDetails.user,
      id: currentUserID,
    };
    dispatch && dispatch(setCurrentUserDetails(currentUserDetails));
  } catch (err) {
    console.log("Error fetching user roles: ", err);
  }
};

export const getUsersByGroup = async (groupName: string): Promise<any> => {
  try {
    const res = await sp.web.siteGroups.getByName(groupName).users.get();
    console.log("res: ", res);
    return res; // Ensure that the resolved data is returned
  } catch (err) {
    console.log("err: ", err);
    throw err; // Rethrow the error if needed or return a default value
  }
};
