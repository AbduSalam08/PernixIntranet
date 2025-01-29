/* eslint-disable @rushstack/no-new-null */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable require-atomic-updates */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable prefer-const */
/* eslint-disable dot-notation */
/* eslint-disable react/self-closing-comp */
/* eslint-disable max-lines */
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
import { Add, Delete, Edit } from "@mui/icons-material";
import { ToastContainer } from "react-toastify";
import { Paginator, PaginatorPageChangeEvent } from "primereact/paginator";
import SendIcon from "@mui/icons-material/Send";
import { resetFormData, validateField } from "../../../utils/commonUtils";
// import DragDropFile from "../DragAndDrop/DragDropFile";
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
  IHyperLinkColumn,
  IHyperLinkData,
  IPageSearchFields,
  IPaginationData,
  IUserDetails,
} from "../../../interface/interface";
import {
  addBlogCommentsData,
  addBlogData,
  addHyperLinkData,
  deleteBlogData,
  deleteHyperLinkData,
  fecthBlogComments,
  fecthBlogDocumentUsingPath,
  fetchBlogDatas,
  fetchCurUserData,
  fetchHyperlinkDatas,
  getAllUsersList,
  updateBlogData,
  updateHyperLinkData,
} from "../../../services/BlogsPage/BlogsPageServices";
import CustomDropDown from "../../../components/common/CustomInputFields/CustomDropDown";
import CustomDateInput from "../../../components/common/CustomInputFields/CustomDateInput";
import moment from "moment";
import CustomMultipleFileUpload from "../../../components/common/CustomInputFields/CustomMultipleFileUpload";
import RichText from "../../../components/common/RichText/RichText";
import { Chip } from "@mui/material";
import CustomFilePicker from "../../../components/common/CustomInputFields/CustomFilePicker";
import FloatingLabelTextarea from "../../../components/common/CustomInputFields/CustomTextArea";

/* Interface creation */
interface IBlogField {
  Heading: IFormFields;
  Tag: IFormFields;
  Description: IFormFields;
  Attachments: IFormFields;
  Content: IFormFields;
}

interface IHyperLinkField {
  Title: IFormFields;
  Links: IFormFields;
}

interface IBlogDetails {
  ID: number | null;
  Like: string[];
  Idx: number | null;
}

/* Global variable creation */
const errorGrey = require("../../../assets/images/svg/errorGrey.svg");

const blogDetail: IBlogDetails = {
  ID: null,
  Like: [],
  Idx: null,
};

let isAdmin: boolean = false;
let isActivityPage: boolean = false;
let typeOfPage: string = "";
let masterHyperLink: IHyperLinkData[] = [];
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
      centerActionBtn: true,
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
      popupTitle: "Confirmation",
      popupWidth: "450px",
      popupType: "custom",
      centerActionBtn: true,
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
    {
      open: false,
      popupTitle: "Add",
      popupWidth: "800px",
      popupType: "custom",
      defaultCloseBtn: false,
      popupData: "",
      isLoading: {
        inprogress: false,
        error: false,
        success: false,
      },
      messages: {
        success: "Hyperlink added successfully!",
        error: "Something went wrong!",
        successDescription: "The hyperlink 'ABC' has been added successfully.",
        errorDescription:
          "An error occured while add hyperlink, please try again later.",
        inprogress: "Add hyperlink, please wait...",
      },
    },
    {
      open: false,
      popupTitle: "Update",
      popupWidth: "800px",
      popupType: "custom",
      defaultCloseBtn: false,
      popupData: "",
      isLoading: {
        inprogress: false,
        error: false,
        success: false,
      },
      messages: {
        success: "Hyperlink updated successfully!",
        error: "Something went wrong!",
        successDescription:
          "The hyperlink 'ABC' has been updated successfully.",
        errorDescription:
          "An error occured while update hyperlink, please try again later.",
        inprogress: "Update hyperlink, please wait...",
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
    Content: {
      value: null,
      isValid: true,
      errorMsg: "",
      validationRule: {
        required: false,
        type: "file",
      },
    },
  };

  const initialHyperFormData: IHyperLinkField = {
    Title: {
      value: "",
      isValid: true,
      errorMsg: "This field is required.",
      validationRule: {
        required: true,
        type: "string",
      },
    },
    Links: {
      value: "",
      isValid: true,
      errorMsg: "This field is required.",
      validationRule: {
        required: true,
        type: "string",
      },
    },
  };

  /* State creation */
  const [isfilter, setIsfilter] = useState<boolean>(false);
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
  const [curDocFiles, setCurDocFiles] = useState<any[]>([]);
  const [arrTags, setArrTags] = useState<string[]>([]);
  const [masterTabs, setMasterTabs] = useState<string[]>([]);
  const [curMasterTab, setCurMasterTab] = useState<string>("");
  const [arrHyperLinkData, setArrHyperLinkData] = useState<IHyperLinkData[]>(
    []
  );
  const [hyperForm, setHyperForm] = useState<IHyperLinkField | any>({
    ...initialHyperFormData,
  });
  const [curObject, setCurObject] = useState<IHyperLinkData>({
    ...CONFIG.HyperLinkData,
  });
  const [linkSearch, setLinkSearch] = useState<string>("");

  /* Functions creation */
  const handleHyperLinkInputChange = async (
    field: string,
    value: any,
    isValid: boolean,
    errorMsg: string = ""
  ): Promise<void> => {
    setHyperForm((prevData: IHyperLinkField | any) => ({
      ...prevData,
      [field]: {
        ...prevData[field],
        value: value,
        isValid,
        errorMsg: isValid ? "" : errorMsg,
      },
    }));
  };

  const handleInputChange = async (
    field: string,
    value: any,
    isValid: boolean,
    errorMsg: string = ""
  ): Promise<void> => {
    if (field === "Tag") {
      if (value?.includes(",") && value.trim() && value.trim() !== ",") {
        const masterTags: string[] = [
          ...arrTags,
          value?.split(",")?.[0]?.trim(),
        ];
        value = "";
        setArrTags([...masterTags]);
      } else if (value?.trim() === ",") {
        value = "";
      }
    }

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

  const searchForLink = async (value: string): Promise<void> => {
    setLinkSearch(value);
    if (value) {
      let temp: IHyperLinkData[] = await Promise.all(
        masterHyperLink?.filter((val: IHyperLinkData) =>
          val?.Title?.toLowerCase().includes(value?.toLowerCase())
        ) || []
      );
      setArrHyperLinkData([...temp]);
    } else {
      setArrHyperLinkData([...masterHyperLink]);
    }
  };

  const handleSearch = async (): Promise<void> => {
    let temp: IBlogColumnType[] = [...curAllBlogs];

    if (searchField.Status) {
      temp = await Promise.all(
        temp?.filter((val: IBlogColumnType) =>
          searchField.Status === CONFIG.blogDrop[0]
            ? val?.IsActive
            : !val?.IsActive
        )
      );
    }
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
            ) ||
            val?.Status?.toLowerCase().includes(
              searchField.Search?.toLowerCase()
            )
        )
      );
    }
    if (searchField.Date) {
      temp = await Promise.all(
        temp?.filter(
          (val: IBlogColumnType) =>
            val?.Date === moment(searchField.Date).format("DD MMM YYYY")
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
              (val: IBlogColumnType) =>
                val?.Status === CONFIG.blogStatus.Approved
            )
          : tampTabData?.filter(
              (val: IBlogColumnType) =>
                val?.Status === CONFIG.blogStatus.Approved && val?.IsActive
            )
      );
      tampTabData?.sort(
        (a: IBlogColumnType, b: IBlogColumnType) =>
          Number(b.ApprovalOn) - Number(a.ApprovalOn)
      );
    } else if (curTab === CONFIG.BlogsTab[1]) {
      tampTabData = await Promise.all(
        tampTabData?.filter(
          (val: IBlogColumnType) => val?.AuthorId === curUserDetail.ID
        )
      );
    } else {
      tampTabData = await Promise.all(
        tampTabData?.filter(
          (val: IBlogColumnType) => val?.Status === CONFIG.blogStatus.Pending
        ) || []
      );
    }

    setCurAllBlogs([...tampTabData]);
    setSelTabBlogs([...tampTabData]);
    setComSearch({ ...CONFIG.PageSearchFields });
    setArrTags([]);
    setCurBlogData(null);
    setSelectedTab(curTab);
    setIsLoading(false);
    setSelData({ ...blogDetail });
    setArrHyperLinkData([...masterHyperLink]);
    setIsView(false);
    setIsCreate(false);
  };

  const handleLinkSubmit = async (i: number): Promise<void> => {
    let hasErrors: boolean = false;

    const updatedFormData = Object.keys(hyperForm).reduce((acc, key) => {
      const fieldData = hyperForm[key];
      let { isValid, errorMsg } = validateField(
        key,
        fieldData.value,
        fieldData?.validationRule
      );

      if (!isValid) {
        hasErrors = true;
      }

      errorMsg = key === "Title" ? "Name is required" : "Invalid url";

      return {
        ...acc,
        [key]: {
          ...fieldData,
          isValid,
          errorMsg,
        },
      };
    }, {} as typeof hyperForm);

    setHyperForm(updatedFormData);
    if (!hasErrors) {
      let data: any = {};
      const columns: IHyperLinkColumn = CONFIG.HyperLinkColumn;

      data[columns.Title] = hyperForm?.Title?.value ?? "";
      data[columns.Links] = hyperForm?.Links?.value ?? "";
      data[columns.ID] = curObject?.id || null;
      data[columns.Result] = typeOfPage;

      togglePopupVisibility(
        setPopupController,
        initialPopupController[i],
        i,
        "close"
      );
      resetFormData(initialHyperFormData, setHyperForm);
      if (data.ID) {
        await updateHyperLinkData({ ...data }).then(() => {
          const Idx: number = masterHyperLink?.findIndex(
            (res: IHyperLinkData) => res?.id === curObject?.id
          );

          masterHyperLink[Idx].Title = data?.Title ?? "";
          masterHyperLink[Idx].Links = data?.Links ?? "";
          setLinkSearch("");
          setArrHyperLinkData([...masterHyperLink]);
        });
      } else {
        await addHyperLinkData({ ...data }).then((res: IHyperLinkData[]) => {
          masterHyperLink = [...res, ...masterHyperLink];
          setLinkSearch("");
          setArrHyperLinkData([...masterHyperLink]);
        });
      }
    } else {
      console.log("Form contains errors");
    }
  };

  const handleSubmit = async (Status: string = ""): Promise<void> => {
    let hasErrors: boolean = false;

    const updatedFormData = Object.keys(formData).reduce((acc, key) => {
      const fieldData = formData[key];
      let { isValid, errorMsg } = validateField(
        key,
        // key === "Tag" && fieldData.value?.length <= 255
        key === "Tag" && arrTags?.join(",")?.length <= 255
          ? arrTags?.join(",")
          : key !== "Tag"
          ? fieldData.value
          : "",
        fieldData?.validationRule
      );

      if (!isValid) {
        hasErrors = true;
      }

      errorMsg =
        key === "Tag" && arrTags?.join(",")?.length <= 255
          ? errorMsg
          : key !== "Tag"
          ? errorMsg
          : "Maximum 255 characters allowed.";

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
      const docFileData: any = {};
      const column: IBlogColumn = CONFIG.BlogColumn;

      data[column.ID] = curBlogData?.ID || null;
      data[column.Heading] = formData?.Heading?.value || "";
      data[column.Title] = arrTags?.join(",") || "";
      // data[column.Title] = formData?.Tag?.value || "";
      data[column.Description] = formData?.Description?.value || "";
      data[column.Status] = Status;
      data[column.Result] = typeOfPage;

      resetFormData(initialFormData, setFormData);
      if (curBlogData?.ID) {
        const addingFiles: any[] = formData?.Content?.value?.length
          ? formData?.Content?.value?.filter((item1: any) => item1?.size)
          : [];

        const filterFiles: any[] = formData?.Content?.value?.length
          ? formData?.Content?.value?.filter(
              (item1: any) =>
                !addingFiles.some((item2: any) => item1.name === item2.name)
            )
          : [];

        const removedFiles: any[] = formData?.Content?.value?.length
          ? curDocFiles?.filter(
              (item1: any) =>
                !filterFiles.some((item2: any) => item1.name === item2.name)
            )
          : [...curDocFiles];

        // Attachments json prepared
        fileData[column.Attachments] = formData?.Attachments?.value?.name
          ? formData?.Attachments?.value
          : null;

        await updateBlogData(
          Number(curBlogData?.ID),
          { ...data },
          true,
          fileData,
          addingFiles,
          removedFiles,
          curBlogData
        );

        const Idx: number = masterBlog?.findIndex(
          (res: IBlogColumnType) => res?.ID === curBlogData?.ID
        );

        masterBlog[Idx].Heading = formData?.Heading?.value || "";
        masterBlog[Idx].Tag = arrTags?.join(",") || "";
        // masterBlog[Idx].Tag = formData?.Tag?.value || "";
        masterBlog[Idx].Description = formData?.Description?.value || "";
        masterBlog[Idx].Status = Status;

        if (fileData?.Attachments) {
          const arrWords: string[] =
            curBlogData?.Attachments?.[0]?.serverRelativeUrl.split("/");
          const index: number = arrWords.findIndex(
            (val: string) => val === arrWords[arrWords.length - 1]
          );
          arrWords.splice(index, 1, fileData?.Attachments?.name);
          const url: string = arrWords.join("/");

          masterBlog[Idx].Attachments = [
            {
              fileName: fileData?.Attachments?.name,
              content: null,
              serverRelativeUrl: url,
            },
          ];
        }

        await filterTabDatas(selectedTab);
      } else {
        // Attachments json prepared
        fileData[column.Attachments] = formData?.Attachments?.value || null;

        // Document file json prepared
        docFileData[column.Content] = formData?.Content?.value || [];

        await addBlogData(
          data,
          fileData,
          docFileData.Content,
          curUserDetail
        ).then(async (res: IBlogColumnType[]) => {
          masterBlog = [...res, ...masterBlog];
          await filterTabDatas(selectedTab);
        });
      }
    } else {
      console.log("Form contains errors");
    }
  };

  const handleRemoveTag = async (Idx: number): Promise<void> => {
    const tempTags: string[] = await Promise.all(
      arrTags?.filter((val: string, i: number) => i !== Idx) || []
    );

    setArrTags([...tempTags]);
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

  const handleEdit = async (
    selObject: IBlogColumnType,
    Id: number | null,
    type: string
  ): Promise<void> => {
    await fecthBlogDocumentUsingPath(
      CONFIG.blogFileFlowPath + "/Pernix_Wiki_" + selObject.ID
    ).then(async (res: any) => {
      const arrDocuments: any[] = [];

      await res?.forEach((attach: any) => {
        arrDocuments.push({
          ...attach,
          name: attach.FileLeafRef,
        });
      });

      setCurDocFiles([...arrDocuments]);
      setCurBlogData({ ...selObject });
      if (type === "edit") {
        setFormData((prev: IBlogField) => ({
          ...prev,
          Heading: {
            ...prev["Heading"],
            value: selObject.Heading,
          },
          Tag: {
            ...prev["Tag"],
            value: "",
            // value: selObject.Tag,
          },
          Description: {
            ...prev["Description"],
            value: selObject?.Description,
          },
          Attachments: {
            ...prev["Attachments"],
            value: selObject.Attachments?.[0]?.fileName,
          },
          Content: {
            ...prev["Content"],
            value: arrDocuments,
          },
        }));
        setArrTags(selObject?.Tag?.split(",") || []);
        setIsCreate(true);
      } else {
        await fecthBlogComments(Number(Id)).then(
          (res: IBlogCommentsColumnType[]) => {
            setAllComment([...res]);
            setIsLoading(false);
            setIsView(true);
          }
        );
      }
    });
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

    await handleEdit({ ...masterBlog[Idx] }, Id, "view");
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

  const handleSelect = async (data: IHyperLinkData): Promise<void> => {
    setCurObject({ ...data });
    setHyperForm({
      Title: {
        ...initialHyperFormData.Title,
        value: data?.Title ?? "",
      },
      Links: {
        ...initialHyperFormData.Links,
        value: data?.Links ?? "",
      },
    });
    togglePopupVisibility(
      setPopupController,
      initialPopupController[3],
      3,
      "open"
    );
  };

  const popupInputs: any[] = [
    [
      <div key={0}>
        <p
          style={{
            textAlign: "center",
          }}
        >
          Are you sure you want to delete this memo?
        </p>
      </div>,
    ],
    [
      <div key={1}>
        <p className={styles.approvePopupContent}>
          Are you sure want to approve this memo?
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
    [
      <div key={2}>
        <div
          style={{
            marginBottom: "20px",
          }}
        >
          <CustomInput
            value={hyperForm.Title.value}
            placeholder="Display name"
            isValid={hyperForm.Title.isValid}
            errorMsg={hyperForm.Title.errorMsg}
            onChange={(e: any) => {
              const value = e.trimStart();
              const { isValid, errorMsg } = validateField(
                "Name",
                value,
                hyperForm.Title.validationRule
              );
              handleHyperLinkInputChange(
                CONFIG.HyperLinkColumn.Title,
                value,
                isValid,
                errorMsg
              );
            }}
          />
        </div>
        <div>
          <FloatingLabelTextarea
            value={hyperForm.Links.value}
            placeholder="URL"
            size="XL"
            isValid={hyperForm.Links.isValid}
            errorMsg={hyperForm.Links.errorMsg}
            onChange={(e: any) => {
              const value = e.trimStart();
              const urlRegex =
                /^(https?:\/\/)?((([a-z0-9][-a-z0-9]{0,62}\.)+[a-z]{2,63})|localhost|((\d{1,3}\.){3}\d{1,3}))(:\d{1,5})?(\/[^\s]*)?$/i;
              const isCheck: boolean = urlRegex.test(value);
              const { isValid, errorMsg } = validateField(
                "Link",
                isCheck ? value : "",
                hyperForm.Links.validationRule
              );
              handleHyperLinkInputChange(
                CONFIG.HyperLinkColumn.Links,
                value,
                isValid,
                errorMsg ? "Invalid url" : ""
              );
            }}
          />
        </div>
      </div>,
    ],
    [
      <div key={3}>
        <div
          style={{
            marginBottom: "20px",
          }}
        >
          <CustomInput
            value={hyperForm.Title.value}
            placeholder="Display name"
            isValid={hyperForm.Title.isValid}
            errorMsg={hyperForm.Title.errorMsg}
            onChange={(e: any) => {
              const value = e.trimStart();
              const { isValid, errorMsg } = validateField(
                "Name",
                value,
                hyperForm.Title.validationRule
              );
              handleHyperLinkInputChange(
                CONFIG.HyperLinkColumn.Title,
                value,
                isValid,
                errorMsg
              );
            }}
          />
        </div>
        <div>
          <FloatingLabelTextarea
            value={hyperForm.Links.value}
            placeholder="URL"
            size="XL"
            isValid={hyperForm.Links.isValid}
            errorMsg={hyperForm.Links.errorMsg}
            onChange={(e: any) => {
              const value = e.trimStart();
              const urlRegex =
                /^(https?:\/\/)?((([a-z0-9][-a-z0-9]{0,62}\.)+[a-z]{2,63})|localhost|((\d{1,3}\.){3}\d{1,3}))(:\d{1,5})?(\/[^\s]*)?$/i;
              const isCheck: boolean = urlRegex.test(value);
              const { isValid, errorMsg } = validateField(
                "Link",
                isCheck ? value : "",
                hyperForm.Links.validationRule
              );
              handleHyperLinkInputChange(
                CONFIG.HyperLinkColumn.Links,
                value,
                isValid,
                errorMsg ? "Invalid url" : ""
              );
            }}
          />
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
        disabled: false,
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
              Status: CONFIG.blogStatus.Rejected,
            },
            true
          );
          masterBlog[Number(selData?.Idx)].Status = CONFIG.blogStatus.Rejected;
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
              Status: CONFIG.blogStatus.Approved,
              ApprovalOn: new Date(),
            },
            true
          );
          masterBlog[Number(selData?.Idx)].Status = CONFIG.blogStatus.Approved;
          masterBlog[Number(selData?.Idx)].ApprovalOn = Number(
            moment(new Date()).format("YYYYMMDDHHmm")
          );
          await filterTabDatas(selectedTab);
        },
      },
    ],
    [
      {
        text: "Cancel",
        btnType: "darkGreyVariant",
        disabled: false,
        endIcon: false,
        startIcon: false,
        size: "large",
        onClick: async () => {
          togglePopupVisibility(
            setPopupController,
            initialPopupController[2],
            2,
            "close"
          );
        },
      },
      {
        text: "Submit",
        btnType: "primaryGreen",
        endIcon: false,
        startIcon: false,
        size: "large",
        onClick: async () => {
          await handleLinkSubmit(2);
        },
      },
    ],
    [
      {
        text: "Cancel",
        btnType: "darkGreyVariant",
        disabled: false,
        endIcon: false,
        startIcon: false,
        size: "large",
        onClick: async () => {
          togglePopupVisibility(
            setPopupController,
            initialPopupController[3],
            3,
            "close"
          );
        },
      },
      {
        text: "Update",
        btnType: "primaryGreen",
        endIcon: false,
        startIcon: false,
        size: "large",
        onClick: async () => {
          await handleLinkSubmit(3);
        },
      },
    ],
  ];

  const initialFetchData = async (): Promise<void> => {
    setIsLoading(true);

    await RoleAuth(
      CONFIG.SPGroupName.Pernix_Admin,
      {
        highPriorityGroups: [
          typeOfPage === CONFIG.blogType.Lesson
            ? CONFIG.SPGroupName.LessonsLearned_Admin
            : CONFIG.SPGroupName.PoliciesAndProcedures_Admin,
        ],
      },
      dispatch
    );
    await getAllUsersList(dispatch);
    await fetchCurUserData().then((res: ICurUserData[]) => {
      curUserDetail = res?.[0] || [];
    });
    await fetchHyperlinkDatas(typeOfPage).then((res: IHyperLinkData[]) => {
      masterHyperLink = res;
    });
    await fetchBlogDatas(typeOfPage).then((res: IBlogColumnType[]) => {
      masterBlog = res;
    });

    await filterTabDatas(
      isActivityPage ? CONFIG.BlogsTab[2] : CONFIG.BlogsTab[0]
    );
  };

  useEffect(() => {
    const urlObj = new URL(window.location.href);
    const params = new URLSearchParams(urlObj.search);
    isActivityPage =
      params?.get("Page")?.toLowerCase() === "activity" ? true : false;
    typeOfPage =
      params?.get("Type")?.toLowerCase() === "lesson"
        ? CONFIG.blogType.Lesson
        : CONFIG.blogType.Policy;

    if (typeOfPage === CONFIG.blogType.Lesson) {
      setMasterTabs(CONFIG.LessonTabs);
      setCurMasterTab(
        isActivityPage ? CONFIG.LessonTabs[1] : CONFIG.LessonTabs[0]
      );
    } else {
      setMasterTabs(CONFIG.PoliciesTabs);
      setCurMasterTab(
        isActivityPage ? CONFIG.PoliciesTabs[1] : CONFIG.PoliciesTabs[0]
      );
    }

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
              <div className={styles.backHeader}>View a Memo</div>
            </div>
          </div>

          {/* View blog content section */}
          <div className={styles.viewBlogContainer}>
            <div className={styles.VHeading}>{curBlogData?.Heading}</div>
            <div className={styles.VTag}>
              {curBlogData?.Tag?.split(",")?.map((val: string, ind: number) => {
                return <Chip key={ind} label={`${val}`} />;
              }) || ""}
            </div>
            <img
              src={curBlogData?.Attachments?.[0]?.serverRelativeUrl}
              alt="blog img"
              className={styles.VImg}
            />
            <div
              className={styles.VContent}
              dangerouslySetInnerHTML={{
                __html: curBlogData?.Description || "",
              }}
            />
            {curDocFiles?.length > 0 && (
              <div className={styles.VDocuments}>
                <p>Attachments</p>
                {curDocFiles?.map((val: any, Idx: number) => {
                  return (
                    <div
                      key={Idx}
                      onClick={() => {
                        window.open(
                          window.location.origin + val?.FileRef + "?web=1"
                        );
                      }}
                    >
                      <i className="pi pi-paperclip"></i> {val?.name}
                    </div>
                  );
                })}
              </div>
            )}
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
            <div
              className={styles.VCommentContainer}
              style={{
                display:
                  CONFIG.blogStatus.Approved === curBlogData?.Status &&
                  curBlogData?.IsActive
                    ? "block"
                    : "none",
              }}
            >
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
          <div className={styles.masterHeaderContainer}>
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
            <div className={styles.backHeader}>{typeOfPage}</div>
          </div>

          {/* Header section */}
          <div className={styles.headerContainer}>
            <div className={styles.masterTabsContainer}>
              {masterTabs?.map((str: string, i: number) => {
                return (
                  <span
                    key={i}
                    style={{
                      color: curMasterTab === str ? "#fff" : "#0b4d53",
                      backgroundColor:
                        curMasterTab === str ? "#0b4d53" : "transparent",
                    }}
                    onClick={(_) => {
                      searchField.Search = "";
                      searchField.Status = "";
                      searchField.Date = null;
                      setComSearch({ ...searchField });
                      filterTabDatas();
                      searchForLink("");
                      setCurMasterTab(str);
                    }}
                  >
                    {str}
                  </span>
                );
              })}
            </div>

            {/* Search section */}
            {curMasterTab === CONFIG.LessonTabs[0] ||
            curMasterTab === CONFIG.PoliciesTabs[0] ? (
              <>
                <div className={styles.searchContainer}>
                  <div>
                    <CustomInput
                      noErrorMsg
                      secWidth="180px"
                      size="SM"
                      value={linkSearch}
                      placeholder="Search"
                      onChange={(e: any) => {
                        const value: string = e.trimStart();
                        searchForLink(value);
                      }}
                    />
                  </div>
                  <div
                    className={styles.refreshBTN}
                    onClick={(_) => {
                      searchForLink("");
                    }}
                  >
                    <i className="pi pi-refresh" />
                  </div>
                  <div
                    style={{
                      display: isAdmin ? "flex" : "none",
                    }}
                  >
                    <DefaultButton
                      text="Add"
                      btnType="primaryGreen"
                      startIcon={<Add />}
                      onClick={(_) => {
                        resetFormData(hyperForm, setHyperForm);
                        setHyperForm({ ...initialHyperFormData });
                        togglePopupVisibility(
                          setPopupController,
                          initialPopupController[2],
                          2,
                          "open"
                        );
                      }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className={styles.searchContainer}>
                  <div
                    style={{
                      display: isAdmin ? "flex" : "none",
                    }}
                  >
                    <CustomDropDown
                      noErrorMsg
                      width="180px"
                      floatingLabel={false}
                      size="SM"
                      options={[...CONFIG.blogDrop]}
                      value={comSearch.Status}
                      placeholder="Select Status"
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
                      secWidth="180px"
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
                  <div>
                    <CustomDateInput
                      label="Select Date"
                      minWidth="180px"
                      maxWidth="180px"
                      size="SM"
                      value={comSearch?.Date}
                      onChange={(e: any) => {
                        const value: any = e;
                        searchField.Date = value;
                        setComSearch((prev: IPageSearchFields) => ({
                          ...prev,
                          Date: value,
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
                      searchField.Date = null;
                      setComSearch({ ...searchField });
                      handleSearch();
                    }}
                  >
                    <i className="pi pi-refresh" />
                  </div>
                  <div>
                    <DefaultButton
                      text="Add"
                      btnType="primaryGreen"
                      startIcon={<Add />}
                      onClick={(_) => {
                        setIsCreate(true);
                      }}
                    />
                  </div>
                </div>
                <div className={styles.ismobile}>
                  <DefaultButton
                    onlyIcon
                    btnType="primaryGreen"
                    startIcon={<Add />}
                    onClick={(_) => {
                      setIsCreate(true);
                    }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Master body section */}
          {curMasterTab === CONFIG.LessonTabs[0] ||
          curMasterTab === CONFIG.PoliciesTabs[0] ? (
            <>
              <div className={styles.detailsListContainer}>
                <div className={styles.lableSec}>Name</div>
                {arrHyperLinkData?.length ? (
                  <div className={styles.bodySec}>
                    {arrHyperLinkData?.map(
                      (val: IHyperLinkData, Idx: number) => {
                        return (
                          <div key={Idx} className={styles.rowSec}>
                            <div
                              title={val?.Title}
                              className={styles.titleSec}
                              onClick={(_) => {
                                window.open(val?.Links, "_blank");
                              }}
                            >
                              {val?.Title}
                            </div>
                            <div
                              className={styles.iconSec}
                              style={{
                                display: isAdmin ? "flex" : "none",
                              }}
                            >
                              <Edit
                                style={{
                                  color: "#adadad",
                                  cursor: "pointer",
                                  fontSize: "22px",
                                }}
                                onClick={() => handleSelect({ ...val })}
                              />
                              <Delete
                                style={{
                                  color: "#ff0000",
                                  cursor: "pointer",
                                  fontSize: "22px",
                                }}
                                onClick={async () => {
                                  await deleteHyperLinkData(
                                    Number(val?.id)
                                  ).then(() => {
                                    masterHyperLink =
                                      masterHyperLink?.filter(
                                        (val: IHyperLinkData) =>
                                          val?.id !== Number(val?.id)
                                      ) || [];
                                    setLinkSearch("");
                                    setArrHyperLinkData([...masterHyperLink]);
                                  });
                                }}
                              />
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                ) : (
                  <div
                    className="errorWrapper"
                    style={{ height: "calc(100vh - 291px)" }}
                  >
                    <img src={errorGrey} alt="Error" />
                    <span className="disabledText">{"No links found!"}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
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
                    ?.slice(
                      pagination.first,
                      pagination.first + pagination.rows
                    )
                    ?.map((val: IBlogColumnType, idx: number) => {
                      return (
                        <div
                          key={idx}
                          className={`${styles.cardSec} ${
                            selectedTab === CONFIG.BlogsTab[2]
                              ? styles.pendingApproval
                              : styles.allblog
                          }`}
                          // className={styles.cardSec}
                          // style={{
                          //   height:
                          //     selectedTab === CONFIG.BlogsTab[2]
                          //       ? "494px"
                          //       : "440px",
                          // }}
                        >
                          <img
                            className={styles.imgSec}
                            src={val?.Attachments?.[0]?.serverRelativeUrl}
                            alt="blog img"
                          />
                          <div className={styles.cardTag}>
                            {/* <span>
                            {val?.Tag?.split(",")?.map(
                              (val: string, ind: number) => {
                                return (
                                  <Chip
                                    className={styles.mainChip}
                                    key={ind}
                                    label={val}
                                  />
                                );
                              }
                            ) || ""}
                          </span> */}
                            <span className={styles.tagsWrap}>
                              {val?.Tag?.split(",")?.map(
                                (tag: string, Idx: number) => {
                                  if (Idx <= 1) {
                                    return (
                                      <Chip
                                        key={Idx}
                                        className={styles.mainChip}
                                        label={`${tag}`}
                                      />
                                    );
                                  }
                                }
                              ) || ""}
                              {val?.Tag?.split(",")?.length > 2 && (
                                <div title={val?.Tag?.split(",")?.join(", ")}>
                                  <Chip
                                    key={"missing units"}
                                    className={styles.mainChip}
                                    label={`+${
                                      val?.Tag?.split(",").length - 2
                                    } more`}
                                    clickable={false}
                                  />
                                </div>
                              )}
                            </span>
                            <div
                              className={styles.icons}
                              // style={{
                              //   display: "flex",
                              //   alignItems: "center",
                              //   gap: "10px",
                              // }}
                            >
                              <div
                                style={{
                                  display:
                                    val?.Status ===
                                      CONFIG.blogStatus.Approved && isAdmin
                                      ? "flex"
                                      : "none",
                                }}
                              >
                                <InputSwitch
                                  className="sectionToggler"
                                  checked={val?.IsActive}
                                  onChange={async (data: any) => {
                                    const curIndex: number =
                                      masterBlog?.findIndex(
                                        (res: IBlogColumnType) =>
                                          res?.ID === val?.ID
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
                              </div>
                              <i
                                style={{
                                  display:
                                    (val?.Status !==
                                      CONFIG.blogStatus.Pending &&
                                      selectedTab === CONFIG.BlogsTab[1]) ||
                                    (val?.Status !==
                                      CONFIG.blogStatus.Pending &&
                                      isAdmin)
                                      ? "flex"
                                      : "none",
                                }}
                                className="pi pi-pen-to-square"
                                onClick={() => {
                                  handleEdit(val, null, "edit");
                                }}
                              />
                              <i
                                style={{
                                  display:
                                    val?.Status !==
                                      CONFIG.blogStatus.Approved &&
                                    (selectedTab === CONFIG.BlogsTab[1] ||
                                      isAdmin)
                                      ? "flex"
                                      : "none",
                                }}
                                className="pi pi-trash"
                                onClick={() => {
                                  const curIndex: number =
                                    masterBlog?.findIndex(
                                      (res: IBlogColumnType) =>
                                        res?.ID === val?.ID
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
                            <div>
                              <div
                                style={{
                                  display:
                                    selectedTab === CONFIG.BlogsTab[0]
                                      ? "none"
                                      : "flex",
                                  background:
                                    val?.Status === CONFIG.blogStatus.Draft
                                      ? "#51515136"
                                      : val?.Status ===
                                        CONFIG.blogStatus.Pending
                                      ? "#cec41936"
                                      : val?.Status ===
                                        CONFIG.blogStatus.Approved
                                      ? "#00bb0436"
                                      : "#bb000036",
                                  color:
                                    val?.Status === CONFIG.blogStatus.Draft
                                      ? "#515151"
                                      : val?.Status ===
                                        CONFIG.blogStatus.Pending
                                      ? "#484502"
                                      : val?.Status ===
                                        CONFIG.blogStatus.Approved
                                      ? "#00bb04"
                                      : "#bb0000",
                                }}
                              >
                                {val?.Status}
                              </div>
                              <i
                                className="pi pi-arrow-up-right"
                                onClick={() => {
                                  const curIndex: number =
                                    masterBlog?.findIndex(
                                      (res: IBlogColumnType) =>
                                        res?.ID === val?.ID
                                    );
                                  handleView(Number(val?.ID), curIndex);
                                }}
                              />
                            </div>
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
                                  const curIndex: number =
                                    masterBlog?.findIndex(
                                      (res: IBlogColumnType) =>
                                        res?.ID === val?.ID
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

              {/* mobilefilter */}
              <div className={styles.filtericon}>
                <i
                  className="pi pi-filter"
                  onClick={() => {
                    setIsfilter(!isfilter);
                  }}
                />
              </div>

              <div
                className={`${styles.filter_container} ${
                  isfilter ? styles.active_filter_container : ""
                }`}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    margin: "10px",
                  }}
                >
                  <div
                    style={{
                      display: isAdmin ? "flex" : "none",
                    }}
                  >
                    <CustomDropDown
                      noErrorMsg
                      floatingLabel={false}
                      width="180px"
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
                      }}
                    />
                  </div>
                  <div>
                    <CustomInput
                      noErrorMsg
                      secWidth="180px"
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
                        // handleSearch();
                      }}
                    />
                  </div>
                  <div>
                    <CustomDateInput
                      label="Select Date"
                      size="SM"
                      minWidth="180px"
                      maxWidth="180px"
                      value={comSearch?.Date}
                      onChange={(e: any) => {
                        const value: any = e;
                        searchField.Date = value;
                        setComSearch((prev: IPageSearchFields) => ({
                          ...prev,
                          Date: value,
                        }));
                        // handleSearch();
                      }}
                    />
                  </div>

                  <div>
                    <DefaultButton
                      text="Apply"
                      size="small"
                      fullWidth
                      btnType="primaryGreen"
                      onClick={(_) => {
                        // handleSearch([...shownewsData]);

                        // handleSearch(strSearch, [...filDocDatas]);
                        handleSearch();

                        setIsfilter(!isfilter);
                      }}
                    />
                  </div>
                  <div>
                    <DefaultButton
                      text="Clear"
                      size="small"
                      fullWidth
                      btnType="darkGreyVariant"
                      onClick={(_) => {
                        setIsfilter(!isfilter);
                        searchField.Search = "";
                        searchField.Status = "";
                        searchField.Date = null;
                        setComSearch({ ...searchField });
                        handleSearch();

                        // setStrSearch("");
                        // handleSearch("", [...filDocDatas]);
                      }}
                    />
                  </div>
                </div>
              </div>

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
          )}
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
                  setArrTags([]);
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
              <div className={styles.backHeader}>
                {curBlogData?.ID ? "Edit a Memo" : "Add a Memo"}
              </div>
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
                  <div className={styles.tagInput}>
                    <CustomInput
                      value={formData?.Tag?.value}
                      placeholder="Tag ( Separate the tags using commas )"
                      maxLength={255}
                      isValid={formData?.Tag?.isValid}
                      errorMsg={formData?.Tag?.errorMsg}
                      onChange={(e: any) => {
                        const value = e.trimStart();
                        const { isValid, errorMsg } = validateField(
                          "Tag",
                          value.length <= 255 ? value : "",
                          formData?.Tag?.validationRule
                        );
                        handleInputChange(
                          "Tag",
                          value,
                          isValid,
                          value.length <= 255
                            ? errorMsg
                            : "Maximum 255 characters allowed."
                        );
                      }}
                    />
                  </div>
                  {arrTags?.length ? (
                    <div className={styles.tagChips}>
                      {arrTags?.map((tag: string, Idx: number) => {
                        return (
                          <Chip
                            key={Idx}
                            className={styles.mainChip}
                            label={`${tag}`}
                            onDelete={() => handleRemoveTag(Idx)}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    ""
                  )}
                </div>
                <div className={styles.ImageSec}>
                  <CustomFilePicker
                    context={props.context}
                    selectedFile={
                      formData?.Attachments?.value?.name ||
                      formData?.Attachments?.value
                    }
                    onSave={(fileData) => {
                      const value: any = fileData?.file;
                      const { isValid, errorMsg } = validateField(
                        CONFIG.BlogColumn.Attachments,
                        value ? value.name : "",
                        formData.Attachments.validationRule
                      );
                      handleInputChange(
                        CONFIG.BlogColumn.Attachments,
                        value,
                        isValid,
                        errorMsg
                      );
                    }}
                    onChange={(fileData) => {
                      console.log("File changed:", fileData);
                    }}
                    isValid={formData?.Attachments.isValid}
                    errorMsg={formData?.Attachments.errorMsg}
                    // isValid={false}
                    // errorMsg={"Mandatory*"}
                  />
                  {/* <DragDropFile
                  setNewVisitor={setFormData}
                  newVisitor={formData?.Attachments?.value}
                />
                {(formData?.Attachments?.value?.name ||
                  formData?.Attachments?.value) && (
                  <div className={styles.selectedFileName}>
                    {formData?.Attachments?.value?.name
                      ? formData?.Attachments?.value?.name
                      : formData?.Attachments?.value
                      ? formData?.Attachments?.value
                      : ""}
                  </div>
                )}
                {!formData?.Attachments?.isValid && (
                  <p className={styles.errorMsg}>
                    {formData?.Attachments?.errorMsg}
                  </p>
                )} */}
                </div>
              </div>
              <div className={styles.thirdRow}>
                <CustomMultipleFileUpload
                  placeholder="Click to upload attachments"
                  accept="application/*"
                  selectedFilesMaxHeight={"60px"}
                  selectedFilesMinHeight={"50px"}
                  emptyFileMessage="No files selected"
                  multiple
                  value={formData?.Content?.value || []}
                  onFileSelect={(e: any) => {
                    const value: any = e;
                    let temp: any[] = value || [];

                    if (curBlogData?.ID) {
                      const arrNewFiles: any[] =
                        value?.filter((val: any) => val?.type) || [];
                      const arrRemFiles: any[] =
                        value?.filter((val: any) => !val?.type) || [];
                      const filArrayFile: any[] =
                        arrRemFiles.filter(
                          (obj1: any) =>
                            !arrNewFiles.some(
                              (obj2: any) => obj1.name === obj2.name
                            )
                        ) || [];
                      temp = [...filArrayFile, ...arrNewFiles];
                    }

                    const { isValid, errorMsg } = validateField(
                      "Content",
                      temp?.[0]?.name || null,
                      formData.Content.validationRule
                    );
                    handleInputChange(
                      "Content",
                      temp || null,
                      isValid,
                      errorMsg
                    );
                  }}
                  isValid={formData.Content.isValid}
                  errMsg={formData.Content.errorMsg}
                />
              </div>
            </div>

            <div className={styles.secondRow}>
              <RichText
                className={`blog ${styles.richtextwrapper}`}
                isValid={!formData?.Description?.isValid}
                errorMsg={formData?.Description?.errorMsg}
                value={formData?.Description?.value}
                onChange={(res: any) => {
                  let value: string = "";

                  if (res === "<p><br></p>") {
                    value = "";
                  } else if (
                    res?.replace(/<(.|\n)*?>/g, "").trim().length === 0
                  ) {
                    value = "";
                  } else {
                    value = res;
                  }

                  const { isValid, errorMsg } = validateField(
                    "Description",
                    value,
                    formData?.Description?.validationRule
                  );
                  handleInputChange("Description", value, isValid, errorMsg);
                }}
                placeholder="Type your content here..."
                // className="myRichTextEditor"
              />
            </div>
          </div>

          {/* Action button section */}
          <div className={styles.formBTNSec}>
            <DefaultButton
              btnType="darkGreyVariant"
              text="Close"
              onClick={(_) => {
                setArrTags([]);
                resetFormData(initialFormData, setFormData);
                filterTabDatas(selectedTab);
              }}
            />
            <DefaultButton
              btnType="primaryGreen"
              text="Save as draft"
              onClick={(_) => {
                handleSubmit(CONFIG.blogStatus.Draft);
              }}
            />
            <DefaultButton
              btnType="primaryGreen"
              text="Submit"
              onClick={(_) => {
                handleSubmit(CONFIG.blogStatus.Pending);
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
          centerActionBtn={popupData.centerActionBtn}
        />
      ))}
    </div>
  );
};

export default Blogs;
