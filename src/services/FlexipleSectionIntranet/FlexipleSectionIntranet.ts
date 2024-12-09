import { toast } from "react-toastify";
import SpServices from "../SPServices/SpServices";

export const ShowHide = async (
  SelectItem: any,
  componentsList: any
): Promise<any> => {
  const toastId = toast.loading("Flexible Section Adding ...");

  try {
    const pollComponent = componentsList.find(
      (component: any) => component.title === "Poll"
    );

    if (pollComponent) {
      await SpServices.SPUpdateItem({
        Listname: "ShowComponent",
        ID: pollComponent.Id,
        RequestJSON: { isActive: SelectItem },
      });
    }

    toast.update(toastId, {
      render: "Layout updated successfully",
      type: "success",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  } catch (error) {
    console.log("error: ", error);

    toast.update(toastId, {
      render: "Error while Updating Flexible section",
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
  }
};
