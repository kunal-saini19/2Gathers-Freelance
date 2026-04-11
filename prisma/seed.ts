import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: "kunal112@gmail.com" },
    update: { name: "Kunal Saini", role: "FREELANCER", tokens: 240 },
    create: { name: "Kunal Saini", email: "kunal112@gmail.com", role: "FREELANCER", tokens: 240 },
  });

  await prisma.user.upsert({
    where: { email: "aarav@2gathers.dev" },
    update: { name: "Aarav Mehta", role: "CLIENT", tokens: 800 },
    create: { name: "Aarav Mehta", email: "aarav@2gathers.dev", role: "CLIENT", tokens: 800 },
  });

  await prisma.user.upsert({
    where: { email: "script4@2gathers.dev" },
    update: { name: "Script Four", role: "ADMIN", tokens: 1200 },
    create: { name: "Script Four", email: "script4@2gathers.dev", role: "ADMIN", tokens: 1200 },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
