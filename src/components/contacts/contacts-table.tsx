import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { STAGE_LABELS } from "@/lib/validation/contact";

type RowContact = {
  id: string;
  firstName: string;
  lastName: string;
  stage: string;
  phone: string | null;
  email: string | null;
  source: string | null;
  owner: { name: string } | null;
};

export function ContactsTable({ contacts }: { contacts: RowContact[] }) {
  if (contacts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No contacts yet — add your first lead to get started.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Stage</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Owner</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contacts.map((c) => (
          <TableRow key={c.id}>
            <TableCell>
              <Link href={`/contacts/${c.id}`} className="font-medium hover:underline">
                {c.firstName} {c.lastName}
              </Link>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">
                {STAGE_LABELS[c.stage as keyof typeof STAGE_LABELS] ?? c.stage}
              </Badge>
            </TableCell>
            <TableCell>{c.phone ?? "—"}</TableCell>
            <TableCell>{c.email ?? "—"}</TableCell>
            <TableCell>{c.source ?? "—"}</TableCell>
            <TableCell>{c.owner?.name ?? "—"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
