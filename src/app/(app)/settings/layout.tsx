import Link from "next/link";

const TABS = [
  { href: "/settings/users", label: "Users" },
  { href: "/settings/integrations", label: "Integrations" },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <nav className="flex gap-4 border-b text-sm text-muted-foreground">
        {TABS.map((tab) => (
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
