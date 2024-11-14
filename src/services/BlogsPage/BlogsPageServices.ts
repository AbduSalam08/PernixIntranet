/* eslint-disable no-debugger */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CONFIG } from "../../config/config";
import { sp } from "@pnp/sp/presets/all";

export const addlikemethod = async (
  Id: number,
  addingdetails: any,
  onLoadingFunc: any
): Promise<void> => {
  const listname = CONFIG.ListNames.Intranet_Blogs;
  await sp.web.lists
    .getByTitle(listname)
    .items.getById(Id)
    .update({
      UserLikes: addingdetails,
    })
    .then((arr) => {
      console.log("Update successful:", arr);
    })
    .catch((err) => {
      console.error("Error updating item:", err);
    })
    .finally(() => {
      onLoadingFunc();
    });
};
export const viewLikes = async (
  Id: number,
  addingdetails: any,
  item: any,
  onLoadingFunc: any,
  setviewitem: any,
  setviewpage: any
): Promise<void> => {
  const listname = CONFIG.ListNames.Intranet_Blogs;
  await sp.web.lists
    .getByTitle(listname)
    .items.getById(Id)
    .update({
      ViewPerson: addingdetails,
    })
    .then((arr) => {
      console.log("Update successful:", arr);
    })
    .catch((err) => {
      console.error("Error updating item:", err);
    })
    .finally(() => {
      setviewitem(item);
      setviewpage(true);
      onLoadingFunc();
    });
};
export const nooneviews = async (
  Id: number,
  addingdetails: any,
  setviewitem: any,
  setviewpage: any,
  onLoadingFunc: any,
  item: any
): Promise<void> => {
  const listname = CONFIG.ListNames.Intranet_Blogs;

  await sp.web.lists
    .getByTitle(listname)
    .items.getById(Id)
    .update({
      ViewPerson: JSON.stringify(addingdetails),
    })
    .then((arr) => {
      console.log("Update successful:", arr);
    })
    .catch((err) => {
      console.error("Error updating item:", err);
    })
    .finally(() => {
      setviewitem(item);
      setviewpage(true);
      onLoadingFunc();
    });
};
export const usergetdetails = async (): Promise<any> => {
  const listname = CONFIG.ListNames.Intranet_Blogs;
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
export const otheruserdetails = async (): Promise<any> => {
  const listname = CONFIG.ListNames.Intranet_Blogs;
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
    .filter("Status eq 'Approved'")
    .get();
};
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const Approved = async (Id: number, _Status: string): Promise<any> => {
  debugger;
  const listname = CONFIG.ListNames.Intranet_Blogs;
  return await sp.web.lists.getByTitle(listname).items.getById(Id).update({
    Status: _Status,
  });
};
export const addfilemsg = async (
  _popupData: any,
  popupData: any
): Promise<string> => {
  const listname = CONFIG.ListNames.Intranet_Blogs;

  try {
    const arr = await sp.web.lists.getByTitle(listname).items.add(_popupData);

    if (popupData.Attachmentfiles.length > 0) {
      const _attachment = popupData.Attachmentfiles.map((fileData: any) => {
        return {
          name: fileData.File.name,
          content: fileData.File,
        };
      });

      await arr.item.attachmentFiles.addMultiple(_attachment);
      return "File and attachments added successfully";
    } else {
      return "File added without attachments";
    }
  } catch (error) {
    console.error("Error adding file:", error);
    return `Failed to add file: ${error.message || "unknown error"}`;
  }
};
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const permissionhandling = async () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // const permissions:string=""
    // const curruntuseremail = arr.Email;

    return await sp.web.siteGroups.getByName("Blogs_Admin").users.get();
  } catch (err) {
    console.error("Error handling permissions:", err);
    return null;
  }
};
export const getintername = async (): Promise<any[]> => {
  try {
    const listname = CONFIG.ListNames.Intranet_Blogs;
    return await sp.web.lists
      .getByTitle(listname)
      .fields.getByInternalNameOrTitle("Status")
      .select("Choices")
      .get();
  } catch (error) {
    console.error("Error fetching fields:", error);
    return [];
  }
};
