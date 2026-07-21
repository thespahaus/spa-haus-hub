"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TaskForm({
  action,
  users,
  fixedContact,
  contacts,
  defaultAssigneeId,
}: {
  action: (formData: FormData) => void;
  users: { id: string; name: string }[];
  fixedContact?: { id: string; firstName: string; lastName: string };
  contacts?: { id: string; firstName: string; lastName: string }[];
  defaultAssigneeId?: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-4 max-w-lg">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required autoFocus />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="dueDate">Due date</Label>
          <Input id="dueDate" name="dueDate" type="date" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="assigneeId">Assignee</Label>
          <Select name="assigneeId" defaultValue={defaultAssigneeId}>
            <SelectTrigger id="assigneeId" className="w-full">
              <SelectValue placeholder="Choose a person">
                {(value: string) =>
                  users.find((u) => u.id === value)?.name ?? value
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {fixedContact ? (
        <div className="flex flex-col gap-2">
          <Label>Contact</Label>
          <input type="hidden" name="contactId" value={fixedContact.id} />
          <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
            {fixedContact.firstName} {fixedContact.lastName}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Label htmlFor="contactId">Related Contact (optional)</Label>
          <Select name="contactId">
            <SelectTrigger id="contactId" className="w-full">
              <SelectValue placeholder="None">
                {(value: string) => {
                  const c = contacts?.find((c) => c.id === value);
                  return c ? `${c.firstName} ${c.lastName}` : value;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {contacts?.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.firstName} {c.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Button type="submit" className="mt-2 w-fit">
        Create Task
      </Button>
    </form>
  );
}
