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
  const [formData, setFormData] = useState<any>({
    Title: {
      value: "",
      isValid: true,
      errorMsg: "Invalid title",
      validationRule: { required: true, type: "string" },
    },

    StartDate: {
      value: "",
      isValid: true,
      errorMsg: "Invalid input",
      validationRule: { required: true, type: "date" },
    },
    EndDate: {
      value: "",
      isValid: true,
      errorMsg: "Invalid input",
      validationRule: { required: true, type: "date" },
    },
  });
  const [options, setOptions] = useState<any>([
    {
      Id: 1,
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
      await addPollData(formData, setPopupController, 0, options);
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
    ? options.map((option: any, index: number) => (
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
          {index === options.length - 1 && option.Title.trim() !== "" ? (
            <DefaultButton
              onlyIcon={true}
              btnType="primaryGreen"
              size="medium"
              onClick={handleAddOption}
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
        <p>Are you sure want to Delete This poll?.</p>
      </div>,
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
          deletePollData(selectQuestionId, setPopupController, 1);
          // await handleSubmit();
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

  // const renderAvatarGroup = (members: any) => {
  //   const maxVisibleAvatars = 4;
  //   const displayedMembers = members.slice(0, maxVisibleAvatars);
  //   const additionalCount = members.length - maxVisibleAvatars;

  //   return (
  //     <AvatarGroup>
  //       {displayedMembers?.map((member: any, index: number) => (
  //         <Avatar
  //           key={index}
  //           title={member?.Author?.Title}
  //           image={
  //             member.Author
  //               ? "/_layouts/15/userphoto.aspx?size=L&username=" +
  //                 member.Author?.EMail
  //               : ""
  //           }
  //           size="normal"
  //           shape="circle"
  //           // alt={member.Author?.Title}
  //         />
  //       ))}
  //       {additionalCount > 0 && (
  //         <Avatar label={`+ ${additionalCount}`} shape="circle" size="normal" />
  //       )}
  //     </AvatarGroup>
  //   );
  // };

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
    debugger;
    if (!hasErrors) {
      // Submit vote if there are no errors
      await addVote(selectedOption, setPopupController, 0);
      await resetSelectedItem(selectedOption, setSelectedOption);
    } else {
      console.log("Vote submission contains errors");
    }
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
    onLoadingFUN(CONFIG.TabsName[0]);
  }, [PollIntranetData]);

  return isLoading ? (
    <CircularSpinner />
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
              const value = e;
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
            value={searchField.selectedDate ? searchField.selectedDate : null}
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
                  isValid: true,
                  errorMsg: "Invalid title",
                  validationRule: { required: true, type: "string" },
                },
                StartDate: {
                  value: new Date(),
                  isValid: true,
                  errorMsg: "Invalid input",
                  validationRule: { required: true, type: "date" },
                },
                EndDate: {
                  value: "",
                  isValid: true,
                  errorMsg: "Invalid input",
                  validationRule: { required: true, type: "date" },
                },
              });

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

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {currentPoll?.map((val: any, index: number) => (
          <div
            style={{
              width: "calc(33.33% - 10px)",
              boxShadow: "rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px",
              padding: "15px",
            }}
            key={index}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div className={styles["poll-header"]}>{val?.Question}</div>

              {currentUserDetails.role !== CONFIG.RoleDetails.user ? (
                <i
                  onClick={() => {
                    togglePopupVisibility(
                      setPopupController,
                      initialPopupController[1],
                      1,
                      "open"
                    );
                    setSelectQuestionId(val.Id);
                  }}
                  style={{
                    fontSize: "1.2rem",
                    color: "red",
                    cursor: "pointer",
                  }}
                  className="pi pi-trash"
                />
              ) : (
                ""
              )}
            </div>

            {val.options?.map((option: any, index: number) => (
              <div key={index}>
                <div
                  style={{
                    cursor:
                      selectedTab === CONFIG.TabsName[0] ? "pointer" : "auto",
                  }}
                  className={styles.container}
                  onClick={() => {
                    if (selectedTab === CONFIG.TabsName[0]) {
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
                      <p>{index + 1}.</p>
                      {selectedOption?.OptionId === option?.Id && (
                        <i className="pi pi-check" />
                      )}
                      <p>{option?.Title}</p>
                    </div>
                    <p>{`${option?.Percentage}%`}</p>
                  </div>
                </div>

                {/* {option.Memebers?.length > 0 &&
                  renderAvatarGroup(option.Memebers)} */}
              </div>
            ))}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <p
                style={{ fontSize: "16px", color: "#cccc", fontWeight: "500" }}
              >{`Total Responses : ${val?.TotlaVotes}`}</p>

              {selectedOption?.OptionId !== val.PreviousOption && (
                <div
                  className={styles.voteButton}
                  style={{
                    display:
                      selectedTab === CONFIG.TabsName[0] ? "flex" : "none",
                  }}
                >
                  <Button label="Vote" onClick={handleSubmitVote} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

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
            togglePopupVisibility(
              setPopupController,
              initialPopupController[0],
              index,
              "close"
            );
            resetFormData(formData, setFormData);
            resetOptionsData(options, setOptions);
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
  );
};

export default PollPage;
