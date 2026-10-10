import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 12;

const DEFAULT_CATEGORIES = [
  "Food & Dining",
  "Transport",
  "Housing",
  "Utilities",
  "Entertainment",
  "Health",
  "Shopping",
  "Education",
  "Other",
];

const UNCATEGORIZED = "Uncategorized";

function generateRandomPassword() {
  return crypto.randomBytes(18).toString("base64url");
}

async function main() {
  await prisma.category.upsert({
    where: { name: UNCATEGORIZED },
    update: { isDefault: true },
    create: { name: UNCATEGORIZED, isDefault: true },
  });

  for (const name of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@retain.app";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const password = process.env.ADMIN_PASSWORD ?? generateRandomPassword();
    const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await prisma.user.create({
      data: { name: "Admin", email: adminEmail, password: hashed, role: "ADMIN" },
    });
    console.log(`Seeded admin user: ${adminEmail}`);
    console.log(`Admin password (shown once, save it now): ${password}`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
