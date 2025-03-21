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
  Intranet_feedbackQuestion: string;
  Intranet_feedbackResponse: string;
  Intranet_ShoutOutsOptions: string;
  Intranet_BirthDay: string;
  Intranet_BirthdayWishes: string;
  EmployeeDirectory_Config: string;
  IntranetBlogs_Title: string;
  HelpDesk_RecurrenceConfig: string;
  FlexibleSection: string;
  Intranet_BlogComments: string;
  Intranet_PernixWiki: string;
  HelpDesk_TicketLocationConfig: string;
  ProjectTemplate: string;
  Intranet_Hyperlink: string;
  Intranet_Calendar: string;
}

export interface ISPGroupName {
  Birthdays_Admin: string;
  Calendar_Admin: string;
  Documentrepository_Admin: string;
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
  Feedback_Admin: string;
  Blogs_Admin: string;
  EmployeeDirectory_Admin: string;
  LessonsLearned_Admin: string;
  PoliciesAndProcedures_Admin: string;
}

export interface IUserMailPath {
  path: string;
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
  FeedbackPage: string;
  NewHiresPage: string;
  BirthdayPage: string;
  BlogsPage: string;
}

export interface ICamlQuery {
  ListName: string;
  CamlQuery: string;
}

export interface IUserData {
  Title: string;
  ID: number | null;
  Email: string;
}

export interface IFeedbackQusColumn {
  ID: string;
  Title: string;
  StartDate: string;
  EndDate: string;
}

export interface IFeedbackQusType {
  ID: number | null;
  Title: string;
  StartDate: Date | null | string;
  EndDate: Date | null | string;
}

export interface IFeedbackResColumn {
  ID: string;
  Answer: string;
  FeedbackQuestionId: string;
}

export interface IFeedbackResType {
  ID: number | null;
  Answer: string;
  FeedbackQuestionId: number | null;
  CreatedBy: IUserData;
  Date: Date | null | string;
}

export interface IinitialPopupLoaders {
  open: boolean;
  popupTitle: string;
  popupWidth: string;
  popupType?: string; // Consider using a union type like 'custom' | 'default' if applicable
  defaultCloseBtn: boolean;
  popupData?: any[] | any; // Replace `any` with the specific type of data if known
  isLoading?: {
    inprogress: boolean;
    error: boolean;
    success: boolean;
  };
  messages?: {
    success: string;
    error: string;
    successDescription: string;
    errorDescription: string;
    inprogress: string;
  };
}

export interface ICommonentsName {
  MotivationBanner: string;
  Calendar: string;
  News: string;
  DocumentRepository: string;
  QuestionCEO: string;
  Poll: string;
  ShoutOuts: string;
  Feedback: string;
  NewHires: string;
  Birthdays: string;
  LessonsBlogs: string;
  PoliciesBlogs: string;
}

export interface IPageURL {
  Name: string;
  GroupName: string;
  IsAdmin: boolean;
  URL: string;
  Image: string;
}

export interface IBirthdayUsers {
  Name: string;
  Email: string;
  ID: string | number;
  Birthday: string;
  IsTeams: boolean;
  IsOutlook: boolean;
  IsActive: boolean;
  IsSameUser: boolean;
  IsShow: boolean;
  BirthdayUserListDataId: number | null;
}

export interface IBirthdayData {
  ID: number;
  UserID: string;
  IsActive: boolean;
}

export interface IBirthdayRes {
  ID: number;
  From: string;
  To: string;
  Message: string;
  IsTeams: boolean;
  IsOutlook: boolean;
}

export interface ISelectWish {
  Idx: number | null;
  ID: string;
  Email: string;
  Name: string;
}

export interface ICurUserData {
  ID: string;
  Email: string;
  Title: string;
}

export interface IHyperLinkColumn {
  ID: string;
  Title: string;
  Links: string;
  Result: string;
}

export interface IHyperLinkData {
  id: number | null;
  Title: string;
  Links: string;
  Result: string;
}

export interface IBlogStatus {
  Draft: string;
  Pending: string;
  Approved: string;
  Rejected: string;
}

export interface IBlogType {
  Lesson: string;
  Policy: string;
}

export interface IBlogColumn {
  ID: string;
  Title: string;
  Description: string;
  Heading: string;
  ViewedUsers: string;
  LikedUsers: string;
  CommentedUsers: string;
  Status: string;
  IsActive: string;
  ApprovalOn: string;
  Attachments: string;
  Content: string;
  Result: string;
}

export interface IBlogCommentsColumn {
  ID: string;
  Comments: string;
  BlogId: string;
  TaggedPerson: string;
  Date: string;
  AuthorId: string;
  AuthorName: string;
  AuthorEmail: string;
}

export interface IBlogColumnType {
  ID: number | null;
  Tag: string;
  Description: string;
  Heading: string;
  ViewedUsers: string[];
  LikedUsers: string[];
  CommentedUsers: string[];
  Status: string;
  IsActive: boolean;
  Attachments: any;
  AuthorId: string;
  AuthorName: string;
  AuthorEmail: string;
  Date: string;
  ApprovalOn: number | null;
}

export interface IBlogCommentsColumnType {
  ID: number | null;
  Comments: string;
  BlogId: any;
  TaggedPerson: any[];
  Date: string;
  AuthorId: string;
  AuthorName: string;
  AuthorEmail: string;
}

export interface IPersonField {
  ID: number;
  Title: string;
  EMail: string;
}

export interface ITicketSchema {
  ID: number;
  id: number;
  Title: string | null;
  TicketNumber: string | null;
  EmployeeName: IPersonField | null;
  EmployeeNameId: number | null;
  ITOwner: IPersonField | null;
  ITOwnerId: number | null;
  TicketManager: IPersonField | null;
  TicketManagerId: number | null;
  Category: string | null;
  Priority: string | null;
  TicketSource: string | null;
  Status: string | null;
  RepeatedTicket: boolean;
  RepeatedTicketSourceId: number | any;
  Rating: number | null;
  TicketClosedOn: string | null;
  TicketRepeatedOn: string | null;
  TicketDescription: string | null;
  RepeatedTicketSource_TicketNumber: string | null;
  TicketClosedBy: IPersonField | null;
  TicketClosedById: number | null;
  TaggedPerson: IPersonField[];
  TaggedPersonId: number | any;
  MailID: string | null;
  ConId: string | null;
  RecurrenceConfigDetailsId: number | any;
  IsRecurredTicket: boolean;
  HasRecurrence: boolean;
  Created: string | null;
  TicketEscalated: boolean;
  Modified: string | null;
  CreatedBy: IPersonField | null;
  ModifiedBy: IPersonField | null;
  TicketLocation: string | null;
  Attachments: boolean;
}

export interface IEDMonthDrop {
  Month: string;
  Date: string[];
}

export interface ProjectDetails {
  id: number;
  projectName: string | null;
  status: string | null;
  contractNo: string | null;
  projectAdmin: {
    id: number | null;
    name: string | null;
    email: string | null;
  };
  clientName: string | null;
  location: string | null;
  address: string | null;
  team: {
    id: number | null;
    name: string | null;
    email: string | null;
  }[];
  startDate: string | null; // ISO date string
  endDate: string | null;
  description: string | null;
  summary: string | null;
}

/* Calendar interfaces start */
export interface ICalendarListColumn {
  ID: string;
  Title: string;
  Description: string;
  Date: string;
  StartTime: string;
  EndTime: string;
}

export interface ICalendarObj {
  id: number | null;
  title: string;
  description: string;
  start: Date | null;
  end: Date | null;
}
/* Calendar interfaces end */

/* Project template interfaces */
export interface IProjectDocNames {
  banner: string;
  documnet: string;
}

export interface IProRepository {
  ID: number | null;
  Content: IAttachObj;
}

/* Employee directory interfaces creation */
export interface IManagerDetails {
  Name: string;
  Email: string;
}

export interface IEmployeeDirectoryUsersData {
  id: number | null;
  ListId: string | number | null;
  IsActive: boolean;
  UserId: string | number | null;
  Name: string;
  SureName: string;
  Email: string;
  JobTitle: string;
  Manager: IManagerDetails;
  Department: string;
  OfficeLocation: string;
  BusinessPhones: string;
  MobilePhone: string;
  Birthday: string;
  Skills: string[];
  Experience: string;
  Qualifications: string;
  IsExtension: boolean;
}

export interface IActiveUserDatas {
  ID: number | null;
  UserId: string;
  IsActive: boolean;
}

export interface IEDSearch {
  Status: string;
  CommonSearch: string;
  Name: string;
  MobilePhone: string;
  OfficePhone: string;
  Department: string;
  OfficeLocation: string;
  JobTitle: string;
  Skills: string;
}
