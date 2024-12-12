import { expect, test, describe } from "bun:test";
import { Linux } from "../../src/install/install.deps.linux";

const linux = new Linux();

describe("Installer for Linux based platforms", () => {
      describe("Apt based pckManagers", () => {
            test("apt", apt());
            test("isPkgInstalled", isPkgInstalled("apt"));
      });
});

function apt() {
      return () => {
            linux.apt();
            expect(linux.pkgFilterCommand).toBe("apt list --installed");
            expect(linux.dependencies).toEqual([
                  "cmake",
                  "build-essential",
                  "ninja-build",
                  "libgtk-3-0",
                  "libgtk-3-dev",
                  "libwebkit2gtk-4.1-0",
                  "libwebkit2gtk-4.1-dev",
            ]);
      };
}
function isPkgInstalled(platform: "apt") {
      return () => {
            linux[platform]();
            let isInstalled = Linux.isPkgInstalled(linux.pkgFilterCommand, "grep");
            expect(isInstalled).toBeTrue();
            isInstalled = Linux.isPkgInstalled(
                  linux.pkgFilterCommand,
                  "grep_shouldNeverBe"
            );
            expect(isInstalled).toBeFalse();
      };
}
