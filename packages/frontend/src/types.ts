import type { Caido } from "@caido/sdk-frontend";
import type { API, BackendEvents } from "backend";

type ViewModeOptions = {
  label: string;
  view: {
    component: unknown;
    props?: Record<string, unknown>;
  };
};

type ResponseViewModeSDK = {
  addResponseViewMode: (opts: ViewModeOptions) => void;
};

export type FrontendSDK = Caido<API, BackendEvents> & {
  httpHistory: Caido<API, BackendEvents>["httpHistory"] & ResponseViewModeSDK;
  replay: Caido<API, BackendEvents>["replay"] & ResponseViewModeSDK;
  sitemap: Caido<API, BackendEvents>["sitemap"] & ResponseViewModeSDK;
  automate: Caido<API, BackendEvents>["automate"] & ResponseViewModeSDK;
  intercept: Caido<API, BackendEvents>["intercept"] & ResponseViewModeSDK;
  backend: Caido<API, BackendEvents>["backend"] & {
    runCommand: (
      command: string,
      input: string,
      timeout: number,
      requestId: string,
    ) => Promise<
      { kind: "Success"; value: string } | { kind: "Error"; error: string }
    >;
  };
};
