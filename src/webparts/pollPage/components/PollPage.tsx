/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../../../assets/styles/Style.css";
import styles from "./PollPage.module.scss";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
import moment from "moment";
import {
  addPollData,
  addVote,
  deletePollData,
  fetchPollData,
  updatePollData,
} from "../../../services/PollIntranet/PollIntranet";
import { CONFIG } from "../../../config/config";
import { RoleAuth } from "../../../services/CommonServices";
import { Button } from "primereact/button";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../utils/popupUtils";
import CustomDateInput from "../../../components/common/CustomInputFields/CustomDateInput";
import {
  resetFormData,
  resetOptionsData,
  resetSelectedItem,
  validateField,
} from "../../../utils/commonUtils";
import CustomInput from "../../../components/common/CustomInputFields/CustomInput";
import { Add, Delete } from "@mui/icons-material";
import DefaultButton from "../../../components/common/Buttons/DefaultButton";
import Popup from "../../../components/common/Popups/Popup";
import { ToastContainer } from "react-toastify";
// import { Avatar } from "primereact/avatar";
// import { AvatarGroup } from "primereact/avatargroup";

interface SearchField {
  selectedDate: Date | any;
  allSearch: string;
}

let objFilter: SearchField = {
  selectedDate: null,
  allSearch: "",
};

let curMasterOptions: any[] = [];

const PollPage = (props: any): JSX.Element => {
  const dispatch = useDispatch();
  const curUser = props.context._pageContext._user.email;

  const currentUserDetails: any = useSelector(
    (state: any) => state?.MainSPContext?.currentUserDetails
  );
  const PollIntranetData: any = useSelector((state: any) => {
    return state.PollIntranetData.value;
  });

  const initialPopupController = [
    {
      open: false,
      popupTitle: "New Poll",
      popupWidth: "900px",
      popupType: "custom",
      defaultCloseBtn: false,
      popupData: "",
      isLoading: {
        inprogress: false,
        error: false,
        success: false,
      },
      messages: {
        success: "PollQuestion added successfully!",
        error: "Something went wrong!",
        successDescription:
          "The new PollQuestion 'ABC' has been added successfully.",
        errorDescription:
          "An error occured while adding PollQuestion, please try again later.",
        inprogress: "Adding new PollQuestion, please wait...",
      },
    },
    {
      open: false,
      popupTitle: "Delete",
      popupWidth: "450px",
      popupType: "custom",
      defaultCloseBtn: false,
      popupData: "",
      isLoading: {
        inprogress: false,
        error: false,
        success: false,
      },
      messages: {
        success: "PollQuestion Deleted successfully!",
        error: "Something went wrong!",
        successDescription:
          "The new PollQuestion 'ABC' has been Deleted successfully.",
        errorDescription:
          "An error occured while Deleting PollQuestion, please try again later.",
        inprogress: "Deleting PollQuestion, please wait...",
      },
    },
    {
      open: false,
      popupTitle: "Update",
      popupWidth: "900px",
      popupType: "custom",
      defaultCloseBtn: false,
      popupData: "",
      isLoading: {
        inprogress: false,
        error: false,
        success: false,
      },
      messages: {
        success: "PollQuestion updated successfully!",
        error: "Something went wrong!",
        successDescription:
          "The new PollQuestion 'ABC' has been updated successfully.",
        errorDescription:
          "An error occured while updating PollQuestion, please try again later.",
        inprogress: "Updating new PollQuestion, please wait...",
      },
    },
  ];

  const [searchField, setSearchField] = useState<SearchField>({
    selectedDate: null,
    allSearch: "",
  });
  const [selectQuestionId, setSelectQuestionId] = useState<number | any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedOption, setSelectedOption] = useState<any | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>("");
  const [currentPoll, setCurrentPoll] = useState<any>([]);
  const [showcurrentPoll, setShowCurrentPoll] = useState<any>([]);
  const [popupController, setPopupController] = useState(
    initialPopupController
  );
  const [curPollID, setCurPollID] = useState<number>(0);
  const [curIDX, setCurIDX] = useState<number>(0);
  const [formData, setFormData] = useState<any>({
    Title: {
      value: "",
      Id: null,
      isValid: true,
      errorMsg: "Invalid title",
      validationRule: { required: true, type: "string" },
    },
    StartDate: {
      value: "",
      Id: null,
      isValid: true,
      errorMsg: "Invalid input",
      validationRule: { required: true, type: "date" },
    },
    EndDate: {
      value: "",
      Id: null,
      isValid: true,
      errorMsg: "Invalid input",
      validationRule: { required: true, type: "date" },
    },
  });
  const [options, setOptions] = useState<any>([
    {
      Id: 1,
      itemId: null,
      Title: "",
      value: "",
      Percentage: 0,
      isValid: true,
      errorMsg: "Invalid title",
      validationRule: { required: true, type: "string" },
    },
  ]);

  const handleInputChange = (
    field: string,
    value: any,
    isValid: boolean,
    errorMsg: string = ""
  ): void => {
    if (field.startsWith("options[")) {
      // Extract index and option field name
      const regex = /options\[(\d+)\]\.(\w+)/;
      const match = field.match(regex);
      if (match) {
        const index = parseInt(match[1]);
        const optionField = match[2];
        // Update the specific option in the options array
        setOptions((prevOptions: any[]) =>
          prevOptions.map((option, i) =>
            i === index
              ? {
                  ...option,
                  [optionField]: value,
                  isValid,
                  errorMsg: isValid ? "" : errorMsg,
                }
              : option
          )
        );
      }
    } else {
      setFormData((prevData: any) => ({
        ...prevData,
        [field]: {
          ...prevData[field],
          value: value,
          isValid,
          errorMsg: isValid ? "" : errorMsg,
        },
      }));
    }
  };

  const handleSubmit = async (): Promise<any> => {
    let hasErrors = false;

    // Validate each field and update the state with error messages
    const updatedFormData = Object.keys(formData).reduce((acc, key) => {
      const fieldData = formData[key];
      const { isValid, errorMsg } = validateField(
        key,
        fieldData.value,
        fieldData?.validationRule
      );

      if (!isValid) {
        hasErrors = true;
      }

      return {
        ...acc,
        [key]: {
          ...fieldData,
          isValid,
          errorMsg,
        },
      };
    }, {} as typeof formData);

    const updatedOptions = options.map((option: any) => {
      const { isValid, errorMsg } = validateField(
        "Title", // Assuming 'Title' is the field being validated for options
        option.Title,
        option.validationRule
      );

      if (!isValid) {
        hasErrors = true;
      }

      return {
        ...option,
        isValid,
        errorMsg,
      };
    });

    // Update both formData and options state
    setOptions(updatedOptions);
    setFormData(updatedFormData);

    if (!hasErrors) {
      if (formData?.Title?.Id) {
        togglePopupVisibility(
          setPopupController,
          initialPopupController[2],
          2,
          "close"
        ),
          await updatePollData(
            formData,
            // setPopupController,
            // 2,
            options,
            curMasterOptions
          );

        await fetchPollData(dispatch, curUser);
      } else {
        togglePopupVisibility(
          setPopupController,
          initialPopupController[0],
          0,
          "close"
        );

        await addPollData(formData, options);
        await fetchPollData(dispatch, curUser);
      }

      // formData?.Title?.Id
      //   ?
      //   togglePopupVisibility(
      //     setPopupController,
      //     initialPopupController[2],
      //     2,
      //     "close"
      //   ),

      //   await updatePollData(
      //       formData,
      //       setPopupController,
      //       2,
      //       options,
      //       curMasterOptions
      //     )
      //   :
      //   togglePopupVisibility(
      //       setPopupController,
      //       initialPopupController[0],
      //       0,
      //       "close"
      //     );

      // await addPollData(formData, options);
      // await fetchPollData(dispatch, curUser);
    } else {
      console.log("Form contains errors");
    }
  };

  // Function to handle adding a new option
  const handleAddOption = (): void => {
    const lastOption = options[options.length - 1];

    // Add a new option only if the last option has a non-empty value
    if (lastOption?.Title.trim() !== "") {
      setOptions((prevOptions: any[]) => [
        ...prevOptions,
        {
          Id: prevOptions.length + 1, // Ensure a unique Id
          Title: "",
          value: "",
          Percentage: 0,
          isValid: true,
          errorMsg: "Invalid title",
          validationRule: { required: true, type: "string" },
        },
      ]);
    }
  };

  // Function to handle deleting an option
  const handleDeleteOption = (index: number): void => {
    setOptions((prevOptions: any[]) =>
      prevOptions.filter((_, i) => i !== index)
    );
  };

  const mappedItem: any = options?.length
    ? options?.map((option: any, index: number) => (
        <div
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
          key={index}
        >
          <CustomInput
            value={option.Title}
            placeholder="Enter option"
            isValid={option.isValid}
            errorMsg={option.errorMsg}
            onChange={(e) => {
              const value = e.trimStart();
              const { isValid, errorMsg } = validateField(
                "Title",
                value,
                option.validationRule
              );
              handleInputChange(
                `options[${index}].Title`, // Update Title specifically
                value,
                isValid,
                errorMsg
              );
            }}
          />

          {/* Show plus icon for the last option if it's not empty */}
          {index === options.length - 1 ? (
            <>
              <DefaultButton
                onlyIcon={true}
                btnType="primaryGreen"
                size="medium"
                onClick={() => {
                  const { isValid, errorMsg } = validateField(
                    "Title",
                    option.Title,
                    option.validationRule
                  );
                  isValid
                    ? handleAddOption()
                    : handleInputChange(
                        `options[${index}].Title`,
                        option.Title,
                        isValid,
                        errorMsg
                      );
                }}
                text={
                  <Add
                    sx={{
                      width: "20px",
                      fontSize: "24px",
                      color: "#fff",
                    }}
                  />
                }
              />
              <DefaultButton
                style={{
                  display: options.length !== 1 ? "flex" : "none",
                }}
                onlyIcon={true}
                btnType="secondaryRed"
                size="medium"
                onClick={() => handleDeleteOption(index)}
                text={
                  <Delete
                    sx={{
                      width: "20px",
                      fontSize: "24px",
                    }}
                  />
                }
              />
            </>
          ) : (
            /* Show delete icon for non-last options or if last option is empty */
            index !== options.length - 1 && (
              <DefaultButton
                onlyIcon={true}
                btnType="secondaryRed"
                size="medium"
                onClick={() => handleDeleteOption(index)}
                text={
                  <Delete
                    sx={{
                      width: "20px",
                      fontSize: "24px",
                    }}
                  />
                }
              />
            )
          )}
        </div>
      ))
    : [];

  const popupInputs: any[] = [
    [
      <div key={1}>
        <CustomInput
          value={formData.Title.value}
          placeholder="Enter Question"
          isValid={formData.Title.isValid}
          errorMsg={formData.Title.errorMsg}
          onChange={(e) => {
            const value = e.trimStart();
            const { isValid, errorMsg } = validateField(
              "Title",
              value,
              formData.Title.validationRule
            );
            handleInputChange("Title", value, isValid, errorMsg);
          }}
        />
      </div>,

      <div
        key={2}
        style={{
          display: "flex",
          gap: "20px",
          alignItems: "center",
          margin: "20px 0px",
        }}
      >
        <div style={{ width: "50%" }}>
          <CustomDateInput
            value={formData.StartDate.value}
            label="Start Date"
            isDateController={true}
            minimumDate={new Date()}
            maximumDate={
              formData?.EndDate?.value
                ? new Date(formData?.EndDate?.value)
                : null
            }
            error={!formData.StartDate.isValid}
            errorMsg={formData.StartDate.errorMsg}
            onChange={(date: any) => {
              const { isValid, errorMsg } = validateField(
                "StartDate",
                date,
                formData.StartDate.validationRule
              );
              handleInputChange("StartDate", date, isValid, errorMsg);
            }}
          />
        </div>
        <div style={{ width: "50%" }}>
          <CustomDateInput
            value={formData.EndDate.value}
            label="End Date"
            isDateController={true}
            minimumDate={
              formData?.StartDate?.value
                ? new Date(formData?.StartDate?.value)
                : null
            }
            maximumDate={null}
            error={!formData.EndDate.isValid}
            errorMsg={formData.EndDate.errorMsg}
            onChange={(date: any) => {
              const { isValid, errorMsg } = validateField("EndDate", date, {
                required: true,
                type: "date",
              });
              handleInputChange("EndDate", date, isValid, errorMsg);
            }}
          />
        </div>
      </div>,
      mappedItem,
    ],
    [
      <div key={2}>
        <p>Are you sure want to Delete This poll?</p>
      </div>,
    ],
    [
      <div key={1}>
        <CustomInput
          value={formData.Title.value}
          placeholder="Enter Question"
          isValid={formData.Title.isValid}
          errorMsg={formData.Title.errorMsg}
          onChange={(e) => {
            const value = e.trimStart();
            const { isValid, errorMsg } = validateField(
              "Title",
              value,
              formData.Title.validationRule
            );
            handleInputChange("Title", value, isValid, errorMsg);
          }}
        />
      </div>,
      <div
        key={2}
        style={{
          display: "flex",
          gap: "20px",
          alignItems: "center",
          margin: "20px 0px",
        }}
      >
        <div style={{ width: "50%" }}>
          <CustomDateInput
            value={formData.StartDate.value}
            label="Start Date"
            isDateController={true}
            minimumDate={new Date()}
            maximumDate={
              formData?.EndDate?.value
                ? new Date(formData?.EndDate?.value)
                : null
            }
            error={!formData.StartDate.isValid}
            errorMsg={formData.StartDate.errorMsg}
            onChange={(date: any) => {
              const { isValid, errorMsg } = validateField(
                "StartDate",
                date,
                formData.StartDate.validationRule
              );
              handleInputChange("StartDate", date, isValid, errorMsg);
            }}
          />
        </div>
        <div style={{ width: "50%" }}>
          <CustomDateInput
            value={formData.EndDate.value}
            label="End Date"
            isDateController={true}
            minimumDate={
              formData?.StartDate?.value
                ? new Date(formData?.StartDate?.value)
                : null
            }
            maximumDate={null}
            error={!formData.EndDate.isValid}
            errorMsg={formData.EndDate.errorMsg}
            onChange={(date: any) => {
              const { isValid, errorMsg } = validateField("EndDate", date, {
                required: true,
                type: "date",
              });
              handleInputChange("EndDate", date, isValid, errorMsg);
            }}
          />
        </div>
      </div>,
      mappedItem,
    ],
  ];

  const popupActions: any[] = [
    [
      {
        text: "Cancel",
        btnType: "darkGreyVariant",
        disabled: false,
        endIcon: false,
        startIcon: false,
        size: "large",
        onClick: () => {
          togglePopupVisibility(
            setPopupController,
            initialPopupController[0],
            0,
            "close"
          );
        },
      },
      {
        text: "Submit",
        btnType: "primaryGreen",
        endIcon: false,
        startIcon: false,
        disabled: !Object.keys(formData).every((key) => formData[key].isValid),
        size: "large",
        onClick: async () => {
          await handleSubmit();
        },
      },
    ],
    [
      {
        text: "Cancel",
        btnType: "darkGreyVariant",
        disabled: false,
        endIcon: false,
        startIcon: false,
        size: "large",
        onClick: () => {
          setSelectQuestionId(null);
          togglePopupVisibility(
            setPopupController,
            initialPopupController[1],
            1,
            "close"
          );
        },
      },
      {
        text: "Delete",
        btnType: "primaryGreen",
        endIcon: false,
        startIcon: false,
        disabled: !Object.keys(formData).every((key) => formData[key].isValid),
        size: "large",
        onClick: async () => {
          togglePopupVisibility(
            setPopupController,
            initialPopupController[1],
            1,
            "close"
          );
          await deletePollData(selectQuestionId);
          await fetchPollData(dispatch, curUser);

          // await handleSubmit();
        },
      },
    ],
    [
      {
        text: "Cancel",
        btnType: "darkGreyVariant",
        disabled: false,
        endIcon: false,
        startIcon: false,
        size: "large",
        onClick: () => {
          togglePopupVisibility(
            setPopupController,
            initialPopupController[2],
            2,
            "close"
          );
        },
      },
      {
        text: "Submit",
        btnType: "primaryGreen",
        endIcon: false,
        startIcon: false,
        disabled: !Object.keys(formData).every((key) => formData[key].isValid),
        size: "large",
        onClick: async () => {
          await handleSubmit();
        },
      },
    ],
  ];

  const handleSearch = (val: any): void => {
    let filteredResults = [...val];

    // Apply common text search for title, status, and description

    if (objFilter.allSearch) {
      const searchValue = objFilter.allSearch.trimStart().toLowerCase();
      filteredResults = filteredResults.filter((item: any) =>
        item?.Question?.toLowerCase().includes(searchValue)
      );
    }
    if (objFilter.selectedDate) {
      const selectedDateFormatted = moment(
        new Date(objFilter.selectedDate)
      ).format("YYYYMMDD");

      filteredResults = filteredResults?.filter((val: any) => {
        const startDateFormatted = moment(new Date(val.StartDate)).format(
          "YYYYMMDD"
        );
        const endDateFormatted = moment(new Date(val.EndDate)).format(
          "YYYYMMDD"
        );

        return (
          startDateFormatted <= selectedDateFormatted &&
          endDateFormatted >= selectedDateFormatted
        );
      });
    }

    // Apply date filter if date is selected
    // if (objFilter.selectedDate) {
    //   filteredResults = filteredResults?.filter(
    //     (val: any) =>
    //       moment(new Date(val.StartDate)).format("YYYYMMDD") <=
    //         moment(new Date(searchField.selectedDate)).format("YYYYMMDD") &&
    //       moment(new Date(val.EndDate)).format("YYYYMMDD") >=
    //         moment(new Date(searchField.selectedDate)).format("YYYYMMDD")
    //   );

    // }

    // Update the state with filtered results
    setCurrentPoll(filteredResults || []);
  };
  const onLoadingFUN = async (curTab: any): Promise<void> => {
    let filteredData: any[] = [];

    if (curTab === CONFIG.TabsName[0] && PollIntranetData?.data?.length) {
      // Current
      filteredData = PollIntranetData?.data?.filter(
        (newsItem: any) =>
          Number(moment().format("YYYYMMDD")) >=
            Number(moment(newsItem.StartDate).format("YYYYMMDD")) &&
          Number(moment().format("YYYYMMDD")) <=
            Number(moment(newsItem.EndDate).format("YYYYMMDD"))
      );
    } else if (
      curTab === CONFIG.TabsName[1] &&
      PollIntranetData?.data?.length
    ) {
      filteredData = PollIntranetData?.data?.filter(
        (newsItem: any) =>
          Number(moment().format("YYYYMMDD")) <
          Number(moment(newsItem.StartDate).format("YYYYMMDD"))
      );
    } else if (
      curTab === CONFIG.TabsName[2] &&
      PollIntranetData?.data?.length
    ) {
      filteredData = PollIntranetData?.data?.filter(
        (newsItem: any) =>
          Number(moment().format("YYYYMMDD")) >
          Number(moment(newsItem.EndDate).format("YYYYMMDD"))
      );
    }
    const initialSelectedOptions = filteredData?.reduce(
      (acc: any, poll: any) => {
        acc[poll.Id] = poll.PreviousOption || null;
        return acc;
      },
      {}
    );

    objFilter.allSearch = "";
    objFilter.selectedDate = null;
    setSearchField({
      ...searchField,
      allSearch: "",
      selectedDate: null,
    });
    setSelectedOption(initialSelectedOptions);
    setSelectedTab(curTab);
    setCurrentPoll([...filteredData]);
    setShowCurrentPoll([...filteredData]);
    handleSearch([...filteredData]);
    setIsLoading(false);
  };

  const handleRefresh = (): void => {
    setSearchField({
      allSearch: "",
      selectedDate: null,
    });
    objFilter = {
      selectedDate: null,
      allSearch: "",
    };
    setCurrentPoll([...showcurrentPoll]);
  };

  const handleOptionClick = (
    questionId: number,
    optionId: number,
    optionTitle: string,
    resId: any
  ) => {
    setSelectedOption({
      QuestionID: questionId,
      OptionId: optionId,
      VoteId: resId,
      Title: optionTitle,
      isValid: true,
      errorMsg: "",
    });
  };

  const handleSubmitVote = async (): Promise<any> => {
    let hasErrors = false;

    // Check if selectedOption is valid
    const updatedSelectedOption = {
      ...selectedOption,
      isValid: true,
      errorMsg: "",
    };

    // Validate the fields in selectedOption
    if (!selectedOption.OptionId) {
      hasErrors = true;
      updatedSelectedOption.isValid = false;
      updatedSelectedOption.errorMsg = "Please select any one";
    }

    // Update state with validation result
    setSelectedOption(updatedSelectedOption);
    if (!hasErrors) {
      setCurPollID(0);
      setCurIDX(0);
      // Submit vote if there are no errors
      await addVote(selectedOption);
      await fetchPollData(dispatch, curUser);

      await resetSelectedItem(selectedOption, setSelectedOption);
    } else {
      console.log("Vote submission contains errors");
    }
  };

  const handleData = async (data: any): Promise<void> => {
    curMasterOptions = [];

    setFormData((prev: any) => ({
      ...prev,
      Title: {
        ...prev["Title"],
        value: data?.Question,
        Id: data?.Id,
      },
      StartDate: {
        ...prev["StartDate"],
        value: new Date(data?.StartDate),
        Id: data?.Id,
      },
      EndDate: {
        ...prev["EndDate"],
        value: new Date(data?.EndDate),
        Id: data?.Id,
      },
    }));

    curMasterOptions = await Promise.all(
      data?.options?.map((val: any, idx: number) => ({
        ...val,
        Id: idx + 1,
        Title: val?.Title,
        itemId: val?.Id,
        value: "",
        Percentage: 0,
        isValid: true,
        errorMsg: "Invalid title",
        validationRule: { required: true, type: "string" },
      })) || []
    );

    setOptions(curMasterOptions);
    togglePopupVisibility(
      setPopupController,
      initialPopupController[2],
      2,
      "open"
    );
  };

  useEffect(() => {
    RoleAuth(
      CONFIG.SPGroupName.Pernix_Admin,
      { highPriorityGroups: [CONFIG.SPGroupName.Poll_Admin] },

      dispatch
    );
    fetchPollData(dispatch, curUser);
  }, [dispatch, curUser]);

  useEffect(() => {
    onLoadingFUN(selectedTab || CONFIG.TabsName[0]);
  }, [PollIntranetData]);

  return (
    <div className={styles.masContainer}>
      {isLoading ? (
        <div className={styles.LoaderContainer}>
          <CircularSpinner />
        </div>
      ) : (
        <>
          <div className={styles.newsHeaderContainer}>
            <div className={styles.leftSection}>
              <i
                onClick={() => {
                  window.open(
                    props.context.pageContext.web.absoluteUrl +
                      CONFIG.NavigatePage.PernixIntranet,
                    "_self"
                  );
                }}
                className="pi pi-arrow-circle-left"
                style={{ fontSize: "1.5rem", color: "#E0803D" }}
              />
              <p>Poll</p>
            </div>

            <div className={styles.rightSection}>
              <CustomInput
                value={searchField.allSearch}
                noErrorMsg
                secWidth="180px"
                labelText="Search"
                placeholder="Search"
                onChange={(e) => {
                  const value = e.trimStart();
                  objFilter.allSearch = value;
                  setSearchField({ ...searchField, allSearch: value });
                  handleSearch([...showcurrentPoll]);
                }}
              />

              <CustomDateInput
                label="Select date"
                placeHolder="Date"
                minWidth="180px"
                maxWidth="180px"
                value={
                  searchField.selectedDate ? searchField.selectedDate : null
                }
                onChange={(e: any) => {
                  const value: any = e;
                  objFilter.selectedDate = value;
                  setSearchField((prev: any) => ({
                    ...prev,
                    selectedDate: value,
                  }));
                  handleSearch([...showcurrentPoll]);
                }}
              />

              <div className={styles.refreshBtn}>
                <i onClick={handleRefresh} className="pi pi-refresh" />
              </div>
              <div
                style={{
                  display:
                    currentUserDetails.role === CONFIG.RoleDetails.user
                      ? "none"
                      : "flex",
                }}
                className={styles.addNewbtn}
                onClick={() => {
                  resetFormData(formData, setFormData);
                  resetOptionsData(options, setOptions);
                  setFormData({
                    Title: {
                      value: "",
                      Id: null,
                      isValid: true,
                      errorMsg: "Invalid title",
                      validationRule: { required: true, type: "string" },
                    },
                    StartDate: {
                      value: new Date(),
                      Id: null,
                      isValid: true,
                      errorMsg: "Invalid input",
                      validationRule: { required: true, type: "date" },
                    },
                    EndDate: {
                      value: "",
                      Id: null,
                      isValid: true,
                      errorMsg: "Invalid input",
                      validationRule: { required: true, type: "date" },
                    },
                  });
                  setOptions([
                    {
                      Id: 1,
                      itemId: null,
                      Title: "",
                      value: "",
                      Percentage: 0,
                      isValid: true,
                      errorMsg: "Invalid title",
                      validationRule: { required: true, type: "string" },
                    },
                  ]);

                  togglePopupVisibility(
                    setPopupController,
                    initialPopupController[0],
                    0,
                    "open"
                  );
                }}
              >
                <i
                  className="pi pi-plus"
                  style={{ fontSize: "1rem", color: "#fff" }}
                />
                Add a Poll
              </div>
            </div>
          </div>

          <div className={styles.tabsContainer}>
            {CONFIG.TabsName.map((str: string, i: number) => {
              return currentUserDetails.role !== CONFIG.RoleDetails.user ? (
                <div
                  key={i}
                  style={{
                    borderBottom:
                      selectedTab === str ? "3px solid #e0803d" : "none",
                  }}
                  onClick={(_) => {
                    setCurPollID(0);
                    setCurIDX(0);
                    setSelectedTab(str);
                    onLoadingFUN(str);
                  }}
                >
                  {str}
                </div>
              ) : i === 0 ? (
                <div
                  key={i}
                  style={{
                    borderBottom:
                      selectedTab === str ? "3px solid #e0803d" : "none",
                  }}
                  onClick={(_) => {
                    setCurPollID(0);
                    setCurIDX(0);
                    setSelectedTab(str);
                    onLoadingFUN(str);
                  }}
                >
                  {str}
                </div>
              ) : (
                ""
              );
            })}
          </div>

          {!currentPoll.length ? (
            <div className={styles.noDataFound}>No poll found!</div>
          ) : (
            <div className={styles.bodyContainer}>
              {currentPoll?.map((val: any, index: number) => (
                <div className={styles.cardSection} key={index}>
                  <div className={styles.pollHeaderSec}>
                    <div
                      className={styles["poll-header"]}
                      title={val?.Question}
                    >
                      {val?.Question}
                    </div>

                    {currentUserDetails.role !== CONFIG.RoleDetails.user ? (
                      <div className={styles.iconsContainer}>
                        <i
                          style={{
                            display:
                              selectedTab !== CONFIG.TabsName[2]
                                ? "flex"
                                : "none",
                          }}
                          className="pi pi-pen-to-square"
                          onClick={() => {
                            resetFormData(formData, setFormData);
                            resetOptionsData(options, setOptions);
                            handleData(val);
                          }}
                        />
                        <i
                          className="pi pi-trash"
                          onClick={() => {
                            togglePopupVisibility(
                              setPopupController,
                              initialPopupController[1],
                              1,
                              "open"
                            );
                            setSelectQuestionId(val.Id);
                          }}
                        />
                      </div>
                    ) : (
                      ""
                    )}
                  </div>

                  <div className={styles.optionsContainer}>
                    {val?.options?.map((option: any, idx: number) => {
                      return (
                        <div
                          key={idx}
                          title={option?.Title}
                          style={{
                            cursor:
                              selectedTab === CONFIG.TabsName[0]
                                ? "pointer"
                                : "auto",
                          }}
                          className={styles.container}
                          onClick={() => {
                            if (selectedTab === CONFIG.TabsName[0]) {
                              setCurPollID(curIDX !== idx + 1 ? val?.Id : 0);
                              setCurIDX(curIDX !== idx + 1 ? idx + 1 : 0);
                              // setCurPollID(val?.Id);
                              handleOptionClick(
                                val?.Id,
                                option?.Id,
                                option?.Title,
                                val?.resId
                              );
                            }
                          }}
                        >
                          <div
                            style={{ width: `${option?.Percentage}%` }}
                            className={styles.backgroundfill}
                          />

                          <div className={styles.contentSection}>
                            <div className={styles.content}>
                              <p
                                style={{
                                  width: "5%",
                                }}
                              >
                                {idx + 1}.
                              </p>
                              {selectedOption?.OptionId === option?.Id &&
                              curPollID ? (
                                <i className="pi pi-check" />
                              ) : (
                                ""
                              )}
                              <p
                                style={{
                                  width: "95%",
                                }}
                              >
                                {option?.Title}
                              </p>
                            </div>

                            <div>{`${option?.Percentage}%`}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className={styles.cardFooter}>
                    <p>{`Total Responses : ${val?.TotlaVotes}`}</p>

                    <div
                      className={styles.voteButton}
                      style={{
                        display:
                          selectedTab === CONFIG.TabsName[0] ? "flex" : "none",
                      }}
                    >
                      <Button
                        label="Vote"
                        disabled={
                          selectedOption?.OptionId === val?.PreviousOption ||
                          curPollID !== val?.Id
                        }
                        onClick={handleSubmitVote}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {popupController?.map((popupData: any, index: number) => (
            <Popup
              key={index}
              isLoading={popupData?.isLoading}
              messages={popupData?.messages}
              resetPopup={() => {
                setPopupController((prev: any): any => {
                  resetPopupController(prev, index, true);
                });
              }}
              PopupType={popupData.popupType}
              onHide={() => {
                resetFormData(formData, setFormData);
                resetOptionsData(options, setOptions);
                togglePopupVisibility(
                  setPopupController,
                  initialPopupController[0],
                  index,
                  "close"
                );
                if (popupData?.isLoading?.success) {
                  setSelectQuestionId(null);
                  fetchPollData(dispatch, curUser);
                }
              }}
              popupTitle={
                popupData.popupType !== "confimation" && popupData.popupTitle
              }
              popupActions={popupActions[index]}
              visibility={popupData.open}
              content={popupInputs[index]}
              popupWidth={popupData.popupWidth}
              defaultCloseBtn={popupData.defaultCloseBtn || false}
              confirmationTitle={
                popupData.popupType !== "custom" ? popupData.popupTitle : ""
              }
              popupHeight={index === 0 ? true : false}
              noActionBtn={true}
            />
          ))}
        </>
      )}

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default PollPage;
