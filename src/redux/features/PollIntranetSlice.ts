/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";

const mainData = {
  value: {
    isLoading: true,
    data: [],
  },
};

const PollIntranetData = createSlice({
  name: "PollIntranetData",
  initialState: mainData,
  reducers: {
    setPollIntranetData: (state, action) => {
      state.value = action?.payload;
    },
  },
});

export const { setPollIntranetData } = PollIntranetData.actions;
export default PollIntranetData.reducer;
