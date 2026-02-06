import { platform } from "os";

import type { Result, ShellDefaults } from "shared";
import { getDefaultShell, getDefaultShellConfig, ok } from "shared";

import type { BackendSDK } from "../types";

export function getPlatform(_sdk: BackendSDK): Result<string> {
  return ok(platform());
}

export function getShellDefaults(_sdk: BackendSDK): Result<ShellDefaults> {
  return ok({
    shell: getDefaultShell(),
    shellConfig: getDefaultShellConfig(),
  });
}
