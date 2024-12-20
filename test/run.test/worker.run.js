import { createRequire } from "node:module";
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// test/run.test/worker.run.ts
import { handleAsNumber, Webview } from "../../dist/src/index.js";
import { html5 } from "../../dist/src/util/index.js";
var webview = new Webview(true);
var handle = handleAsNumber(webview.create());
webview.init(`

const evalLog = (message) => {
      console.log("init evalLog:", message);
};

`);
webview.set_html(html5("Worker Webview"));
if (typeof postMessage === "undefined") {
  const { parentPort } = __require("node:worker_threads");
  parentPort.postMessage(handle);
} else {
  postMessage(handle);
}
webview.run();
