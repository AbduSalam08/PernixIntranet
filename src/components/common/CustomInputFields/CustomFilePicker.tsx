/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useState } from "react";
import {
  FilePicker,
  IFilePickerResult,
} from "@pnp/spfx-controls-react/lib/FilePicker";
// import { convertFileToBase64 } from "../../../utils/commonUtils";
import styles from "./Inputs.module.scss";
import "./customStyle.css";

interface FilePickerProps {
  accepts?: string[];
  buttonIcon?: string;
  context: any; // Adjust the type based on your SPFx context
  onSave?: (fileData: { filename: string; size: number; file: File }) => void;
  onChange?: (fileData: { filename: string; size: number; file: File }) => void;
  selectedFile?: string;
  isValid?: boolean;
  errorMsg?: string;
}

const CustomFilePicker: React.FC<FilePickerProps> = ({
  accepts = [
    ".gif",
    ".jpg",
    ".jpeg",
    ".bmp",
    ".dib",
    ".tif",
    ".tiff",
    ".ico",
    ".png",
    ".jxr",
    ".svg",
  ],
  buttonIcon = "FileImage",
  context,
  onSave,
  onChange,
  selectedFile,
  errorMsg,
  isValid,
}) => {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileProcessing = useCallback(
    async (
      filePickerResult: IFilePickerResult[],
      callback?: (fileData: {
        filename: string;
        size: number;
        file: File;
      }) => void
    ) => {
      if (filePickerResult && filePickerResult.length > 0) {
        const file = await filePickerResult[0]?.downloadFileContent();
        if (file) {
          //   const base64String = await convertFileToBase64(file);

          // Convert Base64 back to the original file format
          const originalFileBlob = new Blob([file], {
            type:
              filePickerResult[0].fileName.split(".").pop() ||
              "application/octet-stream",
          });

          const originalFile = new File(
            [originalFileBlob],
            filePickerResult[0].fileName,
            { type: file.type }
          );

          const fileData = {
            filename: filePickerResult[0].fileName,
            size: file.size,
            file: originalFile,
          };

          setFileName(fileData.filename);
          callback?.(fileData);
        }
      }
    },
    []
  );

  const triggerFilePicker = (): void => {
    const button = document.querySelector(
      `.${styles.filePickerButton}`
    ) as HTMLElement;
    button?.click();
  };

  const clearSelection = (): void => {
    setFileName(null);
    onSave?.({ filename: "", size: 0, file: new File([], "") });
    onChange?.({ filename: "", size: 0, file: new File([], "") });
  };

  return (
    <div className={styles.filePickerContainerWrap}>
      <div className={styles.filePickerWrapper} onClick={triggerFilePicker}>
        <span className={styles.filePickerLabel}>
          {fileName || selectedFile || "Browse file"}
        </span>
        <div className={styles.filePickerContainer}>
          <FilePicker
            accepts={accepts}
            buttonIcon={buttonIcon}
            context={context}
            buttonClassName={styles.filePickerButton}
            onSave={(filePickerResult) =>
              handleFileProcessing(filePickerResult, onSave)
            }
            onChange={(filePickerResult) =>
              handleFileProcessing(filePickerResult, onChange)
            }
          />

          {(fileName || selectedFile) && (
            <div
              style={{
                color: "red",
                fontSize: "14px",
                cursor: "pointer",
                fontFamily: "osRegular",
              }}
              onClick={(e) => {
                e.stopPropagation();
                clearSelection();
              }}
            >
              Clear
            </div>
          )}
        </div>
      </div>
      {!isValid && <span className={styles.errorMsg}>{errorMsg}</span>}
    </div>
  );
};

export default CustomFilePicker;
