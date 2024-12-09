import { toast } from "react-toastify";
import SpServices from "../SPServices/SpServices";

export const ShowHide = async (
  SelectItem: any,
  componentsList: any
  // setLoaderState: any,
  // index: number,
  // currentUser: any
): Promise<any> => {
  const toastId = toast.loading("Flexible Section Adding ...");

  try {
    // Add the PollQuestion

    const pollComponent = componentsList.find(
      (component: any) => component.title === "Poll"
    );

    if (pollComponent) {
      await SpServices.SPUpdateItem({
        Listname: "ShowComponent",
        ID: pollComponent.Id,
        RequestJSON: { isActive: SelectItem },
      });
      console.log("FlexibleSection component updated successfully!");
    }

    // Success handling

    toast.update(toastId, {
      render: "The Flexible Section Updated successfully",
      type: "success",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
    debugger;
  } catch (error) {
    // console.log("Error adding vote:", error);
    // Handle any error in the process

    toast.update(toastId, {
      render: "Error while Updating Flexible section",
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  }
};
