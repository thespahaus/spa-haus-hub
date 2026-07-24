export async function GET() {
  return Response.json(
    { error: "Google Ads OAuth exchange not implemented yet" },
    { status: 501 },
  );
}
