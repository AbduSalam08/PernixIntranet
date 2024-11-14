/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @rushstack/no-new-null */
export interface ITenantDetail {
  webURL: string;
  tenantURL: string;
}

export interface IListName {
  Intranet_DocumentRepository: string;
  Intranet_MotivationalQuotes: string;
  Intranet_NewHires: string;
  Intranet_News: string;
  Intranet_QuestionToCEO: string;
  Intranet_ShoutOuts: string;
  HelpDesk_AllTickets: string;
  Calendar_Azure_Group_ID: string;
  HelpDesk_TicketConversations: string;
  Intranet_QuestionsToCEO: string;
  Intranet_PollQuestion: string;
  Intranet_PollOptions: string;
  Intranet_PollResponse: string;
  Intranet_Blogs: string;
}

export interface ISPGroupName {
  Birthdays_Admin: string;
  Calendar_Admin: string;
  Documentrepository_Admin: string;
  Footer_Admin: string;
  Header_Admin: string;
  Mainbanner_Admin: string;
  Newhire_Admin: string;
  News_Admin: string;
  Pernix_Admin: string;
  Poll_Admin: string;
  QuestionCEO_Admin: string;
  QuestionCEO: string;
  Shoutouts_Admin: string;
  HelpDesk_Ticket_Managers: string;
  HelpDesk_IT_Owners: string;
}

export interface IRoleDetails {
  SuperAdmin: string;
  user: string;
}

export interface IUserDetails {
  userName: string;
  email: string;
  role: string;
  id: number | null;
}

export interface IAttachDetails {
  fileName: string;
  content: any;
  serverRelativeUrl: string;
}

export interface IQuoteDatas {
  ID: number | null;
  Quote: string;
  StartDate: Date | any;
  EndDate: Date | any;
  Attachments: string;
  FileName: string;
  Status: string;
  IsDelete: boolean;
}

export interface IAttachObj {
  isSubFiles: boolean;
  name: string;
  content: any;
  fileType: string;
  ServerRelativeUrl: string;
}

export interface IDocRepository {
  ID: number;
  Content: IAttachObj;
  Priority: string;
  IsActive: boolean;
}

export interface IDocRepositoryColumn {
  ID: string;
  FolderName: string;
  Content: string;
  Priority: string;
  IsActive: string;
}

export interface IPaginationData {
  first: number;
  rows: number;
}

export interface IValidationRule {
  required: boolean;
  type: "string" | "date" | "file" | "array" | "number" | "boolean";
}

export interface IFormFields {
  value: string | number | any;
  isValid: boolean;
  errorMsg: string;
  validationRule: IValidationRule;
}

export interface IMotivateColumn {
  ID: string;
  Quote: string;
  StartDate: string;
  EndDate: string;
  IsDelete: string;
  Attachments: string;
  Status: string;
}

export interface IMotivateColumnType {
  ID: number | null;
  Qutoe: string;
  StartDate: Date | null;
  EndDate: Date | null;
}

export interface IPageSearchFields {
  Search: string;
  Date: Date | any;
  Status: string;
}

export interface INavigatePage {
  PernixIntranet: string;
  MotivationPage: string;
  HelpDeskPage: string;
  NewsPage: string;
  DocRepositoryPage: string;
  QuestionsCEOPage: string;
  PollPage: string;
  CalendarPage: string;
  OrgChartPage: string;
  EmployeeDirectoryPage: string;
  PTOPage: string;
  ApprovalsPage: string;
  ProjectTemplatePage: string;
  ShoutOutsPage: string;
}
