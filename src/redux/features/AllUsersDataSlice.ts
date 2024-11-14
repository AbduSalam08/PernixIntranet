/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";

const mainData = {
  value: [],
};

const AllUsersDataSlice = createSlice({
  name: "AllUsersDataSlice",
  initialState: mainData,
  reducers: {
    setAllUsersData: (state, action) => {
      state.value = action?.payload;
    },
  },
});

export const { setAllUsersData } = AllUsersDataSlice.actions;
export default AllUsersDataSlice.reducer;
