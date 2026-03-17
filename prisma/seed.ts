import { PrismaClient, RoleName } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const adminPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  const adminName = process.env.BOOTSTRAP_ADMIN_NAME ?? "Administrator";

  if (!adminEmail || !adminPassword) {
    console.log("Seed saltato: imposta BOOTSTRAP_ADMIN_EMAIL e BOOTSTRAP_ADMIN_PASSWORD per creare il primo admin.");
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log(`Admin gia presente: ${adminEmail}`);
    return;
  }

  await prisma.user.create({
    data: {
      name: adminName,
      email: adminEmail,
      passwordHash: hashSync(adminPassword, 12),
      role: RoleName.ADMIN,
      profile: {
        create: {
          timezone: process.env.DEFAULT_TIMEZONE ?? "Europe/Rome",
          locale: process.env.DEFAULT_LOCALE ?? "it-IT",
          theme: "dark"
        }
      }
    }
  });

  console.log(`Admin creato: ${adminEmail}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
