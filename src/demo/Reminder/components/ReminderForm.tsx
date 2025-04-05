import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { makeInputStringChangeHandler } from "../../utils";
import {
  IntermediateReminderTicketStatusOptions,
  LastReminderTicketStatusOptions,
  OnlyReminderTicketStatusOptions,
  TicketStatus,
} from "../constants";
import type { Data, TicketStatusValue } from "../types";

type ReminderFormProps = {
  idx: number;
  data: Data;
  isLast: boolean;
  handleChange: (data: Data) => void;
};

const TEXT_FIELD = "text-form";
const TICKET_STATUS_FIELD = "ticket-status-field";

export const ReminderForm = ({
  idx,
  data,
  isLast,
  handleChange,
}: ReminderFormProps) => {
  const [text, setText] = useState(data.text);
  const options = useMemo(() => {
    if (idx === 0 && isLast) return OnlyReminderTicketStatusOptions;
    if (isLast) return LastReminderTicketStatusOptions;
    return IntermediateReminderTicketStatusOptions;
  }, [idx, isLast]);

  const handleChangeText = useCallback(makeInputStringChangeHandler(setText), [
    setText,
  ]);
  const handleChangeTicketStatus = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const status = event.target.value as TicketStatusValue;
      handleChange({ ...data, status });
    },
    [handleChange]
  );

  const handleCommitChangeText = useCallback(() => {
    handleChange({ ...data, text });
  }, [data, text, handleChange]);

  useEffect(() => {
    if (!isLast && data.status === TicketStatus.SOLVED) {
      handleChange({ ...data, status: TicketStatus.NO_CHANGE });
    } else if (isLast && idx > 0 && data.status !== TicketStatus.SOLVED) {
      handleChange({ ...data, status: TicketStatus.SOLVED });
    }
  }, [isLast, data]);

  return (
    <form className="flex flex-row gap-x-2">
      <article>
        <label htmlFor={TEXT_FIELD} className="block font-medium mb-1">
          Text*
        </label>
        <textarea
          onChange={handleChangeText}
          value={text}
          onBlur={handleCommitChangeText}
          id={TEXT_FIELD}
          className="p-2 border-2 rounded-lg"
        />
      </article>
      <section>
        <label htmlFor={TICKET_STATUS_FIELD} className="block font-medium mb-1">
          Ticket Status*
        </label>
        <select
          value={data.status}
          onChange={handleChangeTicketStatus}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          {options.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </section>
    </form>
  );
};
