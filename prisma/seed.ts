import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // System settings
  await prisma.systemSetting.upsert({ where: { key: "bankName" }, update: {}, create: { key: "bankName", value: "Simulated Digital Bank" } });
  await prisma.systemSetting.upsert({ where: { key: "currency" }, update: {}, create: { key: "currency", value: "USD" } });
  await prisma.systemSetting.upsert({ where: { key: "transferFeePercent" }, update: {}, create: { key: "transferFeePercent", value: "0.5" } });

  const hash = async (p: string) => bcrypt.hash(p, 10);
  const admin = await prisma.user.create({ data: { name: "Admin", email: "admin@bank.com", passwordHash: await hash("Admin123!"), role: "ADMIN", phone: "1111111111" } });
  const staff = await prisma.user.create({ data: { name: "Staff", email: "staff@bank.com", passwordHash: await hash("Staff123!"), role: "STAFF", phone: "2222222222" } });
  const cust1 = await prisma.user.create({ data: { name: "Alice Customer", email: "alice@bank.com", passwordHash: await hash("Customer123!"), role: "CUSTOMER", phone: "3333333333" } });
  const cust2 = await prisma.user.create({ data: { name: "Bob Customer", email: "bob@bank.com", passwordHash: await hash("Customer123!"), role: "CUSTOMER", phone: "4444444444" } });

  const pinHash = await hash("1234");

  const acc1 = await prisma.account.create({ data: { accountNumber: "100000000001", userId: cust1.id, type: "SAVINGS", balance: "5000.00", transactionPinHash: pinHash } });
  const acc2 = await prisma.account.create({ data: { accountNumber: "100000000002", userId: cust1.id, type: "CURRENT", balance: "2000.00", transactionPinHash: pinHash } });
  const acc3 = await prisma.account.create({ data: { accountNumber: "100000000003", userId: cust2.id, type: "SAVINGS", balance: "3500.00", transactionPinHash: pinHash } });

  // historical transactions
  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(now.getTime() - i * 6 * 24 * 60 * 60 * 1000);
    await prisma.transaction.create({
      data: {
        transactionId: `TXN-${d.toISOString().slice(0, 10).replace(/-/g, "")}-${String(i).padStart(6, "0")}`,
        type: i % 3 === 0 ? "DEPOSIT" : i % 3 === 1 ? "WITHDRAWAL" : "TRANSFER",
        amount: (50 + i * 13).toFixed(2),
        fee: "0.00",
        status: "COMPLETED",
        description: "Seeded transaction",
        senderAccountId: i % 3 === 1 || i % 3 === 2 ? acc1.id : null,
        receiverAccountId: i % 3 === 2 ? acc3.id : null,
        createdById: cust1.id,
        createdAt: d,
      },
    });
  }

  console.log("Demo credentials:");
  console.log("admin@bank.com / Admin123!");
  console.log("staff@bank.com / Staff123!");
  console.log("alice@bank.com / Customer123! (PIN 1234)");
  console.log("bob@bank.com / Customer123! (PIN 1234)");
}

