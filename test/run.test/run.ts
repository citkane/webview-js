import type { data } from "./worker.run";

import { resolve } from "node:path";
import { numberAsHandle, Webview } from "../../dist/src/index.js";
import { size_hint } from "../../dist/src/types.js";
import { detectRuntime } from "../../dist/src/util/utils.runtime.js";

const initString = `
document.addEventListener('DOMContentLoaded', function() {
  console.log("Hello Window");
});
`;

//if (process.env.NODE_ENV !== "test" && typeof Bun === "undefined") {
webviewChild();
//webviewHelloWindow();
//webviewNavigate();
//webviewEval();
//webviewInit();
//webviewDispatch();
//webviewBind();
//}
export function webviewChild(done?: Function) {
      const worker = makeWorker("./worker.run.js", listenCallback);
      const webview = new Webview();

      function listenCallback(handle: Pointer) {
            webview.set_size(handle, 1200, 1200);

            setTimeout(() => {
                  webview.eval(handle, `evalLog("Hello from your parent")`);
                  webview.dispatch(handle, () => {
                        console.log("dispatched!");
                  });
                  webview.terminate(handle as Pointer);
                  worker.terminate();
                  if (done) done();
            }, 2000);
      }
      //worker.on("message", (handle: object) => {});

      //worker.onmessage = (event: { data: data }) => {
      //console.log({ event });
      /*
            handle = numberAsHandle(event.data.pointer);

            webview.set_title(handle, "child webview");
            webview.set_size(handle, 1200, 1200, size_hint.HINT_MIN);
*/
      //webview.eval(handle, `console.log("evaluated!")`);
      /*
            try {
                  webview.dispatch(
                        handle,
                        (arg: string) => {
                              console.log("Hello dispatch", arg);
                        },
                        "arg"
                  );
            } catch (err) {
                  console.error(err);
            }
*/
      /*
            setTimeout(() => {
                  webview.terminate(handle);
                  worker.terminate();
                  if (done) done();
            }, 2000);
            */
      //};

      //done();
}
function makeWorker(fileRelativePath: string, listenCallback: (handle: Pointer) => void) {
      const runtime = detectRuntime();
      if (runtime === "node") {
            const { Worker } = require("node:worker_threads");
            const { join } = require("node:path");
            const worker = new Worker(join(__dirname, fileRelativePath), {
                  workerData: {},
            });
            worker.on("message", (handle: Pointer) => listenCallback(handle));
            return worker;
      }
      const filePath = import.meta.resolve(fileRelativePath);
      if (runtime === "deno") {
            const worker = new Worker(filePath, { type: "module" });
            worker.onmessage = (event: { data: bigint }) => {
                  const pointerValue = Deno.UnsafePointer.create(event.data);
                  listenCallback(pointerValue);
            };
            return worker;
      }
      const worker = new Worker(filePath);
      worker.onmessage = (event: { data: Pointer }) => listenCallback(event.data);
      return worker;
}

export function webviewHelloWindow() {
      const webview = new Webview(true);
      webview.create();

      webview.set_title("Hello Window");
      webview.set_size(900, 900, size_hint.HINT_NONE);
      webview.set_html("Hello Window");

      webview.run();
}
export function webviewNavigate() {
      const webview = new Webview(true);
      webview.create();

      webview.set_title("DuckDuckGo");
      webview.set_size(900, 900, size_hint.HINT_NONE);
      webview.navigate("https://duckduckgo.com/");

      webview.run();
}
export function webviewInit() {
      const webview = new Webview(true);
      webview.create();

      webview.set_title("webview_init");
      webview.set_size(900, 900, size_hint.HINT_NONE);
      webview.set_html("Test Init");
      webview.init(initString);

      webview.run();
}
export function webviewEval() {
      const webview = new Webview(true);
      webview.create();

      webview.set_title("webview_eval");
      webview.set_size(900, 900, size_hint.HINT_NONE);
      webview.set_html("Test Eval");
      webview.eval(`console.log("Hello Eval")`);

      webview.run();
}
export function webviewDispatch() {
      const webview = new Webview(true);
      const handle = webview.create();

      webview.set_title("webview_dispatch");
      webview.set_size(900, 900, size_hint.HINT_NONE);
      webview.set_html("Test Dispatch");
      webview.dispatch(
            handle,
            (arg: any) => {
                  console.log(arg, typeof arg);
            },
            -9007199254740991n
      );

      webview.dispatch(
            handle,
            (arg: any) => {
                  console.log(arg, typeof arg);
            },
            9007
      );
      webview.dispatch(
            handle,
            (arg: any) => {
                  console.log(arg, typeof arg);
            },
            0.00001
      );
      webview.dispatch(
            handle,
            (arg: any) => {
                  console.log(arg, typeof arg);
            },
            true
      );
      webview.dispatch(
            handle,
            (arg: any) => {
                  console.log(arg, typeof arg);
            },
            false
      );
      webview.dispatch(
            handle,
            (arg: any) => {
                  console.log(arg, typeof arg);
            },
            "I am a string"
      );

      webview.run();
}
export function webviewBind() {
      const webview = new Webview(true);
      webview.create();

      webview.set_title("webview_bind");
      webview.set_size(900, 900, size_hint.HINT_NONE);
      webview.set_html("Test Bind");

      const bindMe = (value: any, userValue: any) =>
            `hello from the bound side: ${value} ${userValue}`;

      webview.bind("bindMe", bindMe, "userValue");

      webview.set_html(`
    <body>Test Bind</body>
    <script>
          bindMe("foo").then(result => console.log(result))
    </script>`);

      webview.run();
}
