import type { RequestFull } from "@caido/sdk-frontend";
import { isResponseInput } from "shared";
import { onMounted, ref, watch } from "vue";

import { usePanesStore } from "@/stores/panes";
import type { FrontendSDK } from "@/types";

type SDKWithWorkflows = FrontendSDK & {
  workflows: {
    run: (workflowId: string, input: string) => Promise<string>;
  };
};

type Response = {
  getBody?: () => { toText?: () => string } | undefined;
  getRaw?: () => { toText?: () => string };
  getHeaders?: () => Record<string, string[]>;
  getId?: () => string;
};

type ViewModeState = {
  output: string;
  loading: boolean;
  error: string;
};

function extractResponseInput(
  response: unknown,
  inputType: "response.body" | "response.headers" | "response.raw",
): string {
  const resp = response as Response;

  try {
    switch (inputType) {
      case "response.body":
        return resp.getBody?.()?.toText?.() ?? "";
      case "response.headers": {
        const headers = resp.getHeaders?.();
        return headers ? JSON.stringify(headers, null, 2) : "";
      }
      case "response.raw":
        return resp.getRaw?.()?.toText?.() ?? "";
      default:
        return "";
    }
  } catch (e) {
    return `Error extracting ${inputType}: ${e instanceof Error ? e.message : String(e)}`;
  }
}

export const useViewMode = (
  paneId: string,
  sdk: FrontendSDK,
  request: RequestFull | undefined,
  response?: unknown,
) => {
  const store = usePanesStore();

  const state = ref<ViewModeState>({
    output: "",
    loading: true,
    error: "",
  });

  const execute = async () => {
    state.value.loading = true;
    state.value.error = "";
    state.value.output = "";

    const pane = store.getPaneById(paneId);
    if (pane === undefined) {
      state.value.error = "Pane not found.";
      state.value.loading = false;
      return;
    }

    const isResponseOnly =
      isResponseInput(pane.input) && pane.input !== "request-response";

    if (isResponseOnly && response !== undefined) {
      const input = extractResponseInput(
        response,
        pane.input as "response.body" | "response.headers" | "response.raw",
      );

      if (input === "") {
        state.value.error = "No response data available.";
        state.value.loading = false;
        return;
      }

      if (pane.httpql !== undefined && pane.httpql.trim() !== "") {
        // HTTPQL filtering requires requestId which is not available in response-only view modes
      }

      if (pane.transformation.type === "command") {
        state.value.error =
          "Shell commands are not supported. Please use a Convert workflow.";
        state.value.loading = false;
        return;
      }

      try {
        const workflowResult = await (
          sdk as unknown as SDKWithWorkflows
        ).workflows.run(pane.transformation.workflowId, input);
        state.value.output = workflowResult;
      } catch (e) {
        state.value.error = `Workflow error: ${e instanceof Error ? e.message : String(e)}`;
      }

      state.value.loading = false;
      return;
    }

    let requestId: string | undefined;
    if (request?.id !== undefined) {
      requestId = request.id;
    } else if (response !== undefined) {
      requestId =
        (response as unknown as { requestId?: string })?.requestId ??
        (response as unknown as { request?: { id?: string } })?.request?.id;
    }

    if (requestId === undefined) {
      if (pane.input === "request-response") {
        state.value.error =
          "Request-response input requires request context. Use a request view mode instead.";
      } else {
        state.value.error = "Request ID not available.";
      }
      state.value.loading = false;
      return;
    }

    const result = await sdk.backend.getPaneInputData(paneId, requestId);

    if (result.kind === "Error") {
      state.value.error = result.error;
      state.value.loading = false;
      return;
    }

    const { input, transformation } = result.value;

    if (transformation.type === "command") {
      state.value.error =
        "Shell commands are not supported. Please use a Convert workflow.";
      state.value.loading = false;
      return;
    }

    try {
      const workflowResult = await (
        sdk as unknown as SDKWithWorkflows
      ).workflows.run(transformation.workflowId, input);
      state.value.output = workflowResult;
    } catch (e) {
      state.value.error = `Workflow error: ${e instanceof Error ? e.message : String(e)}`;
    }

    state.value.loading = false;
  };

  onMounted(() => {
    execute();
  });

  watch(
    () => {
      const pane = store.getPaneById(paneId);
      if (
        pane &&
        isResponseInput(pane.input) &&
        pane.input !== "request-response"
      ) {
        return (response as Response)?.getId?.() ?? "";
      }
      return request?.id ?? "";
    },
    () => {
      execute();
    },
  );

  return {
    state,
    pane: store.getPaneById(paneId),
    execute,
  };
};
