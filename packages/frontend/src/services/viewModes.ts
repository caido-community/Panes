import type { Pane, PaneLocation } from "shared";
import { isResponseInput } from "shared";
import { markRaw } from "vue";

import { RequestViewMode, ResponseViewMode } from "@/components/ViewModes";
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
  const isResponse = isResponseInput(pane.input);

  const requestComponent = markRaw(RequestViewMode);
  const responseComponent = markRaw(ResponseViewMode);

  const requestViewModeOptions = {
    label: pane.tabName,
    view: {
      component: requestComponent,
      props: { paneId: pane.id },
    },
  };

  const responseViewModeOptions = {
    label: pane.tabName,
    view: {
      component: responseComponent,
      props: { paneId: pane.id },
    },
  };

  switch (location) {
    case "http-history": {
      if (isResponse) {
        sdk.httpHistory.addResponseViewMode(responseViewModeOptions);
      } else {
        sdk.httpHistory.addRequestViewMode(requestViewModeOptions);
      }
      break;
    }
    case "replay": {
      if (isResponse) {
        sdk.replay.addResponseViewMode(responseViewModeOptions);
      } else {
        sdk.replay.addRequestViewMode(requestViewModeOptions);
      }
      break;
    }
    case "sitemap": {
      if (isResponse) {
        sdk.sitemap.addResponseViewMode(responseViewModeOptions);
      } else {
        sdk.sitemap.addRequestViewMode(requestViewModeOptions);
      }
      break;
    }
    case "automate": {
      if (isResponse) {
        sdk.automate.addResponseViewMode(responseViewModeOptions);
      } else {
        sdk.automate.addRequestViewMode(requestViewModeOptions);
      }
      break;
    }
    case "intercept": {
      if (isResponse) {
        sdk.intercept.addResponseViewMode(responseViewModeOptions);
      } else {
        sdk.intercept.addRequestViewMode(requestViewModeOptions);
      }
      break;
    }
  }
}
