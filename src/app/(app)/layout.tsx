import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/contacts", label: "Contacts" },
  { href: "/quotes", label: "Quotes" },
  { href: "/tasks", label: "Tasks" },
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="font-semibold">Spa Haus Hub</span>
            <nav className="flex gap-4 text-sm text-muted-foreground">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
              {can(session.user, "integration:manage") && (
                <Link href="/google-ads" className="hover:text-foreground">
                  Google Ads
                </Link>
              )}
              {session.user.role === "OWNER" && (
                <Link href="/settings/users" className="hover:text-foreground">
                  Settings
                </Link>
              )}
            </nav>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Link href="/account" className="hover:text-foreground">
                {session.user.name}
              </Link>
              <Button type="submit" variant="outline" size="sm">
                Sign out
              </Button>
            </div>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        {children}
      </main>
    </div>
  );
}
