import Link from "next/link";
import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const tabs = [
    { href: "/settings/users", label: "Users" },
    ...(can(session?.user, "integration:manage")
      ? [{ href: "/settings/integrations", label: "Integrations" }]
      : []),
  ];

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex gap-4 border-b text-sm text-muted-foreground">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="-mb-px border-b-2 border-transparent pb-2 hover:text-foreground"
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
