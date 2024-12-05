/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-use-before-define */
import moment from "moment";
import { setQuestionCEOIntranetData } from "../../redux/features/QuestionCEOIntranetSlice";
import SpServices from "../SPServices/SpServices";
import { sp } from "@pnp/sp";
import { CONFIG } from "../../config/config";
import { toast } from "react-toastify";

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
        "*, Author/Title, Author/EMail, Author/Id, AssignTo/Title, AssignTo/EMail, AssignTo/Id, AnswerBy/Title, AnswerBy/EMail, AnswerBy/Id",
      Expand: "Author, AssignTo, AnswerBy",
    });

    // Prepare the final structured data by filtering responses for each question
    const questionCeoData = questionsResponse.map((question: any) => {
      const replies = question?.Answer
        ? [
            {
              ID: question.ID,
              content: question?.Answer,
              date: moment(question?.AnswerDate).format("DD MMM YYYY"),
              avatarUrl: question?.AnswerBy?.EMail || "",
              AnswerBy: question?.AnswerBy?.Title || "",
            },
          ]
        : [];

      // Return the structured question and replies data
      return {
        ID: question.ID,
        title: question.Question || "", // Question from Intranet_QuestionsToCEO
        isActive: question.isActive ? true : false,
        date: moment(question.Created).format("DD/MM/YYYY") || null, // Format the question's created date
        Author: question?.Author?.Title ?? "",
        avatarUrl: question?.Author?.EMail ?? "",
        replies: replies,
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
  Curuser?: any
): Promise<any> => {
  const toastId = toast.loading("Creating a new question...");
  let payload = {
    Question: formData?.Description?.value,
    isAnonymous: formData?.Anonymous?.value || false,
    SubmittedBy: formData?.Anonymous?.value ? "" : Curuser.Email,
  };

  try {
    await SpServices.SPAddItem({
      Listname: CONFIG.ListNames.Intranet_QuestionsToCEO,
      RequestJSON: {
        Question: formData?.Description?.value,
        isAnonymous: formData?.Anonymous?.value || false,
        SubmittedById: formData?.Anonymous?.value ? null : Curuser.Id,
      },
    });

    await postToApi(payload);
    debugger;

    toast.update(toastId, {
      render: "The new question added successfully!",
      type: "success",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
    });
    // getQuestionCeo(dispatch);
  } catch (error) {
    console.error("Error while adding Question:", error);

    toast.update(toastId, {
      render: "Error adding new question. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 5000,
      hideProgressBar: false,
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
  dispatch: any,
  type: string = ""
): Promise<void> => {
  let toastId: any;

  if (type) {
    toastId = toast.loading("Creating a response is in progress...");
  } else {
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
  }

  await SpServices.SPUpdateItem({
    Listname: CONFIG.ListNames.Intranet_QuestionsToCEO,
    ID: formData?.qustion?.ID,
    RequestJSON: payloadJson,
  })
    .then((res: any) => {
      getQuestionCeo(dispatch);
      removeSearchParamsID();

      if (type) {
        toast.update(toastId, {
          render: "The response has been added successfully!",
          type: "success",
          isLoading: false,
          autoClose: 5000,
          hideProgressBar: false,
        });
      } else {
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
              successDescription:
                "The leader for this question has been assigned successfully!",
            },
          };
          return updatedState;
        });
      }
    })
    .catch((err: any) => {
      console.log("Answer updated error", err);

      if (type) {
        toast.update(toastId, {
          render:
            "An error occurred while adding the response. Please try again.",
          type: "error",
          isLoading: false,
          autoClose: 5000,
          hideProgressBar: false,
        });
      } else {
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
                "An error occurred while assigning the leader. Please try again.",
            },
          };
          return updatedState;
        });
      }
    });
};

export const getcurrentUser = async (): Promise<any> => {
  let res: any = await sp.web.currentUser.get();

  return {
    Id: res?.Id || null,
    Email: res?.Email.toLowerCase() || "",
    Name: res?.Title || "",
  };
};

// api call when i add the Question

const postToApi = async (payload: any): Promise<void> => {
  const apiUrl =
    "https://prod-01.centralindia.logic.azure.com:443/workflows/a909d0d3e5e74b3ebf51e15d6760d6c0/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=NlthrgeWk21UKdngZuJNQeE4_-GnSvCNx5vkTEWp5Uc";

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log(
        `Request succeeded. Status: ${response.status} - ${response.statusText}`
      );
    } else {
      console.error(
        `Request failed. Status: ${response.status} - ${response.statusText}`
      );
    }
  } catch (error) {
    console.error("Error while posting to API:", error);
  }
};
