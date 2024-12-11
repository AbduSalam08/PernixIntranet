/* eslint-disable @typescript-eslint/no-namespace */
import { CONFIG } from "../../config/config";
import { ICamlQuery } from "../../interface/interface";

export namespace HelpDeskCamlQueryJSON {
  export const CamlQuery: ICamlQuery[] = [
    {
      ListName: CONFIG.ListNames.HelpDesk_AllTickets,
      CamlQuery: `
              <View Scope='RecursiveAll'>
                <Query>
                  <OrderBy>
                    <FieldRef Name='Created' Ascending='FALSE'/>
                  </OrderBy>
                </Query>
                <ViewFields>
                    <FieldRef Name='Title' />
                    <FieldRef Name='TicketNumber' />
                    <FieldRef Name='EmployeeName' />
                    <FieldRef Name='ITOwner' />
                    <FieldRef Name='TicketManager' />
                    <FieldRef Name='Category' />
                    <FieldRef Name='Priority' />
                    <FieldRef Name='TicketSource' />
                    <FieldRef Name='Status' />
                    <FieldRef Name='RepeatedTicket' />
                    <FieldRef Name='RepeatedTicketSource' />
                    <FieldRef Name='Rating' />
                    <FieldRef Name='TicketEscalated' />
                    <FieldRef Name='TicketClosedOn' />
                    <FieldRef Name='TicketRepeatedOn' />
                    <FieldRef Name='TicketDescription' />
                    <FieldRef Name='RepeatedTicketSource_x003a__x002' />
                    <FieldRef Name='TicketClosedBy' />
                    <FieldRef Name='TaggedPerson' />
                    <FieldRef Name='MailID' />
                    <FieldRef Name='ConId' />
                    <FieldRef Name='RecurrenceConfigDetails' />
                    <FieldRef Name='IsRecurredTicket' />
                    <FieldRef Name='HasRecurrence' />
                    <FieldRef Name='ID' />
                    <FieldRef Name='ContentType' />
                    <FieldRef Name='Modified' />
                    <FieldRef Name='Created' />
                    <FieldRef Name='Author' />
                    <FieldRef Name='Editor' />
                    <FieldRef Name='Attachments' />
                    <FieldRef Name='Edit' />
                    <FieldRef Name='LinkTitleNoMenu' />
                    <FieldRef Name='LinkTitle' />
                    <FieldRef Name='DocIcon' />
                    <FieldRef Name='_IsRecord' />
                    <FieldRef Name='AppAuthor' />
                    <FieldRef Name='AppEditor' />
                </ViewFields>
                <RowLimit Paged='TRUE'>5000</RowLimit>
              </View>`,
    },
  ];
}
