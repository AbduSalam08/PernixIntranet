import moment from "moment";
import SpServices from "../SPServices/SpServices";
import { ProjectDetails } from "../../interface/interface";
import { IFolderAddResult, sp } from "@pnp/sp/presets/all";
import "@pnp/sp/webs";
import "@pnp/sp/folders";

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

export const addBannerImages = async (
  FormData: any,
  curpath: string
): Promise<void> => {
  let data = FormData.Content?.value || [];

  for (let i: number = 0; data.length > i; i++) {
    await sp.web
      .getFolderByServerRelativePath(curpath)
      .files.addUsingPath(data?.[i]?.name, data?.[i], {
        Overwrite: true,
      });
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

export const getFolderFiles = async (url: string): Promise<any> => {
  try {
    // Get the folder reference
    const folder = sp.web.getFolderByServerRelativePath(url);

    // Retrieve the files in the folder
    const files = await folder.files();
    console.log("Files in the folder:", files);

    return files;
  } catch (error) {
    console.error("Error retrieving folder files:", error);
  }
};

export const addCheckpoints = async (
  formdata: any,
  listId: any,
  Projectname: string,
  isEdit: boolean,
  checkpointId: number | null
): Promise<void> => {
  // Prepare the checkpoint data from formdata
  const newCheckpoint = {
    id: isEdit ? checkpointId : Math.round(Math.random() * 200000) + 1,
    Checkpoint: formdata.Checkpoint.value,
    StartDate: formdata.StartDate.value,
    EndDate: formdata.EndDate.value,
    Status: formdata.Status.value,
  };

  try {
    // Get the item and its attachments
    const item = await sp.web.lists
      .getByTitle("ProjectDetails")
      .items.getById(listId)
      .select("AttachmentFiles")
      .expand("AttachmentFiles")();

    console.log(item.AttachmentFiles, "Attachments");

    let checkpointsArray: any[] = []; // Initialize an empty array for checkpoints

    if (item.AttachmentFiles.length > 0) {
      // If an attachment exists, download and parse its content
      const attachmentUrl = item.AttachmentFiles[0].ServerRelativeUrl;
      const attachmentContent = await sp.web
        .getFileByServerRelativeUrl(attachmentUrl)
        .getText();

      checkpointsArray = JSON.parse(attachmentContent); // Parse the existing content as JSON
      console.log("Existing checkpoints:", checkpointsArray);
    }

    // Update the existing checkpoint at the specified index
    if (isEdit && checkpointId !== null) {
      // Find the index of the checkpoint with the provided id
      const index = checkpointsArray.findIndex(
        (checkpoint) => checkpoint.id === checkpointId
      );

      if (index !== -1) {
        // Update the existing checkpoint at the found index
        checkpointsArray[index] = {
          ...checkpointsArray[index],
          ...newCheckpoint,
        };
        console.log("Checkpoint updated:", checkpointsArray[index]);
      } else {
        throw new Error("Invalid index provided for update.");
      }
    } else {
      // Add the new checkpoint to the array
      checkpointsArray.push(newCheckpoint);
      console.log("New checkpoint added:", newCheckpoint);
    }

    // Convert the updated array back to JSON
    const fileContent = JSON.stringify(checkpointsArray, null, 2); // Pretty JSON format
    const blob = new Blob([fileContent], { type: "text/plain" }); // Create Blob for file content
    const fileName = `${Projectname}.txt`; // Use the project name as the file name

    if (item.AttachmentFiles.length > 0) {
      // If an attachment exists, delete it before uploading the updated one
      const attachmentUrl = item.AttachmentFiles[0].ServerRelativeUrl;
      await sp.web.getFileByServerRelativeUrl(attachmentUrl).recycle();
      console.log("Existing attachment deleted.");
    }

    // Add the updated attachment
    await sp.web.lists
      .getByTitle("ProjectDetails")
      .items.getById(listId)
      .attachmentFiles.add(fileName, blob);
    console.log("Attachment updated successfully!");
  } catch (error) {
    console.error("Error handling attachments:", error);
  }
};
export const getAttachmentContent = async (
  listName: string,
  itemId: number,
  attachmentName: string
): Promise<string> => {
  try {
    // Fetch the attachment content
    const content = await sp.web.lists
      .getByTitle(listName)
      .items.getById(itemId)
      .attachmentFiles.getByName(attachmentName)
      .getText();

    console.log("Attachment Content:", content);
    return content; // Return the content for further processing
  } catch (error) {
    console.error("Error fetching attachment content:", error);
    throw error; // Re-throw the error for handling
  }
};
