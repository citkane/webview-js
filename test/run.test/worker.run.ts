export type data = { pointer: Pointer };

import { Webview } from "../../dist/src/index.js";
import { handleAsInt } from "../../dist/src/util/index.js";

declare const self: Worker;
const webview = new Webview(true);
const _handle = webview.create();
console.log({ _handle });
const handle = handleAsInt(_handle);
console.log({ handle });

webview.set_html("<html></html>");

/*
const cb = JSCallback((webview: any, data: any) => {
      console.log("dispatched!");
});

console.log({ cb });
*/

/*
webview.dispatch(_handle, (w, userArg) => {
      console.log("dispatched!");
});
*/

/*
webview.set_html(html5("Worker Webview"));
webview.init(`
const evalLog = (message) => {
      console.log("init evalLog:", message);
};
`);
*/
/*

*/
if (typeof postMessage === "undefined") {
      const { parentPort } = require("node:worker_threads");
      parentPort.postMessage(handle);
} else {
      postMessage(handle);
}

webview.run();
