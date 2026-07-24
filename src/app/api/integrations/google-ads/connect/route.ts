import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { buildAuthUrl } from "@/lib/google-ads/oauth";

const STATE_COOKIE = "google_ads_oauth_state";

export async function GET() {
  const session = await auth();
  if (!can(session?.user, "integration:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const state = randomBytes(16).toString("hex");
  const response = NextResponse.redirect(buildAuthUrl(state));
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 300, // 5 minutes — just long enough to complete the consent screen
    path: "/",
  });
  return response;
}
