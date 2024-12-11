/* eslint-disable @typescript-eslint/no-explicit-any */
import { sp } from "@pnp/sp";
import { CONFIG } from "../../config/config";
import { setHelpDeskTickets } from "../../redux/features/HelpDeskSlice";
import SpServices from "../SPServices/SpServices";
import { ICamlQuery } from "../../interface/interface";
import { HelpDeskCamlQueryJSON } from "../../camlQuery/helpDesk/HelpDeskCamlQueryJSON";
import { mapTicketDataToSchema } from "../../utils/helpdeskUtils";

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

const getDataLooping = async (
  data: any[],
  nextRef: any,
  filCamlJSON: ICamlQuery
): Promise<any[]> => {
  try {
    await sp.web.lists
      .getByTitle(filCamlJSON?.ListName)
      .renderListDataAsStream({
        ViewXml: filCamlJSON?.CamlQuery,
        Paging: nextRef.substring(1),
      })
      .then(async (res: any) => {
        data.push(...res.Row);

        if (res.NextHref) {
          await getDataLooping(data, res.NextHref, filCamlJSON);
        }
      });

    return [...data];
  } catch (err) {
    console.log("Looping datas fetching error for feedback: ", err);
    return [...data];
  }
};

export const getAllTicketsDataCamlQuery = async (): Promise<any> => {
  const data: any[] = [];

  const filCamlJSON: ICamlQuery = HelpDeskCamlQueryJSON?.CamlQuery?.[0];

  try {
    await sp.web.lists
      .getByTitle(filCamlJSON?.ListName)
      .renderListDataAsStream({
        ViewXml: filCamlJSON?.CamlQuery,
      })
      .then(async (res: any) => {
        data.push(...res.Row);

        if (res.NextHref) {
          await getDataLooping(data, res.NextHref, filCamlJSON);
        }
      });
    const mappedData = mapTicketDataToSchema([...data]);
    console.log("[...data]", [...data]);
    return mappedData;
  } catch (err) {
    console.log("Datas fetching error for feedback: ", err);
    return [...data];
  }
};

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
  // await SpServices.SPReadItems({
  //   Listname: CONFIG.ListNames.HelpDesk_AllTickets,
  //   Select:
  //     "*, EmployeeName/ID, EmployeeName/Title, EmployeeName/EMail, ITOwner/ID, ITOwner/Title, ITOwner/EMail, TicketManager/ID, TicketManager/Title, TicketManager/EMail, RepeatedTicketSource/ID,TaggedPerson/Title, TaggedPerson/EMail, TaggedPerson/ID, RecurrenceConfigDetails/ID",
  //   Expand:
  //     "EmployeeName,ITOwner,TicketManager,RepeatedTicketSource, TaggedPerson, RecurrenceConfigDetails",
  // })
  await getAllTicketsDataCamlQuery()
    ?.then((res: any) => {
      console.log("normal data", res);
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
