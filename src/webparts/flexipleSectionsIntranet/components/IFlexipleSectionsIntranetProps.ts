import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IFlexipleSectionsIntranetProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  context: WebPartContext;
}
