/* eslint-disable no-unused-expressions */
import { sp } from "@pnp/sp";
import { GROUPS } from "../config/config";
import { setCurrentUserDetails } from "../redux/features/MainSPContextSlice";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const RoleAuth = async (
  currentUser: any,
  dispatch?: any
): Promise<any> => {
  let currentUserDetails: any;
  let currentUserID: any;
  await sp.web.currentUser
    .get()
    ?.then((res: any) => {
      currentUserID = res?.Id;
    })
    .catch((err: any) => {
      console.log("Error : ", err);
    });

  await sp.web.siteGroups
    // .getByName("ReadifyEM_Admin")
    .getByName(GROUPS.PERNIX_ADMIN)
    .users.get()
    .then((res: any) => {
      const defineUserIsAdmin: any[] = res?.filter((item: any) => {
        // return currentUser?.Email === item?.UserPrincipalName;
        return currentUser?.email === item?.Email;
      });

      // setting the current user details
      if (defineUserIsAdmin?.length === 0) {
        currentUserDetails = {
          userName: currentUser?.displayName,
          email: currentUser?.email,
          role: "User",
          id: defineUserIsAdmin[0]?.id || currentUserID,
        };
      } else {
        currentUserDetails = {
          userName: defineUserIsAdmin[0]?.Title,
          // email: defineUserIsAdmin[0]?.UserPrincipalName,
          email: defineUserIsAdmin[0]?.Email,
          role: "Admin",
          id: defineUserIsAdmin[0]?.id || currentUserID,
        };
      }

      dispatch && dispatch(setCurrentUserDetails(currentUserDetails));
    })
    .catch((err: any) => {
      console.log("Error : ", err);
    });
};
