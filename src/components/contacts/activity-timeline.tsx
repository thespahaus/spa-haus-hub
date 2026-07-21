import { ActivityComposer } from "@/components/contacts/activity-composer";

type ActivityItem = {
  id: string;
  type: string;
  body: string;
  occurredAt: Date;
};

const TYPE_LABELS: Record<string, string> = {
  NOTE: "Note",
  CALL: "Call",
  MEETING: "Meeting",
  EMAIL: "Email",
  STATUS_CHANGE: "Status change",
  TASK: "Task",
};

export function ActivityTimeline({
  contactId,
  activities,
}: {
  contactId: string;
  activities: ActivityItem[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <ActivityComposer contactId={contactId} />
      {activities.length === 0 ? (
        <p className="text-sm text-muted-foreground">No activity yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {activities.map((a) => (
            <div key={a.id} className="border-l-2 pl-3 text-sm">
              <div className="text-xs text-muted-foreground">
                {a.occurredAt.toLocaleString()} ·{" "}
                {TYPE_LABELS[a.type] ?? a.type}
              </div>
              <div className="whitespace-pre-wrap">{a.body}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
