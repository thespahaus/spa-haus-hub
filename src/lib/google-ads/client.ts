// Read-only Google Ads API client. Only GAQL search (read) is implemented —
// no mutate methods exist here, deliberately. The connecting Google account
// also has Read-only access in Google Ads itself, so writes are rejected
// server-side by Google regardless of code. Keep it that way.

import { db } from "@/lib/db";
import { decryptToken } from "@/lib/google-ads/encryption";

const API_VERSION = "v23";
const API_BASE = `https://googleads.googleapis.com/${API_VERSION}`;
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

async function getAccessToken(): Promise<string> {
  const connection = await db.googleAdsConnection.findFirst();
  if (!connection) throw new Error("Google Ads is not connected");

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: requiredEnv("GOOGLE_ADS_CLIENT_ID"),
      client_secret: requiredEnv("GOOGLE_ADS_CLIENT_SECRET"),
      refresh_token: decryptToken(connection.refreshTokenEncrypted),
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    throw new Error(`Token refresh failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

function adsHeaders(accessToken: string, loginCustomerId?: string) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "developer-token": requiredEnv("GOOGLE_ADS_DEVELOPER_TOKEN"),
    "Content-Type": "application/json",
  };
  if (loginCustomerId) headers["login-customer-id"] = loginCustomerId;
  return headers;
}

export async function listAccessibleCustomers(): Promise<string[]> {
  const accessToken = await getAccessToken();
  const res = await fetch(`${API_BASE}/customers:listAccessibleCustomers`, {
    headers: adsHeaders(accessToken),
  });
  if (!res.ok) {
    throw new Error(
      `listAccessibleCustomers failed: ${res.status} ${await res.text()}`,
    );
  }
  const data = (await res.json()) as { resourceNames?: string[] };
  return (data.resourceNames ?? []).map((rn) => rn.replace("customers/", ""));
}

export type GaqlRow = Record<string, unknown>;

export async function gaqlSearch(
  customerId: string,
  query: string,
  loginCustomerId?: string,
): Promise<GaqlRow[]> {
  const accessToken = await getAccessToken();
  const rows: GaqlRow[] = [];
  let pageToken: string | undefined;

  do {
    const res = await fetch(
      `${API_BASE}/customers/${customerId}/googleAds:search`,
      {
        method: "POST",
        headers: adsHeaders(accessToken, loginCustomerId),
        body: JSON.stringify({ query, ...(pageToken ? { pageToken } : {}) }),
      },
    );
    if (!res.ok) {
      throw new Error(
        `GAQL search failed for ${customerId}: ${res.status} ${await res.text()}`,
      );
    }
    const data = (await res.json()) as {
      results?: GaqlRow[];
      nextPageToken?: string;
    };
    rows.push(...(data.results ?? []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  return rows;
}
