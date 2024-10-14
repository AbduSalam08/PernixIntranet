// import { LISTNAMES } from "../../config/config";
// import { sp } from "@pnp/sp/presets/all";
// import { LISTNAMES } from "../../config/config";
import moment from "moment";
import { setQuestionCEOIntranetData } from "../../redux/features/QuestionCEOIntranetSlice";
import SpServices from "../SPServices/SpServices";
// import SpServices from "../SPServices/SpServices";
// import { log } from "@pnp/pnpjs";
// import SpServices from "../SPServices/SpServices";
/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-floating-promises */

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
      Listname: "Intranet_QuestionsToCEO",
      RequestJSON: {
        Question: formData.Description.value,
      },
    });

    // const newQuestionItem = {
    //   title: formData.Description.value,
    //   date: moment(new Date()).format("DD/MM/YYYY"),
    //   avatarUrl: "", // Assuming the author is the logged-in user
    //   replies: [
    //     {
    //       content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    //       date: "26/08/2024",
    //       avatarUrl: "https://randomuser.me/api/portraits/men/34.jpg",
    //     },
    //   ],
    // };

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
          successDescription: `The new Question '${formData.Description.value}' has been added successfully.`,
        },
      };
      return updatedState;
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
export const getQuestionCeo = async (dispatch: any): Promise<any> => {
  dispatch?.(
    setQuestionCEOIntranetData({
      isLoading: true,
    })
  );

  try {
    // Fetch questions from the Intranet_QuestionsToCEO list
    const questionsResponse = await SpServices.SPReadItems({
      Listname: "Intranet_QuestionsToCEO",
      Select: "*, Author/Title, Author/EMail, Author/Id",
      Expand: "Author",
    });

    // Fetch responses from the Intranet_Response list
    const responsesResponse = await SpServices.SPReadItems({
      Listname: "Intranet_QuestionCEOresponse",
      Select: "*, Questionceo/ID, Author/Title, Author/EMail", // Include Question/ID to filter by Question lookup
      Expand: "Questionceo, Author", // Expand the Question and Author lookup fields
    });

    // Prepare the final structured data by filtering responses for each question
    const questionCeoData = questionsResponse.map((question: any) => {
      // Filter responses that match the current question ID
      const filteredResponses = responsesResponse.filter(
        (response: any) => response.Questionceo.ID === question.ID
      );

      // Structure the replies array for the current question
      const replies = filteredResponses.map((res: any) => ({
        content: res.Title || "No response text provided.", // Use response text if available
        date: moment(res.Created).format("DD/MM/YYYY"), // Format the created date
        avatarUrl:
          res.Author?.EMail ||
          "https://randomuser.me/api/portraits/placeholder.jpg", // Use author's email as avatar or a placeholder
      }));

      // Return the structured question and replies data
      return {
        title: question.Question || "", // Question from Intranet_QuestionsToCEO
        date: moment(question.Created).format("DD/MM/YYYY") || null, // Format the question's created date
        avatarUrl:
          question.Author?.EMail ||
          "https://randomuser.me/api/portraits/placeholder.jpg", // Author's email or placeholder
        replies: replies, // Attach filtered responses
      };
    });

    // Dispatch the data
    dispatch?.(
      setQuestionCEOIntranetData({
        isLoading: false,
        data: questionCeoData, // Structured question and replies data
      })
    );

    console.log("questionCeoData: ", questionCeoData);
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
