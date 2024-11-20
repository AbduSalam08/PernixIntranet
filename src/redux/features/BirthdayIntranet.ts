/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";

const mainData = {
  value: {
    isLoading: true,
    data: [],
  },
};

const BirthdaysData = createSlice({
  name: "BirthdaysData",
  initialState: mainData,
  reducers: {
    setBirthdaysData: (state, action) => {
      state.value = action?.payload;
    },
  },
});

export const { setBirthdaysData } = BirthdaysData.actions;
export default BirthdaysData.reducer;
