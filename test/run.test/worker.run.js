import { createRequire } from "node:module";
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// test/run.test/worker.run.ts
import { Webview } from "../../dist/src/index.js";
import { handleAsInt } from "../../dist/src/util/index.js";
var webview = new Webview(true);
var _handle = webview.create();
console.log({ _handle });
var handle = handleAsInt(_handle);
console.log({ handle });
webview.set_html("<html></html>");
if (typeof postMessage === "undefined") {
  const { parentPort } = __require("node:worker_threads");
  parentPort.postMessage(handle);
} else {
  postMessage(handle);
}
webview.run();
