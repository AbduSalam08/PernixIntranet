import { sp } from "@pnp/sp/presets/all";
import { setPollIntranetData } from "../../redux/features/PollIntranetSlice";
import SpServices from "../SPServices/SpServices";
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
    // const questionItems: any = await sp.web.lists
    //   .getByTitle("Intranet_PollQuestion")
    //   .items.get();

    const questionItems = await SpServices.SPReadItems({
      Listname: "Intranet_PollQuestion",
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
      questionItems.map(async (questionItem: any) => {
        const optionsItems = await sp.web.lists
          .getByTitle("Intranet_PollOptions")
          .items.select("*,QuestionId/ID")
          .expand("QuestionId")
          .filter(`QuestionId eq ${questionItem.ID}`)
          .get();

        const responses = await sp.web.lists
          .getByTitle("Intranet_PollResponse")
          .items.select(
            "ID, QuestionId/ID, OptionId/ID,Author/EMail,Author/Title"
          )
          .expand("QuestionId, OptionId,Author")
          .filter(`QuestionId eq ${questionItem.ID}`)
          .orderBy("Modified", false)
          .get();

        // Identify the user's response and calculate total votes
        const ResId = responses.filter((val) => val.Author.EMail === curuser);
        const totalVotes = responses.length;

        // Calculate votes per option
        const optionVoteCounts = optionsItems.map((option: any) => {
          const voteCount = responses.filter(
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
        });

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

    console.log(allPollData, "allPollData");
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
      Listname: "Intranet_PollQuestion",
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
          Listname: "Intranet_PollOptions",
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
          successDescription: `The new PollQuestion '${formData.Title.value}' has been added successfully with all options.`,
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
        Listname: "Intranet_PollResponse",
        ID: SelectItem.VoteId,
        RequestJSON: {
          QuestionIdId: SelectItem.QuestionID,
          OptionIdId: SelectItem.OptionId,
        },
      });
    } else {
      await SpServices.SPAddItem({
        Listname: "Intranet_PollResponse",
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
      Listname: "Intranet_PollQuestion",
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
