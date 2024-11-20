/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
//import SectionHeaderIntranet from "../../../components/common/SectionHeaderIntranet/SectionHeaderIntranet";
import styles from "../PollIntranet/PollIntranet.module.scss";
import "../../../../assets/styles/style.css";
import { useEffect, useState } from "react";
import { Button } from "primereact/button";
// import resetPopupController, {
//   togglePopupVisibility,
// } from "../../../utils/popupUtils";
// import {
//   resetFormData,
//   resetOptionsData,
//   resetSelectedItem,
//   validateField,
// } from "../../../utils/commonUtils";
// //import Popup from "../../../components/common/Popups/Popup";
// import {
//   addPollData,
//   addVote,
//   fetchPollData,
// } from "../../../services/PollIntranet/PollIntranet";
import { useDispatch, useSelector } from "react-redux";
import { Add, Delete } from "@mui/icons-material";
//import DefaultButton from "../../../components/common/Buttons/DefaultButton";
//import CustomDateInput from "../../../components/common/CustomInputFields/CustomDateInput";
import moment from "moment";
import {
  resetFormData,
  resetOptionsData,
  resetSelectedItem,
  validateField,
} from "../../../../utils/commonUtils";
import {
  addPollData,
  addVote,
  fetchPollData,
} from "../../../../services/PollIntranet/PollIntranet";
import CustomInput from "../../../../components/common/CustomInputFields/CustomInput";
import DefaultButton from "../../../../components/common/Buttons/DefaultButton";
import CustomDateInput from "../../../../components/common/CustomInputFields/CustomDateInput";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../../utils/popupUtils";
import { RoleAuth } from "../../../../services/CommonServices";
import { CONFIG } from "../../../../config/config";
import CircularSpinner from "../../../../components/common/Loaders/CircularSpinner";
import ViewAll from "../../../../components/common/ViewAll/ViewAll";
import Popup from "../../../../components/common/Popups/Popup";
import SectionHeaderIntranet from "../../../../components/common/SectionHeaderIntranet/SectionHeaderIntranet";
//import { CONFIG } from "../../../config/config";
//import ViewAll from "../../../components/common/ViewAll/ViewAll";
//import { RoleAuth } from "../../../services/CommonServices";
//import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";

const PollIntranet = ({ props }: any): JSX.Element => {
  const dispatch = useDispatch();
  debugger;
  const curUser = props.context._pageContext._user.email;

  const currentUserDetails: any = useSelector(
    (state: any) => state?.MainSPContext?.currentUserDetails
  );

  const [currentPoll, setCurrentPoll] = useState<any>(null);
  const [isLoader, setIsLoader] = useState<boolean>(true);
  const [curPollID, setCurPollID] = useState<number>(0);

  // popup properties
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
  ];

  const [popupController, setPopupController] = useState(
    initialPopupController
  );

  const PollIntranetData: any = useSelector((state: any) => {
    return state.PollIntranetData.value;
  });

  const [formData, setFormData] = useState<any>({
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
    // setFormData(updatedFormData);
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
        className={styles.inputContainer}
        // style={{
        //   display: "flex",
        //   gap: "20px",
        //   alignItems: "center",
        //   margin: "20px 0px",
        // }}
      >
        <div
          className={styles.inputWrapper}
          // style={{ width: "50%" }}
        >
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
        <div
          className={styles.inputWrapper}

          // style={{ width: "50%" }}
        >
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
  ];

  const [selectedOption, setSelectedOption] = useState<any | null>({
    QuestionID: null,
    OptionId: null,
    VoteId: null,
    Title: "",
    isValid: true,
    errorMsg: "",
  });

  const handleOptionClick = (
    QuestionId: number,
    OptionId: number,
    Title: string,
    voteId: number
  ): void => {
    setSelectedOption({
      QuestionID: QuestionId,
      Title: Title,
      OptionId: OptionId,
      VoteId: voteId,
      isValid: true,
      errorMsg: "",
    }); // Update the selected option ID
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
      // Submit vote if there are no errors
      await addVote(selectedOption, setPopupController, 1);
      await resetSelectedItem(selectedOption, setSelectedOption);
    } else {
      console.log("Vote submission contains errors");
    }
  };

  const handlenavigate = (): void => {
    window.open(
      props.context.pageContext.web.absoluteUrl + CONFIG.NavigatePage.PollPage,
      "_self"
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
    if (PollIntranetData?.data) {
      // Filter to get the current poll based on date
      const today = moment().format("YYYYMMDD");
      const activePoll = PollIntranetData.data.filter(
        (poll: any) =>
          moment(poll?.StartDate).format("YYYYMMDD") <= today &&
          moment(poll?.EndDate).format("YYYYMMDD") >= today
      );
      setCurrentPoll(activePoll || null);

      setSelectedOption((prev: any) => ({
        ...prev,
        OptionId: activePoll[0]?.PreviousOption,
      }));
    }
    setIsLoader(false);
  }, [PollIntranetData]);

  return (
    <div className={styles.masContainer}>
      {isLoader ? (
        <div className={styles.LoaderContainer}>
          <CircularSpinner />
        </div>
      ) : (
        <div>
          <SectionHeaderIntranet
            title="Create a new poll"
            label="Poll"
            removeAdd={
              currentUserDetails.role !== CONFIG.RoleDetails.user ? false : true
            }
            headerAction={() => {
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
          />

          {currentPoll?.length ? (
            <>
              <div
                className={styles["poll-header"]}
                title={currentPoll[0]?.Question}
              >
                {currentPoll[0]?.Question}
              </div>

              <div className={styles.bodyOptions}>
                {currentPoll[0]?.options?.map((val: any, index: number) => (
                  <div key={index} title={val?.Title}>
                    <div
                      className={styles.container}
                      onClick={() => {
                        setCurPollID(curPollID !== index + 1 ? index + 1 : 0);
                        handleOptionClick(
                          currentPoll[0]?.Id,
                          val.Id,
                          val.Title,
                          currentPoll[0]?.resId
                        );
                      }}
                    >
                      <div
                        style={{ width: `${val?.Percentage}%` }}
                        className={styles.backgroundfill}
                      />

                      <div className={styles.contentSection}>
                        <div className={styles.content}>
                          <p
                            style={{
                              width: "5%",
                            }}
                          >
                            {index + 1}.
                          </p>
                          {selectedOption?.OptionId === val?.Id && curPollID ? (
                            <i className="pi pi-check" />
                          ) : (
                            ""
                          )}
                          <p
                            style={{
                              width: "95%",
                            }}
                          >
                            {val?.Title}
                          </p>
                        </div>

                        <div>{`${val?.Percentage}%`}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className={styles.noDataFound}>No poll found!</div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
            }}
          >
            <div className={styles.voteButton}>
              <Button
                style={{
                  display: currentPoll?.length !== 0 ? "flex" : "none",
                }}
                label="Vote"
                disabled={
                  selectedOption?.OptionId === currentPoll[0]?.PreviousOption ||
                  !curPollID
                }
                onClick={handleSubmitVote}
              />
            </div>
            <ViewAll onClick={handlenavigate} />
          </div>
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
            togglePopupVisibility(
              setPopupController,
              initialPopupController[0],
              index,
              "close"
            );
            resetFormData(formData, setFormData);
            resetOptionsData(options, setOptions);
            if (popupData?.isLoading?.success) {
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
    </div>
  );
};

export default PollIntranet;
