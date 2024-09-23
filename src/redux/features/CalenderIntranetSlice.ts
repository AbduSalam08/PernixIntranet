/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";

const mainData = {
  value: {
    isLoading: true,
    data: [],
  },
};

const CalenderIntranetData = createSlice({
  name: "CalenderIntranetData",
  initialState: mainData,
  reducers: {
    setCalenderIntranetData: (state, action) => {
      state.value = action?.payload;
      // state.value.isLoading = action.payload.isLoading;
      // state.value.data = action.payload.data; // Update with the new events
    },
  },
});

export const { setCalenderIntranetData } = CalenderIntranetData.actions;
export default CalenderIntranetData.reducer;
