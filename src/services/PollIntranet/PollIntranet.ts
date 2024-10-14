import { sp } from "@pnp/sp/presets/all";
import { setPollIntranetData } from "../../redux/features/PollIntranetSlice";
import SpServices from "../SPServices/SpServices";
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
  // Fetching the question item by ID

  try {
    const questionItem: any = await sp.web.lists
      .getByTitle("Intranet_PollQuestion")
      .items.orderBy("Modified", false)
      .top(1)
      .get()
      .then((res: any) => {
        console.log(res, "questionItem"); // Log the question item
        return res[0]; // Return the question item
      });

    // Accessing the QuestionId from options based on the fetched QuestionItem's ID
    const optionsItems = await sp.web.lists
      .getByTitle("Intranet_PollOptions")
      .items.select("*,QuestionId/ID")
      .expand("QuestionId")
      .filter(`QuestionId eq ${questionItem.ID}`) // Using questionItem.ID here
      .get();

    const responses = await sp.web.lists
      .getByTitle("Intranet_PollResponse")
      .items.select("ID, QuestionId/ID, OptionId/ID,Author/EMail")
      .expand("QuestionId, OptionId,Author")
      .filter(`QuestionId eq ${questionItem.ID}`)
      .orderBy("Modified", false)

      .get();

    // Calculate total votes

    const ResId = responses.filter((val) => val.Author.EMail == curuser);
    console.log(ResId, "curUserId");
    const totalVotes = responses.length;
    console.log(totalVotes, "totalVotes");

    // Calculate votes per option
    const optionVoteCounts = optionsItems.map((option: any) => {
      const voteCount = responses.filter(
        (response: any) => response.OptionId.ID === option.ID
      ).length;
      const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
      return {
        Title: option.Title || "",
        Id: option.ID || "",
        Percentage: percentage.toFixed(2),
        // Round to 2 decimal places
      };
    });
    let POllQues = [
      {
        Question: questionItem.Title, // Question text
        Id: questionItem.ID, // Question ID
        options: optionVoteCounts,
        resId: ResId.length ? ResId[0].ID : null,
        PreviousOption: ResId.length ? ResId[0].OptionId.ID : null,
      },
    ];
    debugger;
    dispatch?.(
      setPollIntranetData({
        isLoading: false,
        data: POllQues,
        // error: "Error fetching news data",
      })
    );

    console.log(POllQues, "POllQues"); // Log options items
  } catch (error) {
    console.error("Error fetching news data:", error);
    dispatch?.(
      setPollIntranetData({
        isLoading: false,
        data: [],
        error: error.message || "Error fetching news data",
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
    const updatedState = [...prevState]; // Create a copy of the array
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
    // Add the PollQuestion
    const res = await SpServices.SPAddItem({
      Listname: "Intranet_PollQuestion",
      RequestJSON: {
        Title: formData.Title.value,
      },
    }).then((res) => {
      return res;
    });

    const questionId = res.data.ID; // Get the Question ID after successfully adding it

    // Add each option one by one in a for loop
    for (let i = 0; i < options.length; i++) {
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

// export const addPollData = async (
//   formData: any,
//   setLoaderState: any,
//   index: number,
//   options: any
// ): Promise<any> => {
//   setLoaderState((prevState: any) => {
//     const updatedState = [...prevState]; // Create a copy of the array
//     updatedState[index] = {
//       ...updatedState[index],
//       popupWidth: "450px",
//       isLoading: {
//         inprogress: true,
//         error: false,
//         success: false,
//       },
//     };
//     return updatedState;
//   });

//   try {
//     await SpServices.SPAddItem({
//       Listname: "Intranet_PollQuestion",
//       RequestJSON: {
//         Title: formData.Title.value,
//       },
//     })
//       .then(async (res) => {
//         let id = res.data.ID;
//         let options1: any = options.map((val: any) => ({
//           QuestionId: id,
//           Title: val.Title,
//         }));

//         await SpServices.SPAddItem({
//           Listname: "Intranet_PollOptions",
//           RequestJSON: options1,
//         })
//           .then((val) => {
//             alert("success");
//           })
//           .catch((err) => {
//             console.log(err);
//           });
//       })
//       .catch((err) => {
//         console.log(err);
//       });

//     setLoaderState((prevState: any) => {
//       const updatedState = [...prevState]; // Copy state array
//       updatedState[index] = {
//         ...updatedState[index],
//         popupWidth: "450px",
//         isLoading: {
//           inprogress: false,
//           success: true,
//           error: false,
//         },
//         messages: {
//           ...updatedState[index].messages,
//           successDescription: `The new PollQuestion '${formData.Title.value}' has been added successfully.`,
//         },
//       };
//       return updatedState;
//     });
//   } catch (error) {
//     setLoaderState((prevState: any) => {
//       const updatedState = [...prevState]; // Copy state array
//       updatedState[index] = {
//         ...updatedState[index],
//         popupWidth: "450px",
//         isLoading: {
//           inprogress: false,
//           success: false,
//           error: true,
//         },
//         messages: {
//           ...updatedState[index].messages,
//           errorDescription:
//             "An error occurred while adding PollQuestion, please try again later.",
//         },
//       };
//       return updatedState;
//     });
//   }
// };

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
