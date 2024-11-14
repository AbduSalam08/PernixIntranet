import { sp } from "@pnp/sp/presets/all";
import { setPollIntranetData } from "../../redux/features/PollIntranetSlice";
import SpServices from "../SPServices/SpServices";
import { CONFIG } from "../../config/config";
// import moment from "moment";
// import { LISTNAMES } from "../../config/config";

export const fetchPollData = async (
  dispatch: any,
  curuser: any
): Promise<any> => {
  dispatch?.(
    setPollIntranetData({
      isLoading: true,
    })
  );

  try {
    const questionItems = await SpServices.SPReadItems({
      Listname: CONFIG.ListNames.Intranet_PollQuestion,
      Filter: [
        {
          FilterKey: "isDelete",
          Operator: "ne",
          FilterValue: "1",
        },
      ],
      Topcount: 5000,
      Orderby: "Created",
      Orderbydecorasc: false,
    }).then((res) => {
      return res;
    });

    const allPollData = await Promise.all(
      questionItems?.map(async (questionItem: any) => {
        const optionsItems = await sp.web.lists
          .getByTitle(CONFIG.ListNames.Intranet_PollOptions)
          .items.select("*, QuestionId/ID")
          .expand("QuestionId")
          .filter(`QuestionId eq ${questionItem.ID} and isDelete ne 1`)
          .get();

        const responses = await sp.web.lists
          .getByTitle(CONFIG.ListNames.Intranet_PollResponse)
          .items.select(
            "*, ID, QuestionId/ID, OptionId/ID, Author/EMail, Author/Title"
          )
          .expand("QuestionId, OptionId, Author")
          .filter(`QuestionId eq ${questionItem.ID} and isDelete ne 1`)
          .orderBy("Modified", false)
          .get();

        // Identify the user's response and calculate total votes
        const ResId = await Promise.all(
          responses?.filter(
            (val: any) =>
              val?.Author?.EMail?.toLowerCase() === curuser?.toLowerCase()
          )
        );
        const totalVotes = responses?.length;

        // Calculate votes per option
        const optionVoteCounts = await Promise.all(
          optionsItems?.map((option: any) => {
            const voteCount = responses?.filter(
              (response: any) => response.OptionId.ID === option.ID
            );

            const percentage =
              totalVotes > 0 ? (voteCount?.length / totalVotes) * 100 : 0;

            return {
              Title: option.Title || "",
              Id: option.ID || "",
              Percentage: percentage.toFixed(2),
              Memebers: [...voteCount],
            };
          })
        );

        return {
          Question: questionItem.Title,
          Id: questionItem.ID,
          StartDate: questionItem.StartDate,
          EndDate: questionItem.EndDate,
          options: optionVoteCounts,
          TotlaVotes: responses ? responses.length : 0,
          resId: ResId.length ? ResId[0].ID : null,
          PreviousOption: ResId.length ? ResId[0].OptionId.ID : null,
          Select: ResId.length ? ResId[0].OptionId.ID : null,
        };
      })
    );

    dispatch?.(
      setPollIntranetData({
        isLoading: false,
        data: allPollData,
      })
    );
  } catch (error) {
    console.error("Error fetching poll data:", error);
    dispatch?.(
      setPollIntranetData({
        isLoading: false,
        data: [],
        error: error.message || "Error fetching poll data",
      })
    );
  }
};

export const addPollData = async (
  formData: any,
  setLoaderState: any,
  index: number,
  options: any
): Promise<any> => {
  setLoaderState((prevState: any) => {
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
    const res = await SpServices.SPAddItem({
      Listname: CONFIG.ListNames.Intranet_PollQuestion,
      RequestJSON: {
        Title: formData.Title.value,
        StartDate: formData?.StartDate?.value || null,
        EndDate: formData?.EndDate?.value || null,
      },
    }).then((res) => {
      return res;
    });

    const questionId = res.data.ID; // Get the Question ID after successfully adding it

    // Add each option one by one in a for loop
    for (let i = 0; i < options?.length; i++) {
      const optionData = {
        QuestionIdId: questionId,
        Title: options[i].Title,
      };

      try {
        // Add the PollOption
        await SpServices.SPAddItem({
          Listname: CONFIG.ListNames.Intranet_PollOptions,
          RequestJSON: optionData,
        });
      } catch (optionError) {
        console.log(`Error adding option '${options[i].Title}':`, optionError);
        // You can add error handling per option if necessary
      }
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
          successDescription: `The new poll question added successfully with all options.`,
        },
      };
      return updatedState;
    });
  } catch (error) {
    console.log("Error adding PollQuestion:", error);
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
            "An error occurred while adding PollQuestion, please try again later.",
        },
      };
      return updatedState;
    });
  }
};

export const updatePollData = async (
  formData: any,
  setLoaderState: any,
  index: number,
  options: any,
  updatedOptions: any
): Promise<any> => {
  setLoaderState((prevState: any) => {
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
    await SpServices.SPUpdateItem({
      Listname: CONFIG.ListNames.Intranet_PollQuestion,
      ID: formData?.Title?.Id,
      RequestJSON: {
        Title: formData?.Title?.value,
        StartDate: formData?.StartDate?.value || null,
        EndDate: formData?.EndDate?.value || null,
      },
    });

    const arrResponseData: any = await sp.web.lists
      .getByTitle(CONFIG.ListNames.Intranet_PollResponse)
      .items.select("*, QuestionId/ID, OptionId/ID")
      .expand("QuestionId, OptionId")
      .filter(`QuestionId eq ${formData?.Title?.Id} and isDelete ne 1`)
      .get();

    let deletedMasterArray: any[] = [];
    let curUpdatedDataArray: any[] = await Promise.all(
      options?.filter((val: any) => val?.itemId) || []
    );

    deletedMasterArray = [
      ...curUpdatedDataArray.filter(
        (obj1: any) =>
          !updatedOptions.some((obj2: any) => obj2?.itemId === obj1?.itemId)
      ),
      ...updatedOptions.filter(
        (obj2: any) =>
          !curUpdatedDataArray.some(
            (obj1: any) => obj1?.itemId === obj2?.itemId
          )
      ),
    ];

    for (let i: number = 0; options?.length > i; i++) {
      const optionData = {
        QuestionIdId: formData?.Title?.Id,
        Title: options[i].Title,
      };

      if (options[i]?.itemId) {
        try {
          await SpServices.SPUpdateItem({
            Listname: CONFIG.ListNames.Intranet_PollOptions,
            ID: options[i]?.itemId,
            RequestJSON: optionData,
          });
        } catch (optionError) {
          console.log(
            `Error updating option '${options[i].Title}': `,
            optionError
          );
        }
      } else {
        try {
          await SpServices.SPAddItem({
            Listname: CONFIG.ListNames.Intranet_PollOptions,
            RequestJSON: optionData,
          });
        } catch (optionError) {
          console.log(
            `Error adding option '${options[i].Title}': `,
            optionError
          );
        }
      }
    }

    for (let j: number = 0; deletedMasterArray?.length > j; j++) {
      if (deletedMasterArray[j]?.itemId) {
        try {
          await SpServices.SPUpdateItem({
            Listname: CONFIG.ListNames.Intranet_PollOptions,
            ID: deletedMasterArray[j]?.itemId,
            RequestJSON: { isDelete: true },
          });

          let deletedDataID: any = await Promise.all(
            arrResponseData?.filter(
              (val: any) => val?.OptionId?.ID === deletedMasterArray[j]?.itemId
            ) || []
          );

          await Promise.all(
            deletedDataID?.forEach(async (val: any) => {
              await SpServices.SPUpdateItem({
                Listname: CONFIG.ListNames.Intranet_PollResponse,
                ID: val?.ID,
                RequestJSON: {
                  isDelete: true,
                },
              });
            })
          );
        } catch (optionError) {
          console.log(
            `Error deleting option '${deletedMasterArray[j].Title}': `,
            optionError
          );
        }
      }
    }

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
          successDescription: `The poll question updated successfully with all options.`,
        },
      };
      return updatedState;
    });
  } catch (err) {
    console.log("Error updating PollQuestion: ", err);
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
            "An error occurred while adding PollQuestion, please try again later.",
        },
      };
      return updatedState;
    });
  }
};

export const addVote = async (
  SelectItem: any,
  setLoaderState: any,
  index: number
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

    if (SelectItem?.VoteId) {
      await SpServices.SPUpdateItem({
        Listname: CONFIG.ListNames.Intranet_PollResponse,
        ID: SelectItem.VoteId,
        RequestJSON: {
          QuestionIdId: SelectItem.QuestionID,
          OptionIdId: SelectItem.OptionId,
        },
      });
    } else {
      await SpServices.SPAddItem({
        Listname: CONFIG.ListNames.Intranet_PollResponse,
        RequestJSON: {
          QuestionIdId: SelectItem.QuestionID,
          OptionIdId: SelectItem.OptionId,
        },
      });
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
          successDescription: `The '${SelectItem.Title}' has been voted successfully with all options.`,
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
            "An error occurred while adding vote, please try again later.",
        },
      };
      return updatedState;
    });
  }
};

export const deletePollData = async (
  questionId: number,
  setLoaderState: any,
  index: number
): Promise<any> => {
  setLoaderState((prevState: any) => {
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
    await SpServices.SPUpdateItem({
      Listname: CONFIG.ListNames.Intranet_PollQuestion,
      ID: questionId,
      RequestJSON: {
        isDelete: true,
      },
    });

    // Success handling
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
          successDescription: `PollQuestion with ID '${questionId}' has been deleted successfully.`,
        },
      };
      return updatedState;
    });
  } catch (error) {
    console.log("Error deleting PollQuestion:", error);
    // Handle error during the delete operation
    setLoaderState((prevState: any) => {
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
            "An error occurred while deleting PollQuestion, please try again later.",
        },
      };
      return updatedState;
    });
  }
};
