/* eslint-disable @rushstack/no-new-null */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable require-atomic-updates */
import "../../../assets/styles/Style.css";
import "./Blogs.css";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./Blogs.module.scss";
import { CONFIG } from "../../../config/config";
import { RoleAuth } from "../../../services/CommonServices";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
import CustomInput from "../../../components/common/CustomInputFields/CustomInput";
import DefaultButton from "../../../components/common/Buttons/DefaultButton";
import { Add } from "@mui/icons-material";
import { ToastContainer } from "react-toastify";
import { Paginator, PaginatorPageChangeEvent } from "primereact/paginator";
import SendIcon from "@mui/icons-material/Send";
import { resetFormData, validateField } from "../../../utils/commonUtils";
import DragDropFile from "../DragAndDrop/DragDropFile";
import QuillEditor from "../../../components/common/QuillEditor/QuillEditor";
import { Avatar } from "primereact/avatar";
import { InputSwitch } from "primereact/inputswitch";
import Popup from "../../../components/common/Popups/Popup";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../utils/popupUtils";
import {
  IBlogColumn,
  IBlogColumnType,
  IBlogCommentsColumnType,
  ICurUserData,
  IFormFields,
  IPageSearchFields,
  IPaginationData,
  IUserDetails,
} from "../../../interface/interface";
import {
  addBlogCommentsData,
  addBlogData,
  deleteBlogData,
  fecthBlogComments,
  fetchBlogDatas,
  fetchCurUserData,
  getAllUsersList,
  updateBlogData,
} from "../../../services/BlogsPage/BlogsPageServices";
import CustomDropDown from "../../../components/common/CustomInputFields/CustomDropDown";

/* Interface creation */
interface IBlogField {
  Heading: IFormFields;
  Tag: IFormFields;
  Description: IFormFields;
  Attachments: IFormFields;
}

interface IBlogDetails {
  ID: number | null;
  Like: string[];
  Idx: number | null;
}

/* Global variable creation */
const blogDetail: IBlogDetails = {
  ID: null,
  Like: [],
  Idx: null,
};

let isAdmin: boolean = false;
let isActivityPage: boolean = false;
let masterBlog: IBlogColumnType[] = [];
let curUserDetail: ICurUserData;

const Blogs = (props: any): JSX.Element => {
  /* Local variable creation */
  const dispatch = useDispatch();

  const AllUsersData: any = useSelector(
    (state: any) => state.AllUsersData?.value
  );
  const currentUserDetails: IUserDetails = useSelector(
    (state: any) => state?.MainSPContext?.currentUserDetails
  );
  isAdmin = currentUserDetails.role === CONFIG.RoleDetails.user ? false : true;
  const searchField: IPageSearchFields = CONFIG.PageSearchFields;

  /* popup properties */
  const initialPopupController: any[] = [
    {
      open: false,
      popupTitle: "Confirmation",
      popupWidth: "450px",
      popupType: "custom",
      defaultCloseBtn: false,
      popupData: "",
      isLoading: {
        inprogress: false,
        error: false,
        success: false,
      },
      messages: {
        success: "Blog deleted successfully!",
        error: "Something went wrong!",
        successDescription: "The blog 'ABC' has been deleted successfully.",
        errorDescription:
          "An error occured while delete blog, please try again later.",
        inprogress: "Delete blog, please wait...",
      },
    },
    {
      open: false,
      popupTitle: "",
      popupWidth: "450px",
      popupType: "custom",
      defaultCloseBtn: false,
      popupData: "",
      isLoading: {
        inprogress: false,
        error: false,
        success: false,
      },
      messages: {
        success: "Blog approved successfully!",
        error: "Something went wrong!",
        successDescription: "The blog 'ABC' has been approved successfully.",
        errorDescription:
          "An error occured while approve blog, please try again later.",
        inprogress: "Approve blog, please wait...",
      },
    },
  ];

  const initialFormData: IBlogField = {
    Heading: {
      value: "",
      isValid: true,
      errorMsg: "This field is required.",
      validationRule: {
        required: true,
        type: "string",
      },
    },
    Tag: {
      value: "",
      isValid: true,
      errorMsg: "This field is required.",
      validationRule: {
        required: true,
        type: "string",
      },
    },
    Description: {
      value: "",
      isValid: true,
      errorMsg: "This field is required.",
      validationRule: {
        required: true,
        type: "string",
      },
    },
    Attachments: {
      value: null,
      isValid: true,
      errorMsg: "This field is required.",
      validationRule: {
        required: true,
        type: "file",
      },
    },
  };

  /* State creation */
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<string>(CONFIG.BlogsTab[0]);
  const [curAllBlogs, setCurAllBlogs] = useState<IBlogColumnType[]>([]);
  const [selTabBlogs, setSelTabBlogs] = useState<IBlogColumnType[]>([]);
  const [comSearch, setComSearch] = useState<IPageSearchFields>({
    ...CONFIG.PageSearchFields,
  });
  const [isCreate, setIsCreate] = useState<boolean>(false);
  const [pagination, setPagination] = useState<IPaginationData>(
    CONFIG.PaginationData
  );
  const [formData, setFormData] = useState<IBlogField | any>({
    ...initialFormData,
  });
  const [popupController, setPopupController] = useState<any[]>(
    initialPopupController
  );
  const [selData, setSelData] = useState<IBlogDetails>({ ...blogDetail });
  const [isView, setIsView] = useState<boolean>(false);
  const [curBlogData, setCurBlogData] = useState<IBlogColumnType | null>(null);
  const [allComment, setAllComment] = useState<IBlogCommentsColumnType[]>([]);
  const [comment, setComment] = useState<string>("");
  const [taggedPerson, setTaggedPerson] = useState({
    results: [],
  });

  /* Functions creation */
  const handleInputChange = async (
    field: string,
    value: any,
    isValid: boolean,
    errorMsg: string = ""
  ): Promise<void> => {
    setFormData((prevData: IBlogField | any) => ({
      ...prevData,
      [field]: {
        ...prevData[field],
        value: value,
        isValid,
        errorMsg: isValid ? "" : errorMsg,
      },
    }));
  };

  const onPageChange = async (
    event: PaginatorPageChangeEvent | any
  ): Promise<void> => {
    setPagination({
      first: event?.first || CONFIG.PaginationData.first,
      rows: event?.rows || CONFIG.PaginationData.rows,
    });
    setIsLoading(false);
  };

  const handleSearch = async (): Promise<void> => {
    let temp: IBlogColumnType[] = [...curAllBlogs];

    if (searchField.Search) {
      temp = await Promise.all(
        temp?.filter(
          (val: IBlogColumnType) =>
            val?.Description?.toLowerCase().includes(
              searchField.Search?.toLowerCase()
            ) ||
            val?.Heading?.toLowerCase().includes(
              searchField.Search?.toLowerCase()
            ) ||
            val?.Tag?.toLowerCase().includes(
              searchField.Search?.toLowerCase()
            ) ||
            val?.AuthorName?.toLowerCase().includes(
              searchField.Search?.toLowerCase()
            )
        )
      );
    }
    if (searchField.Status) {
      temp = await Promise.all(
        temp?.filter((val: IBlogColumnType) =>
          searchField.Status === CONFIG.blogDrop[0]
            ? val?.IsActive
            : !val?.IsActive
        )
      );
    }

    setSelTabBlogs([...temp]);
  };

  const filterTabDatas = async (
    curTab: string = CONFIG.BlogsTab[0]
  ): Promise<void> => {
    let tampTabData: IBlogColumnType[] = [...masterBlog];

    if (curTab === CONFIG.BlogsTab[0]) {
      tampTabData = await Promise.all(
        isAdmin
          ? tampTabData?.filter(
              (val: IBlogColumnType) => val?.Status === "Approved"
            )
          : tampTabData?.filter(
              (val: IBlogColumnType) =>
                val?.Status === "Approved" && val?.IsActive
            )
      );
    } else if (curTab === CONFIG.BlogsTab[1]) {
      tampTabData = await Promise.all(
        isAdmin
          ? tampTabData?.filter(
              (val: IBlogColumnType) =>
                val?.Status === "Approved" && val?.AuthorId === curUserDetail.ID
            )
          : tampTabData?.filter(
              (val: IBlogColumnType) =>
                val?.Status === "Approved" &&
                val?.AuthorId === curUserDetail.ID &&
                val?.IsActive
            )
      );
    } else {
      tampTabData = await Promise.all(
        tampTabData?.filter((val: IBlogColumnType) => !val?.Status) || []
      );
    }

    setCurAllBlogs([...tampTabData]);
    setSelTabBlogs([...tampTabData]);
    setComSearch({ ...CONFIG.PageSearchFields });
    setSelectedTab(curTab);
    setIsLoading(false);
    setSelData({ ...blogDetail });
    setIsView(false);
    setIsCreate(false);
  };

  const handleSubmit = async (): Promise<void> => {
    let hasErrors: boolean = false;

    const updatedFormData = Object.keys(formData).reduce((acc, key) => {
      const fieldData = formData[key];
      const { isValid, errorMsg } = validateField(
        key,
        fieldData.value,
        fieldData?.validationRule
      );

      if (!isValid) {
        hasErrors = true;
      }

      return {
        ...acc,
        [key]: {
          ...fieldData,
          isValid,
          errorMsg,
        },
      };
    }, {} as typeof formData);

    setFormData(updatedFormData);
    if (!hasErrors) {
      setIsLoading(true);
      const data: any = {};
      const fileData: any = {};
      const column: IBlogColumn = CONFIG.BlogColumn;

      data[column.ID] = null;
      data[column.Heading] = formData?.Heading?.value || "";
      data[column.Title] = formData?.Tag?.value || "";
      data[column.Description] = formData?.Description?.value || "";

      // Attachments json prepared.
      fileData[column.Attachments] = formData?.Attachments?.value || null;

      resetFormData(initialFormData, setFormData);
      await addBlogData(data, fileData, curUserDetail).then(
        async (res: IBlogColumnType[]) => {
          masterBlog = [...res, ...masterBlog];
          await filterTabDatas();
        }
      );
    } else {
      console.log("Form contains errors");
    }
  };

  const handleDelete = async (): Promise<void> => {
    togglePopupVisibility(
      setPopupController,
      initialPopupController[0],
      0,
      "close"
    );
    await deleteBlogData(Number(selData?.ID));
    masterBlog = await Promise.all(
      masterBlog?.filter((val: IBlogColumnType) => val?.ID !== selData?.ID) ||
        []
    );
    await filterTabDatas(selectedTab);
  };

  const handleLike = async (Id: number, Idx: number): Promise<void> => {
    let tempLikeUser: string[] = [];

    if (
      masterBlog[Idx].LikedUsers?.some(
        (val: string) => val === curUserDetail?.ID
      )
    ) {
      tempLikeUser = await Promise.all(
        masterBlog[Idx].LikedUsers?.filter(
          (val: string) => val !== curUserDetail?.ID
        ) || []
      );
    } else {
      masterBlog[Idx].LikedUsers.push(curUserDetail?.ID);
      tempLikeUser = masterBlog[Idx].LikedUsers;
    }

    await updateBlogData(
      Id,
      {
        LikedUsers: JSON.stringify(tempLikeUser),
      },
      false
    );
    masterBlog[Idx].LikedUsers = [...tempLikeUser];

    if (!isView) {
      await filterTabDatas(selectedTab);
    } else {
      setCurBlogData({ ...masterBlog[Idx] });
    }
  };

  const handleView = async (Id: number, Idx: number): Promise<void> => {
    setIsLoading(true);
    masterBlog[Idx].ViewedUsers.push("1");
    const tempView: string[] = masterBlog[Idx].ViewedUsers;

    await updateBlogData(
      Id,
      {
        ViewedUsers: JSON.stringify(tempView),
      },
      false
    );

    setCurBlogData({ ...masterBlog[Idx] });
    await fecthBlogComments(Id).then((res: IBlogCommentsColumnType[]) => {
      setAllComment([...res]);
      setIsLoading(false);
      setIsView(true);
    });
  };

  const handleComments = async (): Promise<void> => {
    const Idx: number = masterBlog?.findIndex(
      (val: IBlogColumnType) => val?.ID === curBlogData?.ID
    );

    masterBlog[Idx].CommentedUsers.push("1");
    const tempComment: string[] = masterBlog[Idx].CommentedUsers;

    const data: any = {
      BlogIdId: curBlogData?.ID,
      Comments: comment,
      TaggedPersonId: taggedPerson,
    };

    await updateBlogData(
      Number(curBlogData?.ID),
      {
        CommentedUsers: JSON.stringify(tempComment),
      },
      false
    );

    setCurBlogData({ ...masterBlog[Idx] });
    await addBlogCommentsData({ ...data }, { ...curUserDetail }).then(
      (res: IBlogCommentsColumnType[]) => {
        setAllComment([...allComment, ...res]);
        setComment("");
        setTaggedPerson({
          results: [],
        });
      }
    );
  };

  const popupInputs: any[] = [
    [
      <div key={0}>
        <p>Are you sure you want to delete this blog?</p>
      </div>,
    ],
    [
      <div key={1}>
        <p className={styles.approvePopupContent}>
          Are you sure want to Approved This Blog?
        </p>

        <div
          className={styles.approvePopupClose}
          title="Close"
          onClick={() => {
            togglePopupVisibility(
              setPopupController,
              initialPopupController[1],
              1,
              "close"
            );
          }}
        >
          <i className="pi pi-times" />
        </div>
      </div>,
    ],
  ];

  const popupActions: any[] = [
    [
      {
        text: "Cancel",
        btnType: "darkGreyVariant",
        disabled: false,
        endIcon: false,
        startIcon: false,
        size: "large",
        onClick: () => {
          togglePopupVisibility(
            setPopupController,
            initialPopupController[0],
            0,
            "close"
          );
        },
      },
      {
        text: "Delete",
        btnType: "primaryGreen",
        endIcon: false,
        startIcon: false,
        disabled: !Object.keys(formData).every((key) => formData[key].isValid),
        size: "large",
        onClick: async () => {
          await handleDelete();
        },
      },
    ],
    [
      {
        text: "Reject",
        btnType: "darkGreyVariant",
        disabled: false,
        endIcon: false,
        startIcon: false,
        size: "large",
        onClick: async () => {
          togglePopupVisibility(
            setPopupController,
            initialPopupController[1],
            1,
            "close"
          );
          await updateBlogData(
            Number(selData?.ID),
            {
              Status: "Rejected",
            },
            true
          );
          masterBlog[Number(selData?.Idx)].Status = "Rejected";
          await filterTabDatas(selectedTab);
        },
      },
      {
        text: "Approve",
        btnType: "primaryGreen",
        endIcon: false,
        startIcon: false,
        size: "large",
        onClick: async () => {
          togglePopupVisibility(
            setPopupController,
            initialPopupController[1],
            1,
            "close"
          );
          await updateBlogData(
            Number(selData?.ID),
            {
              Status: "Approved",
            },
            true
          );
          masterBlog[Number(selData?.Idx)].Status = "Approved";
          await filterTabDatas(selectedTab);
        },
      },
    ],
  ];

  const initialFetchData = async (): Promise<void> => {
    setIsLoading(true);

    await RoleAuth(
      CONFIG.SPGroupName.Pernix_Admin,
      {
        highPriorityGroups: [CONFIG.SPGroupName.Blogs_Admin],
      },
      dispatch
    );
    await getAllUsersList(dispatch);
    await fetchCurUserData().then((res: ICurUserData[]) => {
      curUserDetail = res?.[0] || [];
    });
    await fetchBlogDatas().then((res: IBlogColumnType[]) => {
      masterBlog = res;
    });

    await filterTabDatas(
      isActivityPage ? CONFIG.BlogsTab[2] : CONFIG.BlogsTab[0]
    );
  };

  useEffect(() => {
    const urlObj = new URL(window.location.href);
    const params = new URLSearchParams(urlObj.search);
    isActivityPage = params?.get("Page") === "activity" ? true : false;

    initialFetchData();
  }, []);

  return (
    <div className={styles.container}>
      {isLoading ? (
        <div className={styles.LoaderContainer}>
          <CircularSpinner />
        </div>
      ) : isView ? (
        <>
          {/* View blog header section */}
          <div className={styles.headerContainer}>
            <div className={styles.backContainer}>
              <div
                style={{
                  cursor: "pointer",
                }}
                onClick={(_) => {
                  setCurBlogData(null);
                  setIsView(false);
                }}
              >
                <i
                  className="pi pi-arrow-circle-left"
                  style={{
                    fontSize: "26px",
                    color: "#e0803d",
                  }}
                />
              </div>
              <div className={styles.backHeader}>View blog</div>
            </div>
          </div>

          {/* View blog content section */}
          <div className={styles.viewBlogContainer}>
            <div className={styles.VHeading}>{curBlogData?.Heading}</div>
            <div className={styles.VTag}>{curBlogData?.Tag}</div>
            <img
              src={curBlogData?.Attachments}
              alt="blog img"
              className={styles.VImg}
            />
            <div
              className={styles.VContent}
              dangerouslySetInnerHTML={{
                __html: curBlogData?.Description || "",
              }}
            />
            <div className={styles.VAvatar}>
              <div className={styles.AProfile}>
                <Avatar
                  shape="circle"
                  style={{
                    width: "25px !important",
                    height: "25px !important",
                  }}
                  image={`${CONFIG.userImageURL}${curBlogData?.AuthorEmail}`}
                />
                <div className={styles.userTexts}>
                  <span className={styles.authorName}>
                    {curBlogData?.AuthorName}
                  </span>
                  <span>{curBlogData?.Date}</span>
                </div>
              </div>
              <div className={styles.AActions}>
                <div
                  className={styles.AASections}
                  onClick={async () => {
                    const curIndex: number = masterBlog?.findIndex(
                      (res: IBlogColumnType) => res?.ID === curBlogData?.ID
                    );
                    await handleLike(Number(curBlogData?.ID), curIndex);
                  }}
                >
                  <i
                    className={
                      curBlogData?.LikedUsers?.some(
                        (id: string) => id === curUserDetail?.ID
                      )
                        ? "pi pi-thumbs-up-fill"
                        : "pi pi-thumbs-up"
                    }
                  />
                  <span>{curBlogData?.LikedUsers?.length}</span>
                </div>
                <div className={styles.AASections}>
                  <i className="pi pi-eye" />
                  <span>{curBlogData?.ViewedUsers?.length}</span>
                </div>
                <div className={styles.AASections}>
                  <i className="pi pi-comment" />
                  <span>{curBlogData?.CommentedUsers?.length}</span>
                </div>
              </div>
            </div>
            <div className={styles.VCommentContainer}>
              <div className={styles.CHeader}>Comments</div>
              {allComment.length ? (
                <div className={styles.CComments}>
                  {allComment?.map(
                    (val: IBlogCommentsColumnType, Idx: number) => {
                      return (
                        <div
                          className={`${styles.commentCard} ${styles.fadeIn}`}
                          key={Idx}
                        >
                          <div className={styles.userProfile}>
                            <Avatar
                              image={`/_layouts/15/userphoto.aspx?size=S&username=${val?.AuthorEmail}`}
                              // size="small"
                              shape="circle"
                              style={{
                                width: "30px !important",
                                height: "30px !important",
                              }}
                              data-pr-tooltip={val?.AuthorEmail}
                            />
                          </div>
                          <div className={`${styles.commentCardMain}`}>
                            <div className={`${styles.commentHeader}`}>
                              <div className={styles.texts}>
                                <div className={styles.author}>
                                  {val?.AuthorName}{" "}
                                </div>
                                <div className={styles.info}>{val?.Date}</div>
                              </div>
                            </div>
                            <div
                              className={styles.commentSpace}
                              // dangerouslySetInnerHTML={{ __html: content }}
                              dangerouslySetInnerHTML={{
                                __html: val?.Comments,
                              }}
                            />
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              ) : (
                <div className={styles.CNoComments}>No comments found!</div>
              )}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                }}
                className="blogQuill"
              >
                <QuillEditor
                  style={{ width: "80% !important", position: "relative" }}
                  suggestionList={AllUsersData ?? []}
                  onChange={(e: any) => {
                    const value: string = e?.trimStart();
                    if (value === "<p><br></p>") {
                      setComment("");
                    } else if (
                      value.replace(/<(.|\n)*?>/g, "").trim().length === 0
                    ) {
                      setComment("");
                    } else {
                      setComment(value);
                    }
                  }}
                  defaultValue={comment}
                  getMentionedEmails={(e: any) => {
                    setTaggedPerson((prev: any) => ({
                      ...prev,
                      results: e?.map((item: any) => item?.id),
                    }));
                  }}
                  placeHolder={"Enter Comments..."}
                />

                <DefaultButton
                  btnType="primaryGreen"
                  title="Edit Layout"
                  text={<SendIcon />}
                  style={{ position: "absolute", bottom: 0, right: 0 }}
                  disabled={!comment}
                  onClick={() => {
                    handleComments();
                  }}
                  onlyIcon
                />
              </div>
            </div>
          </div>
        </>
      ) : !isCreate ? (
        <>
          {/* Header section */}
          <div className={styles.headerContainer}>
            <div className={styles.backContainer}>
              <div
                style={{
                  cursor: "pointer",
                }}
                onClick={(_) => {
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
                  style={{
                    fontSize: "26px",
                    color: "#e0803d",
                  }}
                />
              </div>
              <div className={styles.backHeader}>Blogs</div>
            </div>

            <div className={styles.searchContainer}>
              <div>
                <CustomDropDown
                  noErrorMsg
                  floatingLabel={false}
                  size="SM"
                  options={[...CONFIG.blogDrop]}
                  value={comSearch.Status}
                  placeholder="All"
                  onChange={(e: any) => {
                    const value: any = e;
                    searchField.Status = value;
                    setComSearch((prev: IPageSearchFields) => ({
                      ...prev,
                      Status: value,
                    }));
                    handleSearch();
                  }}
                />
              </div>
              <div>
                <CustomInput
                  noErrorMsg
                  size="SM"
                  value={comSearch.Search}
                  placeholder="Search"
                  onChange={(e: any) => {
                    const value: string = e.trimStart();
                    searchField.Search = value;
                    setComSearch((prev: IPageSearchFields) => ({
                      ...prev,
                      Search: value,
                    }));
                    handleSearch();
                  }}
                />
              </div>
              <div
                className={styles.refreshBTN}
                onClick={(_) => {
                  searchField.Search = "";
                  searchField.Status = "";
                  setComSearch({ ...searchField });
                  handleSearch();
                }}
              >
                <i className="pi pi-refresh" />
              </div>
              <div>
                <DefaultButton
                  text="Add a blog"
                  btnType="primaryGreen"
                  startIcon={<Add />}
                  onClick={(_) => {
                    setIsCreate(true);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Tab section */}
          <div className={styles.tabsContainer}>
            {CONFIG.BlogsTab.map((str: string, i: number) => {
              return isAdmin ? (
                <div
                  key={i}
                  style={{
                    borderBottom:
                      selectedTab === str ? "3px solid #e0803d" : "none",
                  }}
                  onClick={(_) => {
                    setIsLoading(true);
                    setPagination({ ...CONFIG.PaginationData });
                    filterTabDatas(str);
                  }}
                >
                  {str}
                </div>
              ) : (
                i !== 2 && (
                  <div
                    key={i}
                    style={{
                      borderBottom:
                        selectedTab === str ? "3px solid #e0803d" : "none",
                    }}
                    onClick={(_) => {
                      setIsLoading(true);
                      setPagination({ ...CONFIG.PaginationData });
                      filterTabDatas(str);
                    }}
                  >
                    {str}
                  </div>
                )
              );
            })}
          </div>

          {/* Body section */}
          {selTabBlogs.length ? (
            <div className={styles.bodyContainer}>
              {selTabBlogs
                ?.slice(pagination.first, pagination.first + pagination.rows)
                ?.map((val: IBlogColumnType, idx: number) => {
                  return (
                    <div
                      key={idx}
                      className={styles.cardSec}
                      style={{
                        height:
                          selectedTab === CONFIG.BlogsTab[2]
                            ? "494px"
                            : "440px",
                      }}
                    >
                      <img
                        className={styles.imgSec}
                        src={val?.Attachments}
                        alt="blog img"
                      />
                      <div className={styles.cardTag}>
                        <span>{val?.Tag}</span>
                        <div
                          style={{
                            display: isAdmin ? "flex" : "none",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <InputSwitch
                            className="sectionToggler"
                            checked={val?.IsActive}
                            onChange={async (data: any) => {
                              const curIndex: number = masterBlog?.findIndex(
                                (res: IBlogColumnType) => res?.ID === val?.ID
                              );
                              await updateBlogData(
                                Number(val?.ID),
                                {
                                  IsActive: data?.value,
                                },
                                false
                              );
                              masterBlog[curIndex].IsActive = data?.value;
                              await filterTabDatas(selectedTab);
                            }}
                          />
                          <i
                            className="pi pi-trash"
                            onClick={() => {
                              const curIndex: number = masterBlog?.findIndex(
                                (res: IBlogColumnType) => res?.ID === val?.ID
                              );
                              setSelData((prev: IBlogDetails) => ({
                                ...prev,
                                ID: val?.ID,
                                Idx: curIndex,
                              }));
                              togglePopupVisibility(
                                setPopupController,
                                initialPopupController[0],
                                0,
                                "open"
                              );
                            }}
                          />
                        </div>
                      </div>
                      <div className={styles.cardHeading}>
                        <span>{val?.Heading}</span>
                        {/* <div> */}
                        <i
                          className="pi pi-arrow-up-right"
                          onClick={() => {
                            const curIndex: number = masterBlog?.findIndex(
                              (res: IBlogColumnType) => res?.ID === val?.ID
                            );
                            handleView(Number(val?.ID), curIndex);
                          }}
                        />
                        {/* </div> */}
                      </div>
                      <div
                        className={styles.cardBody}
                        dangerouslySetInnerHTML={{
                          __html: val?.Description,
                        }}
                      />
                      <div
                        style={{
                          display:
                            isAdmin && selectedTab === CONFIG.BlogsTab[2]
                              ? "flex"
                              : "none",
                        }}
                        className={styles.cardApproveSec}
                      >
                        <DefaultButton
                          btnType="secondaryGreen"
                          text="Approve"
                          size="small"
                          onClick={(_) => {
                            const curIndex: number = masterBlog?.findIndex(
                              (res: IBlogColumnType) => res?.ID === val?.ID
                            );
                            setSelData((prev: IBlogDetails) => ({
                              ...prev,
                              ID: val?.ID,
                              Idx: curIndex,
                            }));
                            togglePopupVisibility(
                              setPopupController,
                              initialPopupController[1],
                              1,
                              "open"
                            );
                          }}
                        />
                      </div>
                      <div className={styles.cardFooter}>
                        <div className={styles.cardAvaSec}>
                          <Avatar
                            shape="circle"
                            style={{
                              width: "25px !important",
                              height: "25px !important",
                            }}
                            image={`${CONFIG.userImageURL}${val?.AuthorEmail}`}
                          />
                          <div className={styles.userTexts}>
                            <span className={styles.authorName}>
                              {val?.AuthorName}
                            </span>
                            <span>{val?.Date}</span>
                          </div>
                        </div>
                        <div className={styles.cardAction}>
                          <div
                            className={styles.actions}
                            onClick={async () => {
                              const curIndex: number = masterBlog?.findIndex(
                                (res: IBlogColumnType) => res?.ID === val?.ID
                              );
                              await handleLike(Number(val?.ID), curIndex);
                            }}
                          >
                            <i
                              className={
                                val?.LikedUsers?.some(
                                  (id: string) => id === curUserDetail?.ID
                                )
                                  ? "pi pi-thumbs-up-fill"
                                  : "pi pi-thumbs-up"
                              }
                            />
                            <span>{val?.LikedUsers?.length}</span>
                          </div>
                          <div className={styles.actions}>
                            <i className="pi pi-eye" />
                            <span>{val?.ViewedUsers?.length}</span>
                          </div>
                          <div className={styles.actions}>
                            <i className="pi pi-comment" />
                            <span>{val?.CommentedUsers?.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className={styles.bodyNoDataFound}>
              There are no blogs available!
            </div>
          )}

          {/* Pagination section */}
          {selTabBlogs.length ? (
            <div
              className="card"
              style={{
                padding: "4px 0px",
              }}
            >
              <Paginator
                first={pagination.first}
                rows={pagination.rows}
                totalRecords={selTabBlogs.length}
                onPageChange={onPageChange}
                template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
              />
            </div>
          ) : null}
        </>
      ) : (
        <>
          {/* Add a blog header section */}
          <div className={styles.headerContainer}>
            <div className={styles.backContainer}>
              <div
                style={{
                  cursor: "pointer",
                }}
                onClick={(_) => {
                  resetFormData(initialFormData, setFormData);
                  filterTabDatas(selectedTab);
                }}
              >
                <i
                  className="pi pi-arrow-circle-left"
                  style={{
                    fontSize: "26px",
                    color: "#e0803d",
                  }}
                />
              </div>
              <div className={styles.backHeader}>Add a blog</div>
            </div>
          </div>

          {/* Input field section */}
          <div className={styles.formBodySec}>
            <div className={styles.firstRow}>
              <div className={styles.headingAndTagSec}>
                <div className={styles.headingSec}>
                  <CustomInput
                    value={formData?.Heading?.value}
                    placeholder="Heading"
                    isValid={formData?.Heading?.isValid}
                    errorMsg={formData?.Heading?.errorMsg}
                    onChange={(e: any) => {
                      const value = e.trimStart();
                      const { isValid, errorMsg } = validateField(
                        "Heading",
                        value,
                        formData?.Heading?.validationRule
                      );
                      handleInputChange("Heading", value, isValid, errorMsg);
                    }}
                  />
                </div>
                <div className={styles.tagSec}>
                  <CustomInput
                    value={formData?.Tag?.value}
                    placeholder="Tag"
                    isValid={formData?.Tag?.isValid}
                    errorMsg={formData?.Tag?.errorMsg}
                    onChange={(e: any) => {
                      const value = e.trimStart();
                      const { isValid, errorMsg } = validateField(
                        "Tag",
                        value,
                        formData?.Tag?.validationRule
                      );
                      handleInputChange("Tag", value, isValid, errorMsg);
                    }}
                  />
                </div>
              </div>
              <div className={styles.ImageSec}>
                <DragDropFile
                  setNewVisitor={setFormData}
                  newVisitor={formData?.Attachments?.value}
                />
                {formData?.Attachments?.value?.name && (
                  <div className={styles.selectedFileName}>
                    {formData?.Attachments?.value?.name || ""}
                  </div>
                )}
                {!formData?.Attachments?.isValid && (
                  <p className={styles.errorMsg}>
                    {formData?.Attachments?.errorMsg}
                  </p>
                )}
              </div>
            </div>
            <div className={styles.secondRow}>
              <QuillEditor
                height="255px"
                placeHolder={"Description"}
                defaultValue={formData?.Description?.value}
                onChange={(res: any) => {
                  const value: any = res?.trimStart();
                  let temp: string = "";

                  if (value === "<p><br></p>") {
                    temp = "";
                  } else if (
                    value.replace(/<(.|\n)*?>/g, "").trim().length === 0
                  ) {
                    temp = "";
                  } else {
                    temp = value;
                  }

                  const { isValid, errorMsg } = validateField(
                    "Description",
                    temp,
                    formData?.Description?.validationRule
                  );
                  handleInputChange(
                    "Description",
                    value,
                    !res ? true : isValid,
                    errorMsg
                  );
                }}
                suggestionList={[]}
                getMentionedEmails={(_e: any) => {}}
              />
              {!formData?.Description?.isValid && (
                <p className={styles.errorMsg}>
                  {formData?.Description?.errorMsg}
                </p>
              )}
            </div>
          </div>

          {/* Action button section */}
          <div className={styles.formBTNSec}>
            <DefaultButton
              btnType="darkGreyVariant"
              text="Close"
              onClick={(_) => {
                resetFormData(initialFormData, setFormData);
                filterTabDatas();
              }}
            />
            <DefaultButton
              btnType="primaryGreen"
              text="Submit"
              onClick={(_) => {
                handleSubmit();
              }}
            />
          </div>
        </>
      )}

      {/* Toast message section */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* add and edit popup section */}
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
            resetFormData(initialFormData, setFormData);
            togglePopupVisibility(
              setPopupController,
              initialPopupController[0],
              index,
              "close"
            );
            if (popupData?.isLoading?.success) {
              filterTabDatas(selectedTab);
            }
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
            popupData.popupType !== "custom" ? popupData.popupTitle : ""
          }
          popupHeight={index === 0 ? true : false}
          noActionBtn={true}
        />
      ))}
    </div>
  );
};

export default Blogs;
