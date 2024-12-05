/* eslint-disable @typescript-eslint/no-explicit-any */
import { sp } from "@pnp/sp";
import { CONFIG } from "../../config/config";
import { setHelpDeskTickets } from "../../redux/features/HelpDeskSlice";
import SpServices from "../SPServices/SpServices";

export const getAllTickets = async (
  dispatch: any
  //noLoader?: boolean
): Promise<any> => {
  dispatch?.(
    setHelpDeskTickets({
      isLoading: true,
      ticketType: "All tickets",
    })
  );
  await SpServices.SPReadItems({
    Listname: CONFIG.ListNames.HelpDesk_AllTickets,
    Select:
      "*, EmployeeName/ID, EmployeeName/Title, EmployeeName/EMail, ITOwner/ID, ITOwner/Title, ITOwner/EMail, TicketManager/ID, TicketManager/Title, TicketManager/EMail, RepeatedTicketSource/ID,TaggedPerson/Title, TaggedPerson/EMail, TaggedPerson/ID, RecurrenceConfigDetails/ID",
    Expand:
      "EmployeeName,ITOwner,TicketManager,RepeatedTicketSource, TaggedPerson, RecurrenceConfigDetails",
  })
    ?.then((res: any) => {
      if (res?.length !== 0) {
        dispatch?.(
          setHelpDeskTickets({
            isLoading: false,
            data: res,
            AllData: res,
            ticketType: "All tickets",
          })
        );
      } else {
        dispatch?.(
          setHelpDeskTickets({
            isLoading: false,
            error: true,
            errorMessage: "No tickets found!",
            data: [],
            AllData: [],
            ticketType: "All tickets",
          })
        );
      }
    })
    .catch((err: any) => {
      console.log("err: ", err);
      dispatch?.(
        setHelpDeskTickets({
          isLoading: false,
          error: true,
          errorMessage:
            err?.message || "Something went wrong while fetching tickets!",
          data: [],
          AllData: [],
          ticketType: "All tickets",
        })
      );
    });
};

export const getTicketByTicketNumber = async (
  dispatch: any,
  ticketNumber: string
  //noLoader?: boolean
): Promise<any> => {
  dispatch?.(
    setHelpDeskTickets({
      isLoading: true,
      ticketType: ticketNumber,
    })
  );
  await SpServices.SPReadItems({
    Listname: CONFIG.ListNames.HelpDesk_AllTickets,
    Select:
      "*, EmployeeName/ID, EmployeeName/Title, EmployeeName/EMail, ITOwner/ID, ITOwner/Title, ITOwner/EMail, TicketManager/ID, TicketManager/Title, TicketManager/EMail, RepeatedTicketSource/ID",
    Expand: "EmployeeName,ITOwner,TicketManager,RepeatedTicketSource",
    Filter: [
      {
        FilterKey: "TicketNumber",
        FilterValue: ticketNumber,
        Operator: "eq",
      },
    ],
  })
    ?.then((res: any) => {
      console.log("res: ", res);
      if (res?.length !== 0) {
        dispatch?.(
          setHelpDeskTickets({
            isLoading: false,
            uniqueData: res,
            // AllData: res,
            ticketType: ticketNumber,
          })
        );
      } else {
        dispatch?.(
          setHelpDeskTickets({
            isLoading: false,
            error: true,
            errorMessage: "No ticket found!",
            uniqueData: [],
            // AllData: [],
            ticketType: ticketNumber,
          })
        );
      }
    })
    .catch((err: any) => {
      console.log("err: ", err);
      dispatch?.(
        setHelpDeskTickets({
          isLoading: false,
          error: true,
          errorMessage:
            err?.message || "Something went wrong while fetching ticket!",
          uniqueData: [],
          // AllData: [],
          ticketType: ticketNumber,
        })
      );
    });
};

export const getAllTicketsData = async (): Promise<any> => {
  const res: any = await SpServices.SPReadItems({
    Listname: CONFIG.ListNames.HelpDesk_AllTickets,
    Select:
      "*, EmployeeName/ID, EmployeeName/Title, EmployeeName/EMail, ITOwner/ID, ITOwner/Title, ITOwner/EMail, TicketManager/ID, TicketManager/Title, TicketManager/EMail, RepeatedTicketSource/ID,TaggedPerson/Title, TaggedPerson/EMail, TaggedPerson/ID, RecurrenceConfigDetails/ID",
    Expand:
      "EmployeeName,ITOwner,TicketManager,RepeatedTicketSource, TaggedPerson, RecurrenceConfigDetails",
  });
  return res;
};

export const getAllTicketsData2 = async (): Promise<any> => {
  const camlQuery = {
    ViewXml: `
      <View>
        <Query />
        <ViewFields>
          <FieldRef Name='Title' />
          <FieldRef Name='_ColorTag' />
          <FieldRef Name='ComplianceAssetId' />
          <FieldRef Name='TicketNumber' />
          <FieldRef Name='EmployeeName' />
          <FieldRef Name='ITOwner' />
          <FieldRef Name='TicketManager' />
          <FieldRef Name='Category' />
          <FieldRef Name='Priority' />
          <FieldRef Name='TicketSource' />
          <FieldRef Name='Status' />
          <FieldRef Name='RepeatedTicket' />
          <FieldRef Name='TaggedPerson' />
          <FieldRef Name='RecurrenceConfigDetails' />
          <FieldRef Name='Modified' />
          <FieldRef Name='Created' />
        </ViewFields>
        <QueryOptions />
      </View>
    `,
  };

  try {
    // REST API call using sp.web.lists
    const response = await sp.web.lists
      .getByTitle("HelpDesk_AllTickets")
      .getItemsByCAMLQuery(camlQuery);

    // Return the fetched items
    return response;
  } catch (error) {
    console.error("Error fetching tickets data:", error);
    throw error;
  }
};
