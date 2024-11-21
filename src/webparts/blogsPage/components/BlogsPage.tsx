/* eslint-disable guard-for-in */
/* eslint-disable dot-notation */
// /* eslint-disable no-// */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
// /* eslint-disable no-// */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import "../../../assets/styles/Style.css";
import styles from "./BlogsPage.module.scss";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
import {
  Icon,
  SearchBox,
  ISearchBoxStyles,
  Persona,
  PersonaSize,
  PersonaPresence,
  // IconButton,
} from "@fluentui/react";
// import styles from "../../../components/common/CustomInputFields/Inputs.module.scss";
import AddingComponent from "./AddingComponent";
import ViewComponent from "./ViewComponent";
import {
  addlikemethod,
  Approved,
  getcuruserdetails,
  // Approved,
  getintername,
  nooneviews,
  // otheruserdetails,
  permissionhandling,
  usergetdetails,
  viewLikes,
} from "../../../services/BlogsPage/BlogsPageServices";
// import CustomDropDown from "../../../components/common/CustomInputFields/CustomDropDown";
// import { Checkbox } from "office-ui-fabric-react";
import Popup from "../../../components/common/Popups/Popup";
import { togglePopupVisibility } from "../../../utils/popupUtils";
import moment from "moment";
import {
  // ThumbUpAltOutlined
  VisibilityOutlined,
} from "@mui/icons-material";
import _ from "lodash";
import { CONFIG } from "../../../config/config";
// import { arrayIncludes } from "@mui/x-date-pickers/internals/utils/utils";
// import CustomInput from "../../../components/common/CustomInputFields/CustomInput";

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
        text: "Reject",
        btnType: "darkGreyVariant",
        disabled: false,
        endIcon: false,
        startIcon: false,
        size: "large",
        onClick: () => {
          // const updatedData = data.map((item: any) => {
          //   if (item.Id === Updateid) {
          //     return {
          //       ...item,
          //       UserStatus: "",
          //     };
          //   }
          //   return item;
          // });

          // setdata(updatedData);

          // const _popupcontroller = [...popupController];
          // _popupcontroller[0].open = false;
          // setPopupController([..._popupcontroller]);
          const findarray = data.find((item: any) => item.Id === Updateid);
          Approverfunc(findarray.Id, "Rejected");
        },
      },
      {
        text: "Approve",
        btnType: "primaryGreen",
        endIcon: false,
        startIcon: false,
        size: "large",
        onClick: async () => {
          const findarray = data.find((item: any) => item.Id === Updateid);
          Approverfunc(findarray.Id, "Approved");
        },
      },
    ],
  ];
  // const [duplicatefilter, setduplicatefilter] = useState<any>([]);
  // console.log(duplicatefilter);
  const [data, setdata] = useState<any>([]);
  const [admindata, setadmindata] = useState<any>([]);
  const [duplicatedata, setduplicatedata] = useState<any>([]);
  const [curuser, setcuruser] = useState<any>({
    Id: null,
    Email: "",
    Title: "",
  });
  const [allBlogs, setAllBlogs] = useState("AllBlogs");

  // const [checkbox, setcheckbox] = useState(false);
  const [Updateid, setupdateid] = useState<any>(null);
  console.log(Updateid);
  const [permission, setpermission] = useState("");
  const [choices, setchoices] = useState<any>(["All"]);
  const [filterkey, setfilterkey] = useState({
    _status: "",
    _gsearch: "",
  });
  // const [additionalfilterkey, setadditionalfilterkey] = useState({
  //   _status: "",
  // });

  const [viewitem, setviewitem] = useState("");
  const [viewpage, setviewpage] = useState(false);
  const [isopen, setisopen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const searchBoxStyle: Partial<ISearchBoxStyles> = {
    root: {
      padding: "0 10px",
      fontSize: 16,
      width: "100%",
      borderRadius: "6px",
      border: "none !important",

      ".ms-SearchBox-icon": {
        fontWeight: 900,
        color: "rgb(151 144 155) !important",
      },
      ".ms-SearchBox": {
        border: "none !important",
      },
      "::after": {
        border: "none !important",
        backgrounColor: "white",
      },
      ".ms-Button-flexContainer": {
        background: "transparent",
      },
    },
  };
  const poersonaStyles = {
    root: {
      display: "revert",
    },
  };

  // function algorithmfilterfunction(value: string) {
  //   const _newdata = [...duplicatefilter];
  //   const newdata = [];
  //   if (value.length) {
  //     for (let i = 0; i < _newdata.length; i++) {
  //       const matches = _newdata[i].Searchstring.includes(value.toLowerCase());
  //       if (matches === true) {
  //         newdata.push(_newdata[i]);
  //       }
  //     }
  //     letnewfilterdata(newdata);
  //   } else {
  //     const _duplicatedata = [...duplicatedata];
  //     setdata([..._duplicatedata]);
  //   }
  // }

  // function letnewfilterdata(data: any) {
  //   // eslint-disable-next-line no-debugger
  //   debugger;
  //   const newdata: any = [];
  //   const _duplicatedata = [...duplicatedata];
  //   _duplicatedata.filter((arr) => {
  //     if (data.some((newItem: any) => newItem.Id === arr.Id)) {
  //       newdata.push(arr);
  //     }
  //   });
  //   setdata([...newdata]);
  // }

  // this function is Approver Details/ get userDetails in Intranet_Blogs
  const getdetails = async (_userpermission: string): Promise<void> => {
    await usergetdetails().then((arr) => {
      console.log(arr);
      const tempdata: any = [];
      arr.forEach((item: any) => {
        tempdata.push({
          Id: item.Id,
          Title: item.BlogsHeading,
          ParentTitle: item.BlogTitle,
          Paragraph: item.ImageDescription
            ? JSON.parse(item.ImageDescription)
            : "",
          Created: item.Created
            ? moment(item.Created).format("DD/MM/YYYY")
            : null,
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
      setadmindata([...tempdata]);
      if (_userpermission === "Admin") {
        const _filterdata = tempdata.filter(
          (_admin: any) => _admin.Status === "Approved"
        );
        _filterdata.sort((a: any, b: any) => b.Id - a.Id);
        setdata([..._filterdata]);
        setduplicatedata([..._filterdata]);
      } else {
        const _filterdata = tempdata.filter(
          (_admin: any) => _admin.Status === "Approved"
        );
        _filterdata.sort((a: any, b: any) => b.Id - a.Id);
        // const additionaldata: { Id: any; Searchstring: string }[] = [];
        // _filterdata.map((_reitem: any) => {
        //   let newstring = "";
        //   for (const newitem in _reitem) {
        //     if (
        //       typeof _reitem[newitem] === "string" ||
        //       typeof _reitem[newitem] === "number"
        //     ) {
        //       newstring += `  ${_reitem[newitem]}`;
        //     }
        //   }

        //   // eslint-disable-next-line no-debugger
        //   debugger;
        //   additionaldata.push({
        //     Id: _reitem.Id,
        //     Searchstring: newstring.toLowerCase(),
        //   });
        // });
        // setduplicatefilter([...additionaldata]);
        setdata([..._filterdata]);
        setduplicatedata([..._filterdata]);
      }
    });
  };
  // this function is Other Member Details/ get userDetails in Intranet_Blogs
  // const othermemberdetails = async (): Promise<void> => {
  //   await otheruserdetails().then((arr) => {
  //     console.log(arr);
  //     const tempdata: any = [];
  //     arr.forEach((item: any) => {
  //       tempdata.push({
  //         Id: item.Id,

  //         Created: item.Created
  //           ? moment(item.Created).format("DD/MM/YYYY")
  //           : null,

  //         Title: item.BlogsHeading,
  //         ParentTitle: item.BlogTitle,
  //         Paragraph: item.ImageDescription
  //           ? JSON.parse(item.ImageDescription)
  //           : "",
  //         Author: {
  //           Id: item.Author && item.Author ? item.Author.ID : null,
  //           Email: item.Author ? item.Author.EMail : "",
  //           Title: item.Author ? item.Author.Title : "",
  //         },
  //         Status: item.Status ? item.Status : "",
  //         img: item.AttachmentFiles.map(
  //           (attachment: any) => attachment.ServerRelativeUrl
  //         ).join(""),
  //         userDetails: item.UserLikes ? JSON.parse(item.UserLikes) : [],
  //         viewDetails: item.ViewPerson ? JSON.parse(item.ViewPerson) : [],
  //       });
  //     });
  //     tempdata.sort((a: any, b: any) => b.Id - a.Id);
  //     setdata([...tempdata]);
  //     setduplicatedata([...tempdata]);
  //   });
  // };
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
    resetstate();
  };
  // This is ViewLike Method function
  const viewLikemethod = async (Id: number, userDetails: any, item: any) => {
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
    // resetstate()
  };
  // This function is resetstate function
  const resetstate = async () => {
    setisopen(false);
    setIsLoading(false);
    setchoices(["All"]);
    setviewpage(false);
    setfilterkey({
      _status: "",
      _gsearch: "",
    });
    setAllBlogs("AllBlogs");
    getcurrentuser();
  };
  // This Functino Admin Change The Status
  // const approverStatusFunc = (value: string, Id: number) => {
  //   let _data = [...data];
  //   _data = _data.map((item) => {
  //     if (item.Id === Id) {
  //       return {
  //         ...item,
  //         UserStatus: value,
  //       };
  //     }

  //     return item;
  //   });
  //   setdata([..._data]);
  // };
  // This is the OnLoadingFunc
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
      // Unwanted Code
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
      // if (_userpermission === "Admin") {
      getdetails(_userpermission);
      // } else {
      //   othermemberdetails();
      // }
    });
  };
  // Approver Status Change Function
  const Approverfunc = async (
    Id: number,
    statusValue: string
  ): Promise<any> => {
    try {
      // eslint-disable-next-line no-debugger
      debugger;
      await Approved(Id, statusValue);
      //;
      const _popupcontroller = [...popupController];
      _popupcontroller[0].open = false;
      setPopupController([..._popupcontroller]);
    } catch (error) {
      console.error("Error fetching approvers:", error);
    }
    resetstate();
  };
  // This is The Filterfunction of Blogs Details
  const filterOnchangehandler = (key: string, text: any) => {
    const _filterkey: any = { ...filterkey };
    _filterkey[key] = text;
    filterfunction(_filterkey, text);
  };
  const filterfunction = (key: any, value: any) => {
    let _data = [...duplicatedata];
    if (value !== "All" && key._gsearch && key._gsearch.trim() !== "") {
      const _search = key._gsearch.toLowerCase().toString().trim();
      _data = _data.filter((item) => {
        return (
          (item.Title && item.Title.toLowerCase().trim().includes(_search)) ||
          (item.ParenTitle &&
            item.ParentTitle.trim().toLowerCase().includes(_search))
        );
      });
    }
    if (value !== "All" && key._status && key._status !== "All") {
      _data = _data.filter(
        (item) => item.Status && item.Status === key._status
      );
    }
    if (value !== "All") {
      setfilterkey({ ...key });
      setdata([..._data]);
    } else if (value === "All") {
      setfilterkey({
        _status: "All",
        _gsearch: "",
      });
      setdata([..._data]);
    }
  };

  // This is Currentuser Details
  const getcurrentuser = async (): Promise<void> => {
    await getcuruserdetails().then((arr) => {
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
              <div className={styles.bloginbox}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <div className={styles.blog}>
                    <div
                      className={styles.roundiconbutton}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        window.open(
                          props.context.pageContext.web.absoluteUrl +
                            CONFIG.NavigatePage.PernixIntranet,
                          "_self"
                        );
                      }}
                    >
                      <Icon iconName="SkypeArrow" className={styles.icon} />
                    </div>
                    <div>
                      <h5>Blogs</h5>
                    </div>
                  </div>
                </div>

                <div className={styles.searchboxcontainer}>
                  {permission === "Admin" && (
                    <div>
                      {/* <CustomDropDown
                        value={filterkey._status}
                        placeholder="Status"
                        onChange={(value) => {
                          filterOnchangehandler("_status", value);
                          // stausfilter(value);
                        }}
                        noErrorMsg
                        highlightDropdown={true}
                        options={["All", "Pending", "Approved"]}
                        size="SM"
                        floatingLabel={false}
                        width={"250px"}
                      /> */}
                    </div>
                  )}
                  {/* <CustomInput
                    onChange={(value) => {
                      filterfunction("_gsearch", value);
                    }}
                    value={filterkey._gsearch}
                    inputWrapperClassName={styles.pathSearchFilter}
                    size="SM"
                    placeholder="Search path"
                  /> */}

                  <SearchBox
                    placeholder="Search..."
                    styles={searchBoxStyle}
                    value={filterkey._gsearch}
                    onChange={(e, value) => {
                      filterOnchangehandler("_gsearch", value);
                    }}
                  />

                  {/* 
                  {permission !== "Admin" && (
                    <SearchBox
                      placeholder="Search..."
                      styles={searchBoxStyle}
                      value={additionalfilterkey._status}
                      onChange={(e, value: any) => {
                        setadditionalfilterkey({
                          ...additionalfilterkey,
                          _status: value,
                        });
                        // filterOnchangehandler("_gsearch", value);
                        algorithmfilterfunction(value);
                      }}
                    />
                  )} */}

                  <div>
                    <div
                      className={styles["new-blog-button"]}
                      onClick={() => setisopen(true)}
                    >
                      <Icon iconName="Add" className={styles.Addicon} />
                      <span>New blog</span>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", margin: "7px 39px" }}>
                <div>
                  <h4
                    style={{
                      borderBottom:
                        allBlogs === "AllBlogs"
                          ? "3.5px solid rgb(224, 128, 61)"
                          : "",

                      paddingBottom: "10px",
                      color: "#0b4d53",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      const _data = [...admindata];
                      const _filterdata = _data.filter(
                        (item) => item.Status === "Approved"
                      );
                      _filterdata.sort((a, b) => b.Id - a.Id);
                      setdata([..._filterdata]);
                      setAllBlogs("AllBlogs");
                    }}
                  >
                    All blogs
                  </h4>
                </div>
                {permission === "Admin" ? (
                  <div>
                    <h4
                      style={{
                        borderBottom:
                          allBlogs !== "AllBlogs"
                            ? "3.5px solid rgb(224, 128, 61)"
                            : "",
                        paddingBottom: "10px",
                        color: "#0b4d53",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setAllBlogs("PendingApprovals");
                        const userdata = [...admindata];
                        const filterdata = userdata.filter(
                          (item) => item.Status === "Pending"
                        );
                        filterdata.sort((a, b) => b.Id - a.Id);
                        setdata([...filterdata]);
                      }}
                    >
                      Pending approvals
                    </h4>
                  </div>
                ) : (
                  <div>
                    <h5
                      style={{
                        borderBottom:
                          allBlogs !== "AllBlogs"
                            ? "3.5px solid rgb(224, 128, 61)"
                            : "",
                        paddingBottom: "10px",
                        color: "#0b4d53",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        if (permission === "Admin") {
                          setAllBlogs("PendingApprovals");
                        } else {
                          debugger;
                          const _data = [...data];
                          const _filterdata = _data.filter(
                            (item) =>
                              item.Author && item.Author.Id === curuser.Id
                          );
                          _filterdata.sort((a, b) => b.Id - a.Id);
                          setdata([..._filterdata]);
                          setAllBlogs("MyBlogs");
                        }
                      }}
                    >
                      My Blogs
                    </h5>
                  </div>
                )}
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
                                style={{
                                  height:
                                    permission !== "Admin" ? "110px" : "110px",
                                }}
                                dangerouslySetInnerHTML={{
                                  __html: item.Paragraph,
                                }}
                              />
                              {permission === "Admin" &&
                                item.Status === "Pending" && (
                                  <div className={styles.approversection}>
                                    <div>
                                      <label
                                        style={{
                                          fontSize: "12px",
                                          height: "23px",
                                          width: "66px",
                                          display: "inline-block",
                                          padding: "6px",
                                          backgroundColor:
                                            item.Status === "Approved"
                                              ? "green"
                                              : item.Status === "Pending"
                                              ? "#f3e8c9"
                                              : "red",
                                          color:
                                            item.Status === "Approved"
                                              ? "green"
                                              : item.Status === "Pending"
                                              ? "#c99b1b"
                                              : "red",
                                          borderRadius: "50px",
                                          textAlign: "center",
                                          fontWeight: "500",
                                        }}
                                      >
                                        {item.Status}
                                      </label>
                                    </div>
                                    {permission === "Admin" && (
                                      <div className={styles.checkbox}>
                                        {/* <div> */}
                                        {permission === "Admin" ? (
                                          <div>
                                            <div
                                              className={
                                                styles["new-blog-button"]
                                              }
                                              onClick={() => {
                                                // setcheckbox(false);
                                                setupdateid(item.Id);
                                                const _popupcontroller = [
                                                  ...popupController,
                                                ];
                                                _popupcontroller[0].open = true;
                                                setPopupController([
                                                  ..._popupcontroller,
                                                ]);
                                                // approverStatusFunc(
                                                //   item.Id
                                                // );
                                              }}
                                            >
                                              <span>Approval</span>
                                            </div>
                                          </div>
                                        ) : // <div>
                                        // <CustomDropDown
                                        //   value={item.UserStatus}
                                        //   floatingLabel={false}
                                        //   placeholder="Status"
                                        //   onChange={(value) => {
                                        // setcheckbox(false);
                                        // approverStatusFunc(value, item.Id);
                                        //   }}
                                        //   highlightDropdown={true}
                                        //   options={[
                                        //     "Pending",
                                        //     "Approved",
                                        //     "Rejected",
                                        //   ]}
                                        //   noErrorMsg
                                        //   size="SM"
                                        //   width={"150px"}
                                        // />
                                        // </div>`
                                        null}
                                        {/* </div> */}
                                        {/* <Checkbox
                                        checked={
                                          item.UserStatus &&
                                          item.UserStatus !== item.Status &&
                                          checkbox === true
                                            ? true
                                            : false
                                        }
                                        onChange={(event: any) => {
                                          if (
                                            item.UserStatus &&
                                            item.UserStatus !== item.Status
                                          ) {
                                            setcheckbox(true);
                                            setupdateid(item.Id);
                                            const _popupcontroller = [
                                              ...popupController,
                                            ];
                                            _popupcontroller[0].open = true;
                                            setPopupController([
                                              ..._popupcontroller,
                                            ]);
                                          } else {
                                            setcheckbox(false);
                                            console.log("Shanmugaraj");
                                          }
                                        }}
                                      /> */}
                                      </div>
                                    )}
                                  </div>
                                )}
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
                                    {item.Created || ""}
                                  </h5>
                                </div>
                              </div>
                              <div className={styles.likecontainer}>
                                <div className={styles.likebox}>
                                  {/* <Icon
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
                                  /> */}
                                  <i
                                    className="pi pi-thumbs-up-fill"
                                    style={{
                                      color: curuserlikes
                                        ? "#0a4b48"
                                        : "#b3b0b0",
                                      cursor: "pointer",
                                    }}
                                    onClick={() =>
                                      addLikeMethod(item.Id, item.userDetails)
                                    }
                                  />
                                  {/* <ThumbUpAltOutlined
                                    style={{
                                      color: curuserlikes
                                        ? "#0a4b48"
                                        : "#b3b0b0",
                                      cursor: "pointer",
                                    }}
                                    onClick={() =>
                                      addLikeMethod(item.Id, item.userDetails)
                                    }
                                  /> */}
                                  <label style={{ cursor: "auto" }}>
                                    {totaluserlikescount || "0"}
                                  </label>
                                </div>
                                <div className={styles.eyecontainer}>
                                  {/* <Icon
                                    className={styles.eyeicon}
                                    iconName="VisibilityOutlined"
                                  /> */}
                                  <VisibilityOutlined
                                    style={{
                                      color: "orange",
                                    }}
                                  />

                                  {/* <Icon
                                    iconName="RedEye12"
                                    className={styles.eyeicon}
                                  /> */}
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
          centerActionBtn={true}
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
