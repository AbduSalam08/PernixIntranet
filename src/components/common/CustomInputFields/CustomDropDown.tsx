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
      }}
    >
      <ThemeProvider theme={customTheme(outerTheme)}>
        <FormControl
          variant="filled"
          sx={{ minWidth: width || "276px" }}
          disabled={disabled}
        >
          {floatingLabel && <InputLabel>{placeholder}</InputLabel>}
          <Select
            value={value || ""}
            className={`${sizeClassName} ${
              disabled ? styles.disabledInput : ""
            }`}
            onChange={handleChange}
            displayEmpty
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
                  size === "SM" ? "5px 13px !important" : "18px !important",
                paddingBottom: "6px !important",
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
              sx={{ color: "#555 !important" }}
              disabled={true}
              value={placeholder}
            >
              {placeholder}
            </MenuItem>
            {options?.map((option: any, i: number) => (
              <MenuItem key={i} value={option}>
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

export default memo(CustomDropDown);
