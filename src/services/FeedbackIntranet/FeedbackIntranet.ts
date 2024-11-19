import SpServices from "../SPServices/SpServices";
import { sp } from "@pnp/sp/presets/all";
import { setFeedbackIntranetData } from "../../redux/features/FeedbackIntranetSlice";
import { ICamlQuery, IFeedbackQusType } from "../../interface/interface";
import { CONFIG } from "../../config/config";
import moment from "moment";
import { FeedBackCamlJSON } from "../../camlQuery/feedback/FeedCamlQueryJSON";

interface IFormData {
  [key: string]: { value: any };
}

interface ILoaderStateItem {
  popupWidth: string;
  isLoading: {
    inprogress: boolean;
    error: boolean;
    success: boolean;
  };
  messages?: {
    successDescription?: string;
    errorDescription?: string;
  };
}

export const addFeedback = async (
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
    let listData: any = {
      Title: formData.Title.value,
      FieldType: formData.Status.value,
    };

    if (formData.Status.value === "Single line") {
      listData.Options = "";
    } else if (formData.Status.value === "Multi line") {
      listData.Options = "";
    } else if (formData.Status.value === "Choice") {
      // Store the options as a JSON string in the 'Options' column
      listData.Options = JSON.stringify(options.map((opt: any) => opt.Title));
    }
    // Add the PollQuestion
    const res = await SpServices.SPAddItem({
      Listname: "Intranet_feedbackQuestion",
      RequestJSON: listData,
    }).then((res) => {
      return res;
    });

    console.log(res, "res");

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
          successDescription: `The new FeedbackQuestion '${formData.Title.value}' has been added successfully with all options.`,
        },
      };
      return updatedState;
    });
  } catch (error) {
    console.log("Error adding FeedbackQuestion:", error);
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
            "An error occurred while adding FeedbackQuestion, please try again later.",
        },
      };
      return updatedState;
    });
  }
};

export const fetchPollData = async (
  dispatch: any,
  curuser: any,
  setSelectedVal: any
): Promise<any> => {
  dispatch?.(
    setFeedbackIntranetData({
      isLoading: true,
    })
  );

  try {
    // Fetching the latest question item by Modified date
    const latestQuestionItem: any = await sp.web.lists
      .getByTitle("Intranet_feedbackQuestion")
      .items.orderBy("Modified", false)
      .top(1)
      .get()
      .then((res: any[]) => {
        console.log(res[0], "latestQuestionItem");
        return res[0];
      });

    // Handle different question types (single, multi, or choice)
    let optionsArray;
    let SinglelineText;
    let MultilineText;
    if (latestQuestionItem.FieldType === "Choice") {
      optionsArray = JSON.parse(latestQuestionItem.Options);
    } else if (latestQuestionItem.FieldType === "Single line") {
      SinglelineText = latestQuestionItem.Options;
    } else if (latestQuestionItem.FieldType === "Multi line") {
      MultilineText = latestQuestionItem.Options;
    }

    console.log("optionsArray: ", optionsArray);
    const responses = await sp.web.lists
      .getByTitle("Intranet_feedbackResponse")
      .items.select("*,ID, Question/ID, Author/EMail, Title")
      .expand("Question, Author")
      .filter(`Question eq ${latestQuestionItem.ID}`)
      .get();

    const ResId = responses.filter((val: any) => val.Author.EMail === curuser);

    const Feedbackdata = [
      {
        Question: latestQuestionItem.Title,
        Id: latestQuestionItem.ID,
        singleText: SinglelineText,
        multiText: MultilineText,
        FieldType: latestQuestionItem.FieldType,
        options: optionsArray,
        ReasontoVisit: ResId[0]?.ReasontoVisit || "",
        resId: ResId.length ? ResId[0].ID : null,
        PreviousOption: ResId.length ? ResId[0].Title : null, // Previous response
      },
    ];
    if (Feedbackdata[0].FieldType === "Choice") {
      setSelectedVal((prevState: any) => ({
        ...prevState,
        ReaontoVisit: Feedbackdata[0].resId
          ? Feedbackdata[0].ReasontoVisit
          : "",
        option: Feedbackdata[0].resId
          ? Feedbackdata[0].PreviousOption
          : Feedbackdata[0].options,
      }));
    } else if (Feedbackdata[0].FieldType === "Single line") {
      setSelectedVal((prevState: any) => ({
        ...prevState,
        ReaontoVisit: Feedbackdata[0].resId
          ? Feedbackdata[0].ReasontoVisit
          : "",
        singleText: Feedbackdata[0].resId
          ? Feedbackdata[0].PreviousOption
          : Feedbackdata[0].options,
      }));
    } else if (Feedbackdata[0].FieldType === "Multi line") {
      setSelectedVal((prevState: any) => ({
        ...prevState,
        ReaontoVisit: Feedbackdata[0].resId
          ? Feedbackdata[0].ReasontoVisit
          : "",
        multiText: Feedbackdata[0].resId
          ? Feedbackdata[0].PreviousOption
          : Feedbackdata[0].multiText,
      }));
    }
    dispatch?.(
      setFeedbackIntranetData({
        isLoading: false,
        data: Feedbackdata,
      })
    );

    console.log(Feedbackdata, "POllQues");
  } catch (error) {
    console.error("Error fetching poll data:", error);
    dispatch?.(
      setFeedbackIntranetData({
        isLoading: false,
        data: [],
        error: error.message || "Error fetching poll data",
      })
    );
  }
};

export const sendFeedback = async (
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
  let obj;
  if (SelectItem.FieldType == "Choice") {
    obj = SelectItem.option;
  } else if (SelectItem.FieldType == "Single line") {
    obj = SelectItem.singleText;
  } else if (SelectItem.FieldType == "Multi line") {
    obj = SelectItem.multiText;
  }
  try {
    // Add the PollQuestion

    if (SelectItem?.resId) {
      await SpServices.SPUpdateItem({
        Listname: "Intranet_feedbackResponse",
        ID: SelectItem.resId,
        RequestJSON: {
          QuestionId: SelectItem.Id,
          Title: obj,
          ReasontoVisit: SelectItem.ReaontoVisit,
        },
      });
    } else {
      await SpServices.SPAddItem({
        Listname: "Intranet_feedbackResponse",
        RequestJSON: {
          QuestionId: SelectItem.Id,
          Title: obj,
          ReasontoVisit: SelectItem.ReaontoVisit,
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

const getDataLooping = async (
  data: any[],
  nextRef: any,
  filCamlJSON: ICamlQuery
): Promise<any[]> => {
  try {
    await sp.web.lists
      .getByTitle(filCamlJSON?.ListName)
      .renderListDataAsStream({
        ViewXml: filCamlJSON?.CamlQuery,
        Paging: nextRef.substring(1),
      })
      .then(async (res: any) => {
        data.push(...res.Row);

        if (res.NextHref) {
          await getDataLooping(data, res.NextHref, filCamlJSON);
        }
      });

    return [...data];
  } catch (err) {
    console.log("Looping datas fetching error for feedback: ", err);
    return [...data];
  }
};

export const getFeedBackDatas = async (listName: string): Promise<any[]> => {
  let data: any[] = [];

  let filCamlJSON: ICamlQuery = FeedBackCamlJSON?.CamlQuery?.filter(
    (val: ICamlQuery) => val.ListName === listName
  )?.[0];

  try {
    await sp.web.lists
      .getByTitle(filCamlJSON?.ListName)
      .renderListDataAsStream({
        ViewXml: filCamlJSON?.CamlQuery,
      })
      .then(async (res: any) => {
        data.push(...res.Row);

        if (res.NextHref) {
          await getDataLooping(data, res.NextHref, filCamlJSON);
        }
      });

    return [...data];
  } catch (err) {
    console.log("Datas fetching error for feedback: ", err);
    return [...data];
  }
};

export const addFeedbackQus = async (
  formData: IFormData,
  setLoaderState: React.Dispatch<React.SetStateAction<ILoaderStateItem[]>>,
  index: number
): Promise<any> => {
  setLoaderState((prevState) => {
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
    const res: any = await SpServices.SPAddItem({
      Listname: CONFIG.ListNames.Intranet_feedbackQuestion,
      RequestJSON: { ...formData },
    });

    const curContent: IFeedbackQusType = {
      ID: res?.data?.Id ?? null,
      Title: res?.data?.Title ?? "",
      StartDate: res.data.StartDate
        ? moment(res?.data?.StartDate).format(CONFIG.DateFormat)
        : null,
      EndDate: res.data.EndDate
        ? moment(res?.data?.EndDate).format(CONFIG.DateFormat)
        : null,
    };

    setLoaderState((prevState) => {
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
            "The feedback question has been added successfully.",
        },
      };
      return updatedState;
    });

    return { ...curContent };
  } catch (err) {
    console.log("Feedback question add error: ", err);

    setLoaderState((prevState) => {
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
          successDescription:
            "An error occurred while adding feedback question, please try again later.",
        },
      };
      return updatedState;
    });

    return null;
  }
};

export const updateFeedbackQus = async (
  formData: IFormData,
  setLoaderState: React.Dispatch<React.SetStateAction<ILoaderStateItem[]>>,
  index: number
): Promise<any> => {
  setLoaderState((prevState) => {
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
      Listname: CONFIG.ListNames.Intranet_feedbackQuestion,
      ID: Number(formData?.ID),
      RequestJSON: { ...formData },
    });

    setLoaderState((prevState) => {
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
            "The feedback question has been updated successfully.",
        },
      };
      return updatedState;
    });

    return { ...formData };
  } catch (err) {
    console.log("Feedback question update error: ", err);
    setLoaderState((prevState) => {
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
          successDescription:
            "An error occurred while updating feedback question, please try again later.",
        },
      };
      return updatedState;
    });

    return null;
  }
};

export const deleteFeedbackQus = async (
  formData: any,
  setLoaderState: React.Dispatch<React.SetStateAction<ILoaderStateItem[]>>,
  index: number
): Promise<any> => {
  setLoaderState((prevState) => {
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
    await SpServices.SPDeleteItem({
      Listname: CONFIG.ListNames.Intranet_feedbackQuestion,
      ID: Number(formData?.ID),
    });

    setLoaderState((prevState) => {
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
            "The feedback question has been deleted successfully.",
        },
      };
      return updatedState;
    });

    return true;
  } catch (err) {
    console.log("Feedback question deleted error: ", err);

    setLoaderState((prevState) => {
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
            "An error occurred while delete feedback question, please try again later.",
        },
      };
      return updatedState;
    });

    return false;
  }
};
