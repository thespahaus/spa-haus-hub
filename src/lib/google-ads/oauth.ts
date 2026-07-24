// Read-only Google Ads OAuth helper. Only ever requests the `adwords` scope
// (Google Ads API has no separate read-only scope) — the actual read-only
// guarantee comes from the connecting Google account having "Read only"
// access in Google Ads' own Access and Security settings, not from this
// scope. See project memory "project-google-ads-management".

const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v3/userinfo";
const SCOPE = "https://www.googleapis.com/auth/adwords openid email";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

export function buildAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: requiredEnv("GOOGLE_ADS_CLIENT_ID"),
    redirect_uri: requiredEnv("GOOGLE_ADS_REDIRECT_URI"),
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent", // force a refresh_token even on repeat connects
    state,
  });
  return `${AUTH_ENDPOINT}?${params.toString()}`;
}

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
};

export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: requiredEnv("GOOGLE_ADS_CLIENT_ID"),
      client_secret: requiredEnv("GOOGLE_ADS_CLIENT_SECRET"),
      redirect_uri: requiredEnv("GOOGLE_ADS_REDIRECT_URI"),
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export async function getConnectedEmail(accessToken: string): Promise<string> {
  const res = await fetch(USERINFO_ENDPOINT, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`userinfo fetch failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { email?: string };
  if (!data.email) throw new Error("userinfo response had no email");
  return data.email;
}
