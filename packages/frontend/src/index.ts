import { Classic } from "@caido/primevue";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import { createApp } from "vue";

import { SDKPlugin } from "./plugins/sdk";
import "./styles/index.css";
import type { FrontendSDK } from "./types";
import App from "./views/App.vue";

// This is the entry point for the frontend plugin
export const init = (sdk: FrontendSDK) => {
  const app = createApp(App);
  const pinia = createPinia();

  // Use Pinia for state management
  app.use(pinia);

  // Load the PrimeVue component library
  app.use(PrimeVue, {
    unstyled: true,
    pt: Classic,
  });

  // Provide the FrontendSDK
  app.use(SDKPlugin, sdk);

  // Create the root element for the app
  const root = document.createElement("div");
  Object.assign(root.style, {
    height: "100%",
    width: "100%",
  });

  // Set the ID of the root element to match the prefixWrap plugin in caido.config.ts
  root.id = `plugin--panes`;

  // Mount the app to the root element
  app.mount(root);

  // Add the page to the navigation
  sdk.navigation.addPage("/panes", {
    body: root,
  });

  // Add a sidebar item
  sdk.sidebar.registerItem("Panes", "/panes", {
    icon: "fas fa-window-restore",
  });
};
