import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function UsersSettingsPage() {
  const session = await auth();
  if (session?.user.role !== "OWNER") {
    redirect("/");
  }

  const users = await db.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Users</h1>
      <ul className="flex flex-col gap-2">
        {users.map((u) => (
          <li key={u.id} className="rounded border p-3 text-sm">
            {u.name} — {u.email} — {u.role} {!u.isActive && "(inactive)"}
          </li>
        ))}
      </ul>
    </div>
  );
}
