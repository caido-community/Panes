import { readFile, writeFile } from "fs/promises";
import path from "path";

import type {
  CreatePaneInput,
  Pane,
  PanesConfig,
  PaneScope,
  UpdatePaneInput,
} from "shared";
import { getAllTemplates } from "shared";

import { requireSDK } from "../sdk";
import { generateId } from "../utils";

function createPane(
  data: CreatePaneInput & { templateId?: string; scope?: PaneScope },
): Pane {
  const now = Date.now();
  return {
    ...data,
    scope: data.scope ?? "project",
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
}

class CombinedPanesStore {
  private globalData: PanesConfig = { version: 1, panes: [] };
  private projectData: PanesConfig = { version: 1, panes: [] };
  private currentProjectId: string | undefined;
  private subscribers = new Set<(panes: Pane[]) => void>();
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    const sdk = requireSDK();
    const project = await sdk.projects.getCurrent();
    this.currentProjectId = project?.getId();

    await this.loadGlobalPanes();
    await this.loadProjectPanes();

    this.initialized = true;
  }

  async switchProject(projectId: string | undefined): Promise<void> {
    this.currentProjectId = projectId;
    this.projectData = { version: 1, panes: [] };
    await this.loadProjectPanes();
    this.notify();
  }

  private getGlobalFilePath(): string {
    const sdk = requireSDK();
    return path.join(sdk.meta.path(), "panes-global.json");
  }

  private getProjectFilePath(): string {
    const sdk = requireSDK();
    if (this.currentProjectId === undefined) {
      return path.join(sdk.meta.path(), "panes-project.json");
    }
    return path.join(
      sdk.meta.path(),
      `panes-project-${this.currentProjectId}.json`,
    );
  }

  private async loadGlobalPanes(): Promise<void> {
    const filePath = this.getGlobalFilePath();
    try {
      const fileData = await readFile(filePath, "utf-8");
      const parsed = JSON.parse(fileData);
      // Validate structure
      if (
        typeof parsed !== "object" ||
        parsed === null ||
        !Array.isArray(parsed.panes)
      ) {
        throw new Error("Invalid panes file structure");
      }
      this.globalData = parsed;
      // Ensure all global panes have scope set
      for (const pane of this.globalData.panes) {
        pane.scope = "global";
      }
    } catch (err) {
      // Log error for debugging but continue with default data
      console.warn(
        `Failed to load global panes from ${filePath}:`,
        err instanceof Error ? err.message : String(err),
      );
      this.globalData = { version: 1, panes: [] };
      await this.saveGlobalPanes();
    }
  }

  private async loadProjectPanes(): Promise<void> {
    const filePath = this.getProjectFilePath();
    try {
      const fileData = await readFile(filePath, "utf-8");
      const parsed = JSON.parse(fileData);
      if (
        typeof parsed !== "object" ||
        parsed === null ||
        !Array.isArray(parsed.panes)
      ) {
        throw new Error("Invalid panes file structure");
      }
      this.projectData = parsed;
      // Ensure all project panes have scope set
      for (const pane of this.projectData.panes) {
        pane.scope = "project";
      }
    } catch (err) {
      // Log error for debugging but continue with default data
      console.warn(
        `Failed to load project panes from ${filePath}:`,
        err instanceof Error ? err.message : String(err),
      );
      this.projectData = { version: 1, panes: [] };
      await this.saveProjectPanes();
    }
  }

  private async saveGlobalPanes(): Promise<void> {
    const filePath = this.getGlobalFilePath();
    const { mkdir } = await import("fs/promises");
    const dir = path.dirname(filePath);
    try {
      await mkdir(dir, { recursive: true });
    } catch {
      // Directory might already exist, ignore
    }
    await writeFile(filePath, JSON.stringify(this.globalData, null, 2));
  }

  private async saveProjectPanes(): Promise<void> {
    const filePath = this.getProjectFilePath();
    const { mkdir } = await import("fs/promises");
    const dir = path.dirname(filePath);
    try {
      await mkdir(dir, { recursive: true });
    } catch {
      // Directory might already exist, ignore
    }
    await writeFile(filePath, JSON.stringify(this.projectData, null, 2));
  }

  async ensureTemplatesInstalled(): Promise<void> {
    if (this.globalData.templatesSeeded === true) {
      return;
    }

    const templates = getAllTemplates();
    for (const template of templates) {
      const { templateId, ...paneData } = template;
      const pane = createPane({
        ...paneData,
        templateId,
        scope: "global",
      });
      this.globalData.panes.push(pane);
    }

    this.globalData.templatesSeeded = true;
    this.notify();
    await this.saveGlobalPanes();
  }

  getPanes(): Pane[] {
    return [...this.globalData.panes, ...this.projectData.panes];
  }

  getGlobalPanes(): Pane[] {
    return this.globalData.panes;
  }

  getProjectPanes(): Pane[] {
    return this.projectData.panes;
  }

  getPane(id: string): Pane | undefined {
    return (
      this.globalData.panes.find((p) => p.id === id) ??
      this.projectData.panes.find((p) => p.id === id)
    );
  }

  getEnabledPanes(): Pane[] {
    return this.getPanes().filter((p) => p.enabled);
  }

  getTemplatePanes(): Pane[] {
    return this.globalData.panes.filter((p) => p.templateId !== undefined);
  }

  getCustomPanes(): Pane[] {
    return this.getPanes().filter((p) => p.templateId === undefined);
  }

  installTemplate(templateId: string): Pane | undefined {
    const templates = getAllTemplates();
    const template = templates.find((t) => t.templateId === templateId);
    if (template === undefined) return undefined;

    const existing = this.globalData.panes.find(
      (p) => p.templateId === templateId,
    );
    if (existing !== undefined) return existing;

    const { templateId: tid, ...paneData } = template;
    const pane = createPane({
      ...paneData,
      templateId: tid,
      scope: "global",
    });
    this.globalData.panes.push(pane);
    this.notify();
    this.saveGlobalPanes();

    const sdk = requireSDK();
    sdk.api.send("pane:created", pane);

    return pane;
  }

  createPane(data: CreatePaneInput): Pane {
    const scope = data.scope ?? "project";
    const pane = createPane({ ...data, scope });

    if (scope === "global") {
      this.globalData.panes.push(pane);
      this.saveGlobalPanes();
    } else {
      this.projectData.panes.push(pane);
      this.saveProjectPanes();
    }

    this.notify();

    const sdk = requireSDK();
    sdk.api.send("pane:created", pane);

    return pane;
  }

  updatePane(id: string, updates: UpdatePaneInput): Pane | undefined {
    // Check global panes first
    let index = this.globalData.panes.findIndex((p) => p.id === id);
    const isGlobal = index !== -1;

    if (!isGlobal) {
      index = this.projectData.panes.findIndex((p) => p.id === id);
      if (index === -1) return undefined;
    }

    const panes = isGlobal ? this.globalData.panes : this.projectData.panes;
    const existing = panes[index];
    if (existing === undefined) return undefined;

    // Check if scope is changing
    const newScope = updates.scope ?? existing.scope;
    const scopeChanging = newScope !== existing.scope;

    if (scopeChanging) {
      // Remove from current location
      panes.splice(index, 1);

      // Create updated pane
      const updated: Pane = {
        ...existing,
        ...updates,
        id: existing.id,
        scope: newScope,
        createdAt: existing.createdAt,
        updatedAt: Date.now(),
      };

      // Add to new location
      if (newScope === "global") {
        this.globalData.panes.push(updated);
        this.saveGlobalPanes();
        this.saveProjectPanes();
      } else {
        this.projectData.panes.push(updated);
        this.saveProjectPanes();
        this.saveGlobalPanes();
      }

      this.notify();

      const sdk = requireSDK();
      sdk.api.send("pane:updated", updated);

      return updated;
    }

    // No scope change, update in place
    const updated: Pane = {
      ...existing,
      ...updates,
      id: existing.id,
      scope: existing.scope,
      createdAt: existing.createdAt,
      updatedAt: Date.now(),
    };

    panes[index] = updated;
    this.notify();

    if (isGlobal) {
      this.saveGlobalPanes();
    } else {
      this.saveProjectPanes();
    }

    const sdk = requireSDK();
    sdk.api.send("pane:updated", updated);

    return updated;
  }

  deletePane(id: string): boolean {
    // Check global panes first
    let index = this.globalData.panes.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.globalData.panes.splice(index, 1);
      this.notify();
      this.saveGlobalPanes();

      const sdk = requireSDK();
      sdk.api.send("pane:deleted", id);
      return true;
    }

    // Check project panes
    index = this.projectData.panes.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.projectData.panes.splice(index, 1);
      this.notify();
      this.saveProjectPanes();

      const sdk = requireSDK();
      sdk.api.send("pane:deleted", id);
      return true;
    }

    return false;
  }

  togglePane(id: string, enabled: boolean): Pane | undefined {
    const pane = this.updatePane(id, { enabled });
    if (pane !== undefined) {
      const sdk = requireSDK();
      sdk.api.send("pane:toggled", id, enabled);
    }
    return pane;
  }

  subscribe(subscriber: (panes: Pane[]) => void): () => void {
    this.subscribers.add(subscriber);
    return () => this.subscribers.delete(subscriber);
  }

  private notify(): void {
    const allPanes = this.getPanes();
    for (const subscriber of this.subscribers) {
      subscriber(allPanes);
    }
  }
}

export const panesStore = new CombinedPanesStore();
