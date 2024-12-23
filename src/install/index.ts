import { execSync } from "node:child_process";
import { detectRuntime } from "../util/index.js";
import { installOsDependencies } from "./install.deps.js";

await installOsDependencies().catch((err) => {
      console.error(err);
      process.exit(0);
});

try {
      const compileCommand = getCompileCommand();
      execSync(compileCommand, {
            stdio: "inherit",
      });
} catch (err) {
      console.error(err);
      process.exit(0);
}

function getCompileCommand() {
      const runtime = detectRuntime();
      console.info(`Compiling libWebview for: ${runtime}`);

      if (runtime === "node") {
            const { compileString } = require("../../make/node/compile.js");
            return compileString;
      }
      const { compileString } = require("../../make/ffi/compile.ts");
      return compileString;
}
