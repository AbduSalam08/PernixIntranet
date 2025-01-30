/* eslint-disable @typescript-eslint/no-namespace */
import {
  IBlogColumn,
  IBlogColumnType,
  IBlogCommentsColumn,
  IBlogCommentsColumnType,
  IBlogStatus,
  ICommonentsName,
  IDocRepositoryColumn,
  IFeedbackQusColumn,
  IFeedbackQusType,
  IFeedbackResColumn,
  IFeedbackResType,
  IListName,
  IMotivateColumn,
  INavigatePage,
  IPageSearchFields,
  IPaginationData,
  IEDMonthDrop,
  IQuoteDatas,
  IRoleDetails,
  ISelectWish,
  ISPGroupName,
  ITenantDetail,
  IUserMailPath,
  IProjectDocNames,
  IEDSearch,
  IEmployeeDirectoryUsersData,
  IBlogType,
  IHyperLinkColumn,
  IHyperLinkData,
} from "../interface/interface";

export namespace CONFIG {
  export const TenantDetail: ITenantDetail = {
    webURL: `${window.location.origin}${window.location.pathname
      .split("/", 3)
      .join("/")}`,
    tenantURL: `${window.location.origin}`,
  };

  export const fileFlowPath: string = `${window.location.pathname
    .split("/", 3)
    .join("/")}/Intranet_DocumentRepository`;

  export const blogFileFlowPath: string = `${window.location.pathname
    .split("/", 3)
    .join("/")}/Intranet_PernixWiki`;

  export const ListNames: IListName = {
    Intranet_DocumentRepository: "Intranet_DocumentRepository",
    Intranet_MotivationalQuotes: "Intranet_MotivationalQuotes",
    Intranet_NewHires: "Intranet_NewHires",
    Intranet_News: "Intranet_News",
    Intranet_QuestionToCEO: "Intranet_QuestionToCEO",
    Intranet_ShoutOuts: "Intranet_ShoutOuts",
    HelpDesk_AllTickets: "HelpDesk_AllTickets",
    Calendar_Azure_Group_ID: "Calendar_Azure_Group_ID",
    HelpDesk_TicketConversations: "HelpDesk_TicketConversations",
    Intranet_QuestionsToCEO: "Intranet_QuestionsToCEO",
    Intranet_PollQuestion: "Intranet_PollQuestion",
    Intranet_PollOptions: "Intranet_PollOptions",
    Intranet_PollResponse: "Intranet_PollResponse",
    Intranet_Blogs: "Intranet_Blogs",
    Intranet_feedbackQuestion: "Intranet_feedbackQuestion",
    Intranet_feedbackResponse: "Intranet_feedbackResponse",
    Intranet_ShoutOutsOptions: "Intranet_ShoutOutsOptions",
    Intranet_BirthDay: "Intranet_BirthDay",
    Intranet_BirthdayWishes: "Intranet_BirthdayWishes",
    EmployeeDirectory_Config: "EmployeeDirectory_Config",
    IntranetBlogs_Title: "IntranetBlogs_Title",
    HelpDesk_RecurrenceConfig: "HelpDesk_RecurrenceConfig",
    FlexibleSection: "ShowComponent",
    Intranet_BlogComments: "Intranet_BlogComments",
    Intranet_PernixWiki: "Intranet_PernixWiki",
    HelpDesk_TicketLocationConfig: "HelpDesk_TicketLocationConfig",
    ProjectTemplate: "ProjectTemplate",
    Intranet_Hyperlink: "Intranet_Hyperlink",
  };

  export const SPGroupName: ISPGroupName = {
    Birthdays_Admin: "Birthdays_Admin",
    Calendar_Admin: "Calendar_Admin",
    Documentrepository_Admin: "Documentrepository_Admin",
    Mainbanner_Admin: "Mainbanner_Admin",
    Newhire_Admin: "Newhire_Admin",
    News_Admin: "News_Admin",
    Pernix_Admin: "Pernix_Connect_Super_Admin",
    Poll_Admin: "Poll_Admin",
    QuestionCEO_Admin: "Question_To_Leadership_Admin",
    QuestionCEO: "Leadership",
    Shoutouts_Admin: "Shoutouts_Admin",
    HelpDesk_Ticket_Managers: "HelpDesk_Ticket_Managers",
    HelpDesk_IT_Owners: "HelpDesk_IT_Owners",
    Feedback_Admin: "Feedback_Admin",
    Blogs_Admin: "Blogs_Admin",
    EmployeeDirectory_Admin: "EmployeeDirectory_Admin",
    LessonsLearned_Admin: "LessonsLearned_Admin",
    PoliciesAndProcedures_Admin: "PoliciesAndProcedures_Admin",
  };

  export const UserMailPath: IUserMailPath = {
    // Tech mail path
    path: "@technorucs.com",

    // UAT mail path
    // path: "@pernixfederal.com",
  };

  export const QuestionsPageTabsName: string[] = [
    "All questions",
    "My questions",
    "Un answered questions",
  ];

  export const ShoutOutsPageTabsName: string[] = [
    "All shout-outs",
    "My shout-outs",
  ];

  export const RoleDetails: IRoleDetails = {
    SuperAdmin: "Super Admin",
    user: "user",
  };

  export const TabsName: string[] = ["Current", "Upcoming", "Previous"];
  export const NewsTab: string[] = [
    "All News",
    "My News",
    "Previous News",
    "Pending Approvals",
  ];

  export const NewHiresPageTabsName: string[] = [
    "Current",
    "Upcoming",
    "Previous",
  ];
  export const BirthDayPageTabsName: string[] = [
    "Today",
    "Upcoming",
    "Previous",
  ];

  export const DateFormat: string = "MM/DD/YYYY";

  export const PaginationData: IPaginationData = {
    first: 0,
    rows: 8,
  };

  export const birthdayPaginationData: IPaginationData = {
    first: 0,
    rows: 16,
  };

  export const MotivateColumn: IMotivateColumn = {
    ID: "ID",
    StartDate: "StartDate",
    EndDate: "EndDate",
    Quote: "Quote",
    IsDelete: "IsDelete",
    Attachments: "Attachments",
    Status: "Status",
  };

  export const QuoteDatas: IQuoteDatas = {
    ID: null,
    StartDate: new Date(),
    EndDate: null,
    Quote: "",
    Attachments: "",
    FileName: "",
    Status: "",
    IsDelete: false,
  };

  export const PageSearchFields: IPageSearchFields = {
    Search: "",
    Date: null,
    Status: "",
  };

  export const DocRepositoryColumn: IDocRepositoryColumn = {
    ID: "ID",
    FolderName: "FolderName",
    Content: "Content",
    Priority: "Priority",
    IsActive: "IsActive",
  };

  export const selMasterFolder: string = "selMasterFolder";

  export const NavigatePage: INavigatePage = {
    PernixIntranet: "/SitePages/PernixIntranet.aspx",
    HelpDeskPage: "/SitePages/HelpDeskPage.aspx",
    MotivationPage: "/SitePages/MotivationPage.aspx",
    NewsPage: "/SitePages/NewsPage.aspx",
    ApprovalsPage: "/SitePages/ApprovalsPage.aspx",
    CalendarPage: "/SitePages/CalendarPage.aspx",
    DocRepositoryPage: "/SitePages/DocRepositoryPage.aspx",
    EmployeeDirectoryPage: "/SitePages/EmployeeDirectoryPage.aspx",
    OrgChartPage: "/SitePages/OrgChartPage.aspx",
    PollPage: "/SitePages/PollPage.aspx",
    ProjectTemplatePage: "/SitePages/ProjectTemplatePage.aspx",
    PTOPage: "/SitePages/PTOPage.aspx",
    QuestionsCEOPage: "/SitePages/QuestionsCEOPage.aspx",
    ShoutOutsPage: "/SitePages/ShoutOutsPage.aspx",
    FeedbackPage: "/SitePages/FeedbackPage.aspx",
    NewHiresPage: "/SitePages/NewHiresPage.aspx",
    BirthdayPage: "/SitePages/BirthdayPage.aspx",
    BlogsPage: "/SitePages/BlogsPage.aspx",
  };

  export const FeedbackQusColumn: IFeedbackQusColumn = {
    ID: "ID",
    Title: "Title",
    StartDate: "StartDate",
    EndDate: "EndDate",
  };

  export const FeedbackQusType: IFeedbackQusType = {
    ID: null,
    Title: "Title",
    StartDate: null,
    EndDate: null,
  };

  export const FeedbackResColumn: IFeedbackResColumn = {
    ID: "ID",
    Answer: "Answer",
    FeedbackQuestionId: "FeedbackQuestionId",
  };

  export const FeedbackResType: IFeedbackResType = {
    ID: null,
    Answer: "Answer",
    FeedbackQuestionId: null,
    CreatedBy: {
      ID: null,
      Title: "",
      Email: "",
    },
    Date: null,
  };

  export const CommonentsName: ICommonentsName = {
    Birthdays: "Birthdays",
    LessonsBlogs: "Lessons Learned",
    PoliciesBlogs: "Policies and Procedures",
    Calendar: "Calendar",
    DocumentRepository: "Document Repository",
    Feedback: "Feedback",
    MotivationBanner: "Motivation Banner",
    NewHires: "New Hires",
    News: "News",
    Poll: "Poll",
    QuestionCEO: "Questions to Leadership",
    ShoutOuts: "Shout-Outs",
  };

  export const userImageURL: string =
    "/_layouts/15/userphoto.aspx?size=S&username=";

  export const LinkdinURL: string =
    "https://www.linkedin.com/company/pernix-group-inc-";

  export const TwitterURL: string = "https://x.com/PernixGroup";

  export const SelectWish: ISelectWish = {
    Idx: null,
    ID: "",
    Email: "",
    Name: "",
  };

  export const BlogsTab: string[] = [
    "All",
    "Created by me",
    "Pending approval",
  ];

  export const blogDrop: string[] = ["Active", "Inactive"];

  export const blogStatus: IBlogStatus = {
    Draft: "Draft",
    Pending: "Pending",
    Approved: "Approved",
    Rejected: "Rejected",
  };

  export const blogType: IBlogType = {
    Lesson: "Lessons Learned",
    Policy: "Policies and Procedures",
  };

  export const HyperLinkData: IHyperLinkData = {
    id: null,
    Title: "",
    Links: "",
    Result: "",
  };

  export const HyperLinkColumn: IHyperLinkColumn = {
    ID: "ID",
    Title: "Title",
    Links: "Links",
    Result: "Result",
  };

  export const LessonTabs: string[] = ["Lessons", "Memos"];

  export const PoliciesTabs: string[] = ["Policies", "Memos"];

  export const BlogColumn: IBlogColumn = {
    ID: "ID",
    Title: "Title",
    Description: "Description",
    Heading: "Heading",
    ViewedUsers: "ViewedUsers",
    LikedUsers: "LikedUsers",
    CommentedUsers: "CommentedUsers",
    Status: "Status",
    IsActive: "IsActive",
    Attachments: "Attachments",
    Content: "Content",
    ApprovalOn: "ApprovalOn",
    Result: "Result",
  };

  export const BlogColumnType: IBlogColumnType = {
    ID: null,
    Tag: "",
    Description: "",
    Heading: "",
    ViewedUsers: [],
    LikedUsers: [],
    CommentedUsers: [],
    Status: "",
    IsActive: false,
    Attachments: null,
    AuthorId: "",
    AuthorName: "",
    AuthorEmail: "",
    Date: "",
    ApprovalOn: null,
  };

  export const BlogCommentsColumn: IBlogCommentsColumn = {
    AuthorEmail: "AuthorEmail",
    AuthorId: "AuthorId",
    AuthorName: "AuthorName",
    BlogId: "BlogIdId",
    Comments: "Comments",
    Date: "Date",
    ID: "ID",
    TaggedPerson: "TaggedPersonId",
  };

  export const BlogCommentsColumnType: IBlogCommentsColumnType = {
    AuthorEmail: "",
    AuthorId: "",
    AuthorName: "",
    BlogId: null,
    Comments: "",
    Date: "",
    ID: null,
    TaggedPerson: [],
  };

  const FebMonthDates: string[] = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
    "29",
  ];

  const OddMonthDates: string[] = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
    "29",
    "30",
    "31",
  ];

  const EvenMonthDates: string[] = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
    "29",
    "30",
  ];

  export const EDMonthDrop: IEDMonthDrop[] = [
    {
      Month: "January",
      Date: OddMonthDates,
    },
    {
      Month: "February",
      Date: FebMonthDates,
    },
    {
      Month: "March",
      Date: OddMonthDates,
    },
    {
      Month: "April",
      Date: EvenMonthDates,
    },
    {
      Month: "May",
      Date: OddMonthDates,
    },
    {
      Month: "June",
      Date: EvenMonthDates,
    },
    {
      Month: "July",
      Date: OddMonthDates,
    },
    {
      Month: "August",
      Date: OddMonthDates,
    },
    {
      Month: "September",
      Date: EvenMonthDates,
    },
    {
      Month: "October",
      Date: OddMonthDates,
    },
    {
      Month: "November",
      Date: EvenMonthDates,
    },
    {
      Month: "December",
      Date: OddMonthDates,
    },
  ];

  export const Months: string[] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  /* Projectlibrary path config */
  export const sitePath: string = `${window.location.pathname
    .split("/", 3)
    .join("/")}`;

  export const ProjectDocNames: IProjectDocNames = {
    banner: "BannerImages",
    documnet: "Documents",
  };

  /* Employee directory configs */
  export const EmployeeDirectoryUsersData: IEmployeeDirectoryUsersData = {
    id: null,
    ListId: null,
    IsActive: false,
    UserId: null,
    Name: "",
    SureName: "",
    Email: "",
    JobTitle: "",
    Manager: {
      Name: "",
      Email: "",
    },
    Department: "",
    OfficeLocation: "",
    BusinessPhones: "",
    MobilePhone: "",
    Birthday: "",
    Skills: [],
    Experience: "",
    Qualifications: "",
    IsExtension: false,
  };

  export const EDDrop: string[] = ["All", "Active", "Inactive"];

  export const EDSearch: IEDSearch = {
    CommonSearch: "",
    Department: "",
    Name: "",
    MobilePhone: "",
    Status: EDDrop[0],
    JobTitle: "",
    OfficeLocation: "",
    Skills: "",
    OfficePhone: "",
  };
}
