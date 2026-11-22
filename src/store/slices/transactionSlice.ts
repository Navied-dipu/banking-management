import { createSlice, PayloadAction } from "@reduxjs/toolkit";
export const transactionSlice = createSlice({ name: "transaction", initialState: { search:"", type:"", status:"", dateFrom:"", dateTo:"", page:1 }, reducers: { setFilters: (s,a:PayloadAction<Partial<any>>)=>Object.assign(s,a.payload) } });
export const { setFilters } = transactionSlice.actions;
export default transactionSlice.reducer;
