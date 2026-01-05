import { Classic } from "@caido/primevue";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import { createApp } from "vue";

import { SDKPlugin } from "./plugins/sdk";
import { registerViewModes } from "./services/viewModes";
import "./styles/index.css";
import type { FrontendSDK } from "./types";
import App from "./views/App.vue";

export const init = async (sdk: FrontendSDK) => {
  const app = createApp(App);
  const pinia = createPinia();

  app.use(pinia);
  app.use(PrimeVue, {
    unstyled: true,
    pt: Classic,
  });
  app.use(SDKPlugin, sdk);

  const root = document.createElement("div");
  Object.assign(root.style, {
    height: "100%",
    width: "100%",
  });
  root.id = `plugin--panes`;
  app.mount(root);

  sdk.navigation.addPage("/panes", {
    body: root,
  });

  sdk.sidebar.registerItem("Panes", "/panes", {
    icon: "fas fa-window-restore",
  });

  const result = await sdk.backend.getPanes();
  if (result.kind === "Success") {
    registerViewModes(sdk, result.value);
  }

  const restorePath = localStorage.getItem("panes-restore-path");
  if (restorePath !== null) {
    localStorage.removeItem("panes-restore-path");
    window.location.hash = restorePath;
  }
};
