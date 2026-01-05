import type { Pane, PaneLocation } from "shared";
import { markRaw } from "vue";

import { RequestViewMode } from "@/components/ViewModes";
import type { FrontendSDK } from "@/types";

export function registerViewModes(sdk: FrontendSDK, panes: Pane[]) {
  const enabledPanes = panes.filter((p) => p.enabled);

  for (const pane of enabledPanes) {
    for (const location of pane.locations) {
      registerViewModeForLocation(sdk, pane, location);
    }
  }
}

function registerViewModeForLocation(
  sdk: FrontendSDK,
  pane: Pane,
  location: PaneLocation,
) {
  const viewModeOptions = {
    label: pane.tabName,
    view: {
      component: markRaw(RequestViewMode),
      props: { paneId: pane.id },
    },
  };

  switch (location) {
    case "http-history":
      sdk.httpHistory.addRequestViewMode(viewModeOptions);
      break;
    case "replay":
      sdk.replay.addRequestViewMode(viewModeOptions);
      break;
    case "sitemap":
      sdk.sitemap.addRequestViewMode(viewModeOptions);
      break;
    case "automate":
      sdk.automate.addRequestViewMode(viewModeOptions);
      break;
    case "intercept":
      sdk.intercept.addRequestViewMode(viewModeOptions);
      break;
  }
}
