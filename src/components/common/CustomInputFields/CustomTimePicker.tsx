/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo, useCallback } from "react";
import styles from "./Inputs.module.scss";
import { MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import {
  createTheme,
  ThemeProvider,
  Theme,
  useTheme,
} from "@mui/material/styles";

interface ITimeInputProps {
  value: string | number | any;
  onChange?: (value: string | any) => void;
  placeholder?: string;
  disabled?: boolean;
  size?: "SM" | "MD" | "XL";
  isValid?: boolean;
  noErrorMsg?: boolean;
  errorMsg?: any;
  withLabel?: boolean;
  floatingLabel?: boolean;
  width?: any;
  highlightDropdown?: boolean;
}

const timeOptions: string[] = [
  "00:00",
  "00:30",
  "01:00",
  "01:30",
  "02:00",
  "02:30",
  "03:00",
  "03:30",
  "04:00",
  "04:30",
  "05:00",
  "05:30",
  "06:00",
  "06:30",
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
  "22:30",
  "23:00",
  "23:30",
];

const CustomTimePicker: React.FC<ITimeInputProps> = ({
  value,
  onChange,
  placeholder = "",
  size = "MD",
  disabled,
  errorMsg,
  isValid,
  noErrorMsg,
  withLabel,
  floatingLabel = true,
  width = "100%",
  highlightDropdown,
}) => {
  const handleChange = useCallback(
    (e: any) => {
      onChange && onChange(e?.target.value);
    },
    [onChange]
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
                display: "none",
              },
              "&:hover:not(.Mui-disabled, .Mui-error):before": {
                display: "none",
              },
              "&.Mui-focused:after": {
                display: "none",
              },
            },
          },
        },
        MuiInput: {
          styleOverrides: {
            root: {
              "&::before": {
                display: "none",
              },
              "&:hover:not(.Mui-disabled, .Mui-error):before": {
                display: "none",
              },
              "&.Mui-focused:after": {
                display: "none",
              },
            },
          },
        },
      },
    });

  const outerTheme = useTheme();

  // Concatenate the size with the style class name
  const sizeClassName = styles[`customDropDownInput${size}`];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        flexDirection: "column",
        gap: "2px",
        width: width,
        border: highlightDropdown ? "1px solid #eeeeee" : "none",
        borderRadius: "6px",
        overflow: "hidden",
      }}
    >
      <ThemeProvider theme={customTheme(outerTheme)}>
        <FormControl
          variant="filled"
          sx={{ minWidth: width || "276px" }}
          disabled={disabled}
        >
          {floatingLabel && (
            <InputLabel
              sx={{
                marginLeft: highlightDropdown ? "-3px !important" : "6px",
              }}
            >
              {placeholder}
            </InputLabel>
          )}
          <Select
            value={size === "SM" ? value || placeholder : value || ""}
            className={`${sizeClassName} ${
              disabled ? styles.disabledInput : ""
            }`}
            onChange={handleChange}
            displayEmpty
            placeholder={size === "SM" ? placeholder : ""}
            variant="filled"
            inputProps={{ "aria-label": placeholder }}
            label={placeholder}
            MenuProps={{
              sx: {
                ".MuiMenu-paper": {
                  bottom: "10px !important",
                  maxHeight: "200px",
                  height: "max-content",
                  // top: "588px !important",
                  transform: "translateY(5px) !important",
                  borderRadius: "6px !important",
                  boxShadow: "0px 0px 6px #b6b6b620 !important",
                  fontFamily: "osRegular, sans-serif !important",
                },
                ".Mui-selected": {
                  backgroundColor: "#2d4b5120 !important",
                  "&:hover": {
                    backgroundColor: "#2d4b5120 !important",
                  },
                },
              },
            }}
            sx={{
              ".MuiOutlinedInput-notchedOutline": {
                border: "0",
              },
              ".MuiSelect-select": {
                padding:
                  size === "SM"
                    ? "5px 13px !important"
                    : highlightDropdown
                    ? "18px 10px 6px 10px !important"
                    : "18px !important",
                paddingBottom: highlightDropdown
                  ? "3px !important"
                  : "6px !important",
                fontSize: size === "SM" ? "14px" : "15px",
                // width: size === "SM" ? "auto" : "100%",
                width: "100%",
                textAlign: "left",
              },
              fontWeight: "400",
              padding: "0",
              height: "34px",
              outline: "none",
            }}
          >
            <MenuItem
              sx={{ color: "#555 !important", fontSize: "14px" }}
              disabled={true}
              value={placeholder}
            >
              {placeholder}
            </MenuItem>
            {timeOptions?.map((option: any, i: number) => (
              <MenuItem
                key={i}
                value={option}
                sx={{
                  fontSize: "14px",
                }}
              >
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </ThemeProvider>
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
  );
};

export default memo(CustomTimePicker);
