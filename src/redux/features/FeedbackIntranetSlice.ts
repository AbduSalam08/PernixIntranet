/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";

const mainData = {
  value: {
    isLoading: true,
    data: [],
  },
};

const FeedbackIntranetData = createSlice({
  name: "FeedbackIntranetData",
  initialState: mainData,
  reducers: {
    setFeedbackIntranetData: (state, action) => {
      state.value = action?.payload;
    },
  },
});

export const { setFeedbackIntranetData } = FeedbackIntranetData.actions;
export default FeedbackIntranetData.reducer;
