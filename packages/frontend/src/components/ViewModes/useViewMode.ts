import type { RequestFull } from "@caido/sdk-frontend";
import { onMounted, ref, watch } from "vue";

import { usePanesStore } from "@/stores/panes";
import type { FrontendSDK } from "@/types";

type SDKWithWorkflows = FrontendSDK & {
  workflows: {
    run: (workflowId: string, input: string) => Promise<string>;
  };
};

export type ViewModeState = {
  output: string;
  loading: boolean;
  error: string;
};

export { type RequestFull };

export const useViewMode = (
  paneId: string,
  sdk: FrontendSDK,
  request: RequestFull | undefined,
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

    if (request === undefined) {
      state.value.error = "No request available.";
      state.value.loading = false;
      return;
    }

    const requestId = request.id;
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
    () => request?.id,
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
