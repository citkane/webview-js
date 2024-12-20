import os from "node:os";
import { Linux } from "./install.deps.linux.js";

const platform = os.platform();

export function installOsDependencies() {
      if (platform === "linux") {
            return new Linux().install().catch((err: Error) => {
                  throw err;
            });
      }
      throw Error(`Unsupported "webview-js" platform: ${platform}`);
}
