import { configureStore } from "@reduxjs/toolkit";
import MainSPContext from "../features/MainSPContextSlice";
import MotivationalQuotesSlice from "../features/MotivationalQuotesSlice";
import NewsIntranetSlice from "../features/NewsIntranetSlice";
import CalenderIntranetSlice from "../features/CalenderIntranetSlice";
import QuestionCEOIntranetSlice from "../features/QuestionCEOIntranetSlice";
import NewHiresIntranet from "../features/NewHiresIntranet";
import ShoutOutsSlice from "../features/ShoutOutsSlice";
import PollIntranetSlice from "../features/PollIntranetSlice";
import FeedbackIntranetSlice from "../features/FeedbackIntranetSlice";
import HelpDeskSlice from "../features/HelpDeskSlice";
import AllUsersDataSlice from "../features/AllUsersDataSlice";
import BirthdaysSlice from "../features/BirthdayIntranet";

const store = configureStore({
  reducer: {
    MainSPContext: MainSPContext,
    MotivationalQuotes: MotivationalQuotesSlice,
    NewsIntranetData: NewsIntranetSlice,
    CalenderIntranetData: CalenderIntranetSlice,
    QuestionCEOIntranetData: QuestionCEOIntranetSlice,
    ShoutOutsData: ShoutOutsSlice,
    PollIntranetData: PollIntranetSlice,
    FeedbackIntranetData: FeedbackIntranetSlice,
    NewHiresData: NewHiresIntranet,
    HelpDeskTicktesData: HelpDeskSlice,
    AllUsersData: AllUsersDataSlice,
    BirthdaysData: BirthdaysSlice,
  },
});

export { store };
