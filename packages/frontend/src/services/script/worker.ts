const ctx = globalThis as unknown as {
  onmessage: (event: {
    data: { script: string; context: Record<string, unknown> };
  }) => void;
  postMessage: (message: unknown) => void;
};

const AsyncFunction = Object.getPrototypeOf(async () => {
  await Promise.resolve();
}).constructor as new (
  ...args: string[]
) => (...args: unknown[]) => Promise<unknown>;

ctx.onmessage = async (event) => {
  const { script, context } = event.data;
  try {
    const names = Object.keys(context);
    const values = names.map((name) => context[name]);
    const fn = new AsyncFunction(...names, script);
    const output = await fn(...values);

    if (typeof output === "string") {
      ctx.postMessage({ ok: true, value: output });
      return;
    }
    if (output === undefined || output === null) {
      ctx.postMessage({ ok: false, error: "Script did not return a value" });
      return;
    }

    const serialized = JSON.stringify(output, undefined, 2);
    if (serialized === undefined) {
      ctx.postMessage({
        ok: false,
        error: "Script must return a string or serializable value",
      });
      return;
    }
    ctx.postMessage({ ok: true, value: serialized });
  } catch (e) {
    ctx.postMessage({
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    });
  }
};
