/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";

const mainData = {
  value: [],
  bannerImage: null,
};

const MotivationalQuotes = createSlice({
  name: "MotivationalQuotes",
  initialState: mainData,
  reducers: {
    setMotivationalQuotesData: (state, action) => {
      state.value = action?.payload;
    },
    setBannerImage: (state, action) => {
      state.bannerImage = action?.payload;
    },
  },
});

export const { setMotivationalQuotesData, setBannerImage } =
  MotivationalQuotes.actions;
export default MotivationalQuotes.reducer;
