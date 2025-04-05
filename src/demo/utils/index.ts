import type { ChangeEvent, Dispatch, SetStateAction } from "react";

export const makeInputStringChangeHandler =
  (dispatch: Dispatch<SetStateAction<string>>) =>
  (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    dispatch(event.target.value);
  };
