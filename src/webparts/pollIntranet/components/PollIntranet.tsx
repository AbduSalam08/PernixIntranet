/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */

import SectionHeaderIntranet from "../../../components/common/SectionHeaderIntranet/SectionHeaderIntranet";
import styles from "./PollIntranet.module.scss";
import "../../../assets/styles/style.css";
import { useEffect, useState } from "react";
import { Button } from "primereact/button";
// import { sp } from "@pnp/sp/presets/all";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../utils/popupUtils";
import {
  resetFormData,
  resetOptionsData,
  resetSelectedItem,
  validateField,
} from "../../../utils/commonUtils";
import CustomInput from "../../../components/common/CustomInputFields/CustomInput";
// import { useDispatch } from "react-redux";
import Popup from "../../../components/common/Popups/Popup";
import {
  addPollData,
  addVote,
  fetchPollData,
} from "../../../services/PollIntranet/PollIntranet";
import { useDispatch, useSelector } from "react-redux";
import { Add, Delete } from "@mui/icons-material";
import DefaultButton from "../../../components/common/Buttons/DefaultButton";
const PollIntranet = (props: any): JSX.Element => {
  const curUser = props.context._pageContext._user.email;

  const dispatch = useDispatch();
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
  // console.log(PollIntranetData, "PollIntranetData");

  const [formData, setFormData] = useState<any>({
    Title: {
      value: "",
      isValid: true,
      errorMsg: "Invalid title",
      validationRule: { required: true, type: "string" },
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

  // console.log("formData", setOptions);

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
              const value = e;
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
            // <i
            //   className="pi pi-plus"
            //   onClick={handleAddOption}
            //   style={{ cursor: "pointer" }}
            // />
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
                      // color: "#FD3737",
                    }}
                  />
                }
              />
              // <i
              //   className="pi pi-trash"
              //   onClick={() => handleDeleteOption(index)}
              //   style={{
              //     cursor: "pointer",
              //     color: "#FD3737",
              //     fontSize: "24px",
              //   }}
              // />
            )
          )}
        </div>
      ))
    : [];

  // console.log("mappedItem", mappedItem);
  const popupInputs: any[] = [
    [
      <div
        // className={styles.addNewsGrid}
        key={1}
      >
        <CustomInput
          value={formData.Title.value}
          placeholder="Enter Question"
          isValid={formData.Title.isValid}
          errorMsg={formData.Title.errorMsg}
          onChange={(e) => {
            const value = e;
            const { isValid, errorMsg } = validateField(
              "Title",
              value,
              formData.Title.validationRule
            );
            handleInputChange("Title", value, isValid, errorMsg);
          }}
        />
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

  // const [POll, setPoll] = useState<any[]>([]);

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

  useEffect(() => {
    fetchPollData(dispatch, curUser);

    // setSelectedOption((prev: any) => ({
    //   ...prev,
    //   OptionId: PollIntranetData?.data?.[0]?.PreviousOption,
    // }));
  }, [dispatch]);

  useEffect(() => {
    if (PollIntranetData?.data?.[0]?.PreviousOption) {
      setSelectedOption((prev: any) => ({
        ...prev,
        OptionId: PollIntranetData.data?.[0]?.PreviousOption,
      }));
    }
  }, [PollIntranetData]);

  return (
    <>
      <div className={styles.PollContainer}>
        <SectionHeaderIntranet
          label={"Poll"}
          headerAction={() => {
            togglePopupVisibility(
              setPopupController,
              initialPopupController[0],
              0,
              "open"
            );
            resetFormData(formData, setFormData);
            resetOptionsData(options, setOptions);
          }}
        />

        <div className={styles["poll-header"]}>
          {PollIntranetData?.data?.[0]?.Question}
        </div>

        {PollIntranetData?.data?.[0]?.options?.map(
          (val: any, index: number) => (
            <div key={index}>
              <div
                className={styles.container}
                onClick={() => {
                  handleOptionClick(
                    PollIntranetData?.data?.[0]?.Id,
                    val.Id,
                    val.Title,
                    PollIntranetData?.data?.[0]?.resId
                  );
                }}
              >
                {/* Background fill that respects padding */}
                <div
                  style={{ width: `${val?.Percentage}%` }}
                  className={styles.backgroundfill}
                />

                {/* Content displayed on top of the background */}
                <div className={styles.contentSection}>
                  <div
                    className={styles.content}
                    // style={{ display: "flex", alignItems: "center", gap: "10px" }}
                  >
                    <p>{index + 1}.</p>
                    {selectedOption.OptionId === val?.Id && (
                      <i className="pi pi-check" />
                    )}
                    <p>{val?.Title}</p>
                  </div>
                  <p>{`${val?.Percentage}%`}</p>
                </div>
              </div>
            </div>
          )
        )}
        {!(
          selectedOption.OptionId === PollIntranetData.data?.[0]?.PreviousOption
        ) && (
          <div className={styles.voteButton}>
            <Button label="vote" onClick={handleSubmitVote} />
          </div>
        )}
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
              fetchPollData(dispatch, curUser);
            }
            // resetFormData(formData, setFormData);
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
export default PollIntranet;
