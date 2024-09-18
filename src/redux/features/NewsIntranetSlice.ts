/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";

const mainData = {
  value: {
    isLoading: true,
    data: [],
  },
};

const NewsIntranetData = createSlice({
  name: "NewsIntranetData",
  initialState: mainData,
  reducers: {
    setNewsIntranetData: (state, action) => {
      state.value = action?.payload;
    },
  },
});

export const { setNewsIntranetData } = NewsIntranetData.actions;
export default NewsIntranetData.reducer;
