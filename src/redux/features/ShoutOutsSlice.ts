/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";

const mainData = {
  value: {
    isLoading: true,
    data: [],
  },
};

const ShoutOutsData = createSlice({
  name: "ShoutOutsData",
  initialState: mainData,
  reducers: {
    setShoutOutsData: (state, action) => {
      state.value = action?.payload;
    },
  },
});

export const { setShoutOutsData } = ShoutOutsData.actions;
export default ShoutOutsData.reducer;
