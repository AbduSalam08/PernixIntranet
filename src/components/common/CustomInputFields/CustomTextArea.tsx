/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { TextareaAutosize } from "@mui/base/TextareaAutosize";
import { styled } from "@mui/joy/styles";
import Textarea from "@mui/joy/Textarea";
import styles from "./Inputs.module.scss";

const StyledTextarea = styled(TextareaAutosize)({
  resize: "none",
  border: "none", // remove the native textarea border
  minWidth: 0, // remove the native textarea width
  outline: 0, // remove the native textarea outline
  padding: 0, // remove the native textarea padding
  // paddingBlockStart: "1em",
  // paddingInlineEnd: `var(--Textarea-paddingInline)`,
  flex: "auto",
  alignSelf: "stretch",
  color: "inherit",
  backgroundColor: "transparent",
  fontStyle: "inherit",
  fontWeight: "inherit",
  lineHeight: "inherit",
  fontFamily: "osMedium, sans-serif",
  fontSize: "15px",
  "&::placeholder": {
    opacity: 0,
    display: "none",
    transition: "0.1s ease-out",
  },
  "&:focus::placeholder": {
    display: "none",
    // opacity: 1,
  },
  // specific to TextareaAutosize, cannot use '&:focus ~ label'
  "&:focus + textarea + label, &:not(:placeholder-shown) + textarea + label": {
    top: "0.5rem",
    color: "#a4a4a4",
    fontSize: "0.75rem",
  },
  "&:focus + textarea + label": {
    color: "#a4a4a4",
  },
});

const StyledLabel = styled("label")(({ theme }) => ({
  position: "absolute",
  lineHeight: 1,
  top: "calc((var(--Textarea-minHeight) - 1em) / 1.3)",
  fontWeight: theme.vars.fontWeight.md,
  color: "#a4a4a4",
  fontSize: "16px",
  fontFamily: "osRegular, sans-serif",
  transition: "all 150ms cubic-bezier(0.4, 0, 0.2, 1)",
}));

// Inner textarea component to handle floating label behavior
const InnerTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
  // React.JSX.IntrinsicElements["textarea"]
>(function InnerTextarea(props, ref) {
  return (
    <React.Fragment>
      <StyledTextarea
        placeholder=""
        minRows={2}
        {...props}
        ref={ref}
        id="textarea"
      />
      <StyledLabel htmlFor={"textarea"}>{props.placeholder}</StyledLabel>
    </React.Fragment>
  );
});

// Main component with error handling and floating label
interface Props {
  value: string | number;
  onChange?: (value: string) => void;
  placeholder?: string;
  errorMsg?: string;
  isValid?: boolean;
  rows?: number;
  type?: "text" | "number";
  icon?: unknown;
  size?: "SM" | "MD" | "XL";
  withLabel?: boolean;
  labelText?: string;
  disabled?: boolean;
  onKeyDown?: any;
  inputClassName?: any;
  inputWrapperClassName?: any;
  readOnly?: boolean;
  mandatory?: boolean;
  textAreaWidth?: string | number;
  customBorderColor?: string;
  noBorderInput?: boolean;
  topLabel?: boolean;
}

export default function FloatingLabelTextarea({
  value,
  onChange,
  type = "text",
  placeholder = "Enter text",
  size = "MD",
  icon,
  isValid = false,
  errorMsg,
  labelText,
  withLabel,
  disabled,
  onKeyDown,
  inputClassName,
  inputWrapperClassName,
  readOnly,
  mandatory,
  noBorderInput,
  textAreaWidth,
  rows = 5,
  topLabel,
  customBorderColor,
}: Props): JSX.Element {
  return (
    <div
      className={inputWrapperClassName}
      style={{
        position: "relative",
        width: textAreaWidth ? textAreaWidth : "100%",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        gap: "2px",
        flexDirection: "column",
      }}
    >
      <Textarea
        value={value}
        onChange={(e) => {
          onChange && onChange(e.target.value);
        }}
        disabled={disabled}
        readOnly={readOnly}
        onKeyDown={onKeyDown}
        slots={{ textarea: InnerTextarea }}
        slotProps={{ textarea: { placeholder } }}
        sx={{
          borderRadius: "6px",
          border: `none`,
          // border: !isValid
          //   ? "1.5px solid #ff8585 !important"
          //   : `1.5px solid ${customBorderColor || "#e5e5e5"} !important`,
          paddingTop: "20px", // for the floating label
          width: textAreaWidth ? textAreaWidth : "100%",
          height: rows ? `${rows * 20}px` : "auto",
          fontSize: "15px",
          fontFamily: "osMedium, sans-serif",
          // border: noBorderInput ? "none" : "1px solid #e5e5e5",
        }}
        className={inputClassName}
      />
      {!isValid && <span className={styles.errorMsg}>{errorMsg}</span>}
    </div>
  );
}
