import {
  IListName,
  IRoleDetails,
  ISPGroupName,
  ITenantDetail,
} from "../interface/interface";

export namespace CONFIG {
  export const TenantDetail: ITenantDetail = {
    webURL: `${window.location.origin}/sites/PernixIntranet`,
    tenantURL: `${window.location.origin}`,
  };

  export const ListNames: IListName = {
    Intranet_DocumentRepository: "Intranet_DocumentRepository",
    Intranet_MotivationalQuotes: "Intranet_MotivationalQuotes",
    Intranet_NewHires: "Intranet_NewHires",
    Intranet_News: "Intranet_News",
    Intranet_QuestionToCEO: "Intranet_QuestionToCEO",
    Intranet_ShoutOuts: "Intranet_ShoutOuts",
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
    Shoutouts_Admin: "Shoutouts_Admin",
    HelpDesk_Ticket_Managers: "HelpDesk_Ticket_Managers",
  };

  export const RoleDetails: IRoleDetails = {
    SuperAdmin: "Super Admin",
    User: "User",
  };

  export const TabsName: string[] = ["Current", "Upcoming", "Previous"];

  export const DateFormat: string = "MM/DD/YYYY";
}
