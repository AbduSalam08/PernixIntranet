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
