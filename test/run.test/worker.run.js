import { createRequire } from "node:module";
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// test/run.test/worker.run.ts
import { handleAsNumber, Webview } from "../../dist/src/index.js";
var webview = new Webview(true);
var handle = handleAsNumber(webview.create());
webview.set_html("<html></html>");
if (typeof postMessage === "undefined") {
  const { parentPort } = __require("node:worker_threads");
  parentPort.postMessage(handle);
} else {
  postMessage(handle);
}
webview.run();
