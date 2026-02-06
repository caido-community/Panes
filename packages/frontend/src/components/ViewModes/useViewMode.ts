import type { RequestFull, ResponseFull } from "@caido/sdk-frontend";
import type { Pane } from "shared";
import { isResponseInput } from "shared";
import { computed, onMounted, ref, toValue, watch } from "vue";

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

export const useViewMode = (options: UseViewModeOptions) => {
  const store = usePanesStore();
  const state = ref<ViewModeState>({ type: "Loading" });

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

    devLog(pane, "Execution started", {
      input: pane.input,
      transformationType: pane.transformation.type,
    });

    if (isResponseOnly) {
      const response = toValue(options.response);
      if (response === undefined) {
        state.value = { type: "Failed", error: "Response not available." };
        return;
      }

      const cachedOutput = getCachedResult(paneIdValue, response.id);
      if (cachedOutput !== undefined) {
        state.value = { type: "Success", output: cachedOutput };
        return;
      }

      const input = extractResponseInput(
        response,
        pane.input as "response.body" | "response.headers" | "response.raw",
      );

      devLog(pane, `Input extracted (${input.length} bytes)`);

      if (input === "") {
        state.value = { type: "Failed", error: "No response data available." };
        return;
      }

      if (pane.transformation.type === "command") {
        devLog(pane, "Command execution started", {
          command: pane.transformation.command,
        });
        const commandResult = await sdk.backend.runCommand(
          pane.transformation.command,
          input,
          pane.transformation.timeout ?? 30,
          response.id,
          pane.transformation.shell ?? "",
          pane.transformation.shellConfig ?? "",
        );

        if (commandResult.kind === "Error") {
          devLog(pane, "Command execution failed", {
            error: commandResult.error,
          });
          state.value = { type: "Failed", error: commandResult.error };
          return;
        }

        devLog(
          pane,
          `Command execution success (${commandResult.value.length} bytes output)`,
        );

        setCachedResult(paneIdValue, response.id, commandResult.value);
        state.value = { type: "Success", output: commandResult.value };
        return;
      }

      devLog(pane, "Workflow execution started", {
        workflowId: pane.transformation.workflowId,
      });
      const result = await sdk.backend.runWorkflow(
        pane.transformation.workflowId,
        input,
      );

      if (result.kind === "Error") {
        devLog(pane, "Workflow execution failed", { error: result.error });
        state.value = { type: "Failed", error: result.error };
        return;
      }

      devLog(
        pane,
        `Workflow execution success (${result.value.length} bytes output)`,
      );

      setCachedResult(paneIdValue, response.id, result.value);
      state.value = { type: "Success", output: result.value };
      return;
    }

    const request = toValue(options.request);
    if (request === undefined) {
      state.value = { type: "Failed", error: "Request not available." };
      return;
    }

    const cachedOutput = getCachedResult(paneIdValue, request.id);
    if (cachedOutput !== undefined) {
      state.value = { type: "Success", output: cachedOutput };
      return;
    }

    const result = await sdk.backend.getPaneInputData(paneIdValue, request.id);

    if (result.kind === "Error") {
      state.value = { type: "Failed", error: result.error };
      return;
    }

    const { input, transformation } = result.value;

    devLog(pane, `Input extracted (${input.length} bytes)`);

    if (transformation.type === "command") {
      const paneForCommand = store.getPaneById(paneIdValue);
      const timeout =
        paneForCommand?.transformation.type === "command"
          ? (paneForCommand.transformation.timeout ?? 30)
          : 30;
      const shell =
        paneForCommand?.transformation.type === "command"
          ? (paneForCommand.transformation.shell ?? "")
          : "";
      const shellConfig =
        paneForCommand?.transformation.type === "command"
          ? (paneForCommand.transformation.shellConfig ?? "")
          : "";

      devLog(pane, "Command execution started", {
        command: transformation.command,
      });

      const commandResult = await sdk.backend.runCommand(
        transformation.command,
        input,
        timeout,
        request.id,
        shell,
        shellConfig,
      );

      if (commandResult.kind === "Error") {
        devLog(pane, "Command execution failed", {
          error: commandResult.error,
        });
        state.value = { type: "Failed", error: commandResult.error };
        return;
      }

      devLog(
        pane,
        `Command execution success (${commandResult.value.length} bytes output)`,
      );

      setCachedResult(paneIdValue, request.id, commandResult.value);
      state.value = { type: "Success", output: commandResult.value };
      return;
    }

    devLog(pane, "Workflow execution started", {
      workflowId: transformation.workflowId,
    });

    const workflowResult = await sdk.backend.runWorkflow(
      transformation.workflowId,
      input,
    );

    if (workflowResult.kind === "Error") {
      devLog(pane, "Workflow execution failed", {
        error: workflowResult.error,
      });
      state.value = { type: "Failed", error: workflowResult.error };
      return;
    }

    devLog(
      pane,
      `Workflow execution success (${workflowResult.value.length} bytes output)`,
    );

    setCachedResult(paneIdValue, request.id, workflowResult.value);
    state.value = { type: "Success", output: workflowResult.value };
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
