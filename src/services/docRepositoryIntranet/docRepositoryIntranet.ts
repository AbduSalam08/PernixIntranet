/* eslint-disable @typescript-eslint/no-explicit-any */
import { CONFIG } from "../../config/config";
import SpServices from "../SPServices/SpServices";
import { IFolderAddResult, sp } from "@pnp/sp/presets/all";
import { toast } from "react-toastify";

interface IFormData {
  [key: string]: { value: any };
}

export const getDocRepository = async (): Promise<any[]> => {
  try {
    const res: any = await SpServices.SPReadItems({
      Listname: CONFIG.ListNames.Intranet_DocumentRepository,
      Select:
        "*, FileLeafRef, FileRef, FileDirRef, Author/Title, Author/EMail, Author/Id",
      Expand: "File, Author",
      Topcount: 5000,
      Orderby: "Created",
      Orderbydecorasc: false,
    });

    return [...res];
  } catch (err) {
    console.error("Error fetching Document:", err);
    return [];
  }
};

export const pathFileORFolderCheck = async (path: string): Promise<any[]> => {
  try {
    const items: any = await SpServices.SPReadItems({
      Listname: CONFIG.ListNames.Intranet_DocumentRepository,
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
      Orderbydecorasc: false,
    });

    return [...items];
  } catch (err) {
    console.error("Error fetching Document:", err);
    return [];
  }
};

export const addDocRepository = async (
  formData: IFormData,
  curPath: string,
  folderType: string
): Promise<void> => {
  const toastId = toast.loading("Creating a new document repository...");

  try {
    let arrMasterFiles: any = formData?.Content || [];
    let newFolderName: any = formData?.FolderName || "";

    if (newFolderName) {
      const path: IFolderAddResult = await sp.web
        .getFolderByServerRelativePath(curPath)
        .folders.addUsingPath(newFolderName, true);

      if (folderType === "master_folder") {
        const list: any = await sp.web.lists.getByTitle(
          CONFIG.ListNames.Intranet_DocumentRepository
        );

        const items: any = await list.items
          .filter(`FileRef eq '${path?.data?.ServerRelativeUrl}'`)
          .get();

        await SpServices.SPUpdateItem({
          Listname: CONFIG.ListNames.Intranet_DocumentRepository,
          ID: items[0]?.ID,
          RequestJSON: {
            Priority: "1",
            IsActive: false,
          },
        });
      }

      if (arrMasterFiles.length) {
        for (let i: number = 0; arrMasterFiles.length > i; i++) {
          await sp.web
            .getFolderByServerRelativePath(path?.data?.ServerRelativeUrl)
            .files.addUsingPath(
              arrMasterFiles?.[i]?.name,
              arrMasterFiles?.[i],
              {
                Overwrite: true,
              }
            );
        }
      }
    } else {
      for (let i: number = 0; arrMasterFiles.length > i; i++) {
        await sp.web
          .getFolderByServerRelativePath(curPath)
          .files.addUsingPath(arrMasterFiles?.[i]?.name, arrMasterFiles?.[i], {
            Overwrite: true,
          });
      }
    }

    toast.update(toastId, {
      render: "Folder/File added successfully!",
      type: "success",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  } catch (err) {
    console.error("Error add document:", err);

    toast.update(toastId, {
      render: "Error adding new document repository. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  }
};

export const updateDocRepositoryData = async (data: any): Promise<void> => {
  await SpServices.SPUpdateItem({
    Listname: CONFIG.ListNames.Intranet_DocumentRepository,
    ID: data?.ID,
    RequestJSON: { ...data },
  });
};

export const deleteDocRepository = async (id: number): Promise<void> => {
  const toastId = toast.loading(
    "Deleting the document repository in progress..."
  );

  try {
    await SpServices.SPDeleteItem({
      Listname: CONFIG.ListNames.Intranet_DocumentRepository,
      ID: id,
    });

    toast.update(toastId, {
      render: "Folder/File deleted successfully!",
      type: "success",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  } catch (err) {
    console.error("Error updete document:", err);

    toast.update(toastId, {
      render:
        "An error occurred while deleting this document repository. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  }
};
