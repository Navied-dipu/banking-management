import { api } from "./api";
export const requestsApi = api.injectEndpoints({
  endpoints: (b) => ({
    getRequests: b.query<any, { pending?: boolean }>({ query: (p) => ({ url: "/requests", params: p }), providesTags: ["MoneyRequest"] }),
    createRequest: b.mutation<any, any>({ query: (body) => ({ url: "/requests", method: "POST", body }), invalidatesTags: ["MoneyRequest","Account","Transaction"] }),
    reviewRequest: b.mutation<any, { id: string; action: string; note?: string }>({ query: ({ id, ...body }) => ({ url: `/requests/${id}`, method: "PATCH", body }), invalidatesTags: ["MoneyRequest","Account","Transaction"] }),
  }),
});
export const { useGetRequestsQuery, useCreateRequestMutation, useReviewRequestMutation } = requestsApi;
