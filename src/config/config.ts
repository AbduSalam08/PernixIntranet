/* eslint-disable @typescript-eslint/no-namespace */
import {
  IDocRepositoryColumn,
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
  };

  export const SPGroupName: ISPGroupName = {
    Birthdays_Admin: "Birthdays_Admin",
    Calendar_Admin: "Calendar_Admin",
    Documentrepository_Admin: "Documentrepository_Admin",
    Footer_Admin: "Footer_Admin",
    Header_Admin: "Header_Admin",
    Mainbanner_Admin: "Mainbanner_Admin",
    Newhire_Admin: "Newhire_Admin",
    News_Admin: "News_Admin",
    Pernix_Admin: "Pernix_Admin",
    Poll_Admin: "Poll_Admin",
    QuestionCEO_Admin: "QuestionCEO_Admin",
    QuestionCEO: "QuestionCEO",
    Shoutouts_Admin: "Shoutouts_Admin",
    HelpDesk_Ticket_Managers: "HelpDesk_Ticket_Managers",
    HelpDesk_IT_Owners: "HelpDesk_IT_Owners",
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

  export const DateFormat: string = "MM/DD/YYYY";

  export const PaginationData: IPaginationData = {
    first: 0,
    rows: 8,
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
  };
}
