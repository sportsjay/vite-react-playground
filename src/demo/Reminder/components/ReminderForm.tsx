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

const MESSAGE_FORM = "message-form";

export const ReminderForm = ({
  idx,
  data,
  isLast,
  handleChange,
}: ReminderFormProps) => {
  const [text, setText] = useState(data.text);
  const [status, setStatus] = useState(data.status);
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
      setStatus(event.target.value as TicketStatusValue);
    },
    [setStatus]
  );

  const handleCommitChangeText = useCallback(() => {
    handleChange({ ...data, text });
  }, [data, text, handleChange]);

  const handleCommitChangeTicketStatus = useCallback(() => {
    handleChange({ ...data, status });
  }, [data, status, handleChange]);

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
        <label htmlFor={MESSAGE_FORM} className="block font-medium mb-1">
          Message*
        </label>
        <textarea
          onChange={handleChangeText}
          value={text}
          onBlur={handleCommitChangeText}
          id={MESSAGE_FORM}
          className="p-2 border-2 rounded-lg"
        />
      </article>
      <select
        value={data.status}
        onChange={handleChangeTicketStatus}
        onBlur={handleCommitChangeTicketStatus}
      >
        {options.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
    </form>
  );
};
