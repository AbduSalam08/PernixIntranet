/* eslint-disable @typescript-eslint/no-explicit-any */
export const togglePopupVisibility = (
  setPopupController: any,
  controllerData?: any,
  index?: any,
  action?: "open" | "close" | any,
  popupTitle?: any,
  popupData?: any,
  confirmationTitle?: any
): void => {
  // Immediately toggle the popup visibility
  setPopupController((prev: any) =>
    prev.map(
      (popup: any, popupIndex: any) =>
        popupIndex === index
          ? {
              ...controllerData,
              popupWidth: popup?.popupWidth,
              open: action === "open" ? true : false,
              popupTitle: popupTitle || popup.popupTitle,
              confirmationTitle: confirmationTitle || popup.confirmationTitle,
              popupData: popupData || "",
            }
          : { ...popup }
      // : { ...controllerData }
    )
  );

  // Add a 2-second timeout to update isLoading state
  setTimeout(() => {
    setPopupController((prev: any) =>
      prev.map((popup: any, popupIndex: any) =>
        popupIndex === index
          ? {
              ...popup,
              popupWidth: controllerData?.popupWidth,
              isLoading: {
                inprogress: false,
                error: false,
                success: false,
              },
            }
          : popup
      )
    );
  }, 1000); // 2-second delay for isLoading
};

interface PopupController {
  isLoading: {
    inprogress: boolean;
    error: boolean;
    success: boolean;
  };
  messages: {
    success: string;
    error: string;
    inprogress: string;
  };
  [key: string]: any; // To handle any other dynamic properties in the state
}

export const resetPopupController = (
  prevState: PopupController[],
  index: number,
  resetMessages: boolean = false
): PopupController[] => {
  // Filter out the item by index
  const updatedItems = prevState.filter(
    (item: any, idx: number) => idx !== index
  );

  // Update the state with isLoading and messages if needed
  const updatedState: PopupController = {
    ...prevState[index],
    open: true, // Keep previous popup state at the specific index
    isLoading: {
      inprogress: false,
      error: false,
      success: false,
    },
    ...(resetMessages && {
      messages: {
        success: "",
        error: "",
        inprogress: "",
      },
    }),
  };

  // Return the updated array
  return [...updatedItems, updatedState];
};

export default resetPopupController;
