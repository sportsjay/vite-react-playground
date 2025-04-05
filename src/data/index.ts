import { configureStore } from "@reduxjs/toolkit";

import redaction from "../demo/Redaction/data";

export const store = configureStore({
  reducer: {
    redaction,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
