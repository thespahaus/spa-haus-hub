export type Action =
  | "contact:write"
  | "contact:delete"
  | "quote:write"
  | "quote:delete"
  | "activity:write"
  | "task:write"
  | "task:assign"
  | "user:manage";

export type PermissionUser = { role: string } | null | undefined;

/**
 * Single choke point for authorization. Only OWNER rules exist today because
 * only Matt/Jillian are users. When STAFF (Mark/Dan) are added, their scoped
 * rules get added here — not scattered across every Server Action.
 */
export function can(user: PermissionUser, _action: Action): boolean {
  if (!user) return false;
  if (user.role === "OWNER") return true;
  return false;
}

export function requireOwner(user: PermissionUser) {
  if (!user || user.role !== "OWNER") {
    throw new Error("Unauthorized");
  }
}
