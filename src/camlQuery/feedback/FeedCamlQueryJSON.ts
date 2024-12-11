/* eslint-disable @typescript-eslint/no-namespace */
import { CONFIG } from "../../config/config";
import { ICamlQuery } from "../../interface/interface";

export namespace FeedBackCamlJSON {
  export const CamlQuery: ICamlQuery[] = [
    {
      ListName: CONFIG.ListNames.Intranet_feedbackQuestion,
      CamlQuery: `
              <View Scope='RecursiveAll'>
                <Query>
                  <OrderBy>
                    <FieldRef Name='Created' Ascending='FALSE'/>
                  </OrderBy>
                </Query>
                <ViewFields>
                  <FieldRef Name='Title' />
                  <FieldRef Name='_ColorTag' />
                  <FieldRef Name='ComplianceAssetId' />
                  <FieldRef Name='LinkTitle' />
                  <FieldRef Name='StartDate' />
                  <FieldRef Name='EndDate' />
                  <FieldRef Name='ID' />
                  <FieldRef Name='ContentType' />
                  <FieldRef Name='Modified' />
                  <FieldRef Name='Created' />
                  <FieldRef Name='Author' />
                  <FieldRef Name='Editor' />
                  <FieldRef Name='_UIVersionString' />
                  <FieldRef Name='Attachments' />
                  <FieldRef Name='Edit' />
                  <FieldRef Name='LinkTitleNoMenu' />
                  <FieldRef Name='DocIcon' />
                  <FieldRef Name='ItemChildCount' />
                  <FieldRef Name='FolderChildCount' />
                  <FieldRef Name='_ComplianceFlags' />
                  <FieldRef Name='_ComplianceTag' />
                  <FieldRef Name='_ComplianceTagWrittenTime' />
                  <FieldRef Name='_ComplianceTagUserId' />
                  <FieldRef Name='_IsRecord' />
                  <FieldRef Name='AppAuthor' />
                  <FieldRef Name='AppEditor' />
                </ViewFields>
                <RowLimit Paged='TRUE'>5000</RowLimit>
              </View>`,
    },
    {
      ListName: CONFIG.ListNames.Intranet_feedbackResponse,
      CamlQuery: `
              <View Scope='RecursiveAll'>
                <Query>
                  <OrderBy>
                    <FieldRef Name='Created' Ascending='FALSE'/>
                  </OrderBy>
                  <Where>
                    <IsNotNull>
                      <FieldRef Name='FeedbackQuestion' />
                    </IsNotNull>
                  </Where>
                </Query>
                <ViewFields>
                  <FieldRef Name='Title' />
                  <FieldRef Name='_ColorTag' />
                  <FieldRef Name='ComplianceAssetId' />
                  <FieldRef Name='Answer' />
                  <FieldRef Name='FeedbackQuestion' />
                  <FieldRef Name='ID' />
                  <FieldRef Name='ContentType' />
                  <FieldRef Name='Modified' />
                  <FieldRef Name='Created' />
                  <FieldRef Name='Author' />
                  <FieldRef Name='Editor' />
                  <FieldRef Name='_UIVersionString' />
                  <FieldRef Name='Attachments' />
                  <FieldRef Name='Edit' />
                  <FieldRef Name='LinkTitleNoMenu' />
                  <FieldRef Name='LinkTitle' />
                  <FieldRef Name='DocIcon' />
                  <FieldRef Name='ItemChildCount' />
                  <FieldRef Name='FolderChildCount' />
                  <FieldRef Name='_ComplianceFlags' />
                  <FieldRef Name='_ComplianceTag' />
                  <FieldRef Name='_ComplianceTagWrittenTime' />
                  <FieldRef Name='_ComplianceTagUserId' />
                  <FieldRef Name='_IsRecord' />
                  <FieldRef Name='AppAuthor' />
                  <FieldRef Name='AppEditor' />
                </ViewFields>
                <RowLimit Paged='TRUE'>5000</RowLimit>
              </View>`,
    },
  ];
}
