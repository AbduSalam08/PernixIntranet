// /* eslint-disable no-unused-expressions */
// /* eslint-disable react/jsx-key */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import * as React from "react";
// import { memo, useCallback } from "react";
// import styles from "./Inputs.module.scss";
// import { MenuItem, Select } from "@mui/material";
// import {
//   createTheme,
//   ThemeProvider,
//   Theme,
//   useTheme,
// } from "@mui/material/styles";

// interface Props {
//   value: string | number | any;
//   options?: any[];
//   onChange?: (value: string | any) => void;
//   placeholder?: string;
//   disabled?: boolean;
//   size?: "SM" | "MD" | "XL";
//   isValid?: boolean;
//   noErrorMsg?: boolean;
//   errorMsg?: any;
//   withLabel?: boolean;
//   width?: any;
// }

// const CustomDropDown: React.FC<Props> = ({
//   value,
//   options,
//   onChange,
//   placeholder = "",
//   size = "MD",
//   disabled,
//   errorMsg,
//   isValid,
//   noErrorMsg,
//   withLabel,
//   width,
// }) => {
//   const handleChange = useCallback(
//     (e) => {
//       onChange && onChange(e?.target.value);
//     },
//     [onChange]
//   );
//   const customTheme = (outerTheme: Theme): any =>
//     createTheme({
//       palette: {
//         mode: outerTheme.palette.mode,
//       },
//       components: {
//         MuiFilledInput: {
//           styleOverrides: {
//             root: {
//               "&::before, &::after": {
//                 // borderBottom: "2px solid #adadad",
//                 display: "none",
//               },
//               "&:hover:not(.Mui-disabled, .Mui-error):before": {
//                 // borderBottom: "2px solid #adadad",
//                 display: "none",
//               },
//               "&.Mui-focused:after": {
//                 display: "none",
//                 // borderBottom: `2px solid  ${
//                 //   !isValid ? "red" : "var(--primary-pernix-green)"
//                 // }`,
//               },
//             },
//           },
//         },
//         MuiInput: {
//           styleOverrides: {
//             root: {
//               "&::before": {
//                 // borderBottom: "2px solid #adadad",
//                 display: "none",
//               },
//               "&:hover:not(.Mui-disabled, .Mui-error):before": {
//                 // borderBottom: "2px solid red",
//                 display: "none",
//               },
//               "&.Mui-focused:after": {
//                 // borderBottom: "2px solid red",
//                 display: "none",
//               },
//             },
//           },
//         },
//       },
//     });
//   const outerTheme = useTheme();

//   // Concatenate the size with the style class name
//   const sizeClassName = styles[`customDropDownInput${size}`];
//   // const sizeHeights = size==="SM" ?"35.5px":size==="MD"?""
//   return (
//     <div
//       style={{
//         display: "flex",
//         alignItems: "flex-start",
//         justifyContent: "flex-start",
//         flexDirection: "column",
//         gap: "10px",
//       }}
//     >
//       <ThemeProvider theme={customTheme(outerTheme)}>
//         <Select
//           disabled={disabled}
//           value={value || ""}
//           className={`${sizeClassName} ${disabled ? styles.disabledInput : ""}`}
//           onChange={handleChange}
//           displayEmpty
//           variant="filled"
//           // placeholder={placeholder}
//           renderValue={(selected) => {
//             // if (!selected) {
//             //   return (
//             //     <span
//             //       className={styles.placeHolder}
//             //       style={{
//             //         fontSize: "14px",
//             //       }}
//             //     >
//             //       {placeholder}
//             //     </span>
//             //   );
//             // }
//             return selected;
//           }}
//           inputProps={{ "aria-label": "Without label" }}
//           MenuProps={{
//             sx: {
//               ".MuiMenu-paper": {
//                 bottom: "10px !important",
//                 maxHeight: "200px",
//                 height: "max-content",
//                 boxShadow: "0px 4px 10px rgba(0,0,0,0.1) !important",
//                 // border:"1px solid #eee !important"
//               },
//               ".Mui-selected": {
//                 backgroundColor: "#C9B7FF40 !important",
//                 "&:hover": {
//                   backgroundColor: "#C9B7FF40 !important",
//                 },
//               },
//             },
//           }}
//           label={placeholder}
//           sx={{
//             ".MuiOutlinedInput-notchedOutline": {
//               border: "0",
//             },
//             ":root": {
//               padding: "0 !important",
//               ".MuiSelect-select": {
//                 padding: "0 !important",
//                 fontSize: "14px !important",
//               },
//             },
//             ".MuiSelect-select": {
//               fontSize: "14px !important",
//             },
//             fontWeight: "400",
//             padding: "0",
//             height: "34px",
//             minWidth: width ? width : "276px",
//             outline: "none",
//           }}
//         >
//           <MenuItem
//             sx={{
//               color: "#555 !important",
//             }}
//             disabled={true}
//             value={placeholder}
//           >
//             {placeholder}
//           </MenuItem>
//           {options?.map((option: any, i: number) => (
//             <MenuItem
//               key={i}
//               // sx={{
//               //   color:
//               //     option?.value === options[0].value
//               //       ? "#adadad !important"
//               //       : "#414141 ",
//               // }}
//               value={option}
//             >
//               {option}
//             </MenuItem>
//           ))}
//         </Select>
//       </ThemeProvider>
//       {!isValid && !noErrorMsg && (
//         <p
//           className={styles.errorMsg}
//           style={{
//             textAlign: isValid && !withLabel ? "left" : "right",
//           }}
//         >
//           {errorMsg}
//         </p>
//       )}
//     </div>
//   );
// };

// export default memo(CustomDropDown);

/* eslint-disable no-unused-expressions */
/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { memo, useCallback } from "react";
import styles from "./Inputs.module.scss";
import { MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import {
  createTheme,
  ThemeProvider,
  Theme,
  useTheme,
} from "@mui/material/styles";

interface Props {
  value: string | number | any;
  options?: any[];
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
  height?: any;
  highlightDropdown?: boolean;
  dropDownBackgroundColor?: string | any;
  customFontsize?: string;
  noPadding?: boolean;
}

const CustomDropDown: React.FC<Props> = ({
  value,
  options,
  onChange,
  placeholder = "",
  size = "MD",
  disabled,
  errorMsg,
  isValid,
  noErrorMsg,
  withLabel,
  floatingLabel = true,
  width,
  highlightDropdown,
  height,
  dropDownBackgroundColor,
  noPadding,
  customFontsize,
}) => {
  const handleChange = useCallback(
    (e) => {
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
              // border: highlightDropdown
              //   ? "1px solid #eeeeee !important"
              //   : "none !important",
              borderRadius: "4px", // Optional: Add a border-radius if needed
              "&:hover": {
                borderColor: "none",
              },
              "&.Mui-focused": {
                borderColor: "none", // Optional: Add a focus color
              },
              "&::before, &::after": {
                display: "none", // Disable the default underline styles
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
        // border: highlightDropdown ? "1px solid #eeeeee" : "none",
        borderRadius: "6px",
        overflow: "hidden",
      }}
    >
      <ThemeProvider theme={customTheme(outerTheme)}>
        <FormControl
          variant="filled"
          sx={{
            minWidth: width || "276px",
            border: highlightDropdown
              ? "1px solid #eeeeee !important"
              : "none !important",
            overflow: "hidden",
            borderRadius: "6px",
          }}
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
                padding: noPadding
                  ? "0 !important"
                  : size === "SM"
                  ? "5px 13px !important"
                  : highlightDropdown
                  ? "18px 10px 6px 10px !important"
                  : "18px 15px !important",
                paddingBottom: noPadding
                  ? "0 !important"
                  : highlightDropdown
                  ? "3px !important"
                  : "6px !important",
                fontSize: customFontsize
                  ? customFontsize
                  : size === "SM"
                  ? "14px"
                  : "15px",
                // width: size === "SM" ? "auto" : "100%",
                width: "100%",
                backgroundColor: dropDownBackgroundColor
                  ? `${dropDownBackgroundColor} !important`
                  : "#fff",
                textAlign: "left",
              },
              fontWeight: "400",
              height: height ? `${height} !important` : "34px",
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
            {options?.map((option: any, i: number) => (
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
      {errorMsg && !isValid && !noErrorMsg && (
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

export default memo(CustomDropDown);
