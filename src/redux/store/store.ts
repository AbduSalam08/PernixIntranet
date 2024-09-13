import { configureStore } from "@reduxjs/toolkit";
import MainSPContext from "../features/MainSPContextSlice";

const store = configureStore({
  reducer: {
    MainSPContext: MainSPContext,
  },
});

export { store };
