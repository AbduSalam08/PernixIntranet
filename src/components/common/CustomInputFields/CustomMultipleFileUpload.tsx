/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @rushstack/no-new-null */
import React, { useState, ChangeEvent, useEffect, useRef } from "react";
import styles from "./Inputs.module.scss";
import { Clear } from "@mui/icons-material";

type FileUploadProps = {
  accept?: string;
  placeholder?: string;
  value?: string[]; // Value to show previous file name (for edits)
  onFileSelect?: (file: File[] | null) => void;
  isValid?: boolean;
  errMsg?: any;
  multiple: boolean;
};

const CustomMultipleFileUpload: React.FC<FileUploadProps> = ({
  accept = "image/png,image/svg+xml",
  placeholder = "Select a file...",
  value = [], // Default to empty for new uploads
  onFileSelect,
  errMsg,
  isValid,
  multiple = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<File[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false); // New state for input focus

  // Create a ref to reset the input field programmatically
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Update file name if the value prop changes (for edits)
    if (value) {
      setFileName(value);
    }
  }, [value]);

  const handleFileChange = async (
    e: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    let file: File[] | null = e?.target?.files
      ? Array.from(e.target.files)
      : null;
    let strFileNames: string[] = [];

    if (file?.length && multiple) {
      const acceptedTypes = accept.split("/")?.[0] || "";
      strFileNames = await Promise.all(
        file?.map((val: File) => {
          return val.name;
        })
      );
      let isCheckFileType: boolean = file?.every(
        (val: File) =>
          val?.type?.split("/")?.[0]?.toLowerCase() ===
          acceptedTypes.toLowerCase()
      );

      if (!isCheckFileType) {
        setError(`Invalid file type.`);
        setSelectedFile(null);
        setFileName(value); // Reset to previous file name
        onFileSelect?.(null);
      } else {
        setError(null);
        setSelectedFile(file);
        setFileName([...strFileNames]);
        onFileSelect?.(file);
      }
    } else {
      setError(null);
      setSelectedFile(null);
      setFileName(value); // Reset to previous file name
      onFileSelect?.(null);
    }
  };

  const handleClear = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation(); // Prevent the click event from triggering the file input
    e.preventDefault();
    setSelectedFile(null);
    setError(null);
    setFileName([]); // Clear the file name
    onFileSelect?.(null);
    setIsFocused(false);
    // Reset the file input programmatically
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the input value
    }
  };

  const handleRemove = async (idx: number): Promise<void> => {
    selectedFile?.splice(idx, 1);
    fileName?.splice(idx, 1);
    if (!selectedFile?.length && !fileName.length) {
      setSelectedFile(null);
      setFileName([]);
      handleClear;
    } else {
      setSelectedFile(selectedFile);
      setFileName(fileName);
      onFileSelect?.(selectedFile);
    }
  };

  return (
    <div className={styles.fileUpload}>
      <div
        title=""
        className={`${styles.inputWrapper} ${
          fileName?.length || isFocused ? "" : ""
        }`} // Add 'filled' class when file is selected or input is focused
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className={styles.input}
          ref={fileInputRef} // Attach the ref to the input
          onFocus={() => setIsFocused(true)} // Set focus state
          onBlur={() => setIsFocused(false)} // Reset focus state
        />
        <label className={styles.placeholder}>{placeholder}</label>
      </div>

      {error ? (
        <div className={styles.error}>{error}</div>
      ) : !isValid ? (
        <div className={styles.error}>{errMsg}</div>
      ) : (
        <div className={styles.acceptedInfo}>
          Accepted files: {accept.replace(/,/g, ", ")}
        </div>
      )}

      {fileName?.length ? (
        <div className={styles.fileNameAlign}>
          {fileName?.map((val: string, idx: number) => {
            return (
              <div key={idx}>
                <div title={val}>{val}</div>
                <div>
                  <Clear
                    onClick={async () => {
                      await handleRemove(idx);
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        ""
      )}

      {fileName?.length !== 0 && value?.length !== 0 && (
        <button
          type="button"
          className={styles.clearBtn}
          onClick={handleClear} // Prevent file input from opening
        >
          Clear
        </button>
      )}
    </div>
  );
};

export default CustomMultipleFileUpload;
