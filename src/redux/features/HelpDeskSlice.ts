/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";

const mainData = {
  value: {
    isLoading: true,
    data: [],
  },
};

const HelpDeskSlice = createSlice({
  name: "HelpDeskSlice",
  initialState: mainData,
  reducers: {
    setHelpDeskTickets: (state, action) => {
      state.value = action?.payload;
    },
  },
});

export const { setHelpDeskTickets } = HelpDeskSlice.actions;
export default HelpDeskSlice.reducer;
