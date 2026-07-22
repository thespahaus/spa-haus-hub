export const INSTALLATION_STAGES = [
  "ORDERED",
  "SHIPPED",
  "RECEIVED_AT_SHOP",
  "READY_FOR_DELIVERY",
  "DELIVERED",
  "INSTALL_VISIT",
  "STARTUP_CALL",
  "COMPLETE",
] as const;

export const INSTALLATION_STAGE_LABELS: Record<
  (typeof INSTALLATION_STAGES)[number],
  string
> = {
  ORDERED: "Ordered / In Production",
  SHIPPED: "Shipped",
  RECEIVED_AT_SHOP: "Received at Shop",
  READY_FOR_DELIVERY: "Ready for Delivery",
  DELIVERED: "Delivered",
  INSTALL_VISIT: "After-Sales Install Visit",
  STARTUP_CALL: "Startup Call",
  COMPLETE: "Complete",
};

export const DELIVERY_METHODS = ["SPA_HAUS_TEAM", "HOT_TUB_TAXI"] as const;

export const DELIVERY_METHOD_LABELS: Record<
  (typeof DELIVERY_METHODS)[number],
  string
> = {
  SPA_HAUS_TEAM: "Spa Haus Team (Matt, Mark, Dan)",
  HOT_TUB_TAXI: "Hot Tub Taxi (Darius)",
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
