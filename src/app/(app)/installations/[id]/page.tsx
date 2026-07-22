import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { InstallationStageSelect } from "@/components/installation/installation-stage-select";
import { InstallationChecklistForm } from "@/components/installation/installation-checklist-form";

export default async function InstallationPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const installation = await db.installation.findUnique({
    where: { id },
    include: {
      contact: true,
      quote: true,
    },
  });
  if (!installation) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`/contacts/${installation.contactId}`}
          className="text-sm text-muted-foreground hover:text-foreground hover:underline"
        >
          ← {installation.contact.firstName} {installation.contact.lastName}
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">
          Installation — {installation.contact.firstName}{" "}
          {installation.contact.lastName}
        </h1>
        <div className="mt-2">
          <InstallationStageSelect
            installationId={installation.id}
            stage={installation.stage}
          />
        </div>
      </div>

      <InstallationChecklistForm
        installationId={installation.id}
        contactName={`${installation.contact.firstName} ${installation.contact.lastName}`}
        deliveryAddress={installation.contact.address}
        productModel={installation.quote.productModel}
        defaults={{
          visitDate: installation.visitDate,
          arrivalTime: installation.arrivalTime,
          departureTime: installation.departureTime,
          serialNumber: installation.serialNumber,
          gfciBrand: installation.gfciBrand,
          gfciAmperage: installation.gfciAmperage,
          chemicalKitPresent: installation.chemicalKitPresent,
          coverLifterBoxPresent: installation.coverLifterBoxPresent,
          stepsBoxPresent: installation.stepsBoxPresent,
          coverClipsHardwarePresent: installation.coverClipsHardwarePresent,
          otherAccessoriesPresent: installation.otherAccessoriesPresent,
          waterFilled: installation.waterFilled,
          powerOn: installation.powerOn,
          checklist: installation.checklist,
          issuesNotes: installation.issuesNotes,
          photosTaken: installation.photosTaken,
          followUpWarranty: installation.followUpWarranty,
          followUpService: installation.followUpService,
          followUpParts: installation.followUpParts,
          installerSignedAt: installation.installerSignedAt,
          customerSignedAt: installation.customerSignedAt,
          startupCallAt: installation.startupCallAt,
          startupCallNotes: installation.startupCallNotes,
        }}
      />
    </div>
  );
}
