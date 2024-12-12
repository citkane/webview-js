import { execSync } from "node:child_process";
import { detectRuntime } from "../util/index.js";
import { installOsDependencies } from "./install.deps.js";
import { cmakeStrings } from "../../cmake/cmakeStrings.js";

await installOsDependencies().catch((err) => {
      console.error(err);
      process.exit(0);
});

try {
      const compileCommand = getCompileCommand();
      console.log(compileCommand);
      execSync(compileCommand, {
            stdio: "inherit",
      });
} catch (err) {
      console.error(err);
      process.exit(0);
}

function getCompileCommand() {
      const runtime = detectRuntime();
      if (!runtime) throw Error("Unknown javascript runtime");

      console.info(`Compiling libWebview for: ${runtime}`);
      return cmakeStrings[runtime];
}
