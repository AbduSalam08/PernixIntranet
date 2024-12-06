/* eslint-disable guard-for-in */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "../../../assets/styles/Style.css";
import styles from "./BlogsPage.module.scss";
import "./Style.css";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
import { Icon, Persona, PersonaSize, PersonaPresence } from "@fluentui/react";
import AddingComponent from "./AddingComponent";
import ViewComponent from "./ViewComponent";
import {
  addlikemethod,
  Approved,
  changeBlogActive,
  getcuruserdetails,
  getintername,
  nooneviews,
  permissionhandling,
  usergetdetails,
  viewLikes,
} from "../../../services/BlogsPage/BlogsPageServices";
import Popup from "../../../components/common/Popups/Popup";
import { togglePopupVisibility } from "../../../utils/popupUtils";
import moment from "moment";
import { Chat, VisibilityOutlined } from "@mui/icons-material";
// import _ from "lodash";
import { CONFIG } from "../../../config/config";
import CustomInput from "../../../components/common/CustomInputFields/CustomInput";
import { Paginator } from "primereact/paginator";
import { InputSwitch } from "primereact/inputswitch";
import { IPaginationData } from "../../../interface/interface";

const emptyfile = require("../assets/EmptyFile.jpg");
let isActivityPage: boolean = false;

const BlogsPage = (props: any): JSX.Element => {
  const initialPopupController = [
    {
      open: false,
      popupTitle: "Confirmation",
      popupWidth: "450px",
      popupType: "custom",

      defaultCloseBtn: false,
      confirmationTitle: "",
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
  const [pagination, setPagination] = useState<IPaginationData>(
    CONFIG.PaginationData
  );

  const popupInputs: any[] = [
    [
      <div key={1}>
        <p style={{ textAlign: "center" }}>
          Are you sure want to Approved This Blog?
        </p>

        <div
          style={{
            position: "absolute",
            top: "-20px",
            right: 0,
            left: "380px",
            background: "#ccc",
            border: "1px solid #ccc",
            borderRadius: "50%",
            width: "25px",
            height: "25px",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          title="Close"
          onClick={() => {
            togglePopupVisibility(
              setPopupController,
              initialPopupController[0],
              0,
              "close"
            );
          }}
        >
          <i
            className="pi pi-times"
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "#000",
            }}
          />
        </div>

        {/* <Button
          icon="pi pi-times"
          rounded
          // severity="danger"
          aria-label="Cancel"
          style={{
            position: "absolute",
            top: "-8px",
            right: 0,
            left: "370px",
            background: "#ccc",
            border: "1px solid #cccc",
            width: "18px",
            height: "18px",
            boxShadow: "none",
          }}
        /> */}
      </div>,
    ],
  ];
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

  const [data, setdata] = useState<any>([]);
  const [admindata, setadmindata] = useState<any>([]);
  const [duplicatedata, setduplicatedata] = useState<any>([]);
  const [curuser, setcuruser] = useState<any>({
    Id: null,
    Email: "",
    Title: "",
  });
  const [allBlogs, setAllBlogs] = useState("AllBlogs");
  const [Updateid, setupdateid] = useState<any>(null);
  const [permission, setpermission] = useState("");
  const [choices, setchoices] = useState<any>(["All"]);
  const [filterkey, setfilterkey] = useState({
    _status: "",
    _gsearch: "",
  });
  const [viewitem, setviewitem] = useState("");
  const [viewpage, setviewpage] = useState(false);
  const [isopen, setisopen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const poersonaStyles = {
    root: {
      display: "revert",
    },
  };

  const totalRecords = data?.length || 0;

  // this function is Approver Details/ get userDetails in Intranet_Blogs
  function decodeHtmlEntities(encodedString: any) {
    const parser = document.createElement("div");
    parser.innerHTML = encodedString;
    return parser.textContent || parser.innerText || "";
  }

  const getdetails = async (_userpermission: string): Promise<void> => {
    await usergetdetails().then((arr) => {
      const tempdata: any = [];
      arr.forEach((item: any) => {
        tempdata.push({
          Id: item.Id,
          Title: item.BlogsHeading,
          ParentTitle: item.BlogTitle,
          Paragraph: item.ImageDescription
            ? decodeHtmlEntities(item.ImageDescription)
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
          isActive: item.isActive ? item.isActive : false,
        });
      });
      setadmindata([...tempdata]);
      if (_userpermission === "Admin") {
        const _filterdata = tempdata.filter(
          (_admin: any) => _admin.Status === "Approved"
        );
        _filterdata.sort((a: any, b: any) => b.Id - a.Id);
        if (isActivityPage) {
          const temp: any[] =
            tempdata?.filter((item: any) => item.Status === "Pending") || [];
          temp?.sort((a, b) => b.Id - a.Id);
          setdata([...temp]);
        } else {
          setdata([..._filterdata]);
        }
        setduplicatedata([..._filterdata]);
      } else {
        const _filterdata = tempdata.filter(
          (_admin: any) => _admin.Status === "Approved" && _admin.isActive
        );
        _filterdata.sort((a: any, b: any) => b.Id - a.Id);
        setdata([..._filterdata]);
        setduplicatedata([..._filterdata]);
      }
    });
  };

  // This function is onChangerows function
  const onPageChange = (event: any): void => {
    setPagination({
      first: event?.first || CONFIG.PaginationData.first,
      rows: event?.rows || CONFIG.PaginationData.rows,
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
    resetstate();
  };

  // This is ViewLike Method function
  const viewLikemethod = async (Id: number, userDetails: any, item: any) => {
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
    setAllBlogs(isActivityPage ? "PendingApprovals" : "AllBlogs");
    // setAllBlogs("AllBlogs");
    getcurrentuser();
  };

  // This is the OnLoadingFunc
  const onLoadingFunc = async (user: any): Promise<void> => {
    let _userpermission: string = "";
    await permissionhandling().then(async (arr) => {
      if (arr?.some((item) => item.Email && item?.Email === user?.Email)) {
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
      getdetails(_userpermission);
    });
  };

  // Approver Status Change Function
  const Approverfunc = async (
    Id: number,
    statusValue: string
  ): Promise<any> => {
    try {
      await Approved(Id, statusValue);
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
  const filterfunction = async (key: any, value: any) => {
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
    const urlObj = new URL(window.location.href);
    const params = new URLSearchParams(urlObj.search);
    isActivityPage = params?.get("Page") === "activity" ? true : false;

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
                    gap: "18px",
                  }}
                >
                  <div className={styles.blog}>
                    <div
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        if (isActivityPage) {
                          window.open(
                            props.context.pageContext.web.absoluteUrl +
                              CONFIG.NavigatePage.ApprovalsPage,
                            "_self"
                          );
                        } else {
                          window.open(
                            props.context.pageContext.web.absoluteUrl +
                              CONFIG.NavigatePage.PernixIntranet,
                            "_self"
                          );
                        }
                      }}
                    >
                      <i
                        className="pi pi-arrow-circle-left"
                        style={{ fontSize: "1.2rem", color: "#E0803D" }}
                      />
                    </div>
                    <div>
                      <h5>Blogs</h5>
                    </div>
                  </div>
                </div>

                <div className={styles.searchboxcontainer}>
                  <div>
                    <CustomInput
                      value={filterkey._gsearch}
                      secWidth="200px"
                      labelText="Search"
                      placeholder="Search"
                      noErrorMsg
                      size="SM"
                      onChange={(value: any) => {
                        filterOnchangehandler("_gsearch", value);
                      }}
                    />
                  </div>

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

              <div
                style={{
                  display: "flex",
                  gap: "35px",
                  margin: "20px",
                  marginBottom: "0",
                }}
              >
                <div>
                  <div
                    style={{
                      borderBottom:
                        allBlogs === "AllBlogs"
                          ? "3.5px solid rgb(224, 128, 61)"
                          : "",
                      paddingBottom: "10px",
                      color: "#0b4d53",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "18px",
                      fontWeight: "500",
                    }}
                    onClick={() => {
                      if (permission === "Admin") {
                        const _data = [...admindata];
                        const _filterdata = _data.filter(
                          (item) => item.Status === "Approved"
                        );
                        _filterdata.sort((a, b) => b.Id - a.Id);
                        setdata([..._filterdata]);
                        setAllBlogs("AllBlogs");
                      } else {
                        const _data = [...admindata];
                        const _filterdata = _data.filter(
                          (item) => item.Status === "Approved" && item.isActive
                        );
                        _filterdata.sort((a, b) => b.Id - a.Id);
                        setdata([..._filterdata]);
                        setAllBlogs("AllBlogs");
                      }
                    }}
                  >
                    All blogs
                  </div>
                </div>

                {permission === "Admin" ? (
                  <div>
                    <div
                      style={{
                        borderBottom:
                          allBlogs !== "AllBlogs"
                            ? "3.5px solid rgb(224, 128, 61)"
                            : "",
                        paddingBottom: "10px",
                        color: "#0b4d53",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "18px",
                        fontWeight: "500",
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
                    </div>
                  </div>
                ) : (
                  <div>
                    <div
                      style={{
                        borderBottom:
                          allBlogs !== "AllBlogs"
                            ? "3.5px solid rgb(224, 128, 61)"
                            : "",
                        paddingBottom: "10px",
                        color: "#0b4d53",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "18px",
                        fontWeight: "500",
                      }}
                      onClick={() => {
                        if (permission === "Admin") {
                          setAllBlogs("PendingApprovals");
                        } else {
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
                    </div>
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
                    data
                      ?.slice(
                        pagination.first,
                        pagination.first + pagination.rows
                      )
                      .map((item: any, index: number) => {
                        const totaluserlikescount = item.userDetails.filter(
                          (arr: any) => arr.UserClick === true
                        ).length;
                        const curuserlikes = item.userDetails.some(
                          (arr: any) =>
                            arr.UserId === curuser.Id && arr.UserClick
                        );
                        const userviewcounts = item.viewDetails?.length || 0;

                        return (
                          <div className={styles.smallcontainer} key={index}>
                            <div className={styles.inbox}>
                              <div className={styles.imgbox}>
                                <img src={item.img} alt="Blog" />
                              </div>
                              <div className={styles.contenttitle}>
                                <div className={styles.titleActiveicons}>
                                  <h4
                                    className={styles.Title}
                                    title={item.Title}
                                  >
                                    {item.Title}
                                  </h4>
                                  {permission === "Admin" ? (
                                    <InputSwitch
                                      checked={item?.isActive}
                                      className="sectionToggler"
                                      onChange={async (e: any) => {
                                        setdata((prevItems: any) =>
                                          prevItems.map(
                                            (val: any, idx: number) =>
                                              item?.Id === val?.Id
                                                ? { ...val, isActive: e.value }
                                                : val
                                          )
                                        );
                                        await changeBlogActive(
                                          item.Id,
                                          e.value
                                        );
                                      }}
                                    />
                                  ) : (
                                    <div
                                      className={styles.pilldesign}
                                      style={{
                                        background:
                                          item.isActive === "in Active"
                                            ? "red"
                                            : "",
                                      }}
                                    >
                                      {item.isActive ? "Active" : "in Active"}
                                    </div>
                                  )}
                                </div>
                                <div className={styles.parenttitle}>
                                  <h3 title={item.ParenTitle}>
                                    {item.ParentTitle}
                                  </h3>
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
                                  title={item?.Paragraph}
                                  className={styles.paragraph}
                                  style={{
                                    height:
                                      permission !== "Admin" ? "87px" : "87px",
                                    // fontWeight: "bold",
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
                                          {permission === "Admin" ? (
                                            <div>
                                              <div
                                                className={
                                                  styles["new-blog-button"]
                                                }
                                                onClick={() => {
                                                  setupdateid(item.Id);
                                                  togglePopupVisibility(
                                                    setPopupController,
                                                    initialPopupController[0],
                                                    0,
                                                    "open"
                                                  );
                                                }}
                                              >
                                                <span>Approval</span>
                                              </div>
                                            </div>
                                          ) : null}
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
                                      size={PersonaSize.size28}
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
                                  <div className={styles.eyecontainer}>
                                    <VisibilityOutlined
                                      style={{
                                        color: "orange",
                                        fontSize: "20px",
                                      }}
                                    />
                                    <label style={{ cursor: "auto" }}>
                                      {userviewcounts || "0"}
                                    </label>
                                  </div>
                                  <div className={styles.likebox}>
                                    <i
                                      className="pi pi-thumbs-up-fill"
                                      style={{
                                        color: curuserlikes
                                          ? "#0a4b48"
                                          : "#b3b0b0",
                                        cursor: "pointer",
                                        fontSize: "18px",
                                      }}
                                      onClick={() =>
                                        addLikeMethod(item.Id, item.userDetails)
                                      }
                                    />
                                    <label style={{ cursor: "auto" }}>
                                      {totaluserlikescount || "0"}
                                    </label>
                                  </div>
                                  <div className={styles.eyecontainer}>
                                    <Chat
                                      sx={{
                                        color: "#0a4b48",
                                        width: "18px",
                                      }}
                                    />
                                    <label style={{ cursor: "auto" }}>
                                      {/* {userviewcounts || "0"} */}
                                      10
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
                {data.length > 0 ? (
                  <div className="card">
                    <Paginator
                      first={pagination.first}
                      rows={pagination.rows}
                      totalRecords={totalRecords}
                      onPageChange={onPageChange}
                      template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink "
                    />
                  </div>
                ) : (
                  ""
                )}
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
          }}
          popupTitle={
            popupData.popupType !== "confimation" && popupData.popupTitle
          }
          centerActionBtn={true}
          popupActions={popupActions[index]}
          visibility={popupData.open}
          content={popupInputs[index]}
          popupWidth={popupData.popupWidth}
          defaultCloseBtn={popupData.defaultCloseBtn || false}
          confirmationTitle={popupData?.confirmationTitle}
          popupHeight={index === 0 ? true : false}
          noActionBtn={true}
        />
      ))}

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
    </div>
  );
};

export default BlogsPage;
