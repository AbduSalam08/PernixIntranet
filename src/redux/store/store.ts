import { configureStore } from "@reduxjs/toolkit";
import MainSPContext from "../features/MainSPContextSlice";
import MotivationalQuotesSlice from "../features/MotivationalQuotesSlice";

const store = configureStore({
  reducer: {
    MainSPContext: MainSPContext,
    MotivationalQuotes: MotivationalQuotesSlice,
  },
});

export { store };
