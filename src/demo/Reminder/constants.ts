import type { Data } from "./types";

export const TicketStatus = Object.freeze({
  NO_CHANGE: "NO_CHANGE",
  ON_HOLD: "ON_HOLD",
  PENDING: "PENDING",
  SOLVED: "SOLVED",
});

export const TicketStatusList = Object.values(TicketStatus);
export const OnlyReminderTicketStatusOptions = [
  TicketStatus.PENDING,
  TicketStatus.SOLVED,
];
export const IntermediateReminderTicketStatusOptions = TicketStatusList.filter(
  (option) => option !== TicketStatus.SOLVED
);
export const LastReminderTicketStatusOptions = [TicketStatus.SOLVED];

export const DEFAULT_INTERMEDIATE: Data = {
  text: "default intermediate",
  timeout: 3,
  status: TicketStatus.NO_CHANGE,
};

export const DEFAULT_LAST: Data = {
  text: "default last",
  timeout: 3,
  status: TicketStatus.SOLVED,
};
