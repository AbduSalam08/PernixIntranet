import { emptyCheck } from "./validations";

/* eslint-disable @typescript-eslint/no-explicit-any */

export const resetFormData = (
  initialData: { [key: string]: any },
  setData: (data: { [key: string]: any }) => void
): void => {
  const resetData = Object.keys(initialData).reduce(
    (acc: { [key: string]: any }, key: string) => {
      const field = initialData[key];
      acc[key] = {
        ...field,
        value: typeof field.value === "string" ? "" : null, // Reset string fields to "" and others to null
        isValid: true, // Reset validation status
        errorMsg: field.errorMsg || "", // Keep the original error messages if needed
      };
      return acc;
    },
    {}
  );

  // Update state with the reset data
  setData(resetData);
};

export const resetOptionsData = (
  initialOptions: any[],
  setOptions: (options: any[]) => void
): void => {
  const resetOptions = initialOptions.map((option: any) => ({
    ...option,
    Title: "", // Reset the Title field to an empty string
    value: "", // Reset the value field to an empty string
    Percentage: 0, // Reset the Percentage to its initial state
    isValid: true, // Reset validation status
    errorMsg: option.errorMsg || "", // Keep the original error messages if needed
  }));

  // Update the state with the reset options
  setOptions(resetOptions);
};

export const resetSelectedItem = (
  initialData: { [key: string]: any },
  setSelectedOption: (data: { [key: string]: any }) => void
): void => {
  const resetData = Object.keys(initialData).reduce(
    (acc: { [key: string]: any }, key: string) => {
      const field = initialData[key];
      acc[key] = field !== null && typeof field === "string" ? "" : null;
      return acc;
    },
    {}
  );

  // Update state with the reset data
  setSelectedOption(resetData);
};

type ValidationRule = {
  required?: boolean;
  type?: "string" | "date" | "file" | "array";
  customErrorMessage?: string;
};

export const validateField = (
  field: string,
  value: any,
  rules: ValidationRule
): { isValid: boolean; errorMsg: string } => {
  const { required = false, type, customErrorMessage } = rules;

  // Check for required fields
  if (
    required &&
    (type === "date" || type === "array" ? !value : !emptyCheck(value))
  ) {
    return {
      isValid: false,
      errorMsg: customErrorMessage || `${field} is required`,
    };
  }

  // Additional validations based on type
  if (type === "string" && typeof value !== "string") {
    return { isValid: false, errorMsg: "Invalid string format" };
  }

  if (type === "date" && !value) {
    return { isValid: false, errorMsg: "Invalid date format" };
  }

  if (type === "file" && !value) {
    return { isValid: false, errorMsg: "Invalid file" };
  }
  if (type === "array" && !value) {
    return { isValid: false, errorMsg: "Invalid data" };
  }

  return { isValid: true, errorMsg: "" };
};
