import type { SDK } from "caido:plugin";
import type { API, BackendEvents } from "./index";

export type BackendSDK = SDK<API, BackendEvents>;

