import { createRequire } from "node:module";
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// test/run.test/run.ts
import { Webview } from "../../dist/src/index.js";
import { size_hint } from "../../dist/src/types.js";
import { detectRuntime } from "../../dist/src/util/utils.runtime.js";
var __dirname = "/home/michaeladmin/code/projects/webview-js/test/run.test";
var initString = `
document.addEventListener('DOMContentLoaded', function() {
  console.log("Hello Window");
});
`;
webviewChild();
function webviewChild(done) {
  const worker = makeWorker("./worker.run.js", listenCallback);
  const webview = new Webview;
  function listenCallback(handle) {
    webview.dispatch(handle, () => {
      console.log("dispatched!");
    });
    webview.bind(handle, "testBind", () => {
      console.log("I am a bound function");
    });
    setTimeout(() => {
      webview.eval(handle, `testBind()`);
    }, 2000);
  }
}
function makeWorker(fileRelativePath, listenCallback) {
  const runtime = detectRuntime();
  if (runtime === "node") {
    const { Worker: Worker2 } = __require("node:worker_threads");
    const { join } = __require("node:path");
    const worker2 = new Worker2(join(__dirname, fileRelativePath), {
      workerData: {}
    });
    worker2.on("message", (handle) => listenCallback(handle));
    return worker2;
  }
  const filePath = import.meta.resolve(fileRelativePath);
  if (runtime === "deno") {
    const worker2 = new Worker(filePath, { type: "module" });
    worker2.onmessage = (event) => {
      const pointerValue = Deno.UnsafePointer.create(event.data);
      listenCallback(pointerValue);
    };
    return worker2;
  }
  const worker = new Worker(filePath);
  worker.onmessage = (event) => listenCallback(event.data);
  return worker;
}
function webviewHelloWindow() {
  const webview = new Webview(true);
  webview.create();
  webview.set_title("Hello Window");
  webview.set_size(900, 900, size_hint.HINT_NONE);
  webview.set_html("Hello Window");
  webview.run();
}
function webviewNavigate() {
  const webview = new Webview(true);
  webview.create();
  webview.set_title("DuckDuckGo");
  webview.set_size(900, 900, size_hint.HINT_NONE);
  webview.navigate("https://duckduckgo.com/");
  webview.run();
}
function webviewInit() {
  const webview = new Webview(true);
  webview.create();
  webview.set_title("webview_init");
  webview.set_size(900, 900, size_hint.HINT_NONE);
  webview.set_html("Test Init");
  webview.init(initString);
  webview.run();
}
function webviewEval() {
  const webview = new Webview(true);
  webview.create();
  webview.set_title("webview_eval");
  webview.set_size(900, 900, size_hint.HINT_NONE);
  webview.set_html("Test Eval");
  webview.eval(`console.log("Hello Eval")`);
  webview.run();
}
function webviewDispatch() {
  const webview = new Webview(true);
  const handle = webview.create();
  webview.set_title("webview_dispatch");
  webview.set_size(900, 900, size_hint.HINT_NONE);
  webview.set_html("Test Dispatch");
  webview.dispatch(handle, (arg) => {
    console.log(arg, typeof arg);
  }, -9007199254740991n);
  webview.dispatch(handle, (arg) => {
    console.log(arg, typeof arg);
  }, 9007);
  webview.dispatch(handle, (arg) => {
    console.log(arg, typeof arg);
  }, 0.00001);
  webview.dispatch(handle, (arg) => {
    console.log(arg, typeof arg);
  }, true);
  webview.dispatch(handle, (arg) => {
    console.log(arg, typeof arg);
  }, false);
  webview.dispatch(handle, (arg) => {
    console.log(arg, typeof arg);
  }, "I am a string");
  webview.run();
}
function webviewBind() {
  const webview = new Webview(true);
  webview.create();
  webview.set_title("webview_bind");
  webview.set_size(900, 900, size_hint.HINT_NONE);
  webview.set_html("Test Bind");
  const bindMe = (value, userValue) => `hello from the bound side: ${value} ${userValue}`;
  webview.bind("bindMe", bindMe, "userValue");
  webview.set_html(`
    <body>Test Bind</body>
    <script>
          bindMe("foo").then(result => console.log(result))
    </script>`);
  webview.run();
}
export {
  webviewNavigate,
  webviewInit,
  webviewHelloWindow,
  webviewEval,
  webviewDispatch,
  webviewChild,
  webviewBind
};
