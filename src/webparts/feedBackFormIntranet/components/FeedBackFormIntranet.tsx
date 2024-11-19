/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable  @typescript-eslint/no-use-before-define */
import SectionHeaderIntranet from "../../../components/common/SectionHeaderIntranet/SectionHeaderIntranet";
import "../../../assets/styles/style.css";
import { RadioButton } from "primereact/radiobutton";
import { InputTextarea } from "primereact/inputtextarea";
// import { Button } from "primereact/button";
import { useEffect, useState } from "react";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import styles from "./FeedBackFormIntranet.module.scss";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../utils/popupUtils";
import CustomInput from "../../../components/common/CustomInputFields/CustomInput";
import { resetFormData, validateField } from "../../../utils/commonUtils";
import CustomDropDown from "../../../components/common/CustomInputFields/CustomDropDown";
import Popup from "../../../components/common/Popups/Popup";
import { Add, Delete } from "@mui/icons-material";
import DefaultButton from "../../../components/common/Buttons/DefaultButton";
import {
  addFeedback,
  fetchPollData,
  sendFeedback,
} from "../../../services/FeedbackIntranet/FeedbackIntranet";
import { useDispatch, useSelector } from "react-redux";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

const FeedBackFormIntranet = (props: any) => {
  const curUser = props.context._pageContext._user.email;

  const dispatch = useDispatch();
  // popup properties
  const initialPopupController = [
    {
      open: false,
      popupTitle: "New Feedback form",
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
        success: "News added successfully!",
        error: "Something went wrong!",
        successDescription: "The new news 'ABC' has been added successfully.",
        errorDescription:
          "An error occured while adding news, please try again later.",
        inprogress: "Adding new news, please wait...",
      },
    },
  ];

  const [popupController, setPopupController] = useState(
    initialPopupController
  );
  const [selectedVal, setSelectedVal] = useState({
    Question: "",
    option: "",
    singleText: "",
    multiText: "",
    Id: null,
    resId: null,
    FieldType: "",
    PreviousOption: "",
    ReaontoVisit: "",
  });
  console.log("selectedVal: ", selectedVal);
  const [options, setOptions] = useState<any>([
    {
      Id: 1,
      Title: "",
      value: "",

      isValid: true,
      errorMsg: "Invalid title",
      validationRule: { required: true, type: "string" },
    },
  ]);
  const handleAddOption = () => {
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

  const handleDeleteOption = (index: number) => {
    setOptions((prevOptions: any[]) =>
      prevOptions.filter((_, i) => i !== index)
    );
  };

  const newsIntranetData: any = useSelector((state: any) => {
    return state.FeedbackIntranetData.value;
  });
  const [state, setState] = useState(newsIntranetData.data);
  console.log(state, "state");
  console.log(newsIntranetData, "newsIntranetData");
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
  const [formData, setFormData] = useState<any>({
    Title: {
      value: "",
      isValid: true,
      errorMsg: "Invalid title",
      validationRule: { required: true, type: "string" },
    },

    Status: {
      value: "",
      isValid: true,
      errorMsg: "Status is required",
      validationRule: { required: true, type: "string" },
    },
  });
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
  // const handleInputChange = (
  //   field: string,
  //   value: any,
  //   isValid: boolean,
  //   errorMsg: string = ""
  // ): void => {
  //   setFormData((prevData: any) => ({
  //     ...prevData,
  //     [field]: {
  //       ...prevData[field],
  //       value: value,
  //       isValid,
  //       errorMsg: isValid ? "" : errorMsg,
  //     },
  //   }));
  // };
  // const isFormValid = (): boolean => {
  //   const status = formData.Status.value;

  //   // Always check if the title is valid
  //   if (!formData.Title.isValid) {
  //     return false;
  //   }

  //   // If Status is "Single line", check if SingleLineAnswer is valid
  //   // if (status === "Single line") {
  //   //   return formData.SingleLineAnswer.isValid;
  //   // }

  //   // // If Status is "Multi line", check if MultilineAnswer is valid
  //   // if (status === "Multi line") {
  //   //   return formData.MultilineAnswer.isValid;
  //   // }

  //   // If Status is "Choice", check for the validity of choice options (e.g., mappedItem)
  //   if (status === "Choice") {
  //     // Assuming mappedItem or choices are stored in some other part of the state
  //     // Perform validation for each choice and ensure they are valid
  //     return options.every((option: any) => option.isValid);
  //   }

  //   // If Status is not set (empty), the form is invalid
  //   return false;
  // };

  // const handleSubmit = async (): Promise<any> => {
  //   let hasErrors = false;

  //   // Validate each field in formData
  //   const updatedFormData = Object.keys(formData).reduce((acc, key) => {
  //     const fieldData = formData[key];

  //     // Skip validation for irrelevant fields based on Status
  //     if (
  //       (formData.Status.value === "Single line" &&
  //         key === "MultilineAnswer") ||
  //       (formData.Status.value === "Multi line" &&
  //         key === "SingleLineAnswer") ||
  //       (formData.Status.value === "Choice" &&
  //         (key === "SingleLineAnswer" || key === "MultilineAnswer"))
  //     ) {
  //       // If Status is "Choice", skip both answers
  //       return {
  //         ...acc,
  //         [key]: {
  //           ...fieldData,
  //           isValid: true,
  //           errorMsg: "", // Skipped validation, hence no error
  //         },
  //       };
  //     }

  //     // Perform validation
  //     const { isValid, errorMsg } = validateField(
  //       key,
  //       fieldData.value,
  //       fieldData?.validationRule
  //     );

  //     console.log(
  //       `Validating field: ${key}, value: ${fieldData.value}, isValid: ${isValid}`
  //     );

  //     if (!isValid) {
  //       hasErrors = true;
  //     }

  //     return {
  //       ...acc,
  //       [key]: {
  //         ...fieldData,
  //         isValid,
  //         errorMsg,
  //       },
  //     };
  //   }, {} as typeof formData);

  //   // Validate options (if applicable)
  //   let updatedOptions = [...options];
  //   if (
  //     formData.Status.value !== "Single line" &&
  //     formData.Status.value !== "Multi line"
  //   ) {
  //     updatedOptions = options.map((option: any) => {
  //       const { isValid, errorMsg } = validateField(
  //         "Title", // Assuming 'Title' is the field being validated for options
  //         option.Title,
  //         option.validationRule
  //       );

  //       console.log(
  //         `Validating option: Title, value: ${option.Title}, isValid: ${isValid}`
  //       );

  //       if (!isValid) {
  //         hasErrors = true;
  //       }

  //       return {
  //         ...option,
  //         isValid,
  //         errorMsg,
  //       };
  //     });
  //   }

  //   // Update state
  //   setOptions(updatedOptions);
  //   setFormData(updatedFormData);

  //   if (!hasErrors) {
  //     await addFeedback(formData, setPopupController, 0, options);
  //   } else {
  //     console.log("Form contains errors", updatedFormData, updatedOptions);
  //   }
  // };

  const handleSendFeedback = () => {
    sendFeedback(selectedVal, setPopupController, 1);
  };

  // const handleSubmit = async (): Promise<any> => {
  //   let hasErrors = false;

  //   // Validate each field and update the state with error messages
  //   const updatedFormData = Object.keys(formData).reduce((acc, key) => {
  //     const fieldData = formData[key];

  //     // Conditionally skip validation based on Status value
  //     if (
  //       (formData.Status.value === "Single line" &&
  //         key === "MultilineAnswer") ||
  //       (formData.Status.value === "Multi line" && key === "SingleLineAnswer")
  //     ) {
  //       // Skip validation for the respective field
  //       return {
  //         ...acc,
  //         [key]: {
  //           ...fieldData,
  //           isValid: true,
  //           errorMsg: "", // No error message as it is skipped
  //         },
  //       };
  //     }

  //     // Proceed with validation for other fields
  //     const { isValid, errorMsg } = validateField(
  //       key,
  //       fieldData.value,
  //       fieldData?.validationRule
  //     );

  //     if (!isValid) {
  //       hasErrors = true;
  //     }

  //     return {
  //       ...acc,
  //       [key]: {
  //         ...fieldData,
  //         isValid,
  //         errorMsg,
  //       },
  //     };
  //   }, {} as typeof formData);

  //   // Skip options validation if Status is "singleline" or "multiline"
  //   let updatedOptions = [...options];
  //   if (
  //     formData.Status.value !== "Single line" &&
  //     formData.Status.value !== "Multi line"
  //   ) {
  //     updatedOptions = options.map((option: any) => {
  //       const { isValid, errorMsg } = validateField(
  //         "Title", // Assuming 'Title' is the field being validated for options
  //         option.Title,
  //         option.validationRule
  //       );

  //       if (!isValid) {
  //         hasErrors = true;
  //       }

  //       return {
  //         ...option,
  //         isValid,
  //         errorMsg,
  //       };
  //     });
  //   }

  //   // Update both formData and options state
  //   setOptions(updatedOptions);
  //   setFormData(updatedFormData);

  //   // If no errors, submit the form
  //   if (!hasErrors) {
  //     await addFeedback(formData, setPopupController, 0, options);
  //   } else {
  //     console.log("Form contains errors");
  //   }
  // };

  // const handleSubmit = async (): Promise<any> => {
  //   let hasErrors = false;

  //   // Validate each field and update the state with error messages
  //   const updatedFormData = Object.keys(formData).reduce((acc, key) => {
  //     const fieldData = formData[key];
  //     const { isValid, errorMsg } = validateField(
  //       key,
  //       fieldData.value,
  //       fieldData?.validationRule
  //     );

  //     if (!isValid) {
  //       hasErrors = true;
  //     }

  //     return {
  //       ...acc,
  //       [key]: {
  //         ...fieldData,
  //         isValid,
  //         errorMsg,
  //       },
  //     };
  //   }, {} as typeof formData);

  //   const updatedOptions = options.map((option: any) => {
  //     const { isValid, errorMsg } = validateField(
  //       "Title", // Assuming 'Title' is the field being validated for options
  //       option.Title,
  //       option.validationRule
  //     );

  //     if (!isValid) {
  //       hasErrors = true;
  //     }

  //     return {
  //       ...option,
  //       isValid,
  //       errorMsg,
  //     };
  //   });

  //   // Update both formData and options state
  //   // setFormData(updatedFormData);
  //   setOptions(updatedOptions);

  //   setFormData(updatedFormData);
  //   if (!hasErrors) {
  //     await addFeedback(formData, setPopupController, 0, options);
  //   } else {
  //     console.log("Form contains errors");
  //   }
  // };
  const handleSubmit = async (): Promise<any> => {
    let hasErrors = false;

    // Validate form data for each field
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

    // Check if the field type is "Choice" before validating the options
    if (formData.status === "Choice") {
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

      // Only update options if status is "Choice"
      setOptions(updatedOptions);
    }

    // Update form data state
    setFormData(updatedFormData);

    // If there are no errors, submit the form
    if (!hasErrors) {
      await addFeedback(formData, setPopupController, 0, options);
    } else {
      console.log("Form contains errors");
    }
  };

  const popupInputs: any[] = [
    [
      <div
        // className={styles.addNewsGrid}

        key={1}
      >
        <CustomDropDown
          value={formData.Status.value}
          options={["Single line", "Multi line", "Choice"]}
          placeholder="Status"
          isValid={formData.Status.isValid}
          errorMsg={formData.Status.errorMsg}
          onChange={(value) => {
            const { isValid, errorMsg } = validateField(
              "Status",
              value,
              formData.Status.validationRule
            );
            handleInputChange("Status", value, isValid, errorMsg);
          }}
        />
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

        {formData.Status.value === "Choice"
          ? mappedItem
          : // ) : formData.Status.value === "Single line" ? (
            //   <CustomInput
            //     value={formData.SingleLineAnswer.value}
            //     placeholder="Enter option"
            //     isValid={formData.SingleLineAnswer.isValid}
            //     errorMsg={formData.SingleLineAnswer.errorMsg}
            //     onChange={(e) => {
            //       const value = e;
            //       const { isValid, errorMsg } = validateField(
            //         "SingleLineAnswer",
            //         value,
            //         formData.SingleLineAnswer.validationRule
            //       );
            //       handleInputChange("SingleLineAnswer", value, isValid, errorMsg);
            //     }}
            //   />
            // ) : formData.Status.value === "Multi line" ? (
            //   <FloatingLabelTextarea
            //     value={formData.MultilineAnswer.value}
            //     placeholder="Description"
            //     rows={5}
            //     isValid={formData.MultilineAnswer.isValid}
            //     errorMsg={formData.MultilineAnswer.errorMsg}
            //     onChange={(e: any) => {
            //       const value = e;
            //       const { isValid, errorMsg } = validateField(
            //         "MultilineAnswer",
            //         value,
            //         formData.MultilineAnswer.validationRule
            //       );
            //       handleInputChange("MultilineAnswer", value, isValid, errorMsg);
            //     }}
            //   />
            null}
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
        // disabled: !isFormValid(),
        disabled: !Object.keys(formData).every((key) => formData[key].isValid),
        size: "large",
        onClick: async () => {
          await handleSubmit();
        },
      },
    ],
  ];

  // Function to check if the form is valid based on the current Status

  // const handleGoalChange = (value: string) => {
  //   setSurvey((prev) => ({
  //     ...prev,
  //     goalAchieved: value,
  //   }));
  // };

  const handleFieldChange = (
    fieldType: string,
    value: any,
    Id: number,
    resId: number
  ) => {
    if (fieldType === "Choice") {
      setSelectedVal((prevState: any) => ({
        ...prevState,
        option: value,
        Id: Id,
        resId: resId,
        FieldType: fieldType,
      }));
    } else if (fieldType === "Single line") {
      setSelectedVal((prevState: any) => ({
        ...prevState,
        singleText: value,
        Id: Id,
        resId: resId,
        FieldType: fieldType,
      }));
    } else if (fieldType === "Multi line") {
      setSelectedVal((prevState: any) => ({
        ...prevState,
        multiText: value,
        Id: Id,
        resId: resId,
        FieldType: fieldType,
      }));
    }
  };
  const renderFormField = (question: any) => {
    console.log("question: ", question);
    const { FieldType, options, Id, resId } = question;
    console.log("options: ", options);

    if (FieldType === "Choice") {
      return (
        <div className={styles.radioContainer} key={Id}>
          {options.map((option: string, index: number) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <RadioButton
                inputId={`option-${index}`}
                name={`question-${Id}`} // Group by question ID
                value={option}
                onChange={(e) =>
                  handleFieldChange(FieldType, e.value, Id, resId)
                } // Update selected option
                checked={selectedVal.option === option} // Check if the option is selected
              />
              <label htmlFor={`option-${index}`}>{option}</label>
            </div>
          ))}
        </div>
      );
    }

    if (FieldType === "Single line") {
      return (
        <div key={Id}>
          <InputText
            style={{ width: "100%" }}
            value={selectedVal.singleText} // Show the stored value
            onChange={(e) =>
              handleFieldChange(FieldType, e.target.value, Id, resId)
            } // Capture text input value
            placeholder="Type your answer"
          />
        </div>
      );
    }

    if (FieldType === "Multi line") {
      return (
        <div key={Id}>
          <InputTextarea
            autoResize
            value={selectedVal.multiText} // Show the stored value
            onChange={(e) =>
              handleFieldChange(FieldType, e.target.value, Id, resId)
            } // Capture textarea input value
            placeholder="Type your answer"
            rows={3}
            style={{ width: "100%" }}
          />
        </div>
      );
    }

    return null;
  };
  // const renderFormField = (question: any) => {
  //   const { FieldType, options, Id } = question;

  //   if (FieldType === "Choice") {
  //     return (
  //       <div className="radioContainer" key={Id}>
  //         {options.map((option: string, index: number) => (
  //           <div
  //             key={index}
  //             style={{
  //               display: "flex",
  //               alignItems: "center",
  //               gap: "10px",
  //             }}
  //           >
  //             <RadioButton
  //               inputId={`option-${index}`}
  //               name={`question-${Id}`} // Group by question ID
  //               value={option}
  //               // onChange={(e) => handleFieldChange(Id, e.value)} // Update state based on option selected
  //               checked={formData[Id] === option}
  //             />
  //             <label htmlFor={`option-${index}`}>{option}</label>
  //           </div>
  //         ))}
  //       </div>
  //     );
  //   }

  //   if (FieldType === "Single line") {
  //     return (
  //       <div key={Id}>
  //         <InputText
  //           value={formData[Id] || ""}
  //           // onChange={(e) => handleFieldChange(Id, e.target.value)}
  //           placeholder="Type your answer"
  //         />
  //       </div>
  //     );
  //   }

  //   if (FieldType === "Multi line") {
  //     return (
  //       <div key={Id}>
  //         <InputTextarea
  //           value={formData[Id] || ""}
  //           // onChange={(e) => handleFieldChange(Id, e.target.value)}
  //           placeholder="Type your answer"
  //         />
  //       </div>
  //     );
  //   }

  //   return null;
  // };
  console.log(state, "state");
  useEffect(() => {
    fetchPollData(dispatch, curUser, setSelectedVal);

    setState(newsIntranetData.data);
  }, []);
  return (
    <div className={styles.feedbackContainer}>
      <SectionHeaderIntranet
        label="Feed Back"
        headerAction={() => {
          togglePopupVisibility(
            setPopupController,
            initialPopupController[0],
            0,
            "open"
          );
          resetFormData(formData, setFormData);
        }}
      />

      <div>
        {newsIntranetData?.data?.map((val: any, index: number) => (
          <div key={index}>
            <p className={styles.feedbackQues}>{val?.Question}</p>

            {/* <div
              className={styles.radioContainer}
              // style={{
              //   display: "flex",
              //   alignItems: "center",
              //   gap: "10px",
              // }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <RadioButton
                  inputId="goalYes"
                  name="goalAchieved"
                  value="Yes"
                  onChange={(e) => handleGoalChange(e.value)}
                  checked={survey.goalAchieved === "Yes"}
                />
                <label htmlFor="goalYes">Yes</label>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <RadioButton
                  inputId="goalPartially"
                  name="goalAchieved"
                  value="Partially"
                  onChange={(e) => handleGoalChange(e.value)}
                  checked={survey.goalAchieved === "Partially"}
                />
                <label htmlFor="goalPartially">Partially</label>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <RadioButton
                  inputId="goalNo"
                  name="goalAchieved"
                  value="No"
                  onChange={(e) => handleGoalChange(e.value)}
                  checked={survey.goalAchieved === "No"}
                />
                <label htmlFor="goalNo">No</label>
              </div>
            </div> */}
            {renderFormField(val)}

            <div>
              <p className={styles.reasonText}>
                What is the reason for your visit?
              </p>
              <InputTextarea
                className="suggestion"
                value={selectedVal.ReaontoVisit}
                onChange={(e) => {
                  selectedVal.ReaontoVisit = e.target.value;
                  setSelectedVal({ ...selectedVal });
                }}
                // onChange={handleSuggestionChange}
                rows={8}
                autoResize
                placeholder="Do you have any suggestion"
                style={{ width: "100%" }}
              />
            </div>
          </div>
        ))}

        <div
          style={{ display: "flex", justifyContent: "end", margin: "20px 0px" }}
        >
          <Button
            label="Send"
            onClick={handleSendFeedback}
            style={{
              background: "#0b4d53",
              color: "#fff",
              width: "80px",
              padding: "6px 8px",
              borderRadius: "5px",
              border: "1px solid #0b4d53",
            }}
          />
        </div>
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
            if (popupData?.isLoading?.success) {
              fetchPollData(dispatch, curUser, setSelectedVal);
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
export default FeedBackFormIntranet;
