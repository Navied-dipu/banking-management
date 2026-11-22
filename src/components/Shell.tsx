"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menus: Record<string, { label: string; href: string }[]> = {
  ADMIN: [
    { label: "Dashboard", href: "/admin" },
    { label: "Users", href: "/admin/users" },
    { label: "Accounts", href: "/admin/accounts" },
    { label: "Transactions", href: "/admin/transactions" },
  ],
  STAFF: [
    { label: "Dashboard", href: "/staff" },
    { label: "Money Requests", href: "/staff/requests" },
    { label: "Loans", href: "/staff/loans" },
  ],
  CUSTOMER: [
    { label: "Dashboard", href: "/customer" },
    { label: "Accounts", href: "/customer/accounts" },
    { label: "Transfer", href: "/customer/transfer" },
    { label: "Loans", href: "/customer/loans" },
  ],
};

export default function Shell({ role, children }: { role: string; children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="flex min-h-screen">
      <aside className="w-60 bg-slate-900 border-r border-slate-700 p-4 hidden md:block">
        <nav className="space-y-1">
          {(menus[role] || []).map((m) => (
            <Link key={m.href} href={m.href} className={`block px-3 py-2 rounded-lg ${path === m.href ? "bg-teal-500/20 text-teal-300" : "text-slate-300 hover:bg-slate-800"}`}>{m.label}</Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
