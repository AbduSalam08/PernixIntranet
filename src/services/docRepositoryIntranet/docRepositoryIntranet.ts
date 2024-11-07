/* eslint-disable @typescript-eslint/no-explicit-any */
import { CONFIG } from "../../config/config";
import SpServices from "../SPServices/SpServices";
import { IFolderAddResult, sp } from "@pnp/sp/presets/all";

interface IFormData {
  [key: string]: { value: any };
}

interface ILoaderStateItem {
  popupWidth: string;
  isLoading: {
    inprogress: boolean;
    error: boolean;
    success: boolean;
  };
  messages?: {
    successDescription?: string;
    errorDescription?: string;
  };
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

export const addDocRepository = async (
  formData: IFormData,
  curPath: string,
  setLoaderState: React.Dispatch<React.SetStateAction<ILoaderStateItem[]>>,
  index: number
): Promise<void> => {
  setLoaderState((prevState) => {
    const updatedState = [...prevState];
    updatedState[index] = {
      ...updatedState[index],
      popupWidth: "450px",
      isLoading: {
        inprogress: true,
        error: false,
        success: false,
      },
    };
    return updatedState;
  });

  try {
    let arrMasterFiles: any = formData?.Content || [];
    let newFolderName: any = formData?.FolderName || "";

    if (newFolderName) {
      const path: IFolderAddResult = await sp.web
        .getFolderByServerRelativePath(curPath)
        .folders.addUsingPath(newFolderName, true);

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

    setLoaderState((prevState) => {
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
          successDescription: `The folder has been added successfully.`,
        },
      };

      return updatedState;
    });
  } catch (err) {
    console.error("Error add document:", err);
    setLoaderState((prevState) => {
      const updatedState = [...prevState];

      updatedState[index] = {
        ...updatedState[index],
        popupWidth: "450px",
        isLoading: {
          inprogress: false,
          success: false,
          error: true,
        },
        messages: {
          ...updatedState[index].messages,
          errorDescription:
            "An error occurred while creating folder, please try again later.",
        },
      };

      return updatedState;
    });
  }
};

export const deleteDocRepository = async (
  id: number,
  setLoaderState: React.Dispatch<React.SetStateAction<ILoaderStateItem[]>>,
  index: number
): Promise<void> => {
  setLoaderState((prevState) => {
    const updatedState = [...prevState];
    updatedState[index] = {
      ...updatedState[index],
      popupWidth: "450px",
      isLoading: {
        inprogress: true,
        error: false,
        success: false,
      },
    };
    return updatedState;
  });

  try {
    await SpServices.SPDeleteItem({
      Listname: CONFIG.ListNames.Intranet_DocumentRepository,
      ID: id,
    });

    setLoaderState((prevState) => {
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
          successDescription: `The folder has been deleted successfully.`,
        },
      };

      return updatedState;
    });
  } catch (err) {
    console.error("Error updete document:", err);
    setLoaderState((prevState) => {
      const updatedState = [...prevState];

      updatedState[index] = {
        ...updatedState[index],
        popupWidth: "450px",
        isLoading: {
          inprogress: false,
          success: false,
          error: true,
        },
        messages: {
          ...updatedState[index].messages,
          errorDescription:
            "An error occurred while creating folder, please try again later.",
        },
      };

      return updatedState;
    });
  }
};
