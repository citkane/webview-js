import { execSync } from "node:child_process";
import { existsSync as exists } from "node:fs";

export class Linux {
      pkgFilterCommand = "";
      dependencies: string[] = [];
      constructor() {}
      get candidatePkgs() {
            return this.dependencies.filter(
                  (pkgName) => !Linux.isPkgInstalled(this.pkgFilterCommand, pkgName)
            );
      }
      install = () =>
            new Promise<void>((resolve, reject) => {
                  const pckManager = Linux.whatPkgManager();
                  if (!pckManager) return reject(pckManError);

                  let commandString: string | boolean = "";
                  switch (pckManager) {
                        case "apt":
                              commandString = this.apt();
                              break;
                        case "yum":
                              commandString = this.yum();
                              break;
                        case "dnf":
                              commandString = this.dnf();
                              break;
                        case "apk":
                              commandString = this.apk();
                              break;
                        case "pacman":
                              commandString = this.pacman();
                              break;
                  }

                  if (!(typeof commandString === "string")) return resolve();

                  const consumerWarning = makeConsumerWarning(commandString);
                  console.warn(consumerWarning);

                  execSync(commandString, { stdio: "inherit" });
                  resolve();
            });
      apt = () => {
            this.dependencies = [
                  "cmake",
                  "build-essential",
                  "ninja-build",
                  "libgtk-3-0",
                  "libgtk-3-dev",
                  "libwebkit2gtk-4.1-0",
                  "libwebkit2gtk-4.1-dev",
            ];
            this.pkgFilterCommand = "apt list --installed";

            if (!this.candidatePkgs.length) return false;

            return `sudo apt install -y ${this.candidatePkgs.join(" ")}`;
      };
      yum = () => {
            return false;
      };
      dnf = () => {
            return false;
      };
      apk = () => {
            return false;
      };
      pacman = () => {
            return false;
      };

      static isPkgInstalled = (pkgManFilter: string, pkg: string) => {
            let isInstalled = false;
            try {
                  execSync(`${pkgManFilter} 2>/dev/null | grep -q "^${pkg}/" || exit 1`);
                  isInstalled = true;
            } catch (error) {}
            return isInstalled;
      };
      static whatPkgManager() {
            const isApt = exists("/etc/debian_version") || exists("/etc/lsb-release");
            if (isApt) return "apt";
            const isYum = exists("/etc/redhat-release") || exists("/etc/centos-release");
            if (isYum) return "yum";
            const isDnf = exists("/etc/fedora-release");
            if (isDnf) return "dnf";
            const isApk = exists("/etc/alpine-release");
            if (isApk) return "apk";
            const isPacman = exists("/etc/arch-release");
            if (isPacman) return "pacman";
            return undefined;
      }
}

const pckManError = Error("Could not find a package manager for your system");

function makeConsumerWarning(command: string) {
      return `
\x1b[33mAttention!\x1b[0m
Package "webview-js" needs to install OS dependencies for compilation of libraries and running of "webview".
Find out more: https://github.com/webview/webview

The following command will need \x1b[33mroot\x1b[0m privileges to automatically install these for you.
You are best advised to cancel this installation and firstly execute the installation command from a trusted environment: 
\x1b[32m${command}\x1b[0m

      `;
}
