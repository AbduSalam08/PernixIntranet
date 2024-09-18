/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @rushstack/no-new-null */
import React, { useState, ChangeEvent, useEffect, useRef } from "react";
import styles from "./Inputs.module.scss";

type FileUploadProps = {
  accept?: string;
  placeholder?: string;
  value?: string; // Value to show previous file name (for edits)
  onFileSelect?: (file: File | null) => void;
  isValid?: boolean;
  errMsg?: any;
};

const CustomFileUpload: React.FC<FileUploadProps> = ({
  accept = "image/png,image/svg+xml",
  placeholder = "Select a file...",
  value = "", // Default to empty for new uploads
  onFileSelect,
  errMsg,
  isValid,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  console.log("selectedFile: ", selectedFile);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>(value);

  // Create a ref to reset the input field programmatically
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Update file name if the value prop changes (for edits)
    if (value) {
      setFileName(value);
    }
  }, [value]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0] || null;

    if (file) {
      const acceptedTypes = accept.split(",").map((type) => type.trim());
      if (!acceptedTypes.includes(file.type)) {
        setError(
          `Invalid file type. Accepted types: ${acceptedTypes.join(", ")}`
        );
        setSelectedFile(null);
        setFileName(value); // Reset to previous file name
        onFileSelect?.(null);
      } else {
        setError(null);
        setSelectedFile(file);
        setFileName(file.name);
        onFileSelect?.(file);
      }
    } else {
      setSelectedFile(null);
      setError(null);
      setFileName(value); // Reset to previous file name
      onFileSelect?.(null);
    }
  };

  const handleClear = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation(); // Prevent the click event from triggering the file input
    e.preventDefault();
    setSelectedFile(null);
    setError(null);
    setFileName(""); // Clear the file name
    onFileSelect?.(null);

    // Reset the file input programmatically
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the input value
    }
  };

  return (
    <div className={styles.fileUpload}>
      <div className={styles.inputWrapper}>
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className={styles.input}
          ref={fileInputRef} // Attach the ref to the input
        />
        <div className={styles.placeholder} title={fileName || placeholder}>
          {fileName || placeholder}
        </div>
        {fileName && value !== null && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={handleClear} // Prevent file input from opening
          >
            Clear
          </button>
        )}
      </div>
      {error ? (
        <div className={styles.errorMsg}>{error}</div>
      ) : !isValid ? (
        <div className={styles.errorMsg}>{errMsg}</div>
      ) : (
        <div className={styles.acceptedInfo}>
          Accepted files: {accept.replace(/,/g, ", ")}
        </div>
      )}
    </div>
  );
};

export default CustomFileUpload;
