"use client";

import { useState, useTransition } from "react";
import { updateInstallationChecklist } from "@/actions/installations";
import { EMPTY_CHECKLIST, type InstallationChecklist } from "@/lib/validation/installation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type InstallationDefaults = {
  visitDate: Date | null;
  arrivalTime: Date | null;
  departureTime: Date | null;
  serialNumber: string | null;
  gfciBrand: string | null;
  gfciAmperage: string | null;
  chemicalKitPresent: boolean | null;
  coverLifterBoxPresent: boolean | null;
  stepsBoxPresent: boolean | null;
  coverClipsHardwarePresent: boolean | null;
  otherAccessoriesPresent: boolean | null;
  waterFilled: boolean | null;
  powerOn: boolean | null;
  checklist: unknown;
  issuesNotes: string | null;
  photosTaken: boolean | null;
  followUpWarranty: boolean;
  followUpService: boolean;
  followUpParts: boolean;
  installerSignedAt: Date | null;
  customerSignedAt: Date | null;
  startupCallAt: Date | null;
  startupCallNotes: string | null;
};

function toDatetimeLocal(d: Date | null) {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toDateInput(d: Date | null) {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(!!v)} />
      {label}
    </label>
  );
}

export function InstallationChecklistForm({
  installationId,
  contactName,
  deliveryAddress,
  productModel,
  defaults,
}: {
  installationId: string;
  contactName: string;
  deliveryAddress: string | null;
  productModel: string | null;
  defaults: InstallationDefaults;
}) {
  const [checklist, setChecklist] = useState<InstallationChecklist>(() => ({
    ...EMPTY_CHECKLIST,
    ...((defaults.checklist as Partial<InstallationChecklist>) ?? {}),
  }));
  const [isPending, startTransition] = useTransition();

  function update<K extends keyof InstallationChecklist>(
    key: K,
    value: InstallationChecklist[K],
  ) {
    setChecklist((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form
      action={(formData: FormData) => {
        formData.set("checklist", JSON.stringify(checklist));
        startTransition(() => {
          updateInstallationChecklist(installationId, formData);
        });
      }}
      className="flex flex-col gap-6 pb-12"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Job Information
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Customer: </span>
            {contactName}
          </div>
          <div>
            <span className="text-muted-foreground">Address: </span>
            {deliveryAddress ?? "—"}
          </div>
          <div>
            <span className="text-muted-foreground">Model: </span>
            {productModel ?? "—"}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="serialNumber">Serial #</Label>
              <Input
                id="serialNumber"
                name="serialNumber"
                defaultValue={defaults.serialNumber ?? ""}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="visitDate">Visit Date</Label>
              <Input
                id="visitDate"
                name="visitDate"
                type="date"
                defaultValue={toDateInput(defaults.visitDate)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="arrivalTime">Arrival Time</Label>
              <Input
                id="arrivalTime"
                name="arrivalTime"
                type="datetime-local"
                defaultValue={toDatetimeLocal(defaults.arrivalTime)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="departureTime">Departure Time</Label>
              <Input
                id="departureTime"
                name="departureTime"
                type="datetime-local"
                defaultValue={toDatetimeLocal(defaults.departureTime)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="gfciBrand">GFCI Brand</Label>
              <Input
                id="gfciBrand"
                name="gfciBrand"
                defaultValue={defaults.gfciBrand ?? ""}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="gfciAmperage">Amperage</Label>
              <Input
                id="gfciAmperage"
                name="gfciAmperage"
                defaultValue={defaults.gfciAmperage ?? ""}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Delivery Confirmation — all items present on-site
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              name="chemicalKitPresent"
              defaultChecked={!!defaults.chemicalKitPresent}
            />
            SpaGuard chemical kit
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              name="coverLifterBoxPresent"
              defaultChecked={!!defaults.coverLifterBoxPresent}
            />
            Cover lifter box
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              name="stepsBoxPresent"
              defaultChecked={!!defaults.stepsBoxPresent}
            />
            Steps box
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              name="coverClipsHardwarePresent"
              defaultChecked={!!defaults.coverClipsHardwarePresent}
            />
            Cover clips / hardware
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              name="otherAccessoriesPresent"
              defaultChecked={!!defaults.otherAccessoriesPresent}
            />
            Other accessories
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Water &amp; Power
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              name="waterFilled"
              defaultChecked={!!defaults.waterFilled}
            />
            Water Filled
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox name="powerOn" defaultChecked={!!defaults.powerOn} />
            Power On
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Steps &amp; Cover
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <CheckRow
            label="Steps assembled"
            checked={checklist.steps.installed}
            onChange={(v) => update("steps", { ...checklist.steps, installed: v })}
          />
          <CheckRow
            label="Steps level & positioned, stable"
            checked={checklist.steps.secure}
            onChange={(v) => update("steps", { ...checklist.steps, secure: v })}
          />
          <CheckRow
            label="Cover aligned, seals perimeter, no damage"
            checked={checklist.cover.fits}
            onChange={(v) => update("cover", { ...checklist.cover, fits: v })}
          />
          <CheckRow
            label="Cover skirt attached"
            checked={checklist.cover.skirtAttached}
            onChange={(v) =>
              update("cover", { ...checklist.cover, skirtAttached: v })
            }
          />
          <CheckRow
            label="Cover lifter assembled, installed square, hardware tight"
            checked={checklist.coverLifter.assembled}
            onChange={(v) =>
              update("coverLifter", { ...checklist.coverLifter, assembled: v })
            }
          />
          <CheckRow
            label="Cover lifter opens/closes smoothly, customer shown"
            checked={checklist.coverLifter.functions}
            onChange={(v) =>
              update("coverLifter", { ...checklist.coverLifter, functions: v })
            }
          />
          <CheckRow
            label="Cover clips installed, tension correct, customer shown"
            checked={checklist.coverClips.installed}
            onChange={(v) =>
              update("coverClips", { ...checklist.coverClips, installed: v })
            }
          />
          <CheckRow
            label="Screws from brown envelope installed, keys placed in chemical bag"
            checked={checklist.coverClips.brownEnvelopeScrewsInstalled}
            onChange={(v) =>
              update("coverClips", {
                ...checklist.coverClips,
                brownEnvelopeScrewsInstalled: v,
              })
            }
          />
          <CheckRow
            label="Other accessories (handrails, SpaCaddy, etc.) installed & shown"
            checked={checklist.otherAccessories.installed}
            onChange={(v) => update("otherAccessories", { installed: v })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Startup &amp; Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <CheckRow
            label="Power on"
            checked={checklist.initialStartup.powerOn}
            onChange={(v) =>
              update("initialStartup", { ...checklist.initialStartup, powerOn: v })
            }
          />
          <CheckRow
            label="No error codes"
            checked={checklist.initialStartup.noErrorCodes}
            onChange={(v) =>
              update("initialStartup", {
                ...checklist.initialStartup,
                noErrorCodes: v,
              })
            }
          />
          <CheckRow
            label="Circulation running"
            checked={checklist.initialStartup.circulationRunning}
            onChange={(v) =>
              update("initialStartup", {
                ...checklist.initialStartup,
                circulationRunning: v,
              })
            }
          />
          <CheckRow
            label="Filters installed"
            checked={checklist.initialStartup.filtersInstalled}
            onChange={(v) =>
              update("initialStartup", {
                ...checklist.initialStartup,
                filtersInstalled: v,
              })
            }
          />
          <CheckRow
            label="Topside controls: screen OK, temp adjusts, menus accessible"
            checked={checklist.topsideControls.functioning}
            onChange={(v) => update("topsideControls", { functioning: v })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Jet Pumps
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {checklist.jetPumps.map((pump, i) => (
            <div key={pump.label} className="flex flex-col gap-1">
              <span className="text-sm">{pump.label}</span>
              <select
                className="rounded-md border px-2 py-1 text-sm"
                value={pump.status}
                onChange={(e) => {
                  const next = [...checklist.jetPumps];
                  next[i] = {
                    ...pump,
                    status: e.target.value as "pass" | "fail" | "na",
                  };
                  update("jetPumps", next);
                }}
              >
                <option value="na">N/A</option>
                <option value="pass">Pass</option>
                <option value="fail">Fail</option>
              </select>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Jets, Waterfalls, Lights &amp; Audio
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <CheckRow
            label="All jet zones verified, diverters & air controls function"
            checked={checklist.jetsValvesFeatures.functioning}
            onChange={(v) => update("jetsValvesFeatures", { functioning: v })}
          />
          <CheckRow
            label="Waterfall(s) verified (if equipped)"
            checked={checklist.waterfalls.functioning}
            onChange={(v) => update("waterfalls", { functioning: v })}
          />
          <CheckRow
            label="All lights work, modes cycle"
            checked={checklist.lightsEntertainment.lightsFunctioning}
            onChange={(v) =>
              update("lightsEntertainment", {
                ...checklist.lightsEntertainment,
                lightsFunctioning: v,
              })
            }
          />
          <CheckRow
            label="Audio tested, customer paired phone, volume verified"
            checked={checklist.lightsEntertainment.audioPaired}
            onChange={(v) =>
              update("lightsEntertainment", {
                ...checklist.lightsEntertainment,
                audioPaired: v,
              })
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Leak &amp; Visual Inspection
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <CheckRow
            label="No visible leaks, no abnormal noise or vibration"
            checked={checklist.leakVisualInspection.noLeaks}
            onChange={(v) =>
              update("leakVisualInspection", {
                ...checklist.leakVisualInspection,
                noLeaks: v,
              })
            }
          />
          <CheckRow
            label="Cabinet & exterior OK — no damage"
            checked={checklist.leakVisualInspection.visualOk}
            onChange={(v) =>
              update("leakVisualInspection", {
                ...checklist.leakVisualInspection,
                visualOk: v,
              })
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Customer Handoff
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <CheckRow
            label="Basic operation demonstrated — temperature, jets, lights"
            checked={checklist.customerHandoff.basicOperationDemonstrated}
            onChange={(v) =>
              update("customerHandoff", {
                ...checklist.customerHandoff,
                basicOperationDemonstrated: v,
              })
            }
          />
          <CheckRow
            label="Cover and cover lifter operation explained"
            checked={checklist.customerHandoff.coverLifterExplained}
            onChange={(v) =>
              update("customerHandoff", {
                ...checklist.customerHandoff,
                coverLifterExplained: v,
              })
            }
          />
          <CheckRow
            label="Customer knows how to reach The Spa Haus for support"
            checked={checklist.customerHandoff.knowsHowToReachSupport}
            onChange={(v) =>
              update("customerHandoff", {
                ...checklist.customerHandoff,
                knowsHowToReachSupport: v,
              })
            }
          />
          <CheckRow
            label="Accessory packaging broken down, stacked for customer disposal"
            checked={checklist.customerHandoff.packagingBrokenDown}
            onChange={(v) =>
              update("customerHandoff", {
                ...checklist.customerHandoff,
                packagingBrokenDown: v,
              })
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Issues &amp; Follow-Up
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="issuesNotes">
              Error codes / symptoms / missing items / damage / follow-up needed
            </Label>
            <Textarea
              id="issuesNotes"
              name="issuesNotes"
              defaultValue={defaults.issuesNotes ?? ""}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              name="photosTaken"
              defaultChecked={!!defaults.photosTaken}
            />
            Photos taken
          </label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                name="followUpWarranty"
                defaultChecked={defaults.followUpWarranty}
              />
              Warranty
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                name="followUpService"
                defaultChecked={defaults.followUpService}
              />
              Service
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                name="followUpParts"
                defaultChecked={defaults.followUpParts}
              />
              Parts
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Sign-Off
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              name="installerSigned"
              defaultChecked={!!defaults.installerSignedAt}
            />
            After-Sales Manager confirms installation complete
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              name="customerSigned"
              defaultChecked={!!defaults.customerSignedAt}
            />
            Customer confirms satisfaction with installation visit
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Startup Call
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              name="startupCallDone"
              defaultChecked={!!defaults.startupCallAt}
            />
            Startup call completed with Matt
          </label>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="startupCallNotes">Startup call notes</Label>
            <Textarea
              id="startupCallNotes"
              name="startupCallNotes"
              defaultValue={defaults.startupCallNotes ?? ""}
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-fit" disabled={isPending}>
        {isPending ? "Saving..." : "Save Checklist"}
      </Button>
    </form>
  );
}
