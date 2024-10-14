/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";

const mainData = {
  value: {
    isLoading: true,
    data: [],
  },
};

const NewHiresData = createSlice({
  name: "NewHiresData",
  initialState: mainData,
  reducers: {
    setNewHiresData: (state, action) => {
      state.value = action?.payload;
    },
  },
});

export const { setNewHiresData } = NewHiresData.actions;
export default NewHiresData.reducer;
