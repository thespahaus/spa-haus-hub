import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Open Leads
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">—</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Quotes Awaiting Response
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">—</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Tasks Due Today
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">—</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Customers This Month
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">—</CardContent>
        </Card>
      </div>
      <p className="text-sm text-muted-foreground">
        Real numbers land once contacts, quotes, and tasks are built out.
      </p>
    </div>
  );
}
