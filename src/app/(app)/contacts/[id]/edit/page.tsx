import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { updateContact } from "@/actions/contacts";
import { ContactForm } from "@/components/contacts/contact-form";

export default async function EditContactPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const contact = await db.contact.findUnique({ where: { id } });
  if (!contact) notFound();

  const updateWithId = updateContact.bind(null, contact.id);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">
        Edit {contact.firstName} {contact.lastName}
      </h1>
      <ContactForm
        action={updateWithId}
        defaults={contact}
        submitLabel="Save Changes"
      />
    </div>
  );
}
