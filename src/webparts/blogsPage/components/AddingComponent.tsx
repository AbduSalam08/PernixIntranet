/* eslint-disable @typescript-eslint/no-floating-promises */
// /* eslint-disable no-// */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import "../../../assets/styles/Style.css";
import { toast, ToastContainer } from "react-toastify";

import styles from "./AddingComponent.module.scss";
import { Icon } from "@fluentui/react";
import QuillEditor from "../../../components/common/QuillEditor/QuillEditor";
import { addfilemsg } from "../../../services/BlogsPage/BlogsPageServices";
// import { InputText } from "primereact/inputtext";
import CustomInput from "../../../components/common/CustomInputFields/CustomInput";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
import {
  getintranettitle,
  getupdateintranettitle,
} from "../../../services/BlogsPage/BlogsPageServices";
import Popup from "../../../components/common/Popups/Popup";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../utils/popupUtils";
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
  const [objerror, setobjerror] = useState({
    Title: "",
    ParentTitle: "",
    Image: "",
    Quill: "",
  });
  const allowedImageExtensions = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "bmp",
    "svg",
    "webp",
  ];
  const [customInput, setcustomInput] = useState<boolean>(false);
  const [filteredSuggestions, setfilteredSuggestions] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [additionaldetails, setadditionaldetails] =
    useState(_additionaldetails);
  const [joditContent, setJoditContent] = useState("");
  const [popupData, setpoupData] = useState(_popupData);
  const [intraData, setIntraData] = useState<any>([]);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const initialPopupController: any = [
    {
      open: false,
      popupTitle: "",
      popupWidth: "720px",
      popupType: "custom",
      defaultCloseBtn: false,
      popupData: "",
      isLoading: {
        inprogress: false,
        error: false,
        success: false,
      },
      messages: {
        success: "blog added successfully!",
        error: "Something went wrong!",
        successDescription: "Blog added successfully.",
        errorDescription:
          "An error occured while addingBlog, please try again later.",
        inprogress: "Adding Blog, please wait...",
      },
    },
  ];

  const [popupController, setPopupController] = useState<any[]>(
    initialPopupController
  );

  const popupInputs: any[] = [[]];

  const popupActions: any[] = [[]];
  // This functino is OnLoaderFunction

  // This function is Quill onchange method
  const onChange = (key: any, text: any) => {
    if (text === "<p><br></p>") {
      console.log("");
    } else if (text !== "<p><br></p>") {
      setJoditContent(text);
    }
    setobjerror({
      Title: "",
      ParentTitle: "",
      Image: "",
      Quill: "",
    });
  };

  // this parenttitleonChange method
  const headingonchange = (key: any, text: any) => {
    const _additionaldetails: any = { ...additionaldetails };
    _additionaldetails[key] = text;
    setobjerror({
      Title: "",
      ParentTitle: "",
      Image: "",
      Quill: "",
    });
    setadditionaldetails({ ..._additionaldetails });
    if (key === "Title") {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      headingfilter(text);
    }
  };
  // this function heading autosuggesting function

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
    setobjerror({
      Title: "",
      ParentTitle: "",
      Image: "",
      Quill: "",
    });
  };
  // This is file Validation Function Method
  const filevalidation = (event: any) => {
    const fileName = event.target.files[0].name;
    const extension: any = fileName.substring(fileName.lastIndexOf(".") + 1);
    if (allowedImageExtensions.some((item) => item === extension)) {
      fnfiles(event.target.files);
    } else {
      setobjerror({
        Title: "",
        ParentTitle: "",
        Image: "Only image upload",
        Quill: "",
      });
    }
  };
  // This Function is Delete files Method
  const delfiles = (index: any) => {
    const _Attachmentfiles: any[] = [...popupData.Attachmentfiles];
    _Attachmentfiles.splice(index, 1);
    setpoupData({ ...popupData, Attachmentfiles: [..._Attachmentfiles] });
    setobjerror({
      Title: "",
      ParentTitle: "",
      Image: "",
      Quill: "",
    });
  };
  // this overall validation
  const validation = () => {
    const matches = joditContent.replace(/<\/?p>/g, "");
    const _objerror: any = { ...objerror };
    if (additionaldetails.Title === "") {
      _objerror.Title = "Please give tag";
    } else if (additionaldetails.Title.trim() === "") {
      _objerror.Title = "Please give tag";
    } else if (additionaldetails.ParentTitle === "") {
      _objerror.ParentTitle = "Please give title";
    } else if (additionaldetails.ParentTitle.trim() === "") {
      _objerror.ParentTitle = "Please give title";
    } else if (matches.trim().length === 0) {
      _objerror.Quill = "Please fill image description";
    } else if (popupData.Attachmentfiles.length === 0) {
      _objerror.Image = "Please upload image";
    } else if (Math.floor(popupData.Attachmentfiles[0].Size) > 10000) {
      _objerror.Image = "Image size no more than 10 MB";
    }
    //;
    return _objerror;
  };

  // This is addmsg function method
  const addmsg = async () => {
    //;
    const error = validation();
    //;
    let finderrorobj: boolean = false;
    for (const [key, value] of Object.entries(error)) {
      console.log("key: ", key);
      if (value !== "") {
        finderrorobj = true;
      }
    }
    if (finderrorobj !== true) {
      setIsLoading(true);
      const _popupData = {
        ImageDescription: joditContent,
        // ImageDescription: JSON.stringify(joditContent),
        BlogsHeading: additionaldetails.Title,
        BlogTitle: additionaldetails.ParentTitle,
        Status: "Pending",
      };
      addfilemsg(_popupData, popupData, setPopupController, 0)
        .then((response) => {
          setIsLoading(false);
          props.resetstate();
        })
        .catch((err) => {
          setIsLoading(false);

          props.resetstate();

          toast.update("test", {
            render: "Error while Adding Block. Please try again.",
            type: "error",
            isLoading: false,
            autoClose: 5000,
            hideProgressBar: false,
          });

          console.log(err);
        });
    } else {
      setobjerror({ ...error });
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

  // This function is get intranettitle
  const intranettitle = async () => {
    await getintranettitle().then((arr) => {
      const tempdata: any = [];
      arr.forEach((item: any) => {
        tempdata.push({
          AutoTitle: item.IntranetTitle ? item.IntranetTitle : "",
        });
      });
      setIntraData([...tempdata]);
    });
  };
  const onLoader = () => {
    intranettitle();
  };
  const headingfilter = async (text: string) => {
    //;
    const findtext = text.toLowerCase().toString();
    let _intranetdata: any = [...intraData];
    debugger;
    if (_intranetdata.length > 0) {
      _intranetdata = _intranetdata.filter((item: any) =>
        item.AutoTitle.includes(findtext)
      );
      if (_intranetdata.length > 0) {
        setfilteredSuggestions([..._intranetdata]);
      } else if (text.length >= 3) {
        await getupdateintranettitle(text).then((item) => {
          onLoader();
        });
      }
    } else {
      await getupdateintranettitle(text).then((item) => {
        onLoader();
      });
    }
  };

  useEffect(() => {
    onLoader();
  }, []);
  return (
    <div>
      {isLoading ? (
        <div className={styles.LoaderContainer}>
          <CircularSpinner />
        </div>
      ) : (
        <div>
          <div className={styles.blogbody}>
            <div className={styles.blogparentbox}>
              <div className={styles.blog}>
                <div
                  // className={styles.roundiconbutton}
                  onClick={() => {
                    props.resetstate();
                  }}
                >
                  <i
                    className="pi pi-arrow-circle-left"
                    style={{ fontSize: "1.2rem", color: "#E0803D" }}
                  />
                </div>
                <div>
                  <h5
                    style={{
                      fontSize: "15px",
                    }}
                  >
                    New blog
                  </h5>
                </div>
              </div>
              {/* This is File Inputs Method */}
              <div style={{ color: "parenttitle" }}>
                <div className={styles.inputparentbox}>
                  <div
                    className={styles.inputfoucsbox}
                    onMouseMove={(e) => {
                      setcustomInput(true);
                    }}
                    onMouseLeave={(e) => {
                      setcustomInput(false);
                    }}
                  >
                    <CustomInput
                      onChange={(value) => {
                        if (value.length < 250) {
                          headingonchange("Title", value);
                        } else if (value.length >= 250) {
                          setobjerror({
                            Title:
                              "The title may contain up to 250 characters.",
                            ParentTitle: "",
                            Image: "",
                            Quill: "",
                          });
                        }
                      }}
                      errorMsg={objerror.Title || ""}
                      value={additionaldetails.Title}
                      inputWrapperClassName={styles.pathSearchFilter}
                      size="SM"
                      placeholder="Tag"
                    />
                    {filteredSuggestions.length > 0 && customInput && (
                      <ul className={styles.suggestionlist}>
                        {filteredSuggestions.map(
                          (suggestion: any, index: number) => {
                            // //;
                            return (
                              <li
                                key={index}
                                onClick={() => {
                                  setadditionaldetails({
                                    ...additionaldetails,
                                    Title: suggestion.AutoTitle,
                                  });
                                  // headingonchange(
                                  //   "Title",
                                  //   suggestion.AutoTitle
                                  // );
                                }}
                                className={styles.suggestionitem}
                              >
                                {suggestion.AutoTitle}
                              </li>
                            );
                          }
                        )}
                      </ul>
                    )}
                  </div>
                  <div style={{ width: "49%" }}>
                    <CustomInput
                      onChange={(e) => {
                        if (e.length < 250) {
                          headingonchange("ParentTitle", e);
                        } else {
                          setobjerror({
                            Title:
                              "The parent title may contain up to 250 characters.",
                            ParentTitle: "",
                            Image: "",
                            Quill: "",
                          });
                        }
                      }}
                      errorMsg={objerror.ParentTitle || ""}
                      value={additionaldetails.ParentTitle}
                      inputWrapperClassName={styles.pathSearchFilter}
                      size="SM"
                      placeholder="Title"
                    />
                  </div>
                </div>
                <div className={styles.quillparentbox}>
                  {/* this is Quill Editor function method */}
                  <QuillEditor
                    onChange={(commentText: any) => {
                      setobjerror({
                        Title: "",
                        ParentTitle: "",
                        Image: "",
                        Quill: "",
                      });
                      onChange("ImageDescription", commentText);

                      setCommentText((prev: any) => ({
                        ...prev,
                        isValid: true,
                        value: commentText,
                      }));
                    }}
                    value={joditContent}
                    getMentionedEmails={(e: any) => {
                      // console.log("shanmugaraj");
                    }}
                    placeHolder={"Enter Comments..."}
                    defaultValue={commentText.value}
                  />
                  <label className={styles.errorlabel}>
                    {objerror.Quill || ""}
                  </label>
                </div>
                <div className={styles.fileuploadparentbox}>
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
                          <h6>JPG,PNG or JPEG size no more than 10 MB</h6>
                        </div>
                        <div
                          className={styles.inputbox}
                          onClick={() => {
                            if (fileInputRef.current) {
                              fileInputRef.current.click();
                            }
                          }}
                        >
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
                                setobjerror({
                                  Title: "",
                                  ParentTitle: "",
                                  Image: "",
                                  Quill: "",
                                });

                                filevalidation(event);
                              }}
                            />
                            <span>Select file</span>
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
                              borderRadius: "10px",
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
                  <label className={styles.errorlabel}>
                    {objerror.Image || ""}
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div
            style={{
              marginTop: "20px",
            }}
            className={styles.quillbox}
          >
            {/* this cancel submit button container */}
            <div className={styles.buttonbox}>
              {/* <div className={styles.errorobj}>
            {objerror.Quill
              ? objerror.Quill
              : objerror.Image
              ? objerror.Image
              : ""}
          </div> */}
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
                  // onClick={() => {
                  //   console.log("shanmugaraj");
                  // }}
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
      )}

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {popupController?.map((popupData: any, index: number) => (
        <Popup
          key={index}
          isLoading={popupData?.isLoading}
          messages={popupData?.messages}
          resetPopup={() => {
            setPopupController((prev: any): any => {
              resetPopupController(prev, index, true);
            });
          }}
          PopupType={popupData.popupType}
          onHide={() => {
            togglePopupVisibility(
              setPopupController,
              initialPopupController[index],
              index,
              "close"
            );
            if (popupData?.isLoading?.success) {
              // setIsile(false);
              // getAllNewsData(dispatch);
            }
            // resetFormData(formData, setFormData);
          }}
          popupTitle={
            popupData.popupType !== "confimation" && popupData.popupTitle
          }
          popupActions={popupActions[index]}
          visibility={popupData.open}
          content={popupInputs[index]}
          popupWidth={popupData.popupWidth}
          defaultCloseBtn={popupData.defaultCloseBtn || false}
          confirmationTitle={
            popupData?.confirmationTitle
            // popupData.popupType !== "custom" ? popupData.popupTitle : ""
          }
          popupHeight={index === 0 ? true : false}
          noActionBtn={true}
        />
      ))}
    </div>
  );
}
export default AddingComponent;
