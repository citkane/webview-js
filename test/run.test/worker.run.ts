export type data = { pointer: Pointer };

import { Webview } from "../../dist/src";

declare const self: Worker;
const webview = new Webview(true);
const handle = getHandle();
webview.set_html("Worker Webview");

postMessage({ pointer: handle } as data);

webview.run();
process.exit();

function getHandle() {
      return typeof Bun !== "undefined"
            ? webview.create()
            : Deno.UnsafePointer.value(webview.create() as Deno.PointerValue);
}
