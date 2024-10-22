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
  Shoutouts_Admin: string;
  HelpDesk_Ticket_Managers: string;
}

export interface IRoleDetails {
  SuperAdmin: string;
  User: string;
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
  IsDelete: boolean;
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
}

export interface INavigatePage {
  PernixIntranet: string;
  MotivationPage: string;
  HelpDeskPage: string;
  NewsPage: string;
}
