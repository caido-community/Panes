import type { RequestFull, ResponseFull } from "@caido/sdk-frontend";
import type { Pane, Result } from "shared";
import { error, isResponseInput } from "shared";
import { computed, onMounted, ref, toValue, watch } from "vue";

import { runScript } from "@/services/script";
import { usePanesStore } from "@/stores/panes";
import type { FrontendSDK } from "@/types";

function devLog(pane: Pane, message: string, data?: unknown): void {
  if (pane.devMode !== true) return;
  const prefix = `%c[Pane: ${pane.name}]`;
  const style = "color: #22d3ee; font-weight: bold";
  if (data !== undefined) {
    console.log(prefix, style, message, data);
  } else {
    console.log(prefix, style, message);
  }
}

type ViewModeState =
  | { type: "Loading" }
  | { type: "Success"; output: string }
  | { type: "Failed"; error: string };

type UseViewModeOptions = {
  paneId: () => string | undefined;
  sdk: () => FrontendSDK;
  request?: () => RequestFull | undefined;
  response?: () => ResponseFull | undefined;
};

const resultCache = new Map<string, { output: string; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getCacheKey(paneId: string, requestId: string): string {
  return `${paneId}:${requestId}`;
}

function getCachedResult(
  paneId: string,
  requestId: string,
): string | undefined {
  const key = getCacheKey(paneId, requestId);
  const cached = resultCache.get(key);

  if (cached === undefined) return undefined;

  if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
    resultCache.delete(key);
    return undefined;
  }

  return cached.output;
}

function setCachedResult(
  paneId: string,
  requestId: string,
  output: string,
): void {
  const key = getCacheKey(paneId, requestId);
  resultCache.set(key, { output, timestamp: Date.now() });

  if (resultCache.size > 1000) {
    const oldestKey = resultCache.keys().next().value;
    if (oldestKey !== undefined) {
      resultCache.delete(oldestKey);
    }
  }
}

function extractResponseInput(
  response: ResponseFull,
  inputType: "response.body" | "response.headers" | "response.raw",
): string {
  switch (inputType) {
    case "response.body": {
      const raw = response.raw;
      const bodyStart = raw.indexOf("\r\n\r\n");
      if (bodyStart === -1) return "";
      return raw.substring(bodyStart + 4);
    }
    case "response.headers": {
      const raw = response.raw;
      const headerEnd = raw.indexOf("\r\n\r\n");
      if (headerEnd === -1) return "";
      const headerLines = raw.substring(0, headerEnd).split("\r\n");
      const headers: Record<string, string[]> = {};
      for (let i = 1; i < headerLines.length; i++) {
        const line = headerLines[i];
        if (line === undefined) continue;
        const colonIndex = line.indexOf(":");
        if (colonIndex === -1) continue;
        const key = line.substring(0, colonIndex).trim().toLowerCase();
        const value = line.substring(colonIndex + 1).trim();
        if (headers[key] === undefined) {
          headers[key] = [];
        }
        headers[key].push(value);
      }
      return JSON.stringify(headers, null, 2);
    }
    case "response.raw":
      return response.raw;
    default:
      return "";
  }
}

async function runTransformation(
  sdk: FrontendSDK,
  pane: Pane,
  input: string,
  requestId: string,
): Promise<Result<string>> {
  const transformation = pane.transformation;
  if (transformation.type === "command") {
    return sdk.backend.runCommand(
      transformation.command,
      input,
      transformation.timeout ?? 30,
      requestId,
      transformation.shell ?? "",
      transformation.shellConfig ?? "",
    );
  }
  if (transformation.type === "workflow") {
    return sdk.backend.runWorkflow(transformation.workflowId, input);
  }
  return error("Unsupported transformation type");
}

export const useViewMode = (options: UseViewModeOptions) => {
  const store = usePanesStore();
  const state = ref<ViewModeState>({ type: "Loading" });

  const finish = (
    pane: Pane,
    paneId: string,
    requestId: string,
    result: Result<string>,
  ) => {
    if (result.kind === "Error") {
      devLog(pane, "Transformation failed", { error: result.error });
      state.value = { type: "Failed", error: result.error };
      return;
    }
    devLog(pane, `Transformation success (${result.value.length} bytes)`);
    setCachedResult(paneId, requestId, result.value);
    state.value = { type: "Success", output: result.value };
  };

  const execute = async () => {
    state.value = { type: "Loading" };

    const paneIdValue = toValue(options.paneId);
    if (paneIdValue === undefined) {
      state.value = { type: "Failed", error: "Pane ID not provided." };
      return;
    }

    const pane = store.getPaneById(paneIdValue);
    if (pane === undefined) {
      state.value = { type: "Failed", error: "Pane not found." };
      return;
    }

    const sdk = toValue(options.sdk);
    const isResponseOnly = isResponseInput(pane.input);
    const response = toValue(options.response);
    const request = toValue(options.request);
    const requestId = isResponseOnly ? response?.id : request?.id;

    if (requestId === undefined) {
      state.value = {
        type: "Failed",
        error: isResponseOnly
          ? "Response not available."
          : "Request not available.",
      };
      return;
    }

    const cached = getCachedResult(paneIdValue, requestId);
    if (cached !== undefined) {
      state.value = { type: "Success", output: cached };
      return;
    }

    devLog(pane, "Execution started", {
      input: pane.input,
      transformationType: pane.transformation.type,
    });

    if (pane.transformation.type === "script") {
      const contextResult = await sdk.backend.getScriptContext(
        paneIdValue,
        requestId,
      );
      if (contextResult.kind === "Error") {
        state.value = { type: "Failed", error: contextResult.error };
        return;
      }
      const result = await runScript(
        contextResult.value,
        pane.transformation.script,
        (pane.transformation.timeout ?? 30) * 1000,
      );
      finish(pane, paneIdValue, requestId, result);
      return;
    }

    let input: string | undefined;

    if (isResponseOnly && response !== undefined) {
      input = extractResponseInput(
        response,
        pane.input as "response.body" | "response.headers" | "response.raw",
      );
      if (input === "") {
        state.value = { type: "Failed", error: "No response data available." };
        return;
      }
    }

    if (!isResponseOnly) {
      const inputResult = await sdk.backend.getPaneInputData(
        paneIdValue,
        requestId,
      );
      if (inputResult.kind === "Error") {
        state.value = { type: "Failed", error: inputResult.error };
        return;
      }
      input = inputResult.value.input;
    }

    if (input === undefined) {
      state.value = { type: "Failed", error: "No input data available." };
      return;
    }

    devLog(pane, `Input extracted (${input.length} bytes)`);

    const result = await runTransformation(sdk, pane, input, requestId);
    finish(pane, paneIdValue, requestId, result);
  };

  onMounted(() => {
    execute();
  });

  watch(
    () => {
      const paneIdValue = toValue(options.paneId);
      if (paneIdValue === undefined) return "";
      const pane = store.getPaneById(paneIdValue);
      if (pane && isResponseInput(pane.input)) {
        const response = toValue(options.response);
        return response?.id ?? "";
      }
      const request = toValue(options.request);
      return request?.id ?? "";
    },
    () => {
      execute();
    },
  );

  return {
    state,
    pane: computed(() => {
      const paneIdValue = toValue(options.paneId);
      return paneIdValue !== undefined
        ? store.getPaneById(paneIdValue)
        : undefined;
    }),
    execute,
  };
};
