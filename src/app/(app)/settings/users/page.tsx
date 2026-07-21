import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/permissions";
import { AddUserForm } from "@/components/settings/add-user-form";
import { UserActiveToggle } from "@/components/settings/user-active-toggle";

export default async function UsersSettingsPage() {
  const session = await auth();
  if (!can(session?.user, "user:manage")) {
    redirect("/");
  }

  const users = await db.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Users</h1>

      <AddUserForm />

      <ul className="flex flex-col gap-2">
        {users.map((u) => (
          <li
            key={u.id}
            className="flex items-center justify-between rounded border p-3 text-sm"
          >
            <span>
              {u.name} — {u.email} — {u.role}
              {!u.isActive && (
                <span className="text-muted-foreground"> (inactive)</span>
              )}
            </span>
            <UserActiveToggle
              userId={u.id}
              isActive={u.isActive}
              isSelf={u.id === session?.user.id}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
