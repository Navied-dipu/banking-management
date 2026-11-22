import { configureStore } from "@reduxjs/toolkit";
import { api } from "./api";
import auth from "./slices/authSlice";
import account from "./slices/accountSlice";
import transaction from "./slices/transactionSlice";
import loan from "./slices/loanSlice";
import ui from "./slices/uiSlice";

export const store = configureStore({
  reducer: { [api.reducerPath]: api.reducer, auth, account, transaction, loan, ui },
  middleware: (gDM) => gDM().concat(api.middleware),
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
