"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/permissions";

const userSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Enter a valid email"),
  role: z.enum(["OWNER", "STAFF"]),
});

export type CreateUserState = {
  error?: string;
  tempPassword?: string;
  createdEmail?: string;
};

export async function createUser(
  _prevState: CreateUserState,
  formData: FormData,
): Promise<CreateUserState> {
  const session = await auth();
  if (!can(session?.user, "user:manage")) {
    return { error: "Unauthorized" };
  }

  const parsed = userSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await db.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return { error: "A user with that email already exists" };
  }

  const tempPassword = crypto.randomBytes(9).toString("base64url");
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      passwordHash,
    },
  });

  revalidatePath("/settings/users");
  return { tempPassword, createdEmail: parsed.data.email };
}

export async function setUserActive(userId: string, isActive: boolean) {
  const session = await auth();
  if (!can(session?.user, "user:manage")) {
    throw new Error("Unauthorized");
  }
  if (userId === session?.user.id && !isActive) {
    throw new Error("You can't deactivate your own account");
  }

  await db.user.update({ where: { id: userId }, data: { isActive } });
  revalidatePath("/settings/users");
}
