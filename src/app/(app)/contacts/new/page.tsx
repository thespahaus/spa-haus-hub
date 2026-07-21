import { createContact } from "@/actions/contacts";
import { ContactForm } from "@/components/contacts/contact-form";

export default function NewContactPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">New Contact</h1>
      <ContactForm action={createContact} submitLabel="Create Contact" />
    </div>
  );
}
