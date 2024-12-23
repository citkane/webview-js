import { createRequire } from "node:module";
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// test/run.test/run.ts
import { Webview } from "../../dist/src/index.js";
import { size_hint } from "../../dist/src/types.js";
import { universalWorker } from "../../dist/src/util/index.js";
import { JSCallback } from "../../dist/src/util/class.node.JSCallback.js";
import { join } from "node:path";
var __dirname = "/home/michaeladmin/code/projects/webview-js/test/run.test";
var initString = `
document.addEventListener('DOMContentLoaded', function() {
  console.log("Hello Window");
});
`;
nodeJSCallabck();
function nodeJSCallabck() {
  const lib = __require("../../.bin/libwebview.node");
  const handle = new JSCallback;
  console.log({ handle });
  const result = lib.swig_jsCallback(10, 10, handle);
  console.log({ result });
}
function webviewChild(done) {
  const workerPath = join(__dirname, "./worker.run.js");
  const worker = universalWorker(workerPath, listenCallback);
  const webview = new Webview;
  function listenCallback(handle) {
    console.log({ handle });
    webview.set_size(handle, 1200, 1200);
    webview.set_title(handle, "Webview Child Test");
    setTimeout(() => {
      webview.terminate(handle);
      worker.terminate();
    }, 1000);
  }
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
