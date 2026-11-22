import { api } from "./api";
export const dashboardApi = api.injectEndpoints({
  endpoints: (b) => ({
    getAdminDashboard: b.query<any, void>({ query: () => "/dashboard/admin", providesTags: ["Dashboard"] }),
    getCustomerDashboard: b.query<any, void>({ query: () => "/dashboard/customer", providesTags: ["Dashboard"] }),
  }),
});
export const { useGetAdminDashboardQuery, useGetCustomerDashboardQuery } = dashboardApi;
