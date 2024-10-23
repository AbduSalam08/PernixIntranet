/* eslint-disable @typescript-eslint/no-explicit-any */
import { CONFIG } from "../../config/config";
import { setHelpDeskTickets } from "../../redux/features/HelpDeskSlice";
import SpServices from "../SPServices/SpServices";

export const getAllTickets = async (dispatch: any): Promise<any> => {
  dispatch?.(
    setHelpDeskTickets({
      isLoading: true,
    })
  );
  await SpServices.SPReadItems({
    Listname: CONFIG.ListNames.HelpDesk_AllTickets,
    Select:
      "*, EmployeeName/ID, EmployeeName/Title, EmployeeName/EMail, ITOwner/ID, ITOwner/Title, ITOwner/EMail, TicketManager/ID, TicketManager/Title, TicketManager/EMail, RepeatedTicketSource/ID",
    Expand: "EmployeeName,ITOwner,TicketManager,RepeatedTicketSource",
  })
    ?.then((res: any) => {
      console.log("res: ", res);
      if (res?.length !== 0) {
        dispatch?.(
          setHelpDeskTickets({
            isLoading: false,
            data: res,
          })
        );
      } else {
        dispatch?.(
          setHelpDeskTickets({
            isLoading: false,
            error: true,
            errorMessage: "No tickets found!",
            data: [],
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
        })
      );
    });
};
