"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";

const demos = [
  { label: "Admin", email: "admin@bank.com", password: "Admin123!" },
  { label: "Staff", email: "staff@bank.com", password: "Staff123!" },
  { label: "Customer", email: "alice@bank.com", password: "Customer123!" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setError("Invalid credentials");
    else window.location.href = "/customer";
  }

  return (
    <div className="max-w-sm mx-auto mt-20 p-6 border rounded">
      <h1 className="text-xl font-bold mb-4">Login</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border p-2 rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border p-2 rounded" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded">{loading?"Loading...":"Sign in"}</button>
      </form>
      <div className="mt-4 text-sm">
        <p className="font-semibold">Demo credentials:</p>
        {demos.map(d => <button key={d.label} onClick={()=>{setEmail(d.email);setPassword(d.password);}} className="block text-blue-600">{d.label}: {d.email}</button>)}
      </div>
    </div>
  );
}
