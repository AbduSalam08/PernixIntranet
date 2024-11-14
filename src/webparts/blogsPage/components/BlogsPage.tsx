/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
// /* eslint-disable no-// */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import "../../../assets/styles/Style.css";
import { sp } from "@pnp/sp/presets/all";
import styles from "./BlogsPage.module.scss";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
import {
  Icon,
  SearchBox,
  ISearchBoxStyles,
  Persona,
  PersonaSize,
  PersonaPresence,
} from "@fluentui/react";
// import styles from "../../../components/common/CustomInputFields/Inputs.module.scss";
import AddingComponent from "./AddingComponent";
import ViewComponent from "./ViewComponent";
import {
  addlikemethod,
  Approved,
  // Approved,
  getintername,
  nooneviews,
  otheruserdetails,
  permissionhandling,
  usergetdetails,
  viewLikes,
} from "../../../services/BlogsPage/BlogsPageServices";
import CustomDropDown from "../../../components/common/CustomInputFields/CustomDropDown";
import { Checkbox } from "office-ui-fabric-react";
import Popup from "../../../components/common/Popups/Popup";
import { togglePopupVisibility } from "../../../utils/popupUtils";

// import CustomInput from "../../../components/common/CustomInputFields/CustomInput";
const emptyfile = require("../assets/EmptyFile.jpg");
const BlogsPage = (props: any): JSX.Element => {
  const initialPopupController = [
    {
      open: false,
      popupTitle: "Confirmation",
      popupWidth: "450px",
      popupType: "confirmation",
      defaultCloseBtn: false,
      confirmationTitle: "Are you sure want to Approved This Blog?",
      popupData: "",
      isLoading: {
        inprogress: false,
        error: false,
        success: false,
      },
      messages: {
        success: "News Deleted successfully!",
        error: "Something went wrong!",
        successDescription: "The new news 'ABC' has been Deleted successfully.",
        errorDescription:
          "An error occured while Deleting news, please try again later.",
        inprogress: "Deleting new news, please wait...",
      },
    },
  ];
  const [popupController, setPopupController] = useState(
    initialPopupController
  );
  const popupActions: any = [
    [
      {
        text: "Cancel",
        btnType: "darkGreyVariant",
        disabled: false,
        endIcon: false,
        startIcon: false,
        size: "large",
        onClick: () => {
          const _popupcontroller = [...popupController];
          _popupcontroller[0].open = false;
          setPopupController([..._popupcontroller]);
        },
      },
      {
        text: "Approved",
        btnType: "primaryGreen",
        endIcon: false,
        startIcon: false,
        size: "large",
        onClick: async () => {
          const findarray = data.find((item: any) => item.Id === Updateid);
          // eslint-disable-next-line no-debugger
          debugger;
          Approverfunc(findarray.Id, findarray.UserStatus);
        },
      },
    ],
  ];
  const poersonaStyles = {
    root: {
      display: "revert",
    },
  };

  const searchBoxStyle: Partial<ISearchBoxStyles> = {
    root: {
      padding: "0 10px",
      fontSize: 16,
      width: "100%",
      border: "1px solid rgb(187 186 186) !important",
      // ".ms-SearchBox": {
      //   border: "1px solid #c5c1c1 !important",
      // },
      // ":hover": {
      //   borderColor: "none",
      // },
      ".ms-SearchBox-icon": {
        fontWeight: 900,
        color: "rgb(151 144 155) !important",
      },
      "::after": {
        border: "none !important",
        backgrounColor: "white",
      },
      ".ms-Button-flexContainer": {
        background: "transparent",
      },
      // ".ms-Button": {
      //   ":hover": {
      //     background: "transparent",
      //   },
      // },
    },
  };
  // const [filtervalue, setfiltervalue] = useState("");
  const [data, setdata] = useState<any>([]);
  const [duplicatedata, setduplicatedata] = useState<any>([]);
  const [curuser, setcuruser] = useState<any>({
    Id: null,
    Email: "",
    Title: "",
  });
  const [Updateid, setupdateid] = useState<any>(null);
  console.log(Updateid);
  // This  State Admin Change Drop Down Value
  // const [approverStatus, setApproverStatus] = useState<any>("");
  const [permission, setpermission] = useState("");
  const [choices, setchoices] = useState<any>(["All"]);
  const [choicevalue, setchoicevalue] = useState("");
  const [viewitem, setviewitem] = useState("");
  const [viewpage, setviewpage] = useState(false);
  const [isopen, setisopen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // This is Usergetdetails Method

  const getdetails = async (): Promise<void> => {
    await usergetdetails().then((arr) => {
      const tempdata: any = [];
      arr.forEach((item: any) => {
        tempdata.push({
          Id: item.Id,
          Title: item.BlogsHeading,
          ParentTitle: item.BlogTitle,
          Paragraph: item.ImageDescription
            ? JSON.parse(item.ImageDescription)
            : "",
          Author: {
            Id: item.Author && item.Author ? item.Author.ID : null,
            Email: item.Author ? item.Author.EMail : "",
            Title: item.Author ? item.Author.Title : "",
          },
          UserStatus: "",
          Status: item.Status ? item.Status : "",
          img: item.AttachmentFiles.map(
            (attachment: any) => attachment.ServerRelativeUrl
          ).join(""),
          userDetails: item.UserLikes ? JSON.parse(item.UserLikes) : [],
          viewDetails: item.ViewPerson ? JSON.parse(item.ViewPerson) : [],
        });
      });
      setdata([...tempdata]);
      setduplicatedata([...tempdata]);
    });
  };
  const othermemberdetails = async (): Promise<void> => {
    await otheruserdetails().then((arr) => {
      const tempdata: any = [];
      arr.forEach((item: any) => {
        tempdata.push({
          Id: item.Id,
          Title: item.BlogsHeading,
          ParentTitle: item.BlogTitle,
          Paragraph: item.ImageDescription
            ? JSON.parse(item.ImageDescription)
            : "",
          Author: {
            Id: item.Author && item.Author ? item.Author.ID : null,
            Email: item.Author ? item.Author.EMail : "",
            Title: item.Author ? item.Author.Title : "",
          },
          Status: item.Status ? item.Status : "",
          img: item.AttachmentFiles.map(
            (attachment: any) => attachment.ServerRelativeUrl
          ).join(""),
          userDetails: item.UserLikes ? JSON.parse(item.UserLikes) : [],
          viewDetails: item.ViewPerson ? JSON.parse(item.ViewPerson) : [],
        });
      });
      setdata([...tempdata]);
    });
  };
  // This is addlikemethod function
  const addLikeMethod = async (Id: number, userDetails: any): Promise<any> => {
    let additionaluserDetails: any = [];
    if (userDetails === undefined || userDetails.length === 0) {
      additionaluserDetails.push({
        UserId: curuser.Id,
        UserClick: true,
      });
    } else if (userDetails.length) {
      additionaluserDetails = [...userDetails];
      let userFound = false;
      additionaluserDetails = additionaluserDetails.map((arr: any) => {
        if (arr.UserId === curuser.Id) {
          userFound = true;
          return { ...arr, UserClick: !arr.UserClick };
        }
        return arr;
      });
      if (!userFound) {
        additionaluserDetails.push({
          UserId: curuser.Id,
          UserClick: true,
        });
      }
    }
    const addingdetails: any = JSON.stringify(additionaluserDetails);
    await addlikemethod(Id, addingdetails, onLoadingFunc);
  };
  // This is ViewLike Method function
  async function viewLikemethod(Id: number, userDetails: any, item: any) {
    //;
    let additionaluserDetails: any = [];
    if (userDetails === undefined || userDetails.length === 0) {
      additionaluserDetails.push({
        UserId: curuser.Id,
        UserClick: true,
      });

      await nooneviews(
        Id,
        additionaluserDetails,
        setviewitem,
        setviewpage,
        onLoadingFunc,
        item
      );
    } else if (userDetails.length) {
      additionaluserDetails = [...userDetails];
      const finduser: any[] = additionaluserDetails.filter(
        (item: any) => item.UserId === curuser.Id
      );
      if (finduser.length > 0) {
        setviewitem(item);
        setviewpage(true);
      } else {
        additionaluserDetails.push({
          UserId: curuser.Id,
          UserClick: true,
        });
        const addingdetails: any = JSON.stringify(additionaluserDetails);
        await viewLikes(
          Id,
          addingdetails,
          item,
          onLoadingFunc,
          setviewitem,
          setviewpage
        );
      }
    }
    await nooneviews(
      Id,
      additionaluserDetails,
      setviewitem,
      setviewpage,
      onLoadingFunc,
      item
    );
  }
  const resetstate = async () => {
    setisopen(false);
    setIsLoading(false);
    setchoices(["All"]);
    setviewpage(false);

    getcurrentuser();
  };
  // This Functino Admin Change The Status
  const approverStatusFunc = (value: string, Id: number) => {
    let _data = [...data];
    _data = _data.map((item) => {
      if (item.Id === Id) {
        return {
          ...item,
          UserStatus: value,
        };
      }

      return item;
    });
    setdata([..._data]);
  };
  const onLoadingFunc = async (user: any): Promise<void> => {
    let _userpermission: string = "";
    await permissionhandling().then(async (arr) => {
      if (arr?.some((item) => item.Email === user.Email)) {
        _userpermission = "Admin";
        setpermission(_userpermission);
      } else {
        _userpermission = "OtherUser";
        setpermission(_userpermission);
      }
      getintername()
        .then((arr: any) => {
          const temp: { key: any; text: any }[] = [];

          arr.Choices.map((item: any) => {
            temp.push(item);
          });
          setchoices([...choices, ...temp]);
        })
        .catch((error) => {
          console.error("Error retrieving internal names:", error);
        });
      if (_userpermission === "Admin") {
        getdetails();
      } else {
        othermemberdetails();
      }
    });
  };
  // Approver Status Change Function
  const Approverfunc = async (
    Id: number,
    statusValue: string
  ): Promise<any> => {
    try {
      await Approved(Id, statusValue);
      debugger;
      const _popupcontroller = [...popupController];
      _popupcontroller[0].open = false;
      setPopupController([..._popupcontroller]);
    } catch (error) {
      console.error("Error fetching approvers:", error);
    }
    resetstate();
  };

  const stausfilter = (tstatus: any) => {
    let _data = [...duplicatedata];
    if (tstatus !== "All") {
      _data = _data.filter((item) => item.Status === tstatus);
    }

    setdata([..._data]);
    setchoicevalue(tstatus);
  };
  // This is Currentuser Details
  const getcurrentuser = async (): Promise<void> => {
    sp.web.currentUser.get().then((arr) => {
      setcuruser({
        ...curuser,
        Id: arr.Id,
        Email: arr.Email,
        Title: arr.Title,
      });
      onLoadingFunc(arr);
    });
  };
  useEffect(() => {
    resetstate();
  }, []);

  return (
    <div className={styles.container}>
      {isLoading ? (
        <div className={styles.LoaderContainer}>
          <CircularSpinner />
        </div>
      ) : isopen ? (
        <AddingComponent resetstate={resetstate} />
      ) : viewpage ? (
        <div>
          <ViewComponent viewitem={viewitem} resetstate={resetstate} />
        </div>
      ) : (
        <div className={styles.blogbody}>
          <div className={styles.blogparentbox}>
            <div className={styles.blogarrowcontainer}>
              {/* Optional Icon and Blog Header code here */}
            </div>
            <div>
              {/* Blogs Heading Section */}
              {permission === "Admin" && (
                <div className={styles.adminbox}>
                  <h3>Admin Component</h3>
                  <h6>{`${permission}:${curuser.Title}`}</h6>
                </div>
              )}
              <div className={styles.bloginbox}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <div className={styles.blog}>
                    <div
                      className={styles.roundiconbutton}
                      style={{ cursor: "pointer" }}
                    >
                      <Icon iconName="SkypeArrow" className={styles.icon} />
                    </div>
                    <div>
                      <h5>Blogs</h5>
                    </div>
                  </div>
                  {permission === "Admin" ? (
                    <div>
                      <CustomDropDown
                        value={choicevalue}
                        options={choices}
                        placeholder="Status"
                        onChange={(value) => {
                          stausfilter(value);
                        }}
                      />
                    </div>
                  ) : null}
                </div>

                <div className={styles.searchboxcontainer}>
                  <SearchBox
                    placeholder="Search..."
                    styles={searchBoxStyle}
                    onChange={(e, value) => console.log("shanmugaraj")}
                  />
                  <div>
                    <div
                      className={styles["new-blog-button"]}
                      onClick={() => setisopen(true)}
                    >
                      <Icon iconName="Add" className={styles.Addicon} />
                      <span>New Blog</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blogs Container Section */}
              <div className={styles.blogcontainer}>
                <div
                  className={styles.blogmaincontainer}
                  style={{
                    ...(data.length === 0
                      ? {
                          alignItems: "center",
                          justifyContent: "center",
                          display: "flex",
                          height: "64vh",
                        }
                      : {}),
                  }}
                >
                  {data.length > 0 ? (
                    data.map((item: any, index: number) => {
                      // const checkStatus =
                      //   item.Status === "Approved" ? true : false;
                      const totaluserlikescount = item.userDetails.filter(
                        (arr: any) => arr.UserClick === true
                      ).length;
                      const curuserlikes = item.userDetails.some(
                        (arr: any) => arr.UserId === curuser.Id && arr.UserClick
                      );
                      const userviewcounts = item.viewDetails?.length || 0;

                      return (
                        <div className={styles.smallcontainer} key={index}>
                          <div className={styles.inbox}>
                            <div className={styles.imgbox}>
                              <img src={item.img} alt="Blog" />
                            </div>
                            <div className={styles.contenttitle}>
                              <h4>{item.Title}</h4>
                              <div className={styles.parenttitle}>
                                <h3>{item.ParentTitle}</h3>
                                <Icon
                                  iconName="ArrowUpRight8"
                                  className={styles.Arrowupicon}
                                  onClick={() =>
                                    viewLikemethod(
                                      item.Id,
                                      item.viewDetails,
                                      item
                                    )
                                  }
                                />
                              </div>
                              <div
                                className={styles.paragraph}
                                dangerouslySetInnerHTML={{
                                  __html: item.Paragraph,
                                }}
                              />
                              <div className={styles.approversection}>
                                <div>
                                  <label
                                    style={{
                                      color:
                                        item.Status === "Approved"
                                          ? "green"
                                          : item.Status === "Pending"
                                          ? "red"
                                          : "red",
                                      fontWeight: "500",
                                    }}
                                  >
                                    {item.Status}
                                  </label>
                                </div>
                                <div className={styles.checkbox}>
                                  <div>
                                    {permission === "Admin" ? (
                                      <div>
                                        <CustomDropDown
                                          value={item.UserStatus}
                                          options={choices}
                                          floatingLabel={false}
                                          placeholder="Status"
                                          onChange={(value) => {
                                            approverStatusFunc(value, item.Id);
                                          }}
                                          highlightDropdown={true}
                                          size="SM"
                                          width={"150px"}
                                        />
                                      </div>
                                    ) : null}
                                  </div>
                                  <Checkbox
                                    checked={
                                      item.UserStatus === ""
                                        ? false
                                        : item.UserStatus !== item.Status
                                        ? false
                                        : true
                                    }
                                    onChange={(event: any) => {
                                      if (item.UserStatus !== item.Status) {
                                        setupdateid(item.Id);
                                        const _popupcontroller = [
                                          ...popupController,
                                        ];
                                        _popupcontroller[0].open = true;
                                        setPopupController([
                                          ..._popupcontroller,
                                        ]);
                                      } else {
                                        console.log("Shanmugaraj");
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className={styles.footercontainer}>
                              <div className={styles.peoplebox}>
                                <div>
                                  <Persona
                                    showOverflowTooltip
                                    styles={poersonaStyles}
                                    size={PersonaSize.size40}
                                    presence={PersonaPresence.none}
                                    showInitialsUntilImageLoads
                                    imageUrl={`/_layouts/15/userphoto.aspx?size=S&username=${item.Author?.Email}`}
                                  />
                                </div>
                                <div className={styles.namediv}>
                                  <h5>{item.Author?.Title}</h5>
                                  <h5 className={styles.datediv}>
                                    17 Jan 2022
                                  </h5>
                                </div>
                              </div>
                              <div className={styles.likecontainer}>
                                <div className={styles.likebox}>
                                  <Icon
                                    iconName="LikeSolid"
                                    style={{
                                      color: curuserlikes
                                        ? "#0a4b48"
                                        : "#b3b0b0",
                                    }}
                                    className={styles.likeicon}
                                    onClick={() =>
                                      addLikeMethod(item.Id, item.userDetails)
                                    }
                                  />
                                  <label style={{ cursor: "auto" }}>
                                    {totaluserlikescount || "0"}
                                  </label>
                                </div>
                                <div className={styles.eyecontainer}>
                                  <Icon
                                    iconName="RedEye12"
                                    className={styles.eyeicon}
                                  />
                                  <label style={{ cursor: "auto" }}>
                                    {userviewcounts || "0"}
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className={styles.emptyfile}>
                      <img src={emptyfile} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {popupController?.map((popupData: any, index: number) => (
        <Popup
          popupCustomBgColor="#fff"
          key={index}
          isLoading={popupData?.isLoading}
          messages={popupData?.messages}
          PopupType={popupData.popupType}
          onHide={() => {
            togglePopupVisibility(
              setPopupController,
              initialPopupController[0],
              index,
              "close"
            );
            // resetFormData(formData, setFormData);
          }}
          popupTitle={
            popupData.popupType !== "confimation" && popupData.popupTitle
          }
          popupActions={popupActions[index]}
          visibility={popupData.open}
          // content={popupInputs[index]}
          popupWidth={popupData.popupWidth}
          defaultCloseBtn={popupData.defaultCloseBtn || false}
          confirmationTitle={popupData?.confirmationTitle}
          popupHeight={index === 0 ? true : false}
          noActionBtn={true}
        />
      ))}
    </div>
  );
};

export default BlogsPage;
