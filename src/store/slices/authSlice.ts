import { createSlice, PayloadAction } from "@reduxjs/toolkit";
export const authSlice = createSlice({ name: "auth", initialState: { user: null as any, role: null as string|null }, reducers: { setUser: (s,a:PayloadAction<any>)=>{s.user=a.payload;s.role=a.payload?.role??null;} } });
export const { setUser } = authSlice.actions;
export default authSlice.reducer;
