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

type ResponseViewModeSDK = {
  addResponseViewMode: (opts: {
    label: string;
    view: { component: unknown; props?: Record<string, unknown> };
  }) => void;
};

function registerViewModeForLocation(
  sdk: FrontendSDK,
  pane: Pane,
  location: PaneLocation,
) {
  const isResponse = isResponseInput(pane.input);
  const component = isResponse
    ? markRaw(ResponseViewMode)
    : markRaw(RequestViewMode);

  const viewModeOptions = {
    label: pane.tabName,
    view: {
      component,
      props: { paneId: pane.id },
    },
  };

  switch (location) {
    case "http-history": {
      if (isResponse) {
        (sdk.httpHistory as unknown as ResponseViewModeSDK).addResponseViewMode(
          viewModeOptions,
        );
      } else {
        sdk.httpHistory.addRequestViewMode(viewModeOptions);
      }
      break;
    }
    case "replay": {
      if (isResponse) {
        (sdk.replay as unknown as ResponseViewModeSDK).addResponseViewMode(
          viewModeOptions,
        );
      } else {
        sdk.replay.addRequestViewMode(viewModeOptions);
      }
      break;
    }
    case "sitemap": {
      if (isResponse) {
        (sdk.sitemap as unknown as ResponseViewModeSDK).addResponseViewMode(
          viewModeOptions,
        );
      } else {
        sdk.sitemap.addRequestViewMode(viewModeOptions);
      }
      break;
    }
    case "automate": {
      if (isResponse) {
        (sdk.automate as unknown as ResponseViewModeSDK).addResponseViewMode(
          viewModeOptions,
        );
      } else {
        sdk.automate.addRequestViewMode(viewModeOptions);
      }
      break;
    }
    case "intercept": {
      if (isResponse) {
        (sdk.intercept as unknown as ResponseViewModeSDK).addResponseViewMode(
          viewModeOptions,
        );
      } else {
        sdk.intercept.addRequestViewMode(viewModeOptions);
      }
      break;
    }
  }
}
