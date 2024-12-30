/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import React, { useMemo } from "react";
// import {
//   Autocomplete,
//   TextField,
//   createTheme,
//   ThemeProvider,
//   useTheme,
// } from "@mui/material";
// import styles from "./Inputs.module.scss";

// interface AutocompleteProps {
//   options: string[];
//   value: string;
//   onChange?: (value: string | any) => void;
//   placeholder?: string;
//   label?: string;
//   isValid?: boolean;
//   errorMsg?: string;
//   disabled?: boolean;
//   size?: "SM" | "MD" | "XL";
// }

// const CustomAutocomplete: React.FC<AutocompleteProps> = ({
//   options,
//   value,
//   onChange,
//   placeholder = "",
//   label,
//   isValid = true,
//   errorMsg,
//   disabled = false,
//   size = "MD",
// }) => {
//   const outerTheme = useTheme();

//   const customTheme = useMemo(
//     () =>
//       createTheme({
//         ...outerTheme,
//         components: {
//           MuiAutocomplete: {
//             styleOverrides: {
//               inputRoot: {
//                 padding: size === "SM" ? "4px" : "8px",
//               },
//             },
//           },
//         },
//       }),
//     [outerTheme, size]
//   );

//   return (
//     <ThemeProvider theme={customTheme}>
//       <div className={styles.inputMainWrapper}>
//         <Autocomplete
//           freeSolo
//           disableClearable
//           options={options}
//           value={value}
//           onChange={(event, newValue) => {
//             if (typeof newValue === "string" || newValue === null) {
//               onChange?.(newValue);
//             }
//           }}
//           disabled={disabled}
//           renderInput={(params) => (
//             <TextField
//               {...params}
//               label={label || placeholder}
//               variant="filled"
//               //   error={!isValid}
//               helperText={""}
//               InputProps={{
//                 ...params.InputProps,
//                 style: {
//                   fontSize: size === "SM" ? "14px" : "15px",
//                   fontFamily: '"osMedium", sans-serif',
//                 },
//               }}
//               InputLabelProps={{
//                 style: {
//                   fontSize: size === "SM" ? "14px" : "15px",
//                   fontFamily: '"osRegular", sans-serif',
//                   color: "#a4a4a4",
//                 },
//               }}
//             />
//           )}
//           sx={{
//             width: "100%",
//             "& .MuiInputBase-root": {
//               height: size === "SM" ? "40px" : "50px",
//             },
//           }}
//         />
//         {!isValid && (
//           <p
//             className={styles.errorMsg}
//             style={{
//               textAlign: "right",
//             }}
//           >
//             {errorMsg}
//           </p>
//         )}
//       </div>
//     </ThemeProvider>
//   );
// };

// export default CustomAutocomplete;

import * as React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import styles from "./Inputs.module.scss";
import { Clear } from "@mui/icons-material";

const filter = createFilterOptions<any>();

interface AutocompleteProps {
  options: string[];
  value: string;
  onChange?: (value: string) => void;
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
  const [dynamicOptions, setDynamicOptions] = React.useState<string[]>(options);
  const [selectedValue, setSelectedValue] = React.useState<string | null>(
    value || null
  );

  React.useEffect(() => {
    // Sync internal state if the value prop changes
    if (value !== selectedValue) {
      setSelectedValue(value);
    }
  }, [value]);

  React.useEffect(() => {
    if (options?.length !== dynamicOptions?.length) {
      setDynamicOptions(options);
    }
  }, [options?.length]);

  const handleChange = (
    event: React.ChangeEvent<{}>,
    newValue: string | any
  ): void => {
    if (newValue !== null) {
      // Check if the new value exists in the current options
      const isOptionExist = dynamicOptions.some(
        (option: any) =>
          option === newValue ||
          (option.inputValue && option.inputValue === newValue)
      );

      const newSelectedValue =
        typeof newValue === "string" ? newValue : newValue?.inputValue;

      if (isOptionExist) {
        setSelectedValue(newSelectedValue);
        onChange?.(newSelectedValue);
      } else {
        setSelectedValue(newSelectedValue);
        onChange?.(newSelectedValue);
        setDynamicOptions((prevOptions) => [...prevOptions, newSelectedValue]);
      }
    } else {
      setSelectedValue(null);
      onChange?.("");
    }
  };

  const handleClear = (): any => {
    // Manually reset the value and clear the state when the clear button is clicked
    setSelectedValue(null);
    onChange?.(""); // Notify parent component of the clear action
  };

  return (
    <div className={styles.inputMainWrapper}>
      <Autocomplete
        value={selectedValue} // Controlled value
        onChange={handleChange} // Handle change and update both internal state and parent
        filterOptions={(options, params) => {
          const filtered = filter(options, params);
          const { inputValue } = params;

          // Suggest the creation of a new value if it doesn't exist
          const isExisting = options.some((option) => inputValue === option);
          if (inputValue !== "" && !isExisting) {
            filtered.push({
              inputValue,
              title: `Add "${inputValue}"`,
            });
          }

          return filtered;
        }}
        selectOnFocus
        clearOnBlur
        clearOnEscape
        clearIcon={
          <Clear
            sx={{
              color: "#a4a4a4",
              fontSize: "18px",
            }}
            onClick={handleClear}
          />
        }
        id="free-solo"
        options={dynamicOptions} // Use dynamic options here
        getOptionLabel={(option: any) => {
          if (typeof option === "string") {
            return option;
          }
          return option.inputValue || option;
        }}
        renderOption={(props, option) => {
          return (
            <li {...props}>
              {option.title || option} {/* Handle the object or string case */}
            </li>
          );
        }}
        sx={{
          width: "100%",
          "& .MuiInputBase-root": {
            height: size === "SM" ? "40px" : "50px",
          },
        }}
        freeSolo
        renderInput={(params) => (
          <TextField
            {...params}
            label={label || placeholder}
            variant="filled"
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
  );
};

export default CustomAutocomplete;
