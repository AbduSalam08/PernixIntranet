import SpServices from "../SPServices/SpServices";

export const ShowHide = async (
  SelectItem: any,
  componentsList: any,
  setLoaderState: any,
  index: number,
  currentUser: any
): Promise<any> => {
  setLoaderState((prevState: any) => {
    const updatedState = [...prevState]; // Create a copy of the array
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
    setLoaderState((prevState: any) => {
      const updatedState = [...prevState]; // Copy state array
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
          successDescription: `The Flexile option has been Updated successfully with all options.`,
        },
      };
      return updatedState;
    });
  } catch (error) {
    console.log("Error adding vote:", error);
    // Handle any error in the process
    setLoaderState((prevState: any) => {
      const updatedState = [...prevState]; // Copy state array
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
            "An error occurred while adding Flexiblesection, please try again later.",
        },
      };
      return updatedState;
    });
  }
};
