import { createSlice, PayloadAction } from "@reduxjs/toolkit";
export const accountSlice = createSlice({ name: "account", initialState: { selectedAccountId: (typeof window!=="undefined"?localStorage.getItem("selectedAccountId"):null) as string|null }, reducers: { setSelectedAccountId: (s,a:PayloadAction<string|null>)=>{s.selectedAccountId=a.payload;if(typeof window!=="undefined") a.payload?localStorage.setItem("selectedAccountId",a.payload):localStorage.removeItem("selectedAccountId");} } });
export const { setSelectedAccountId } = accountSlice.actions;
export default accountSlice.reducer;
