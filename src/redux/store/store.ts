import { configureStore } from "@reduxjs/toolkit";
import MainSPContext from "../features/MainSPContextSlice";
import MotivationalQuotesSlice from "../features/MotivationalQuotesSlice";
import NewsIntranetSlice from "../features/NewsIntranetSlice";
import CalenderIntranetSlice from "../features/CalenderIntranetSlice";
import QuestionCEOIntranetSlice from "../features/QuestionCEOIntranetSlice";

import ShoutOutsSlice from "../features/ShoutOutsSlice";

const store = configureStore({
  reducer: {
    MainSPContext: MainSPContext,
    MotivationalQuotes: MotivationalQuotesSlice,
    NewsIntranetData: NewsIntranetSlice,
    CalenderIntranetData: CalenderIntranetSlice,
    QuestionCEOIntranetData: QuestionCEOIntranetSlice,
    ShoutOutsData: ShoutOutsSlice,
  },
});

export { store };
