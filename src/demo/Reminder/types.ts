import { TicketStatus } from "./constants";

export type TicketStatusType = typeof TicketStatus;
export type TicketStatusValue = TicketStatusType[keyof TicketStatusType];

export type Data = {
  text: string;
  timeout: number;
  status: TicketStatusValue;
};
