import { error, ok, type Result, type ScriptContext } from "shared";

import InlineWorker from "./worker?worker&inline";

type WorkerResponse =
  | { ok: true; value: string }
  | { ok: false; error: string };

export function runScript(
  context: ScriptContext,
  script: string,
  timeoutMs: number,
): Promise<Result<string>> {
  return new Promise((resolve) => {
    const worker = new InlineWorker();

    let settled = false;
    const finish = (result: Result<string>) => {
      if (settled) return;
      settled = true;
      worker.terminate();
      resolve(result);
    };

    const timer = setTimeout(
      () => finish(error(`Script timed out after ${timeoutMs}ms`)),
      timeoutMs,
    );

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      clearTimeout(timer);
      const data = event.data;
      finish(data.ok ? ok(data.value) : error(data.error));
    };
    worker.onerror = (event) => {
      clearTimeout(timer);
      finish(
        error(event.message !== "" ? event.message : "Script worker error"),
      );
    };

    worker.postMessage({ script, context });
  });
}
