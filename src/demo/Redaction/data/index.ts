import { createSlice } from "@reduxjs/toolkit";

import { REDACTION_SLICE } from "./constants";

export const redactionSlice = createSlice({
  name: REDACTION_SLICE,
  initialState: {},
  reducers: {},
});

export default redactionSlice.reducer;
