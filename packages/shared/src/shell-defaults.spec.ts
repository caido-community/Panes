import { describe, expect, it } from "vitest";

import {
  getDefaultShell,
  getDefaultShellConfig,
  getShellDefaults,
} from "./types";

describe("Shell defaults", () => {
  describe("getDefaultShell", () => {
    it("should return a shell path", () => {
      const shell = getDefaultShell();
      expect(shell).toBeTruthy();
      expect(typeof shell).toBe("string");
      expect(shell.length).toBeGreaterThan(0);
    });

    it("should return a valid shell for the current platform", () => {
      const shell = getDefaultShell();
      const validShells = ["/bin/bash", "/bin/zsh", "powershell.exe"];
      expect(validShells).toContain(shell);
    });
  });

  describe("getDefaultShellConfig", () => {
    it("should return a string", () => {
      const config = getDefaultShellConfig();
      expect(typeof config).toBe("string");
    });

    it("should return a valid config for the current platform", () => {
      const config = getDefaultShellConfig();
      const validConfigs = ["~/.bashrc", "~/.zshrc", ""];
      expect(validConfigs).toContain(config);
    });
  });

  describe("getShellDefaults", () => {
    it("should return shell and shellConfig", () => {
      const defaults = getShellDefaults();
      expect(defaults).toHaveProperty("shell");
      expect(defaults).toHaveProperty("shellConfig");
      expect(typeof defaults.shell).toBe("string");
      expect(typeof defaults.shellConfig).toBe("string");
    });

    it("should return consistent values", () => {
      const defaults1 = getShellDefaults();
      const defaults2 = getShellDefaults();
      expect(defaults1.shell).toBe(defaults2.shell);
      expect(defaults1.shellConfig).toBe(defaults2.shellConfig);
    });
  });
});
