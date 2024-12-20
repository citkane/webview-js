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

      if (!runtime) throw Error("Unknown javascript runtime");

      console.info(`Compiling libWebview for: ${runtime}`);
      return runtime === "node"
            ? `
      npm install node-addon-api@latest
      npx node-gyp configure build -C make/node
      mkdir -p ../.bin
      cp -p make/node/build/Release/webview.node ../.bin/libwebview.node`
            : `
      cmake -G Ninja -S make/ffi -B make/build
      cmake --build make/build`;
}
