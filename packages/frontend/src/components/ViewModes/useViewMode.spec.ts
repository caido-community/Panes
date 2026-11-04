import type { RequestFull } from "@caido/sdk-frontend";
import type { Pane, Result } from "shared";
import { ok } from "shared";
import { describe, expect, it, vi } from "vitest";
import type * as Vue from "vue";
import { effectScope, nextTick, ref } from "vue";

import { useViewMode } from "./useViewMode";

import type { FrontendSDK } from "@/types";

const pane: Pane = {
  id: "pane-1",
  name: "Raw",
  tabName: "Raw",
  enabled: true,
  scope: "global",
  input: "request.raw",
  locations: ["http-history"],
  transformation: { type: "command", command: "cat" },
  createdAt: 0,
  updatedAt: 0,
};

vi.mock("@/stores/panes", () => ({
  usePanesStore: () => ({ getPaneById: () => pane }),
}));

vi.mock("@/services/script", () => ({
  runScript: vi.fn(),
}));

vi.mock("vue", async (importOriginal) => ({
  ...(await importOriginal<typeof Vue>()),
  onMounted: (hook: () => void) => hook(),
}));

const createDeferred = () => {
  let resolve: (value: Result<string>) => void = () => {};
  const promise = new Promise<Result<string>>((r) => {
    resolve = r;
  });
  return { promise, resolve };
};

describe("useViewMode", () => {
  it("keeps the latest request output when an earlier run finishes last", async () => {
    const runs = new Map([
      ["request-a", createDeferred()],
      ["request-b", createDeferred()],
    ]);
    const sdk = {
      backend: {
        getPaneInputData: (_paneId: string, requestId: string) =>
          Promise.resolve(ok({ input: requestId })),
        runCommand: (
          _command: string,
          _input: string,
          _timeout: number,
          requestId: string,
        ) => runs.get(requestId)?.promise,
      },
    } as unknown as FrontendSDK;
    const request = ref({ id: "request-a" } as RequestFull);

    const scope = effectScope();
    const viewMode = scope.run(() =>
      useViewMode({
        paneId: () => pane.id,
        sdk: () => sdk,
        request: () => request.value,
      }),
    );
    if (viewMode === undefined) throw new Error("useViewMode did not run");

    request.value = { id: "request-b" } as RequestFull;
    await nextTick();

    runs.get("request-b")?.resolve(ok("output-b"));
    await vi.waitFor(() =>
      expect(viewMode.state.value).toEqual({
        type: "Success",
        output: "output-b",
      }),
    );

    runs.get("request-a")?.resolve(ok("output-a"));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(viewMode.state.value).toEqual({
      type: "Success",
      output: "output-b",
    });
    scope.stop();
  });
});
