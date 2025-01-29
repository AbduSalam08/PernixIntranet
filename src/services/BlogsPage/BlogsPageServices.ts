/* eslint-disable no-debugger */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { CONFIG } from "../../config/config";
import { IFolderAddResult, sp } from "@pnp/sp/presets/all";
import SpServices from "../SPServices/SpServices";
import { toast } from "react-toastify";
import {
  IAttachDetails,
  IBlogColumnType,
  IBlogCommentsColumnType,
  ICurUserData,
  IHyperLinkData,
} from "../../interface/interface";
import moment from "moment";
import { ReactText } from "react";
import { setAllUsersData } from "../../redux/features/AllUsersDataSlice";

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

export const getAllUsersList = async (dispatch: any): Promise<any> => {
  await SpServices.getAllUsers()
    .then((res: any) => {
      const allUsers: any = res
        ?.map((user: any) => ({
          id: user?.Id,
          value: user?.Title,
          email: user?.Email,
        }))
        ?.filter((item: any) => item?.email?.trim() !== "");
      dispatch(setAllUsersData(allUsers));
    })
    .catch((err: any) => {
      console.log("err: ", err);
    });
};

export const fetchCurUserData = async (): Promise<ICurUserData[]> => {
  try {
    const res: any = await sp.web.currentUser.get();

    return [
      {
        ID: res?.Id.toString() || "",
        Email: res?.Email.toLowerCase() || "",
        Title: res?.Title || "",
      },
    ];
  } catch (err) {
    console.log("fetchCurUserData: ", err);
    return [];
  }
};

export const fetchHyperlinkDatas = async (
  result: string
): Promise<IHyperLinkData[]> => {
  try {
    const res: any[] = await SpServices.SPReadItems({
      Listname: CONFIG.ListNames.Intranet_Hyperlink,
      Filter: [
        {
          FilterKey: "Result",
          Operator: "eq",
          FilterValue: result,
        },
      ],
      Topcount: 5000,
      Orderby: "Created",
      Orderbydecorasc: false,
    });

    console.log("res: ", res);
    const resData: IHyperLinkData[] = await Promise.all(
      res?.map((val: any) => {
        return {
          id: val?.ID || null,
          Title: val?.Title || "",
          Links: val?.Links || "",
          Result: val?.Result || "",
        };
      }) || []
    );

    return [...resData];
  } catch (err) {
    return [];
  }
};

export const fetchBlogDatas = async (
  result: string
): Promise<IBlogColumnType[]> => {
  try {
    const res: any[] = await SpServices.SPReadItems({
      Listname: CONFIG.ListNames.Intranet_Blogs,
      Select: "*, AttachmentFiles, Author/ID, Author/Title, Author/EMail",
      Expand: "AttachmentFiles, Author",
      Filter: [
        {
          FilterKey: "Result",
          Operator: "eq",
          FilterValue: result,
        },
      ],
      Topcount: 5000,
      Orderby: "Created",
      Orderbydecorasc: false,
    });

    const resData: IBlogColumnType[] = await Promise.all(
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
          Tag: val?.Title || "",
          Heading: val?.Heading || "",
          Description: val?.Description || "",
          ViewedUsers: val?.ViewedUsers ? JSON.parse(val?.ViewedUsers) : [],
          LikedUsers: val?.LikedUsers ? JSON.parse(val?.LikedUsers) : [],
          CommentedUsers: val?.CommentedUsers
            ? JSON.parse(val?.CommentedUsers)
            : [],
          Status: val?.Status || "",
          IsActive: val?.IsActive || false,
          Attachments: arrGetAttach,
          AuthorId: val?.AuthorId.toString() || "",
          AuthorEmail: val?.Author?.EMail.toLowerCase() || "",
          AuthorName: val?.Author?.Title || "",
          Date: moment(val?.Created).format("DD MMM YYYY"),
          ApprovalOn: val?.ApprovalOn
            ? Number(moment(val?.ApprovalOn).format("YYYYMMDDHHmm"))
            : null,
        };
      }) || []
    );

    return [...resData];
  } catch (err) {
    console.log("fetchBlogDatas: ", err);

    return [];
  }
};

export const fecthBlogDocumentUsingPath = async (
  path: string
): Promise<any[]> => {
  try {
    const res: any = await SpServices.SPReadItems({
      Listname: CONFIG.ListNames.Intranet_PernixWiki,
      Select:
        "*, FileLeafRef, FileRef, FileDirRef, Author/Title, Author/EMail, Author/Id",
      Expand: "File, Author",
      Filter: [
        {
          FilterKey: "FileDirRef",
          Operator: "eq",
          FilterValue: path,
        },
      ],
      Topcount: 5000,
      Orderby: "Created",
      Orderbydecorasc: true,
    });

    return [...res];
  } catch (err) {
    console.log("err: ", err);
    return [];
  }
};

export const fecthBlogComments = async (
  Id: number
): Promise<IBlogCommentsColumnType[]> => {
  try {
    const res: any = await SpServices.SPReadItems({
      Listname: CONFIG.ListNames.Intranet_BlogComments,
      Select:
        "*, Author/EMail, Author/Title, Author/ID, BlogId/ID ,TaggedPerson/ID, TaggedPerson/EMail, TaggedPerson/Title",
      Expand: "Author, BlogId, TaggedPerson",
      Filter: [
        {
          FilterKey: "BlogIdId",
          Operator: "eq",
          FilterValue: Id,
        },
      ],
      Topcount: 5000,
    });

    const comDatas: IBlogCommentsColumnType[] = await Promise.all(
      res?.map((val: any) => {
        return {
          AuthorId: val?.AuthorId.toString() || "",
          AuthorEmail: val?.Author?.EMail.toLowerCase() || "",
          AuthorName: val?.Author?.Title || "",
          BlogId: val?.BlogIdId || null,
          Comments: val?.Comments || "",
          Date: moment(val?.Created).format("DD MMM YYYY, H:mm"),
          ID: val?.ID || null,
          TaggedPerson: val?.TaggedPerson
            ? val?.TaggedPerson?.map((val: any) => ({
                id: val?.ID || null,
                email: val?.EMail || "",
                name: val?.Title || "",
              }))
            : [],
        };
      })
    );

    return [...comDatas];
  } catch (err) {
    console.log("fecthBlogComments: ", err);

    return [];
  }
};

export const addBlogData = async (
  data: any,
  fileData: any,
  arrMasterFiles: any,
  curUser: ICurUserData
): Promise<IBlogColumnType[]> => {
  const toastId = toast.loading("Creating a new blog...");

  try {
    let fileRes: any;

    const res: any = await SpServices.SPAddItem({
      Listname: CONFIG.ListNames.Intranet_Blogs,
      RequestJSON: { ...data },
    });

    if (fileData?.Attachments?.name) {
      fileRes = await sp.web.lists
        .getByTitle(CONFIG.ListNames.Intranet_Blogs)
        .items.getById(res?.data?.Id)
        .attachmentFiles.add(fileData.Attachments.name, fileData.Attachments);
    }

    const path: IFolderAddResult = await sp.web
      .getFolderByServerRelativePath(CONFIG.blogFileFlowPath)
      .folders.addUsingPath(`Pernix_Wiki_${res?.data?.Id}`, true);

    const list: any = await sp.web.lists.getByTitle(
      CONFIG.ListNames.Intranet_PernixWiki
    );

    const items: any = await list.items
      .filter(`FileRef eq '${path?.data?.ServerRelativeUrl}'`)
      .get();

    await SpServices.SPUpdateItem({
      Listname: CONFIG.ListNames.Intranet_PernixWiki,
      ID: items[0]?.ID,
      RequestJSON: {
        BlogId: res?.data?.Id,
      },
    });

    if (arrMasterFiles.length) {
      for (let i: number = 0; arrMasterFiles.length > i; i++) {
        await sp.web
          .getFolderByServerRelativePath(path?.data?.ServerRelativeUrl)
          .files.addUsingPath(arrMasterFiles?.[i]?.name, arrMasterFiles?.[i], {
            Overwrite: true,
          });
      }
    }
    const arrGetAttach: IAttachDetails[] = [];

    arrGetAttach.push({
      fileName: fileData.Attachments.name,
      content: null,
      serverRelativeUrl: fileRes?.data?.ServerRelativeUrl,
    });

    const resData: IBlogColumnType[] = [
      {
        ID: res?.data?.Id || null,
        Tag: data?.Title || "",
        Heading: data?.Heading || "",
        Description: data?.Description || "",
        ViewedUsers: [],
        LikedUsers: [],
        CommentedUsers: [],
        Status: data?.Status || "",
        IsActive: false,
        Attachments: arrGetAttach || null,
        AuthorId: curUser?.ID || "",
        AuthorEmail: curUser?.Email || "",
        AuthorName: curUser?.Title || "",
        Date: moment().format("DD MMM YYYY"),
        ApprovalOn: null,
      },
    ];

    toast.update(toastId, {
      render: "Blog added successfully!",
      type: "success",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });

    return [...resData];
  } catch (err) {
    console.log("err: ", err);

    toast.update(toastId, {
      render: "Error adding the new blog. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });

    return [];
  }
};

export const updateBlogData = async (
  Id: number,
  data: any,
  isToast: boolean,
  fileData?: any,
  docFileAddData?: any[],
  docFileRemoveData?: any[],
  curObject?: IBlogColumnType
): Promise<void> => {
  let toastId: ReactText = "";

  if (isToast) {
    toastId = toast.loading("Blog update in progress...");
  }

  try {
    await SpServices.SPUpdateItem({
      Listname: CONFIG.ListNames.Intranet_Blogs,
      ID: Id,
      RequestJSON: { ...data },
    });

    if (fileData?.Attachments?.name) {
      if (curObject?.Attachments?.[0]?.fileName) {
        await sp.web.lists
          .getByTitle(CONFIG.ListNames.Intranet_Blogs)
          .items.getById(Id)
          .attachmentFiles.getByName(curObject?.Attachments?.[0]?.fileName)
          .delete();
      }

      if (fileData?.Attachments) {
        await sp.web.lists
          .getByTitle(CONFIG.ListNames.Intranet_Blogs)
          .items.getById(Id)
          .attachmentFiles.add(
            fileData?.Attachments?.name,
            fileData?.Attachments
          );
      }
    }

    if (docFileRemoveData?.length) {
      for (let i: number = 0; docFileRemoveData.length > i; i++) {
        await SpServices.SPDeleteItem({
          Listname: CONFIG.ListNames.Intranet_PernixWiki,
          ID: docFileRemoveData[i].ID,
        });
      }
    }

    if (docFileAddData?.length) {
      for (let i: number = 0; docFileAddData.length > i; i++) {
        await sp.web
          .getFolderByServerRelativePath(
            `${CONFIG.blogFileFlowPath}/Pernix_Wiki_${Id}`
          )
          .files.addUsingPath(docFileAddData?.[i]?.name, docFileAddData?.[i], {
            Overwrite: true,
          });
      }
    }

    isToast &&
      toast.update(toastId, {
        render:
          data?.Status === CONFIG.blogStatus.Approved
            ? "Blog approved successfully!"
            : data?.Status === CONFIG.blogStatus.Rejected
            ? "Blog rejected successfully!"
            : "Blog updated successfully!",
        type: "success",
        isLoading: false,
        autoClose: 5000,
        hideProgressBar: false,
      });
  } catch (err) {
    console.log("err: ", err);

    isToast &&
      toast.update(toastId, {
        render: "Error updating the blog. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 5000,
        hideProgressBar: false,
      });
  }
};

export const deleteBlogData = async (ID: number): Promise<void> => {
  const toastId = toast.loading("Blog deletion in progress...");

  try {
    await SpServices.SPDeleteItem({
      Listname: CONFIG.ListNames.Intranet_Blogs,
      ID: ID,
    });

    toast.update(toastId, {
      render: "Blog deleted successfully!",
      type: "success",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  } catch (err) {
    console.log("err: ", err);

    toast.update(toastId, {
      render: "Error deleting the blog. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  }
};

export const addBlogCommentsData = async (
  data: any,
  curUser: ICurUserData
): Promise<IBlogCommentsColumnType[]> => {
  const toastId = toast.loading("Adding a comments...");

  try {
    const res: any = await SpServices.SPAddItem({
      Listname: CONFIG.ListNames.Intranet_BlogComments,
      RequestJSON: { ...data },
    });

    const resData: IBlogCommentsColumnType[] = [
      {
        AuthorId: curUser?.ID || "",
        AuthorEmail: curUser?.Email || "",
        AuthorName: curUser?.Title || "",
        BlogId: data?.BlogIdId || null,
        Comments: data?.Comments || "",
        Date: moment().format("DD MMM YYYY, H:mm"),
        ID: res?.data?.Id || null,
        TaggedPerson: res?.data?.TaggedPerson
          ? res?.data?.TaggedPerson?.map((val: any) => ({
              id: val?.ID || null,
              email: val?.EMail || "",
              name: val?.Title || "",
            }))
          : [],
      },
    ];

    toast.update(toastId, {
      render: "Comment added successfully!",
      type: "success",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });

    return [...resData];
  } catch (err) {
    console.log("err: ", err);

    toast.update(toastId, {
      render: "Error adding the blog comment. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });

    return [];
  }
};

export const addHyperLinkData = async (
  data: any
): Promise<IHyperLinkData[]> => {
  const toastId = toast.loading("Creating a new hyperlink...");

  try {
    const res: any = await SpServices.SPAddItem({
      Listname: CONFIG.ListNames.Intranet_Hyperlink,
      RequestJSON: { ...data },
    });

    const resData: IHyperLinkData[] = [
      {
        id: res?.data?.Id || null,
        Title: data?.Title || "",
        Links: data?.Links || "",
        Result: data?.Result || "",
      },
    ];

    toast.update(toastId, {
      render: "Hyperlink added successfully!",
      type: "success",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });

    return [...resData];
  } catch (err) {
    console.log("err: ", err);

    toast.update(toastId, {
      render: "Error adding the new hyperlink. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });

    return [];
  }
};

export const updateHyperLinkData = async (data: any): Promise<void> => {
  const toastId = toast.loading("Updating a hyperlink...");

  try {
    await SpServices.SPUpdateItem({
      Listname: CONFIG.ListNames.Intranet_Hyperlink,
      ID: data?.ID,
      RequestJSON: { ...data },
    });

    toast.update(toastId, {
      render: "Hyperlink updated successfully!",
      type: "success",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  } catch (err) {
    console.log("err: ", err);

    toast.update(toastId, {
      render: "Error updating the hyperlink. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  }
};

export const deleteHyperLinkData = async (ID: number): Promise<void> => {
  const toastId = toast.loading("Hyperlink deletion in progress...");

  try {
    await SpServices.SPDeleteItem({
      Listname: CONFIG.ListNames.Intranet_Hyperlink,
      ID: ID,
    });

    toast.update(toastId, {
      render: "Hyperlink deleted successfully!",
      type: "success",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  } catch (err) {
    console.log("err: ", err);

    toast.update(toastId, {
      render: "Error deleting the hyperlink. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  }
};
