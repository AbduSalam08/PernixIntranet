import { configureStore } from "@reduxjs/toolkit";
import MainSPContext from "../features/MainSPContextSlice";
import MotivationalQuotesSlice from "../features/MotivationalQuotesSlice";
import NewsIntranetSlice from "../features/NewsIntranetSlice";

const store = configureStore({
  reducer: {
    MainSPContext: MainSPContext,
    MotivationalQuotes: MotivationalQuotesSlice,
    NewsIntranetData: NewsIntranetSlice,
  },
});

export { store };
