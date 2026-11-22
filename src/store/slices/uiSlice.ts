import { createSlice, PayloadAction } from "@reduxjs/toolkit";
export const uiSlice = createSlice({ name: "ui", initialState: { loading:0, sidebarOpen:false, theme:"light" }, reducers: { incLoading:(s)=>{s.loading++}, decLoading:(s)=>{s.loading=Math.max(0,s.loading-1)}, toggleSidebar:(s)=>{s.sidebarOpen=!s.sidebarOpen} } });
export const { incLoading, decLoading, toggleSidebar } = uiSlice.actions;
export default uiSlice.reducer;
