import { auth } from "@/lib/auth";
import { ChangePasswordForm } from "@/components/account/change-password-form";

export default async function AccountPage() {
  const session = await auth();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">My Account</h1>
        <p className="text-sm text-muted-foreground">
          {session?.user.name} — {session?.user.email}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Change password</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
