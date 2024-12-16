/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from "react";
import {
  Autocomplete,
  TextField,
  createTheme,
  ThemeProvider,
  useTheme,
} from "@mui/material";
import styles from "./Inputs.module.scss";

interface AutocompleteProps {
  options: string[];
  value: string;
  onChange?: (value: string | any) => void;
  placeholder?: string;
  label?: string;
  isValid?: boolean;
  errorMsg?: string;
  disabled?: boolean;
  size?: "SM" | "MD" | "XL";
}

const CustomAutocomplete: React.FC<AutocompleteProps> = ({
  options,
  value,
  onChange,
  placeholder = "",
  label,
  isValid = true,
  errorMsg,
  disabled = false,
  size = "MD",
}) => {
  const outerTheme = useTheme();

  const customTheme = useMemo(
    () =>
      createTheme({
        ...outerTheme,
        components: {
          MuiAutocomplete: {
            styleOverrides: {
              inputRoot: {
                padding: size === "SM" ? "4px" : "8px",
              },
            },
          },
        },
      }),
    [outerTheme, size]
  );

  return (
    <ThemeProvider theme={customTheme}>
      <div className={styles.inputMainWrapper}>
        <Autocomplete
          freeSolo
          disableClearable
          options={options}
          value={value}
          onChange={(event, newValue) => {
            if (typeof newValue === "string" || newValue === null) {
              onChange?.(newValue);
            }
          }}
          disabled={disabled}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label || placeholder}
              variant="filled"
              //   error={!isValid}
              helperText={""}
              InputProps={{
                ...params.InputProps,
                style: {
                  fontSize: size === "SM" ? "14px" : "15px",
                  fontFamily: '"osMedium", sans-serif',
                },
              }}
              InputLabelProps={{
                style: {
                  fontSize: size === "SM" ? "14px" : "15px",
                  fontFamily: '"osRegular", sans-serif',
                  color: "#a4a4a4",
                },
              }}
            />
          )}
          sx={{
            width: "100%",
            "& .MuiInputBase-root": {
              height: size === "SM" ? "40px" : "50px",
            },
          }}
        />
        {!isValid && (
          <p
            className={styles.errorMsg}
            style={{
              textAlign: "right",
            }}
          >
            {errorMsg}
          </p>
        )}
      </div>
    </ThemeProvider>
  );
};

export default CustomAutocomplete;
