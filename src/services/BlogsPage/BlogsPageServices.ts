/* eslint-disable no-debugger */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { CONFIG } from "../../config/config";
import { sp } from "@pnp/sp/presets/all";
import SpServices from "../SPServices/SpServices";
import { toast } from "react-toastify";
// This function is User like functionality Update Method
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
// This function userviewlikes Method
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
// This function is Number View Person
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
// This function usergetdetails in Intranet_Blogs
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
    .filter("isDelete ne 1 ")
    .get();
};
// This function Other UserDetails in NOt Approved Person
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
    // .filter("Status eq 'Approved'")
    .get();
};
// This function Admin Approved The Blog Status
export const Approved = async (Id: number, _Status: string): Promise<any> => {
  const toastId = toast.loading(`${_Status}ticket...`);

  try {
    const listname = CONFIG.ListNames.Intranet_Blogs;
    await sp.web.lists.getByTitle(listname).items.getById(Id).update({
      Status: _Status,
    });

    toast.update(toastId, {
      render: `Blog  ${_Status} Successfully!`,
      type: "success",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  } catch {
    toast.update(toastId, {
      render: `Error on ${_Status} Blog`,
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  }
};
// This Function is User Add Blogs Method
export const addfilemsg = async (
  _popupData: any,
  popupData: any,
  setLoaderState: any,
  index: any
): Promise<string> => {
  const toastId = toast.loading("Creating Blog...");

  setLoaderState((prevState: any) => {
    const updatedState = [...prevState];
    updatedState[index] = {
      ...updatedState[index],
      popupWidth: "450px",
      open: true,
      isLoading: {
        inprogress: true,
        error: false,
        success: false,
      },
    };
    return updatedState;
  });
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

      toast.update(toastId, {
        render: "Blog Added Successfully!",
        type: "success",
        isLoading: false,
        autoClose: 5000,
        hideProgressBar: false,
      });
      debugger;
      setLoaderState((prevState: any) => {
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
            successDescription: `The new Blog has been added successfully.`,
          },
        };
        return updatedState;
      });

      return "File and attachments added successfully";
    } else {
      return "File added without attachments";
    }
  } catch (error) {
    console.error("Error adding file:", error);
    return `Failed to add file: ${error.message || "unknown error"}`;
  }
};
// This is The Permission Handling
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const permissionhandling = async () => {
  try {
    // const groupname = CONFIG.SPGroupName.Calendar_Admin;
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
// This function get CurrentuserDetails
export const getcuruserdetails = async (): Promise<any> => {
  try {
    return await sp.web.currentUser.get();
  } catch {
    console.log("shanmugaraj");
  }
};
export const getintranettitle = async (): Promise<any> => {
  const listname = CONFIG.ListNames.IntranetBlogs_Title;
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
export const getupdateintranettitle = async (text: string): Promise<any> => {
  const listname = CONFIG.ListNames.IntranetBlogs_Title;
  return await sp.web.lists.getByTitle(listname).items.add({
    IntranetTitle: text,
  });
};

export const addComments = async (
  comment: string,
  id: number,
  TaggedPerson: any,

  setAllComment: any,
  allComment: any,
  curuser: any
): Promise<any> => {
  const toastId = toast.loading(` Adding Comment...`);

  try {
    let res = await SpServices.SPAddItem({
      Listname: "Intranet_BlogComments",
      RequestJSON: {
        Comments: comment,
        BlogIdId: id,
        TaggedPersonId: TaggedPerson,
      },
    });
    toast.update(toastId, {
      render: `Comment Added Successfully!`,
      type: "success",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });

    return res?.data?.Id;
  } catch {
    toast.update(toastId, {
      render: `Error on Adding Comment!`,
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
    console.log("failed to add comments");
  }
};

export const deleteBlog = async (id: number): Promise<void> => {
  const toastId = toast.loading(` Deleting Blog...`);

  try {
    SpServices.SPUpdateItem({
      Listname: CONFIG.ListNames.Intranet_Blogs,
      ID: id,
      RequestJSON: {
        isDelete: true,
      },
    });

    toast.update(toastId, {
      render: `Blog Deleted Successfully!`,
      type: "success",
      isLoading: false,
      autoClose: 3000,
      hideProgressBar: false,
    });
  } catch {
    toast.update(toastId, {
      render: `Error on Deleting Blog!`,
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
    console.log("failed to add comments");
  }
};

export const getComments = async (id: any): Promise<any> => {
  if (id) {
    const getComment = await sp.web.lists
      .getByTitle("Intranet_BlogComments")
      .items.select(
        "*,Author/EMail,Author/Title,Author/ID,BlogId/ID ,TaggedPerson/ID, TaggedPerson/EMail,TaggedPerson/Title"
      )
      .expand("Author,BlogId,TaggedPerson")
      .filter(`BlogIdId eq ${id}`)
      .get();
    return getComment;
  } else {
    const comments = SpServices.SPReadItems({
      Listname: "Intranet_BlogComments",
    });
    return comments;
  }
};

export const getCommentsLength = async (id: any): Promise<number> => {
  try {
    const comments = await getComments(id);
    return (await comments?.length) || 0;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return 0;
  }
};

export const changeBlogActive = async (
  qusId: number,
  isActive: boolean
): Promise<any> => {
  try {
    await SpServices.SPUpdateItem({
      Listname: CONFIG.ListNames.Intranet_Blogs,
      ID: qusId,
      RequestJSON: { isActive: isActive },
    });

    return "updated";
  } catch {
    return "error";
  }
};

export const getAllUsersList = async (): Promise<any> => {
  try {
    const res = await SpServices.getAllUsers(); // Wait for the service call to complete
    const allUsers = res
      ?.map((user: any) => ({
        id: user?.Id,
        value: user?.Title,
        email: user?.Email,
      }))
      ?.filter((item: any) => item?.email?.trim() !== ""); // Filter out users without emails
    return allUsers; // Return the processed list
  } catch (err) {
    console.error("Error fetching all users: ", err);
    return []; // Return an empty array in case of an error
  }
};
