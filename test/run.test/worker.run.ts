export type data = { pointer: Pointer };

import { handleAsNumber, Webview } from "../../dist/src/index.js";
import { html5 } from "../../dist/src/util/index.js";

declare const self: Worker;
const webview = new Webview(true);
const handle = handleAsNumber(webview.create());

webview.set_html("<html></html>");
/*
webview.set_html(html5("Worker Webview"));
webview.init(`
const evalLog = (message) => {
      console.log("init evalLog:", message);
};
`);
*/
/*
webview.dispatch(handle as Pointer, () => {
      console.log("dispatched!");
});
*/
if (typeof postMessage === "undefined") {
      const { parentPort } = require("node:worker_threads");
      parentPort.postMessage(handle);
} else {
      postMessage(handle);
}

webview.run();
