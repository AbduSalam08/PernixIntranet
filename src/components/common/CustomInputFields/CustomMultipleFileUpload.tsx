/* eslint-disable no-debugger */
/* eslint-disable @rushstack/no-new-null */
/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @rushstack/no-new-null */
// import React, { useState, ChangeEvent, useEffect, useRef } from "react";
// import styles from "./Inputs.module.scss";
// import { Clear } from "@mui/icons-material";

// type FileUploadProps = {
//   accept?: string;
//   placeholder?: string;
//   value?: string[]; // Value to show previous file name (for edits)
//   onFileSelect?: (file: File[] | null) => void;
//   isValid?: boolean;
//   errMsg?: any;
//   multiple: boolean;
// };

// const CustomMultipleFileUpload: React.FC<FileUploadProps> = ({
//   accept = "image/png,image/svg+xml",
//   placeholder = "Select a file...",
//   value = [], // Default to empty for new uploads
//   onFileSelect,
//   errMsg,
//   isValid,
//   multiple = false,
// }) => {
//   console.log("value: ", value);
//   const [selectedFile, setSelectedFile] = useState<File[] | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [fileName, setFileName] = useState<string[]>([]);
//   console.log("fileName: ", fileName);
//   const [isFocused, setIsFocused] = useState(false); // New state for input focus

//   // Create a ref to reset the input field programmatically
//   const fileInputRef = useRef<HTMLInputElement | null>(null);

//   useEffect(() => {
//     // Update file name if the value prop changes (for edits)
//     if (value) {
//       setFileName(value);
//     }
//   }, [value]);

//   const handleFileChange = async (
//     e: ChangeEvent<HTMLInputElement>
//   ): Promise<void> => {
//     const file: File[] | null = e?.target?.files
//       ? Array.from(e.target.files)
//       : null;
//     let strFileNames: string[] = [];

//     if (file?.length && multiple) {
//       const acceptedTypes = accept.split("/")?.[0] || "";
//       strFileNames = await Promise.all(
//         file?.map((val: File) => {
//           return val.name;
//         })
//       );
//       const isCheckFileType: boolean = file?.every(
//         (val: File) =>
//           val?.type?.split("/")?.[0]?.toLowerCase() ===
//           acceptedTypes.toLowerCase()
//       );

//       if (!isCheckFileType) {
//         setError(`Invalid file type.`);
//         setSelectedFile(null);
//         setFileName(value); // Reset to previous file name
//         onFileSelect?.(null);
//       } else {
//         setError(null);
//         setSelectedFile(file);
//         setFileName([...strFileNames]);
//         onFileSelect?.(file);
//       }
//     } else {
//       setError(null);
//       setSelectedFile(null);
//       setFileName(value); // Reset to previous file name
//       onFileSelect?.(null);
//     }
//   };

//   const handleClear = (e: React.MouseEvent<HTMLButtonElement>): void => {
//     e.stopPropagation(); // Prevent the click event from triggering the file input
//     e.preventDefault();
//     setSelectedFile(null);
//     setError(null);
//     setFileName([]); // Clear the file name
//     onFileSelect?.(null);
//     setIsFocused(false);
//     // Reset the file input programmatically
//     if (fileInputRef.current) {
//       fileInputRef.current.value = ""; // Clear the input value
//     }
//   };

//   const handleRemove = async (idx: number): Promise<void> => {
//     selectedFile?.splice(idx, 1);
//     fileName?.splice(idx, 1);
//     if (!selectedFile?.length && !fileName.length) {
//       setSelectedFile(null);
//       setFileName([]);
//       // handleClear?.();
//     } else {
//       setSelectedFile(selectedFile);
//       setFileName(fileName);
//       onFileSelect?.(selectedFile);
//     }
//   };

//   return (
//     <div className={styles.fileUpload}>
//       <div
//         title=""
//         className={`${styles.inputWrapper} ${
//           fileName?.length || isFocused ? "" : ""
//         }`}
//       >
//         <input
//           type="file"
//           accept={accept}
//           multiple={multiple}
//           onChange={handleFileChange}
//           className={styles.input}
//           ref={fileInputRef} // Attach the ref to the input
//           onFocus={() => setIsFocused(true)} // Set focus state
//           onBlur={() => setIsFocused(false)} // Reset focus state
//         />
//         <label className={styles.placeholder}>{placeholder}</label>
//       </div>

//       {error ? (
//         <div className={styles.error}>{error}</div>
//       ) : !isValid ? (
//         <div className={styles.error}>{errMsg}</div>
//       ) : (
//         <div className={styles.acceptedInfo}>
//           Accepted files: {accept.replace(/,/g, ", ")}
//         </div>
//       )}

//       {fileName?.length ? (
//         <div className={styles.fileNameAlign}>
//           {fileName?.map((val: string, idx: number) => {
//             return (
//               <div key={idx}>
//                 <div title={val}>{val}</div>
//                 <div>
//                   <Clear
//                     onClick={async () => {
//                       await handleRemove(idx);
//                     }}
//                   />
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       ) : (
//         ""
//       )}

//       {fileName?.length !== 0 && value?.length !== 0 && (
//         <button
//           type="button"
//           className={styles.clearBtn}
//           onClick={handleClear} // Prevent file input from opening
//         >
//           Clear all
//         </button>
//       )}
//     </div>
//   );
// };

// export default CustomMultipleFileUpload;

// v2

// import React, { useState, useEffect, useRef } from "react";
// import styles from "./Inputs.module.scss";
// import { Clear } from "@mui/icons-material";

// type FileUploadProps = {
//   accept?: string;
//   placeholder?: string;
//   value?: string[]; // Value for previously selected files (used for edits)
//   onFileSelect?: (files: File[] | null) => void;
//   isValid?: boolean;
//   errMsg?: any;
//   multiple: boolean;
// };

// const CustomMultipleFileUpload: React.FC<FileUploadProps> = ({
//   accept = "image/png,image/svg+xml",
//   placeholder = "Select files...",
//   value = [], // Default to empty if no files are provided initially
//   onFileSelect,
//   errMsg,
//   isValid,
//   multiple = false,
// }) => {
//   console.log("value: ", value);
//   const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // To hold the actual File objects
//   const [fileNames, setFileNames] = useState<string[]>([]); // To display file names as strings
//   const [error, setError] = useState<string | null>(null);
//   const [isFocused, setIsFocused] = useState(false);

//   const fileInputRef = useRef<HTMLInputElement | null>(null);

//   // Handling initial file selection (if value prop is passed, which is useful for editing)
//   useEffect(() => {
//     if (value.length > 0) {
//       setFileNames(value); // Set file names to display (e.g., SharePoint attachment names)
//       setSelectedFiles([]); // We don't have actual File objects, so initialize empty
//     }
//   }, [value]);

//   // Handling new file selection
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
//     const files: File[] | null = e?.target?.files
//       ? Array.from(e.target.files)
//       : null;

//     if (files && multiple) {
//       // Validate file types
//       const acceptedTypes = accept.split(",");
//       const isValidFileType = files.every((file) =>
//         acceptedTypes.some((type) => file.type.startsWith(type.trim()))
//       );

//       if (!isValidFileType) {
//         setError(
//           `Invalid file type: Only files of type ${accept.replace(
//             /,/g,
//             ", "
//           )} are allowed.`
//         );
//         setSelectedFiles([]); // Reset selected files if invalid type
//         setFileNames([]); // Reset file names if invalid type
//         onFileSelect?.(null);
//       } else {
//         setError(null);
//         // Append new files to the existing selected files and file names
//         const updatedFiles = [...selectedFiles, ...files]; // Append new files to existing files
//         setSelectedFiles(updatedFiles);
//         setFileNames(updatedFiles.map((file) => file.name)); // Update the file names display
//         onFileSelect?.(updatedFiles); // Pass the updated files (both old and new) to the parent
//       }
//     }
//   };

//   // Handle removing individual files
//   const handleRemove = (index: number): void => {
//     const updatedFiles = selectedFiles.filter((_, i) => i !== index); // Remove the file from the array
//     const updatedFileNames = fileNames.filter((_, i) => i !== index); // Remove the file name from the array
//     setSelectedFiles(updatedFiles);
//     setFileNames(updatedFileNames); // Update the file names for display
//     onFileSelect?.(updatedFiles); // Pass the updated files to the parent
//   };

//   // Clear all selected files
//   const handleClear = (e: React.MouseEvent<HTMLButtonElement>): void => {
//     e.preventDefault();
//     setSelectedFiles([]);
//     setFileNames([]);
//     setError(null);
//     onFileSelect?.(null);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = ""; // Clear the input
//     }
//   };

//   return (
//     <div className={styles.fileUpload}>
//       <div
//         className={`${styles.inputWrapper} ${
//           fileNames.length || isFocused ? "" : ""
//         }`}
//       >
//         <input
//           type="file"
//           accept={accept}
//           multiple={multiple}
//           onChange={handleFileChange}
//           className={styles.input}
//           ref={fileInputRef}
//           onFocus={() => setIsFocused(true)}
//           onBlur={() => setIsFocused(false)}
//         />
//         <label className={styles.placeholder}>{placeholder}</label>
//       </div>

//       {error ? (
//         <div className={styles.error}>{error}</div>
//       ) : !isValid ? (
//         <div className={styles.error}>{errMsg}</div>
//       ) : (
//         <div className={styles.acceptedInfo}>
//           Accepted files: {accept.replace(/,/g, ", ")}
//         </div>
//       )}

//       {fileNames.length > 0 && (
//         <div className={styles.fileNameAlign}>
//           {fileNames?.map((fileName, idx) => (
//             <div key={idx}>
//               <div title={fileName}>{fileName}</div>
//               <div>
//                 <Clear
//                   onClick={async () => {
//                     await handleRemove(idx);
//                   }}
//                 />
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {fileNames.length > 0 && (
//         <button type="button" className={styles.clearBtn} onClick={handleClear}>
//           Clear all
//         </button>
//       )}
//     </div>
//   );
// };

// export default CustomMultipleFileUpload;

// v3
// import React, { useState, useEffect, useRef } from "react";
// import { FileUpload } from "primereact/fileupload"; // PrimeReact FileUpload component
// import { Clear } from "@mui/icons-material"; // Clear icon for removing files
// import styles from "./Inputs.module.scss"; // Your styles

// type FileUploadProps = {
//   accept?: string;
//   placeholder?: string;
//   value?: string[]; // Value for previously selected files (file names or URLs)
//   onFileSelect?: (files: File[] | null) => void;
//   isValid?: boolean;
//   errMsg?: any;
//   multiple: boolean;
// };

// const CustomMultipleFileUpload: React.FC<FileUploadProps> = ({
//   accept = "image/png,image/svg+xml",
//   placeholder = "Select files...",
//   value = [], // Default to empty if no files are provided initially
//   onFileSelect,
//   errMsg,
//   isValid,
//   multiple = false,
// }) => {
//   const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // Actual File objects
//   const [fileNames, setFileNames] = useState<string[]>([]); // To display file names
//   const [error, setError] = useState<string | null>(null);

//   const fileUploadRef = useRef<FileUpload | null>(null); // Ref for the FileUpload component

//   // Handle the initial value (existing files) when the component is loaded
//   useEffect(() => {
//     if (value.length > 0) {
//       setFileNames(value); // Initialize with existing file names from value
//       setSelectedFiles([]); // No File objects are passed, will be added after selection
//     }
//   }, [value]);

//   // Handle file selection
//   const handleFileChange = (e: any): void => {
//     const files: File[] = e?.files ? Array.from(e.files) : [];

//     if (files && multiple) {
//       // Validate file types
//       const acceptedTypes = accept.split(",");
//       const isValidFileType = files.every((file) =>
//         acceptedTypes.some((type) => file.type.startsWith(type.trim()))
//       );

//       if (!isValidFileType) {
//         setError(
//           `Invalid file type: Only files of type ${accept.replace(
//             /,/g,
//             ", "
//           )} are allowed.`
//         );
//         setSelectedFiles([]);
//         setFileNames([]);
//         onFileSelect?.(null);
//       } else {
//         setError(null);
//         const updatedFiles = [...selectedFiles, ...files];
//         setSelectedFiles(updatedFiles);
//         setFileNames(updatedFiles.map((file) => file.name)); // Update file names
//         onFileSelect?.(updatedFiles);
//       }
//     }
//   };

//   // Handle file removal
//   const handleRemove = (index: number): void => {
//     const updatedFiles = selectedFiles.filter((_, i) => i !== index);
//     const updatedFileNames = fileNames.filter((_, i) => i !== index);
//     setSelectedFiles(updatedFiles);
//     setFileNames(updatedFileNames);
//     onFileSelect?.(updatedFiles);
//   };

//   // Handle clearing all files
//   const handleClear = (e: React.MouseEvent<HTMLButtonElement>): void => {
//     e.preventDefault();
//     setSelectedFiles([]);
//     setFileNames([]);
//     setError(null);
//     onFileSelect?.(null);
//     if (fileUploadRef.current) {
//       fileUploadRef.current.clear(); // Clear files in FileUpload component
//     }
//   };

//   return (
//     <div className={styles.fileUpload}>
//       <div className={`${styles.inputWrapper}`}>
//         {/* PrimeReact FileUpload Component */}
//         <FileUpload
//           ref={fileUploadRef}
//           name="files"
//           accept={accept}
//           multiple={multiple}
//           onSelect={handleFileChange}
//           chooseLabel={placeholder}
//           className={styles.input}
//         />
//       </div>

//       {/* Display error messages */}
//       {error ? (
//         <div className={styles.error}>{error}</div>
//       ) : !isValid ? (
//         <div className={styles.error}>{errMsg}</div>
//       ) : (
//         <div className={styles.acceptedInfo}>
//           Accepted files: {accept.replace(/,/g, ", ")}
//         </div>
//       )}

//       {/* Display file names and allow file removal */}
//       {fileNames.length > 0 && (
//         <div className={styles.fileNameAlign}>
//           {fileNames.map((fileName, idx) => (
//             <div key={idx}>
//               <div title={fileName}>{fileName}</div>
//               <Clear onClick={() => handleRemove(idx)} />
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Button to clear all selected files */}
//       {fileNames.length > 0 && (
//         <button type="button" className={styles.clearBtn} onClick={handleClear}>
//           Clear all
//         </button>
//       )}
//     </div>
//   );
// };

// export default CustomMultipleFileUpload;

// working modules
// import React, { useState, useEffect, useRef } from "react";
// import styles from "./Inputs.module.scss";
// import { Clear } from "@mui/icons-material";

// type FileUploadProps = {
//   accept?: string;
//   placeholder?: string;
//   value?: string[]; // Pre-selected file names, useful for edits
//   onFileSelect?: (files: File[] | null) => void;
//   isValid?: boolean;
//   errMsg?: string | null;
//   multiple: boolean;
//   customFileNameWidth?: string | any;
// };

// const CustomMultipleFileUpload: React.FC<FileUploadProps> = ({
//   accept,
//   // accept = "image/png,image/svg+xml",
//   placeholder = "Select files...",
//   value = [],
//   onFileSelect,
//   errMsg,
//   isValid,
//   multiple = false,
//   customFileNameWidth,
// }) => {
//   const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
//   const [fileNames, setFileNames] = useState<string[]>(value);
//   const [error, setError] = useState<string | null>(null);
//   const [isFocused, setIsFocused] = useState(false);
//   console.log("isFocused: ", isFocused);

//   const fileInputRef = useRef<HTMLInputElement | null>(null);

//   // Handle initial value from props (e.g., pre-existing files)
//   useEffect(() => {
//     if (value.length > 0) {
//       setFileNames(value?.map((item: any) => item?.name));
//       setSelectedFiles([...value]);
//     }
//   }, [value]);

//   // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): any => {
//   //   debugger;
//   //   const files = e.target.files ? Array.from(e.target.files) : [];
//   //   console.log("files: ", files);

//   //   if (files.length > 0) {
//   //     const acceptedTypes = accept?.split(",");
//   //     const validFiles = files.filter((file) =>
//   //       acceptedTypes?.some((type) => file.type.startsWith(type.trim()))
//   //     );

//   //     if (validFiles?.length !== files?.length) {
//   //       setError(`Only ${accept?.replace(/,/g, ", ")} files are allowed.`);
//   //       return;
//   //     }

//   //     setError(null);
//   //     const updatedFiles = multiple
//   //       ? [...selectedFiles, ...validFiles]
//   //       : validFiles;

//   //     setSelectedFiles(updatedFiles);
//   //     setFileNames(updatedFiles.map((file) => file.name));
//   //     onFileSelect?.(updatedFiles);
//   //   }
//   // };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): any => {
//     const files = e.target.files ? Array.from(e.target.files) : [];
//     console.log("files: ", files);

//     if (files.length > 0) {
//       const acceptedTypes = accept?.split(",").map((type) => type.trim()); // Split and trim accepted types

//       const validFiles = files.filter((file) => {
//         return acceptedTypes?.some((type) => {
//           if (type.endsWith("/*")) {
//             // Check for general MIME type (e.g., application/*)
//             return file.type.startsWith(type.replace("/*", ""));
//           }
//           // Check for specific MIME type (e.g., application/pdf)
//           return file.type === type;
//         });
//       });

//       if (validFiles.length !== files.length) {
//         setError(`Only ${accept?.replace(/,/g, ", ")} files are allowed.`);
//         return;
//       }

//       setError(null);
//       const updatedFiles = multiple
//         ? [...selectedFiles, ...validFiles]
//         : validFiles;

//       setSelectedFiles(updatedFiles);
//       setFileNames(updatedFiles.map((file) => file.name));
//       onFileSelect?.(updatedFiles);
//     }
//   };

//   const handleRemove = (index: number): any => {
//     const updatedFiles = selectedFiles.filter((_, i) => i !== index);
//     setSelectedFiles(updatedFiles);
//     setFileNames(updatedFiles.map((file) => file.name));
//     onFileSelect?.(updatedFiles);
//   };

//   const handleClear = (): any => {
//     setSelectedFiles([]);
//     setFileNames([]);
//     setError(null);
//     onFileSelect?.(null);
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };

//   return (
//     <div className={styles.fileUpload}>
//       <div className={styles.inputWrapper}>
//         <input
//           type="file"
//           accept={accept}
//           multiple={multiple}
//           onChange={handleFileChange}
//           className={styles.input}
//           ref={fileInputRef}
//           onFocus={() => setIsFocused(true)}
//           onBlur={() => setIsFocused(false)}
//         />
//         <label className={styles.placeholder}>{placeholder}</label>
//       </div>

//       {error ? (
//         <div className={styles.error}>{error}</div>
//       ) : !isValid ? (
//         <div className={styles.error}>{errMsg}</div>
//       ) : (
//         <div className={styles.acceptedInfo}>
//           Accepted files: {accept?.replace(/,/g, ", ")}
//         </div>
//       )}

//       {fileNames.length > 0 && (
//         <div className={styles.fileNameAlign}>
//           {fileNames?.map((fileName, idx) => (
//             <div key={idx}>
//               <span
//                 title={fileName}
//                 style={{
//                   maxWidth: customFileNameWidth ?? "90%",
//                 }}
//               >
//                 {fileName}
//               </span>
//               <div>
//                 <Clear
//                   onClick={async () => {
//                     await handleRemove(idx);
//                   }}
//                 />
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {fileNames.length > 0 && (
//         <button type="button" className={styles.clearBtn} onClick={handleClear}>
//           Clear all
//         </button>
//       )}
//     </div>
//   );
// };

// export default CustomMultipleFileUpload;

// POC for copy paste
import React, { useState, useEffect, useRef } from "react";
import styles from "./Inputs.module.scss";
import { Clear } from "@mui/icons-material";

type FileUploadProps = {
  accept?: string;
  placeholder?: string;
  value?: string[]; // Pre-selected file names, useful for edits
  onFileSelect?: (files: File[] | null) => void;
  isValid?: boolean;
  errMsg?: string | null;
  multiple: boolean;
  customFileNameWidth?: string | any;
  selectedFilesMaxHeight?: string;
  selectedFilesMinHeight?: string;
  emptyFileMessage?: string;
};

const CustomMultipleFileUpload: React.FC<FileUploadProps> = ({
  accept,
  placeholder = "Select files...",
  value = [],
  onFileSelect,
  errMsg,
  isValid,
  multiple = false,
  customFileNameWidth,
  selectedFilesMaxHeight,
  selectedFilesMinHeight,
  emptyFileMessage,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [fileNames, setFileNames] = useState<string[]>(value);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState<boolean>(false);
  console.log("dragging: ", dragging);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle initial value from props
  useEffect(() => {
    if (value.length > 0) {
      setFileNames(value?.map((item: any) => item?.name ?? item?.FileName));
      setSelectedFiles([...value]);
    }
  }, [value]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): any => {
      if (e.key === "Control") {
        setIsCtrlPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent): any => {
      if (e.key === "Control") {
        setIsCtrlPressed(false);
      }
    };

    const processFiles = (files: File[]): any => {
      if (files.length > 0) {
        const acceptedTypes = accept?.split(",").map((type) => type.trim());
        const validFiles = files.filter((file) =>
          acceptedTypes?.some((type) =>
            type.endsWith("/*")
              ? file.type.startsWith(type.replace("/*", ""))
              : file.type === type
          )
        );

        if (validFiles.length !== files.length) {
          setError(`Only ${accept?.replace(/,/g, ", ")} files are allowed.`);
          return;
        }

        setError(null);
        const updatedFiles = multiple
          ? [...selectedFiles, ...validFiles]
          : validFiles;

        setSelectedFiles(updatedFiles);
        setFileNames(updatedFiles.map((file) => file.name));
        onFileSelect?.(updatedFiles);
      }
      setDragging(false);
    };

    const handlePaste = (e: ClipboardEvent): any => {
      if (!isCtrlPressed) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i]?.kind === "file") {
          const file = items[i].getAsFile();
          if (file) {
            const originalName = file.name;
            let newName = originalName;
            let count = 1;

            // Check for duplicates and increment name if necessary
            while (fileNames?.includes(newName)) {
              const nameWithoutExtension = originalName?.replace(
                /\.[^/.]+$/,
                ""
              ); // Remove extension
              const extension = originalName?.slice(
                originalName.lastIndexOf(".")
              );
              newName = `${nameWithoutExtension}(${count})${extension}`;
              count++;
            }

            // Create a new file with the updated name
            const renamedFile = new File([file], newName, { type: file.type });
            files.push(renamedFile);
          }
        }
      }
      processFiles(files);
    };

    // Attach global event listeners
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("paste", handlePaste);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("paste", handlePaste);
    };
  }, [isCtrlPressed, fileNames]);

  const processFiles = (files: File[]): any => {
    if (files.length > 0) {
      const acceptedTypes = accept?.split(",").map((type) => type.trim());
      const validFiles = files.filter((file) =>
        acceptedTypes?.some((type) =>
          type.endsWith("/*")
            ? file.type.startsWith(type.replace("/*", ""))
            : file.type === type
        )
      );

      if (validFiles.length !== files.length) {
        setError(`Only ${accept?.replace(/,/g, ", ")} files are allowed.`);
        return;
      }

      setError(null);
      const updatedFiles = multiple
        ? [...selectedFiles, ...validFiles]
        : validFiles;

      setSelectedFiles(updatedFiles);
      setFileNames(updatedFiles.map((file) => file.name));
      onFileSelect?.(updatedFiles);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): any => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    processFiles(files);
    setDragging(false);
  };

  const handleRemove = (index: number): any => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setFileNames(updatedFiles.map((file) => file.name));
    onFileSelect?.(updatedFiles);
    setDragging(false);
  };

  const handleClear = (): any => {
    setSelectedFiles([]);
    setFileNames([]);
    setError(null);
    onFileSelect?.(null);
    setDragging(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragHightlight = (): void => {
    setDragging(true);
  };
  const handleDragLeave = (): void => {
    setDragging(false);
  };

  return (
    <div className={styles.fileUpload}>
      <div
        className={`${styles.inputWrapper} `}
        style={{
          border: !dragging ? `2px solid transparent` : `2px dashed #adadad`,
          backgroundColor: !dragging ? `#fff` : `#adadad10`,
        }}
        onDragEnter={handleDragHightlight}
        onDragOver={handleDragHightlight}
        onDragLeave={handleDragLeave}
        onDrag={handleDragHightlight}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className={styles.input}
          ref={fileInputRef}
        />
        <label className={styles.placeholder}>{placeholder}</label>
      </div>

      {error ? (
        <div className={styles.error}>{error}</div>
      ) : !isValid ? (
        <div className={styles.error}>{errMsg}</div>
      ) : (
        <div className={styles.acceptedInfo}>
          Accepted files: {accept?.replace(/,/g, ", ")}
        </div>
      )}

      {fileNames.length > 0 && (
        <div
          className={styles.fileNameAlign}
          style={{
            minHeight: selectedFilesMinHeight ?? selectedFilesMinHeight,
            maxHeight: selectedFilesMaxHeight ?? selectedFilesMaxHeight,
          }}
        >
          {fileNames?.map((fileName: any, idx: number) => (
            <div key={idx}>
              <span
                title={fileName?.name ? fileName?.name : fileName}
                style={{
                  maxWidth: customFileNameWidth ?? "90%",
                }}
              >
                {fileName?.name ? fileName?.name : fileName}
              </span>
              <div>
                <Clear
                  onClick={async () => {
                    await handleRemove(idx);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {fileNames.length === 0 && emptyFileMessage && (
        <span className={styles.emptyFileMsg}>{emptyFileMessage}</span>
      )}

      {fileNames.length > 0 && (
        <button type="button" className={styles.clearBtn} onClick={handleClear}>
          Clear all
        </button>
      )}
    </div>
  );
};

export default CustomMultipleFileUpload;
