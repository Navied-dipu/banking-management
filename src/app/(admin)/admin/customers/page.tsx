"use client";
import { useGetCustomersQuery } from "@/store/apiCustomers";
export default function Page() {
  const { data, isLoading } = useGetCustomersQuery({});
  return <div><h1 className="text-2xl font-bold mb-4">Customers</h1><pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>{isLoading && <p>Loading...</p>}</div>;
}
