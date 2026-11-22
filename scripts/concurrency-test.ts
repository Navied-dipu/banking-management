import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  // placeholder: fire 20 parallel transfers via API not available in script; demonstrate DB lock logic
  console.log("Concurrency test script placeholder. Run against live API.");
}
main().finally(() => prisma.$disconnect());
