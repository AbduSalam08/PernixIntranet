import moment from "moment";
import { setQuestionCEOIntranetData } from "../../redux/features/QuestionCEOIntranetSlice";
import SpServices from "../SPServices/SpServices";
import { sp } from "@pnp/sp";
import { CONFIG } from "../../config/config";
/* eslint-disable @typescript-eslint/no-floating-promises */

// export const getQuestionCeo = async (dispatch: any): Promise<any> => {
//   dispatch?.(
//     setQuestionCEOIntranetData({
//       isLoading: true,
//     })
//   );

//   try {
//     // Fetch news data
//     const response = await SpServices.SPReadItems({
//       Listname: "Intranet_QuestionsToCEO",
//       Select: "*, Author/Title, Author/EMail, Author/Id",
//       Expand: "Author",
//     });
//     console.log(response, "response");

//     const QuestionCeo = response.map((val) => ({
//       title: val.Question || "",

//       date: moment(val.Created).format("DD/MM/YYYY") || null,
//       avatarUrl: val.Author.EMail || "",
//       replies: [
//         {
//           content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
//           date: "26/08/2024",
//           avatarUrl: "https://randomuser.me/api/portraits/men/34.jpg",
//         },
//       ],
//     }));

//     // Wait for all attachment fetching promises to complete
//     const newsData = await Promise.all(QuestionCeo);

//     console.log("newsData: ", newsData);
//     // Dispatch the data
//     dispatch?.(
//       setQuestionCEOIntranetData({
//         isLoading: false,
//         data: newsData,
//         // error: "Error fetching news data",
//       })
//     );
//   } catch (error) {
//     console.error("Error fetching news data:", error);
//     dispatch?.(
//       setQuestionCEOIntranetData({
//         isLoading: false,
//         data: [],
//         error: error.message || "Error fetching news data",
//       })
//     );
//   }
// };

export const questionsCurrentUserRole = async (
  setUserDetails: any,
  setAssignToUsersList: any
): Promise<any> => {
  let userDetails = {};
  const currentUser: any = await sp.web.currentUser.get();
  const currentUserID = currentUser?.Id || null;
  const currentUserEmail = currentUser?.Email.toLowerCase() || "";

  const superAdmin: any = await sp.web.siteGroups
    .getByName(CONFIG.SPGroupName.Pernix_Admin)
    .users.get();

  const questionCEOAdminData: any = await sp.web.siteGroups
    .getByName(CONFIG.SPGroupName.QuestionCEO_Admin)
    .users.get();

  const questionCEOData: any = await sp.web.siteGroups
    .getByName(CONFIG.SPGroupName.QuestionCEO)
    .users.get();

  const usersWithJobTitles: any[] = await Promise.all(
    questionCEOData?.map(async (user: any) => {
      const profileProperties = await sp.profiles.getUserProfilePropertyFor(
        user?.LoginName,
        "SPS-JobTitle"
      );

      return {
        ...user,
        JobTitle: profileProperties || "Not Available",
      };
    })
  );

  setAssignToUsersList([...usersWithJobTitles]);

  const usersArray: any[] = [...superAdmin, ...questionCEOAdminData];
  const isAdmin: boolean = usersArray?.some(
    (val: any) => val.Email.toLowerCase() === currentUserEmail
  );
  const isCEO: boolean = usersWithJobTitles?.some(
    (val: any) => val.Email.toLowerCase() === currentUserEmail
  );

  if (isAdmin) {
    setUserDetails({
      role: "Admin",
      email: currentUserEmail,
      id: currentUserID,
    });
    userDetails = { role: "Admin", email: currentUserEmail };
  } else if (isCEO) {
    setUserDetails({
      role: "User",
      email: currentUserEmail,
      id: currentUserID,
    });
    userDetails = { role: "User", email: currentUserEmail };
  } else {
    setUserDetails({
      role: "User",
      email: currentUserEmail,
      id: currentUserID,
    });
    userDetails = { role: "User", email: currentUserEmail };
  }
  return userDetails;
};

export const getQuestionCeo = async (dispatch: any): Promise<any> => {
  dispatch?.(
    setQuestionCEOIntranetData({
      isLoading: true,
    })
  );
  try {
    // Fetch questions from the Intranet_QuestionsToCEO list
    const questionsResponse = await SpServices.SPReadItems({
      Listname: CONFIG.ListNames.Intranet_QuestionsToCEO,
      Select:
        "*, Author/Title, Author/EMail, Author/Id,AssignTo/Title, AssignTo/EMail, AssignTo/Id,AnswerBy/Title, AnswerBy/EMail, AnswerBy/Id",
      Expand: "Author,AssignTo,AnswerBy",
    });

    // Fetch responses from the Intranet_Response list
    // const responsesResponse = await SpServices.SPReadItems({
    //   Listname: "Intranet_QuestionCEOresponse",
    //   Select: "*, Questionceo/ID, Author/Title, Author/EMail", // Include Question/ID to filter by Question lookup
    //   Expand: "Questionceo, Author", // Expand the Question and Author lookup fields
    // });

    // Prepare the final structured data by filtering responses for each question
    const questionCeoData = questionsResponse.map((question: any) => {
      // Filter responses that match the current question ID
      // const filteredResponses = responsesResponse.filter(
      //   (response: any) => response.Questionceo?.ID === question?.ID
      // );

      // Structure the replies array for the current question
      // const replies = filteredResponses.map((res: any) => ({
      //   ID: res.ID,
      //   content: res.Title || "No response text provided.", // Use response text if available
      //   date: moment(res.Created).format("DD/MM/YYYY"), // Format the created date
      //   avatarUrl:
      //     res.Author?.EMail ||
      //     "https://randomuser.me/api/portraits/placeholder.jpg", // Use author's email as avatar or a placeholder
      // }));

      const replies = question?.Answer
        ? [
            {
              ID: question.ID,
              content: question?.Answer,
              date: moment(question?.AnswerDate).format("DD/MM/YYYY"),
              avatarUrl: question?.AnswerBy?.EMail || "",
            },
          ]
        : [];

      // Return the structured question and replies data
      return {
        ID: question.ID,
        title: question.Question || "", // Question from Intranet_QuestionsToCEO
        isActive: question.isActive ? true : false,
        date: moment(question.Created).format("DD/MM/YYYY") || null, // Format the question's created date
        avatarUrl:
          question.Author?.EMail ||
          "https://randomuser.me/api/portraits/placeholder.jpg", // Author's email or placeholder
        replies: replies, // Attach filtered responses
        assignTo: question?.AssignTo
          ? {
              id: question.AssignTo.Id,
              name: question.AssignTo.Title,
              email: question.AssignTo.EMail,
            }
          : { id: null, name: "", email: "" },
        Anonymous: question?.isAnonymous,
      };
    });

    // Dispatch the data
    dispatch?.(
      setQuestionCEOIntranetData({
        isLoading: false,
        data: questionCeoData, // Structured question and replies data
      })
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    dispatch?.(
      setQuestionCEOIntranetData({
        isLoading: false,
        data: [],
        error: error.message || "Error fetching data",
      })
    );
  }
};

export const addQuestionCeo = async (
  formData: any,
  setLoaderState: any,
  index: number,
  dispatch: any
): Promise<any> => {
  // Start loader for the specific item at the given index
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
    //Add item to the SharePoint list
    const addItem: any = await SpServices.SPAddItem({
      Listname: CONFIG.ListNames.Intranet_QuestionsToCEO,
      RequestJSON: {
        Question: formData?.Description?.value,
        isAnonymous: formData?.Anonymous?.value,
      },
    }).then((res: any) => {
      console.log(addItem, "addItem");
      // Success state after item and attachment are added
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
            successDescription: `The new Question has been added successfully.`,
            // successDescription: `The new Question '${formData.Description.value}' has been added successfully.`,
          },
        };
        return updatedState;
      });
      getQuestionCeo(dispatch);
    });
  } catch (error) {
    console.error("Error while adding Question:", error);

    // Handle error state
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
            "An error occurred while adding Question, please try again later.",
        },
      };
      return updatedState;
    });
  }
};
export const removeSearchParamsID = (): void => {
  // Get the current URL
  const currentUrl = new URL(window.location.href);

  // Get the search parameters (query string)
  const params = new URLSearchParams(currentUrl.search);

  // Remove the 'ID' parameter if it exists
  if (params.has("ID")) {
    params.delete("ID");

    // Construct the new URL without the 'ID' parameter
    const newUrl = `${currentUrl.origin}${currentUrl.pathname}${
      params.toString() ? "?" + params.toString() : ""
    }`;

    // Update the URL in the browser without reloading the page
    window.history.replaceState({}, "", newUrl);
  }
};

export const changeQuestionActiveStatus = async (
  qusId: number,
  isActive: boolean
): Promise<void> => {
  await SpServices.SPUpdateItem({
    Listname: CONFIG.ListNames.Intranet_QuestionsToCEO,
    ID: qusId,
    RequestJSON: { isActive: isActive },
  });
};

export const submitCEOQuestionAnswer = async (
  formData: any,
  payloadJson: object,
  setLoaderState: any,
  index: number,
  dispatch: any
): Promise<void> => {
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

  // if (type === "Update") {
  await SpServices.SPUpdateItem({
    Listname: CONFIG.ListNames.Intranet_QuestionsToCEO,
    ID: formData?.qustion?.ID,
    RequestJSON: payloadJson,
  })
    .then((res: any) => {
      getQuestionCeo(dispatch);
      removeSearchParamsID();
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
            successDescription: `The answer has been updated successfully.`,
            // successDescription: `The answer '${formData?.answer?.value}' has been updated successfully.`,
          },
        };
        return updatedState;
      });
    })
    .catch((err: any) => {
      console.log("Answer updated error", err);
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
              "An error occurred while updating answer, please try again later.",
          },
        };
        return updatedState;
      });
    });
  // } else {
  //   await SpServices.SPAddItem({
  //     Listname: "Intranet_QuestionCEOresponse",
  //     RequestJSON: { Title: formData?.answer?.value },
  //   })
  //     .then((res: any) => {
  //       getQuestionCeo(dispatch);
  //       removeSearchParamsID();
  //       setLoaderState((prevState: any) => {
  //         const updatedState = [...prevState]; // Copy state array
  //         updatedState[index] = {
  //           ...updatedState[index],
  //           popupWidth: "450px",
  //           isLoading: {
  //             inprogress: false,
  //             success: true,
  //             error: false,
  //           },
  //           messages: {
  //             ...updatedState[index].messages,
  //             successDescription: `The answer '${answer}' has been added successfully.`,
  //           },
  //         };
  //         return updatedState;
  //       });
  //     })
  //     .catch((err: any) => {
  //       console.log("Answer added error", err);
  //       setLoaderState((prevState: any) => {
  //         const updatedState = [...prevState]; // Copy state array
  //         updatedState[index] = {
  //           ...updatedState[index],
  //           popupWidth: "450px",
  //           isLoading: {
  //             inprogress: false,
  //             success: false,
  //             error: true,
  //           },
  //           messages: {
  //             ...updatedState[index].messages,
  //             errorDescription:
  //               "An error occurred while adding answer, please try again later.",
  //           },
  //         };
  //         return updatedState;
  //       });
  //     });
  // }
};
