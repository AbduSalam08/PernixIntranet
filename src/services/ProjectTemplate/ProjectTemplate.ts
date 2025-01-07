import moment from "moment";
import SpServices from "../SPServices/SpServices";
import { ProjectDetails } from "../../interface/interface";
import { IFolderAddResult, sp } from "@pnp/sp/presets/all";

interface IFormData {
  [key: string]: { value: any };
}

// export const handleAddNewProject = async (formData: any): Promise<any> => {
//   debugger;
//   await SpServices.SPAddItem({
//     Listname: "ProjectDetails",
//     RequestJSON: {
//       Title: formData.projectName?.value || "",
//       Status: formData.Status.value,
//       ContractNo: formData.contractNo.value,
//       ProjectAdminId: formData.projectAdmin.value?.id,
//       ClientName: formData.clientName.value,
//       Location: formData.location.value,
//       Address: formData.address.value,
//       TeamId: { results: [formData.team.value[0]?.id] },
//       StartDate: moment(formData.StartDate.value) || "",
//       EndDate: moment(formData.EndDate.value) || "",
//       ProjectDescription: formData.Description.value,
//     },
//   })
//     .then(async (res: any) => {
//       let curpath = `${window.location.pathname
//         .split("/", 3)
//         .join("/")}/ProjectTemplate`;
//       console.log("curpath: ", curpath);

//       let path = await sp.web
//         .getFolderByServerRelativePath(curpath)
//         .folders.addUsingPath(formData.projectName.value, true);

//       let folders = ["Documents", "BannerImages"];
//       for (let i = 0; i < folders.length; i++) {
//         await sp.web
//           .getFolderByServerRelativePath(`${path?.data?.ServerRelativeUrl}`)
//           .folders.addUsingPath(folders[i], true);
//       }

//       return res?.data?.Id;
//     })
//     .catch((error: any) => {
//       console.log(error);
//     });
// };

export const handleAddNewProject = async (formData: any): Promise<any> => {
  try {
    const res = await SpServices.SPAddItem({
      Listname: "ProjectDetails",
      RequestJSON: {
        Title: formData.projectName?.value || "",
        Status: formData.Status.value,
        ContractNo: formData.contractNo.value,
        ProjectAdminId: formData.projectAdmin.value?.id,
        ClientName: formData.clientName.value,
        Location: formData.location.value,
        Address: formData.address.value,
        TeamId: { results: [formData.team.value[0]?.id] },
        StartDate: moment(formData.StartDate.value) || "",
        EndDate: moment(formData.EndDate.value) || "",
        ProjectDescription: formData.Description.value,
      },
    });

    const curpath = `${window.location.pathname
      .split("/", 3)
      .join("/")}/ProjectTemplate`;
    console.log("curpath: ", curpath);

    const path = await sp.web
      .getFolderByServerRelativePath(curpath)
      .folders.addUsingPath(formData.projectName.value, true);

    const folders = ["Documents", "BannerImages"];
    for (let i = 0; i < folders.length; i++) {
      await sp.web
        .getFolderByServerRelativePath(`${path?.data?.ServerRelativeUrl}`)
        .folders.addUsingPath(folders[i], true);
    }

    return res?.data?.Id;
  } catch (error: any) {
    console.error(error);
    throw error;
  }
};

export const getProjectDetails = async (): Promise<ProjectDetails[]> => {
  try {
    const res: any = await SpServices.SPReadItems({
      Listname: "ProjectDetails",
      Select:
        "*,ProjectAdmin/Title,ProjectAdmin/EMail,ProjectAdmin/ID,Team/Title,Team/ID,Team/EMail",
      Expand: "ProjectAdmin,Team",
    });

    const data: ProjectDetails[] = res?.map((val: any) => ({
      id: val.ID,
      projectName: val?.Title,
      status: val?.Status,
      contractNo: val?.ContractNo,
      projectAdmin: {
        id: val?.ProjectAdmin?.ID,
        name: val?.ProjectAdmin?.Title,
        email: val?.ProjectAdmin?.EMail,
      },
      clientName: val?.ClientName,
      location: val?.Location,
      address: val?.Address,
      team: val?.Team?.map((team: any) => ({
        id: team?.ID,
        name: team?.Title,
        email: team?.EMail,
      })),
      startDate: val?.StartDate
        ? moment(val.StartDate).format("YYYY-MM-DD")
        : null,
      endDate: val?.EndDate ? moment(val.EndDate).format("YYYY-MM-DD") : null,
      description: val.ProjectDescription,
      summary: val?.Summary,
    }));

    return data;
  } catch (error) {
    console.error("Error fetching project details:", error);
    return [];
  }
};

export const addDocRepository = async (
  formData: IFormData,
  curPath: string,
  folderType: string
): Promise<void> => {
  // const toastId = toast.loading("Creating a new document repository...");

  try {
    let arrMasterFiles: any = formData?.Content || [];
    let newFolderName: any = formData?.FolderName || "";

    if (newFolderName) {
      const path: IFolderAddResult = await sp.web
        .getFolderByServerRelativePath(curPath)
        .folders.addUsingPath(newFolderName, true);

      //   if (folderType === "master_folder") {
      //     const list: any = await sp.web.lists.getByTitle(
      //       CONFIG.ListNames.Intranet_DocumentRepository
      //     );

      //     const items: any = await list.items
      //       .filter(`FileRef eq '${path?.data?.ServerRelativeUrl}'`)
      //       .get();

      //     await SpServices.SPUpdateItem({
      //       Listname: CONFIG.ListNames.Intranet_DocumentRepository,
      //       ID: items[0]?.ID,
      //       RequestJSON: {
      //         Priority: "1",
      //         IsActive: false,
      //       },
      //     });
      //   }

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

    // toast.update(toastId, {
    //   render: "Folder/File added successfully!",
    //   type: "success",
    //   isLoading: false,
    //   autoClose: 5000,
    //   hideProgressBar: false,
    // });
  } catch (err) {
    console.error("Error add document:", err);

    // toast.update(toastId, {
    //   render: "Error adding new document repository. Please try again.",
    //   type: "error",
    //   isLoading: false,
    //   autoClose: 5000,
    //   hideProgressBar: false,
    // });
  }
};

// export const getProjectDetails = async (): Promise<any> => {
//   await SpServices.SPReadItems({
//     Listname: "ProjectDetails",
//     Select:
//       "*,ProjectAdmin/Title,ProjectAdmin/EMail,ProjectAdmin/ID,Team/Title,Team/ID,Team/EMail",
//     Expand: "ProjectAdmin,Team",
//   })
//     .then((res: any) => {
//       let data = res?.map((val: any) => {
//         return {
//           id: val.ID,
//           projectName: val?.Title,
//           status: val?.Status,
//           contractNo: val?.ContractNo,
//           projectAdmin: {
//             id: val?.projectAdmin?.ID,

//             name: val?.ProjectAdmin?.Title,
//             email: val?.ProjectAdmin?.EMail,
//           },
//           clientName: val?.ClientName,
//           location: val?.Location,
//           address: val?.Address,
//           team: val?.Team?.map((team: any) => {
//             return {
//               id: team?.ID,
//               name: team?.Title,
//               email: team?.EMail,
//             };
//           }),
//           startDate: moment(val?.StartDate).format("YYYY-MM-DD") || null,
//           endDate: moment(val?.EndDate).format("YYYY-MM-DD") || null,
//           description: val.ProjectDescription,
//           summary: val?.Summary,
//         };
//       });
//       return data;
//     })
//     .catch((error: any) => {
//       console.log(error);
//     });
// };

//handle update ProjectDetails

export const handleUpdateproject = async (formData: any): Promise<void> => {
  try {
    await SpServices.SPUpdateItem({
      Listname: "ProjectDetails",
      ID: formData.ID,
      RequestJSON: {
        Title: formData.projectName?.value || "",
        Status: formData.Status.value,
        ContractNo: formData.contractNo.value,
        ProjectAdminId: formData.projectAdmin.value?.id,
        ClientName: formData.clientName.value,
        Location: formData.location.value,
        Address: formData.address.value,
        TeamId: { results: [formData.team.value[0]?.id] },
        StartDate: moment(formData.StartDate.value).format("YYYY-MM-DD") || "",
        EndDate: moment(formData.EndDate.value).format("YYYY-MM-DD") || "",
        ProjectDescription: formData.Description.value,
      },
    });
  } catch (error: any) {
    console.error(error);
    throw error;
  }
};

// export const getFoldersAndFiles = async (serverRelativeUrl: string) => {
//     try {
//       // Get the folder by server relative URL
//       const folder:IFolder  = await sp.web.getFolderByServerRelativePath(serverRelativeUrl).expand("Folders", "Files").get();

//       // Extract folders and files
//       const folders = folder.Folders.map((item: any) => ({
//         Name: item.Name,
//         ServerRelativeUrl: item.ServerRelativeUrl,
//       }));

//       const files = folder.files.map((item: any) => ({
//         Name: item.Name,
//         ServerRelativeUrl: item.ServerRelativeUrl,
//       }));

//       console.log("Folders:", folders);
//       console.log("Files:", files);

//       return { folders, files };
//     } catch (error) {
//       console.error("Error fetching folders and files:", error);
//       throw error;
//     }
//   };
