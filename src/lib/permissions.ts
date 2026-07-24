export type Action =
  | "contact:write"
  | "contact:delete"
  | "quote:write"
  | "quote:delete"
  | "activity:write"
  | "task:write"
  | "task:assign"
  | "user:manage"
  | "installation:write"
  | "integration:manage";

export type PermissionUser = { role: string; email?: string | null } | null | undefined;

// Matt's explicit request: the Google Ads integration is visible/manageable
// only from his account, not other OWNERs.
const INTEGRATION_MANAGERS = ["matt@thespahausnc.com"];

/**
 * Single choke point for authorization. Only OWNER rules exist today because
 * only Matt/Jillian are users. When STAFF (Mark/Dan) are added, their scoped
 * rules get added here — not scattered across every Server Action.
 */
export function can(user: PermissionUser, action: Action): boolean {
  if (!user) return false;
  if (action === "integration:manage") {
    return (
      user.role === "OWNER" &&
      !!user.email &&
      INTEGRATION_MANAGERS.includes(user.email)
    );
  }
  if (user.role === "OWNER") return true;
  return false;
}
