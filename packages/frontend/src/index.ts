import { Classic } from "@caido/primevue";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import { createApp } from "vue";

import { SDKPlugin } from "./plugins/sdk";
import "./styles/index.css";
import type { FrontendSDK } from "./types";
import App from "./views/App.vue";

export const init = (sdk: FrontendSDK) => {
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
};
