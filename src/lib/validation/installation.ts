export const INSTALLATION_STAGES = [
  "ORDER_PRODUCTION",
  "SITE_PREP",
  "ELECTRICAL_PREP",
  "DELIVERY",
  "FILL_POWER_ON",
  "INSTALL_VISIT",
  "STARTUP_CALL",
] as const;

export const INSTALLATION_STAGE_LABELS: Record<
  (typeof INSTALLATION_STAGES)[number],
  string
> = {
  ORDER_PRODUCTION: "Order & Production",
  SITE_PREP: "Site Prep",
  ELECTRICAL_PREP: "Electrical Prep",
  DELIVERY: "Delivery",
  FILL_POWER_ON: "Fill & Power On",
  INSTALL_VISIT: "After-Sales Install Visit",
  STARTUP_CALL: "Startup Call",
};

export interface InstallationChecklist {
  steps: { installed: boolean; secure: boolean };
  cover: { fits: boolean; skirtAttached: boolean };
  coverLifter: { assembled: boolean; functions: boolean };
  coverClips: { installed: boolean; brownEnvelopeScrewsInstalled: boolean };
  otherAccessories: { installed: boolean };
  initialStartup: {
    powerOn: boolean;
    noErrorCodes: boolean;
    circulationRunning: boolean;
    filtersInstalled: boolean;
  };
  topsideControls: { functioning: boolean };
  jetPumps: { label: string; status: "pass" | "fail" | "na" }[];
  jetsValvesFeatures: { functioning: boolean };
  waterfalls: { functioning: boolean };
  lightsEntertainment: { lightsFunctioning: boolean; audioPaired: boolean };
  leakVisualInspection: { noLeaks: boolean; visualOk: boolean };
  customerHandoff: {
    basicOperationDemonstrated: boolean;
    coverLifterExplained: boolean;
    knowsHowToReachSupport: boolean;
    packagingBrokenDown: boolean;
  };
}

export const EMPTY_CHECKLIST: InstallationChecklist = {
  steps: { installed: false, secure: false },
  cover: { fits: false, skirtAttached: false },
  coverLifter: { assembled: false, functions: false },
  coverClips: { installed: false, brownEnvelopeScrewsInstalled: false },
  otherAccessories: { installed: false },
  initialStartup: {
    powerOn: false,
    noErrorCodes: false,
    circulationRunning: false,
    filtersInstalled: false,
  },
  topsideControls: { functioning: false },
  jetPumps: [1, 2, 3, 4, 5, 6].map((n) => ({
    label: `Pump ${n}`,
    status: "na" as const,
  })),
  jetsValvesFeatures: { functioning: false },
  waterfalls: { functioning: false },
  lightsEntertainment: { lightsFunctioning: false, audioPaired: false },
  leakVisualInspection: { noLeaks: false, visualOk: false },
  customerHandoff: {
    basicOperationDemonstrated: false,
    coverLifterExplained: false,
    knowsHowToReachSupport: false,
    packagingBrokenDown: false,
  },
};
