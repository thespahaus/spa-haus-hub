import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

function tempPassword() {
  return crypto.randomBytes(9).toString("base64url");
}

async function upsertOwner(email: string, name: string) {
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Skipped ${email} — already exists.`);
    return;
  }
  const password = tempPassword();
  const passwordHash = await bcrypt.hash(password, 12);
  await db.user.create({
    data: { email, name, role: "OWNER", passwordHash },
  });
  console.log(`Created ${email} — temporary password: ${password}`);
}

async function main() {
  await upsertOwner("matt@thespahausnc.com", "Matt");
  await upsertOwner("jillian@thespahausnc.com", "Jillian");
  console.log("\nSave these temporary passwords somewhere safe (e.g. a password manager) — they are not stored anywhere else and won't be shown again. Log in at /login, then change them once a password-change screen ships.");
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
