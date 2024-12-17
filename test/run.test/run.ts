import { resolve } from "node:path";
import { Webview } from "../../dist/src";
import { size_hint } from "../../src/types";
import type { data } from "./worker.run";

const initString = `
document.addEventListener('DOMContentLoaded', function() {
  console.log("Hello Window");
});
`;

if (process.env.NODE_ENV !== "test" && typeof Bun === "undefined") {
      webviewChild();
      //webviewHelloWindow();
      //webviewNavigate();
      //webviewEval();
      //webviewInit();
      //webviewDispatch();
      //webviewBind();
}
export function webviewChild(done?: Function) {
      const worker =
            typeof Bun !== "undefined"
                  ? new Worker(resolve("./test/run.test/worker.run.ts"))
                  : new Worker(import.meta.resolve("./worker.run.ts"), {
                          type: "module",
                    });
      const webview = new Webview();
      let handle: Pointer;

      worker.onmessage = (event: { data: data }) => {
            handle = getHandle(event.data.pointer);

            webview.set_title("child webview", handle);
            webview.eval(
                  `console.log("evaluated!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")`,
                  handle
            );
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

            setTimeout(() => {
                  webview.terminate(handle);
                  worker.terminate();
                  if (done) done();
            }, 1000);
      };

      //done();
}
function getHandle(pointer: Pointer) {
      return typeof Bun !== "undefined"
            ? pointer
            : Deno.UnsafePointer.create(pointer as any as bigint);
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
