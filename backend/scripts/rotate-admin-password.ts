import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 10;

async function main() {
  const email = process.argv[2] ?? process.env.ADMIN_EMAIL ?? "admin@retain.app";

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error(`No user found with email ${email}`);
  }

  const newPassword = process.env.NEW_PASSWORD ?? crypto.randomBytes(18).toString("base64url");
  const hashed = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  await prisma.user.update({ where: { email }, data: { password: hashed } });

  console.log(`Password rotated for ${email}.`);
  console.log(`New password (shown once, save it now): ${newPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
