import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { toast } from "sonner";

const baseQuery = fetchBaseQuery({ baseUrl: "/api" });
const baseQueryWithReauth: typeof baseQuery = async (args, api, extra) => {
  const res = await baseQuery(args, api, extra);
  if (res.error) {
    const status = (res.error as any).status;
    if (status === 401) { window.location.href = "/login"; }
    else { toast.error("Request failed"); }
  }
  return res;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Account","Transaction","Loan","MoneyRequest","Customer","Dashboard","Notification"],
  endpoints: () => ({}),
});
