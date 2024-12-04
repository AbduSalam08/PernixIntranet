/* eslint-disable @typescript-eslint/no-namespace */
import {
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
  IQuoteDatas,
  IRoleDetails,
  ISPGroupName,
  ITenantDetail,
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
    rows: 9,
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
    Blogs: "Blogs",
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
}
