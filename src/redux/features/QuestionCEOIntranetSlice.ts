/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";

const mainData = {
  value: {
    isLoading: true,
    data: [],
  },
};

const QuestionCEOIntranetData = createSlice({
  name: "QuestionCEOIntranetData",
  initialState: mainData,
  reducers: {
    setQuestionCEOIntranetData: (state, action) => {
      state.value = action?.payload;
    },
    mergeQuestionCEOIntranetData: (state, action) => {
      state.value = {
        ...state.value,
        ...action.payload,
        data: [...state.value.data, ...action.payload.data],
      };
    },
  },
});

export const { setQuestionCEOIntranetData, mergeQuestionCEOIntranetData } =
  QuestionCEOIntranetData.actions;
export default QuestionCEOIntranetData.reducer;
