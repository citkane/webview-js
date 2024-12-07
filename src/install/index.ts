import { execSync } from "node:child_process";
import { installOsDependencies } from "./install.deps.js";
import { exit } from "node:process";

console.log({ runTime: detectRuntime() });
exit(0);

/*
await installOsDependencies().catch((err) => {
      throw err;
});

console.info("Compiling webview...");
try {
      execSync(getCompileCommand(), {
            stdio: "inherit",
      });
} catch (err) {
      throw err;
}
*/
function detectRuntime() {
      if (typeof Deno !== "undefined") {
            return "Deno";
      }
      if (typeof Bun !== "undefined") {
            return "Bun";
      }
      if (
            typeof Bun === "undefined" &&
            typeof process !== "undefined" &&
            process.versions &&
            process.versions.node
      ) {
            return "Node";
      }
}
/*
function getCompileCommand() {
      const runtime = detectRuntime();
      //console.log({ runtime });
      if (!runtime) throw Error("Unknown javascript runtime");

      if (runtime === "Node")
            return `npx cmake-js compile -G Ninja -d ./cmake/node --CDCMAKE_BUILD_TYPE="Release"`;
      if (runtime === "Bun") return `echo "Bun"`;
      if (runtime === "Deno") return `echo "Deno"`;

      throw "Never";
}
      */
