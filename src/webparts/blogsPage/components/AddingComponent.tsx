/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-debugger */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import "../../../assets/styles/Style.css";
import styles from "./AddingComponent.module.scss";
import { Icon } from "@fluentui/react";
import QuillEditor from "../../../components/common/QuillEditor/QuillEditor";

import { addfilemsg } from "../../../services/BlogsPage/BlogsPageServices";
import { InputText } from "primereact/inputtext";
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
interface IPopupData {
  ImageDescription: string;
  Attachmentfiles: any[];
}
interface IDetails {
  Title: string;
  ParentTitle: string;
}

function AddingComponent(props: any) {
  const _popupData: IPopupData = {
    ImageDescription: "",
    Attachmentfiles: [],
  };
  const _additionaldetails: IDetails = {
    Title: "",
    ParentTitle: "",
  };

  const [commentText, setCommentText] = useState({
    isValid: true,
    isEdited: false,
    value: "",
  });
  const [additionaldetails, setadditionaldetails] =
    useState(_additionaldetails);
  const [joditContent, setJoditContent] = useState("");
  const [popupData, setpoupData] = useState(_popupData);
  const [error, seterror] = useState("");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const allowedImageExtensions = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "bmp",
    "svg",
    "webp",
  ];
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // This function is Quill onchange method
  const onChange = (key: any, text: any) => {
    if (text === "<p><br></p>") {
      console.log("shanmugaraj");
    } else if (text !== "<p><br></p>") {
      setJoditContent(text);
    }
    seterror("");
  };
  const headingonchange = (key: any, text: any) => {
    const _additionaldetails: any = { ...additionaldetails };
    _additionaldetails[key] = text;
    seterror("");
    setadditionaldetails({ ..._additionaldetails });
  };

  // This function is handle files  method
  const fnfiles = (files: any) => {
    const tempfiles: any = [];
    [...files].forEach((_file) => {
      tempfiles.push({
        name: _file.name,
        Type: "New",
        File: _file,
        Size: _file.size / 1024,
        type: _file.type,
      });
    });
    const imageUrl = URL.createObjectURL(files[0]);
    setImageSrc(imageUrl);
    setpoupData({
      ...popupData,
      Attachmentfiles: [...popupData.Attachmentfiles, ...tempfiles],
    });
    seterror("");
  };
  // This is file Validation Function Method
  const filevalidation = (event: any) => {
    const fileName = event.target.files[0].name;
    const extension: any = fileName.substring(fileName.lastIndexOf(".") + 1);
    if (allowedImageExtensions.some((item) => item === extension)) {
      fnfiles(event.target.files);
    } else {
      seterror("Only Images Upload");
    }
  };
  // This Function is Delete files Method
  const delfiles = (index: any) => {
    const _Attachmentfiles: any[] = [...popupData.Attachmentfiles];
    _Attachmentfiles.splice(index, 1);
    setpoupData({ ...popupData, Attachmentfiles: [..._Attachmentfiles] });
    seterror("");
  };
  // this overall validation
  const validation = () => {
    const matches = joditContent.replace(/<\/?p>/g, "");
    let error = "";
    if (popupData.Attachmentfiles.length === 0) {
      error = "Please Upload Images";
    } else if (additionaldetails.Title === "") {
      error = "Please Give Title";
    } else if (additionaldetails.ParentTitle === "") {
      error = "Please Give ParentTitle";
    } else if (matches.trim().length === 0) {
      error = "Please Fill Image Description";
    }

    return error;
  };
  // This is addmsg function method
  const addmsg = async () => {
    const error = validation();
    if (!error) {
      const _popupData = {
        ImageDescription: JSON.stringify(joditContent),
        BlogsHeading: additionaldetails.Title,
        BlogTitle: additionaldetails.ParentTitle,
      };
      addfilemsg(_popupData, popupData).then((response) => {
        props.resetstate();
      });
    } else {
      seterror(error);
    }
  };
  // This is Cancel Function Method
  const cancelstate = () => {
    setpoupData({
      ImageDescription: "",
      Attachmentfiles: [],
    });
    setJoditContent("");
    props.resetstate();
  };
  const onLoader = () => {
    console.log("shanmugaraj");
  };
  useEffect(() => {
    onLoader();
  }, []);
  return (
    <div>
      <div className={styles.blogbody}>
        <div className={styles.blogparentbox}>
          <div className={styles.blog}>
            <div
              className={styles.roundiconbutton}
              onClick={() => {
                props.resetstate();
              }}
            >
              <Icon iconName="SkypeArrow" className={styles.icon} />
            </div>
            <div>
              <h5>New Blog</h5>
            </div>
          </div>
          {/* This is File Inputs Method */}
          {popupData.Attachmentfiles.length === 0 ? (
            <div className={styles.fileuploadbox}>
              <div className={styles.fileuploadinbox}>
                <div className={styles.filedescriptionbox}>
                  <div>
                    <Icon
                      iconName="CloudUpload"
                      style={{
                        fontSize: "27px",
                        color: "#878787",
                      }}
                    />
                  </div>
                  <h4>Select a file or drag drop here</h4>
                  <h6>JPG,PNG,or PDF,file size no more than 10 MB</h6>
                </div>
                <div className={styles.inputbox}>
                  <div
                    className={styles["new-blog-button"]}
                    onClick={() => {
                      // document.getElementById("filetype").click(); // Programmatically click the hidden input
                    }}
                  >
                    <input
                      type="file"
                      id="filetype"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      onChange={(event: any) => {
                        seterror("");
                        // eslint-disable-next-line no-debugger
                        filevalidation(event);
                      }}
                    />
                    <span
                      onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.click();
                        }
                      }}
                    >
                      Select File
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={styles.fileuploadbox}
              style={{
                padding: "45px",
              }}
            >
              {imageSrc && (
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                  }}
                >
                  <img
                    src={imageSrc}
                    alt="Selected"
                    style={{
                      width: "330px",
                      height: "220px",
                      borderRadius: "68px",
                      objectFit: "cover",
                    }}
                  />
                  <Icon
                    iconName="Cancel"
                    className={styles.imageshowbox}
                    onClick={() => {
                      delfiles(0);
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div
        style={{
          marginTop: "20px",
        }}
        className={styles.quillbox}
      >
        <div style={{ display: "flex" }}>
          <InputText
            className={styles.inputbox}
            value={additionaldetails.Title}
            onChange={(e) => headingonchange("Title", e.target.value)} // Capture text input value
            placeholder="Title"
          />
          <InputText
            className={styles.inputbox}
            value={additionaldetails.ParentTitle}
            onChange={(e) => headingonchange("ParentTitle", e.target.value)} // Capture text input value
            placeholder="Parent Title"
          />
        </div>

        <div>
          {/* this is Quill Editor function method */}
          <QuillEditor
            onChange={(commentText: any) => {
              seterror("");
              onChange("ImageDescription", commentText);

              setCommentText((prev: any) => ({
                ...prev,
                isValid: true,
                value: commentText,
              }));
            }}
            value={joditContent}
            getMentionedEmails={(e: any) => {
              console.log("shanmugaraj");
            }}
            placeHolder={"Enter Comments and @ to mention..."}
            defaultValue={commentText.value}
          />
        </div>
        {/* this cancel submit button container */}
        <div className={styles.buttonbox}>
          <div className={styles.errorobj}>{error || ""}</div>
          <div className={styles.buttoninbox}>
            <div
              className={styles["new-blog-button"]}
              onClick={() => {
                cancelstate();
              }}
            >
              <button className={styles.cancelbutton}>Cancel</button>
            </div>
            <div
              className={styles["new-blog-button"]}
              onClick={() => {
                console.log("shanmugaraj");
              }}
            >
              <button
                className={styles.submitbutton}
                onClick={() => {
                  addmsg();
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AddingComponent;
