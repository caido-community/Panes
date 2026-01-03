import type { Pane, PanesConfig } from "shared";

import { requireSDK } from "../sdk";
import { generateId } from "../utils";

import { ProjectScopedStore } from "./project-store";

const DEFAULT_PANES: Omit<Pane, "id" | "createdAt" | "updatedAt">[] = [
  {
    name: "JQ JSON",
    tabName: "JQ",
    description: "Pretty-print JSON responses using jq",
    enabled: true,
    input: "response.body",
    httpql: 'resp.headers.cont:"application/json"',
    locations: ["http-history", "replay"],
    transformation: {
      type: "command",
      command: 'echo "{{input}}" | jq .',
      timeout: 10,
    },
  },
  {
    name: "Base64 Decode",
    tabName: "B64",
    description: "Decode base64 encoded content",
    enabled: false,
    input: "response.body",
    locations: ["http-history", "replay"],
    transformation: {
      type: "command",
      command: 'echo "{{input}}" | base64 -d',
      timeout: 5,
    },
  },
];

function createPane(data: Omit<Pane, "id" | "createdAt" | "updatedAt">): Pane {
  const now = Date.now();
  return {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
}

class PanesStore extends ProjectScopedStore<PanesConfig> {
  constructor() {
    super("panes");
  }

  protected getDefaultData(): PanesConfig {
    return {
      version: 1,
      panes: DEFAULT_PANES.map(createPane),
    };
  }

  getPanes(): Pane[] {
    return this.data.panes;
  }

  getPane(id: string): Pane | undefined {
    return this.data.panes.find((p) => p.id === id);
  }

  getEnabledPanes(): Pane[] {
    return this.data.panes.filter((p) => p.enabled);
  }

  createPane(data: Omit<Pane, "id" | "createdAt" | "updatedAt">): Pane {
    const pane = createPane(data);
    this.data.panes.push(pane);
    this.notify();
    this.saveToFile();

    const sdk = requireSDK();
    sdk.api.send("pane:created", pane);

    return pane;
  }

  updatePane(id: string, updates: Partial<Pane>): Pane | undefined {
    const index = this.data.panes.findIndex((p) => p.id === id);
    if (index === -1) return undefined;

    const existing = this.data.panes[index];
    if (existing === undefined) return undefined;

    const updated: Pane = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: Date.now(),
    };

    this.data.panes[index] = updated;
    this.notify();
    this.saveToFile();

    const sdk = requireSDK();
    sdk.api.send("pane:updated", updated);

    return updated;
  }

  deletePane(id: string): boolean {
    const index = this.data.panes.findIndex((p) => p.id === id);
    if (index === -1) return false;

    this.data.panes.splice(index, 1);
    this.notify();
    this.saveToFile();

    const sdk = requireSDK();
    sdk.api.send("pane:deleted", id);

    return true;
  }

  togglePane(id: string, enabled: boolean): Pane | undefined {
    const pane = this.updatePane(id, { enabled });
    if (pane !== undefined) {
      const sdk = requireSDK();
      sdk.api.send("pane:toggled", id, enabled);
    }
    return pane;
  }
}

export const panesStore = new PanesStore();
