import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { makeInputStringChangeHandler } from "../utils";

const TicketStatus = Object.freeze({
  NO_CHANGE: "NO_CHANGE",
  ON_HOLD: "ON_HOLD",
  PENDING: "PENDING",
  SOLVED: "SOLVED",
});

const TicketStatusList = Object.values(TicketStatus);
const OnlyReminderTicketStatusOptions = [
  TicketStatus.PENDING,
  TicketStatus.SOLVED,
];
const IntermediateReminderTicketStatusOptions = TicketStatusList.filter(
  (option) => option !== TicketStatus.SOLVED
);
const LastReminderTicketStatusOptions = [TicketStatus.SOLVED];

type TicketStatusType = typeof TicketStatus;
type TicketStatusValue = TicketStatusType[keyof TicketStatusType];

type Data = {
  text: string;
  timeout: number;
  status: TicketStatusValue;
};

const DEFAULT_INTERMEDIATE: Data = {
  text: "default intermediate",
  timeout: 3,
  status: TicketStatus.NO_CHANGE,
};

const DEFAULT_LAST: Data = {
  text: "default last",
  timeout: 3,
  status: TicketStatus.SOLVED,
};

type ReminderFormProps = {
  idx: number;
  data: Data;
  isLast: boolean;
  handleChange: (data: Data) => void;
};

const MESSAGE_FORM = "message-form";

const ReminderForm = ({
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

const REMINDER_COUNT_FORM = "reminder-count";

export const Reminder = () => {
  const [count, setCount] = useState("0");
  const [reminders, setReminders] = useState<Data[]>([]);
  // to retain memory
  const currentCount = useMemo(() => Number(count), [count]);

  const renderableReminders = useMemo(
    () =>
      Array(currentCount)
        .fill("")
        .map((_, idx) => reminders[idx]),
    [currentCount, reminders]
  );

  useEffect(() => {
    if (currentCount > reminders.length) {
      const remindersDiff = currentCount - reminders.length;
      const newItems = Array(remindersDiff)
        .fill("")
        .map((_, idx) =>
          idx === remindersDiff - 1 ? DEFAULT_LAST : DEFAULT_INTERMEDIATE
        );
      setReminders((cache) => {
        cache.push(...newItems);
        return [...cache];
      });
    }
  }, [currentCount, reminders.length]);

  const makeChangeAt = useCallback(
    (idx: number) => {
      return (newData: Data) =>
        setReminders((prevReminders) => {
          prevReminders[idx] = newData;
          return [...prevReminders];
        });
    },
    [setReminders]
  );

  return (
    <div className="container mx-auto px-4 py-4">
      <section className="flex gap-x-2">
        <form className="container mx-auto px-4 py-4">
          <label className="block font-medium" htmlFor={REMINDER_COUNT_FORM}>
            Reminders
          </label>
          <input
            min={0}
            id={REMINDER_COUNT_FORM}
            className="p-2 border-2 rounded-lg"
            type="number"
            value={count}
            onChange={makeInputStringChangeHandler(setCount)}
          />
        </form>
      </section>
      <div className="container flex flex-row mx-auto px-4 py-4">
        <section className="flex-1 flex flex-col gap-y-2">
          {renderableReminders.map(
            (reminder, idx) =>
              reminder && (
                <ReminderForm
                  key={`reminder-${idx}`}
                  idx={idx}
                  data={reminder}
                  handleChange={makeChangeAt(idx)}
                  isLast={idx === currentCount - 1}
                />
              )
          )}
        </section>
        <pre className="flex-1">{JSON.stringify(reminders, undefined, 2)}</pre>
        <pre className="flex-1">
          {JSON.stringify(renderableReminders, undefined, 2)}
        </pre>
      </div>
    </div>
  );
};
