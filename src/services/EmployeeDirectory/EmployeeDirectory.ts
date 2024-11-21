/* eslint-disable @typescript-eslint/no-explicit-any */
import { CONFIG } from "../../config/config";
import { sp } from "@pnp/sp/presets/all";
export const getuserdetails = async (): Promise<any> => {
  const listname = CONFIG.ListNames.EmployeeDirectory_Config;
  return await sp.web.lists
    .getByTitle(listname)
    .items.select(
      "*",
      "AttachmentFiles",
      "Author/ID",
      "Author/Title",
      "Author/EMail"
    )
    .expand("AttachmentFiles,Author")
    .get();
};
