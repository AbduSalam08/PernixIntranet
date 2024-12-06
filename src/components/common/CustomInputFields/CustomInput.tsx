/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from "react";
import styles from "./Inputs.module.scss";
import "./customStyle.css";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import {
  createTheme,
  ThemeProvider,
  Theme,
  useTheme,
} from "@mui/material/styles";

interface Props {
  value: string | number | any;
  onChange?: (value: string | any) => void;
  onClickFunction?: (value: boolean) => void;
  type?: "text" | "number";
  placeholder?: string;
  icon?: React.ReactNode;
  size?: "SM" | "MD" | "XL";
  isValid?: boolean;
  errorMsg?: string;
  secWidth?: string;
  withLabel?: boolean;
  labelText?: string;
  disabled?: boolean;
  inputClassName?: string;
  inputWrapperClassName?: string;
  readOnly?: boolean;
  mandatory?: boolean;
  hideErrMsg?: boolean;
  submitBtn?: boolean;
  clearBtn?: boolean;
  autoFocus?: boolean;
  noErrorMsg?: boolean;
  onKeyDown?: any;
  noBorderInput?: boolean;
  topLabel?: boolean;
}

const CustomInput: React.FC<Props> = ({
  value,
  onChange,
  onClickFunction,
  type = "text",
  placeholder = "",
  size = "MD",
  icon,
  isValid,
  errorMsg,
  labelText,
  withLabel,
  disabled,
  inputClassName,
  inputWrapperClassName,
  readOnly,
  mandatory,
  hideErrMsg,
  submitBtn,
  clearBtn,
  autoFocus,
  noErrorMsg,
  onKeyDown,
  noBorderInput,
  topLabel,
  secWidth = "100%",
}) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue =
        type === "number" ? parseFloat(e.target.value) : e.target.value;
      onChange && onChange(newValue);
    },
    [onChange, type]
  );

  const customTheme = (outerTheme: Theme): any =>
    createTheme({
      palette: {
        mode: outerTheme.palette.mode,
      },
      components: {
        MuiFilledInput: {
          styleOverrides: {
            root: {
              "&::before, &::after": {
                // borderBottom: "2px solid #adadad",
                display: "none",
              },
              "&:hover:not(.Mui-disabled, .Mui-error):before": {
                // borderBottom: "2px solid #adadad",
                display: "none",
              },
              "&.Mui-focused:after": {
                display: "none",
                // borderBottom: `2px solid  ${
                //   !isValid ? "red" : "var(--primary-pernix-green)"
                // }`,
              },
            },
          },
        },
        MuiInput: {
          styleOverrides: {
            root: {
              "&::before": {
                // borderBottom: "2px solid #adadad",
                display: "none",
              },
              "&:hover:not(.Mui-disabled, .Mui-error):before": {
                // borderBottom: "2px solid red",
                display: "none",
              },
              "&.Mui-focused:after": {
                // borderBottom: "2px solid red",
                display: "none",
              },
            },
          },
        },
      },
    });
  const outerTheme = useTheme();

  return (
    <div
      className={`${styles.inputMainWrapper} ${
        topLabel ? styles.topinputMainWrapper : ""
      }`}
      style={{ width: secWidth ? secWidth : "auto" }}
    >
      <div
        className={`${
          withLabel ? styles.inputWrapperWithLabel : styles.inputWrapper
        } ${disabled ? styles.disabledInput : ""} ${
          topLabel ? styles.topLabel : ""
        }`}
      >
        {withLabel && (
          <p
            className={`${styles.inputLabel} ${
              mandatory ? styles.mandatoryField : ""
            }`}
          >
            {labelText}
          </p>
        )}
        <ThemeProvider theme={customTheme(outerTheme)}>
          <div className={styles.flexColStart}>
            <TextField
              fullWidth
              value={value || ""}
              onChange={handleChange}
              // placeholder={placeholder}
              type={type}
              disabled={disabled}
              InputProps={{
                readOnly,
                autoFocus,
                startAdornment: icon ? (
                  <InputAdornment position="start">{icon}</InputAdornment>
                ) : undefined,
                endAdornment:
                  submitBtn || clearBtn ? (
                    <InputAdornment position="end">
                      {submitBtn && (
                        <IconButton onClick={() => onClickFunction?.(true)}>
                          {/* Submit button logic */}
                          {/* You can place your submit icon here */}
                        </IconButton>
                      )}
                      {clearBtn && (
                        <IconButton onClick={() => onClickFunction?.(false)}>
                          {clearBtn}
                        </IconButton>
                      )}
                    </InputAdornment>
                  ) : undefined,
                disableUnderline: noBorderInput,
              }}
              sx={{
                height: size === "SM" ? "34px" : "auto",
                "& .MuiInputLabel-root": {
                  top: size === "SM" ? "-6px !important" : "-3px",
                  fontSize: size === "SM" ? "13px" : "15px",
                  transition: "top 0.2s, font-size 0.2s",
                },
                "& .MuiInputBase-input": {
                  fontSize: size === "SM" ? "13px" : "15px",
                  paddingTop: size === "SM" ? "8px !important" : "15px",
                },
                "&.MuiInputBase-input:focus-within .MuiInputLabel-root": {
                  top: size === "SM" ? "-3px !important" : "-3px",
                  fontSize: size === "SM" ? "13px" : "15px",
                },
              }}
              error={Boolean(!isValid)}
              // helperText={!hideErrMsg && isValid && !noErrorMsg ? errorMsg : ""}
              // helperText={"Error input"}
              variant="filled"
              size={size === "SM" ? "small" : "medium"}
              label={placeholder}
              className={inputClassName}
              onKeyDown={onKeyDown}
            />
            {!isValid && !noErrorMsg && (
              <p
                className={styles.errorMsg}
                style={{
                  textAlign: isValid && !withLabel ? "left" : "right",
                }}
              >
                {errorMsg}
              </p>
            )}
          </div>
        </ThemeProvider>
      </div>
    </div>
  );
};

export default CustomInput;
