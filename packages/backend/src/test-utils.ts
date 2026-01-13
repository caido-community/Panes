import { vi } from "vitest";

import { setSDK } from "./sdk";
import type { BackendSDK } from "./types";

function createMockSDK(): BackendSDK {
  return {
    api: {
      register: vi.fn(),
      send: vi.fn(),
    },
    events: {
      onProjectChange: vi.fn(),
    },
    meta: {
      path: () => "/tmp/test-panes",
    },
    projects: {
      getCurrent: vi.fn().mockResolvedValue({
        getId: () => "test-project-id",
      }),
    },
    requests: {
      get: vi.fn(),
      matches: vi.fn().mockReturnValue(true),
    },
  } as unknown as BackendSDK;
}

export function setupMockSDK(): BackendSDK {
  const mockSDK = createMockSDK();
  setSDK(mockSDK);
  return mockSDK;
}
