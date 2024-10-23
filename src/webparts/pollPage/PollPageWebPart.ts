import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
// import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from "PollPageWebPartStrings";
import PollPage from "./components/PollPage";
// import { IPollPageProps } from './components/IPollPageProps';
import { SPComponentLoader } from "@microsoft/sp-loader";
import { sp } from "@pnp/sp/presets/all";
import { graph } from "@pnp/graph/presets/all";
import { store } from "../../redux/store/store";
import { Provider } from "react-redux";
require("../../../node_modules/primereact/resources/themes/bootstrap4-light-blue/theme.css");
require("../../assets/styles/style.css");
require("../../components/common/CustomInputFields/customStyle.css");

export interface IPollPageWebPartProps {
  description: string;
}

export default class PollPageWebPart extends BaseClientSideWebPart<IPollPageWebPartProps> {
  // private _isDarkTheme: boolean = false;
  // private _environmentMessage: string = "";

  public async onInit(): Promise<void> {
    SPComponentLoader.loadCss(
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
    );
    SPComponentLoader.loadCss(
      "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
    );

    SPComponentLoader.loadCss("https://unpkg.com/primeicons/primeicons.css");

    // Set up SharePoint context
    sp.setup({
      spfxContext: this.context as unknown as undefined,
    });

    // Set up Graph context
    graph.setup({
      spfxContext: this.context as unknown as undefined,
    });

    await super.onInit();
  }

  public render(): void {
    const element: React.ReactElement = React.createElement(
      Provider, // Wrap everything in Redux's Provider
      { store: store }, // Pass the store to the Provider
      React.createElement(PollPage, {
        context: this.context,
      })
    );

    ReactDom.render(element, this.domElement);
  }

  // protected onInit(): Promise<void> {
  //   return this._getEnvironmentMessage().then((message) => {
  //     this._environmentMessage = message;
  //   });
  // }

  // private _getEnvironmentMessage(): Promise<string> {
  //   if (!!this.context.sdks.microsoftTeams) {
  //     // running in Teams, office.com or Outlook
  //     return this.context.sdks.microsoftTeams.teamsJs.app
  //       .getContext()
  //       .then((context) => {
  //         let environmentMessage: string = "";
  //         switch (context.app.host.name) {
  //           case "Office": // running in Office
  //             environmentMessage = this.context.isServedFromLocalhost
  //               ? strings.AppLocalEnvironmentOffice
  //               : strings.AppOfficeEnvironment;
  //             break;
  //           case "Outlook": // running in Outlook
  //             environmentMessage = this.context.isServedFromLocalhost
  //               ? strings.AppLocalEnvironmentOutlook
  //               : strings.AppOutlookEnvironment;
  //             break;
  //           case "Teams": // running in Teams
  //           case "TeamsModern":
  //             environmentMessage = this.context.isServedFromLocalhost
  //               ? strings.AppLocalEnvironmentTeams
  //               : strings.AppTeamsTabEnvironment;
  //             break;
  //           default:
  //             environmentMessage = strings.UnknownEnvironment;
  //         }

  //         return environmentMessage;
  //       });
  //   }

  //   return Promise.resolve(
  //     this.context.isServedFromLocalhost
  //       ? strings.AppLocalEnvironmentSharePoint
  //       : strings.AppSharePointEnvironment
  //   );
  // }

  // protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
  //   if (!currentTheme) {
  //     return;
  //   }

  //   this._isDarkTheme = !!currentTheme.isInverted;
  //   const { semanticColors } = currentTheme;

  //   if (semanticColors) {
  //     this.domElement.style.setProperty(
  //       "--bodyText",
  //       semanticColors.bodyText || null
  //     );
  //     this.domElement.style.setProperty("--link", semanticColors.link || null);
  //     this.domElement.style.setProperty(
  //       "--linkHovered",
  //       semanticColors.linkHovered || null
  //     );
  //   }
  // }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription,
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField("description", {
                  label: strings.DescriptionFieldLabel,
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
