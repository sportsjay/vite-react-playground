import { useCallback, useEffect, useMemo, useState } from "react";

import { makeInputStringChangeHandler } from "../utils";
import { ReminderForm } from "./components/ReminderForm";
import { DEFAULT_INTERMEDIATE, DEFAULT_LAST } from "./constants";
import type { Data } from "./types";

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
