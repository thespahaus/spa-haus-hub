import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { db } from "@/lib/db";
import { encryptToken } from "@/lib/google-ads/encryption";
import { exchangeCodeForTokens, getConnectedEmail } from "@/lib/google-ads/oauth";

const STATE_COOKIE = "google_ads_oauth_state";
// Single-row connection — same id every time so we can upsert.
const CONNECTION_ID = "primary";

function redirectToSettings(status: "connected" | "error", detail?: string) {
  const url = new URL(
    "/settings/integrations",
    process.env.GOOGLE_ADS_REDIRECT_URI?.replace(
      "/api/integrations/google-ads/callback",
      "",
    ) ?? "http://localhost:3000",
  );
  url.searchParams.set("google_ads", status);
  if (detail) url.searchParams.set("detail", detail);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!can(session?.user, "integration:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;

  if (searchParams.get("error")) {
    return redirectToSettings("error", searchParams.get("error") ?? "denied");
  }

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const expectedState = request.cookies.get(STATE_COOKIE)?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return redirectToSettings("error", "invalid_state");
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    if (!tokens.refresh_token) {
      return redirectToSettings("error", "no_refresh_token");
    }

    const connectedEmail = await getConnectedEmail(tokens.access_token);

    await db.googleAdsConnection.upsert({
      where: { id: CONNECTION_ID },
      create: {
        id: CONNECTION_ID,
        connectedEmail,
        refreshTokenEncrypted: encryptToken(tokens.refresh_token),
      },
      update: {
        connectedEmail,
        refreshTokenEncrypted: encryptToken(tokens.refresh_token),
      },
    });

    const response = redirectToSettings("connected");
    response.cookies.delete(STATE_COOKIE);
    return response;
  } catch (err) {
    console.error("Google Ads OAuth callback failed:", err);
    return redirectToSettings("error", "exchange_failed");
  }
}
