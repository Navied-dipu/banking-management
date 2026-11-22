import { api } from "./api";
export const customersApi = api.injectEndpoints({
  endpoints: (b) => ({
    getCustomers: b.query<any, { search?: string; page?: number }>({ query: (p) => ({ url: "/customers", params: p }), providesTags: ["Customer"] }),
    createCustomer: b.mutation<any, any>({ query: (body) => ({ url: "/customers", method: "POST", body }), invalidatesTags: ["Customer"] }),
    getAccounts: b.query<any, { userId?: string }>({ query: (p) => ({ url: "/accounts", params: p }), providesTags: ["Account"] }),
    createAccount: b.mutation<any, any>({ query: (body) => ({ url: "/accounts", method: "POST", body }), invalidatesTags: ["Account"] }),
  }),
});
export const { useGetCustomersQuery, useCreateCustomerMutation, useGetAccountsQuery, useCreateAccountMutation } = customersApi;
