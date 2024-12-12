import { Webview } from "../../dist/src";
import { size_hint } from "../../src/types";

const initString = `
document.addEventListener('DOMContentLoaded', function() {
  console.log("Hello Window");
});
`;

//webviewHelloWindow();
//webviewNavigate();
//webviewEval();
//webviewInit();
//webviewDispatch();
webviewBind();

export function webviewHelloWindow() {
      const webview = new Webview(true);

      webview.set_title("Hello Window");
      webview.set_size(900, 900, size_hint.HINT_NONE);
      webview.set_html("Hello Window");

      webview.run();
}
export function webviewNavigate() {
      const webview = new Webview(true);

      webview.set_title("DuckDuckGo");
      webview.set_size(900, 900, size_hint.HINT_NONE);
      webview.navigate("https://duckduckgo.com/");

      webview.run();
}
export function webviewInit() {
      const webview = new Webview(true);

      webview.set_title("webview_init");
      webview.set_size(900, 900, size_hint.HINT_NONE);
      webview.set_html("Test Init");
      webview.init(initString);

      webview.run();
}
export function webviewEval() {
      const webview = new Webview(true);

      webview.set_title("webview_eval");
      webview.set_size(900, 900, size_hint.HINT_NONE);
      webview.set_html("Test Eval");
      webview.eval(`console.log("Hello Eval")`);

      webview.run();
}
export function webviewDispatch() {
      const webview = new Webview(true);

      webview.set_title("webview_dispatch");
      webview.set_size(900, 900, size_hint.HINT_NONE);
      webview.set_html("Test Dispatch");

      webview.dispatch((arg: any) => {
            console.log(arg, typeof arg);
      }, -9007199254740991n);

      webview.dispatch((arg: any) => {
            console.log(arg, typeof arg);
      }, 9007);
      webview.dispatch((arg: any) => {
            console.log(arg, typeof arg);
      }, 0.00001);
      webview.dispatch((arg: any) => {
            console.log(arg, typeof arg);
      }, true);
      webview.dispatch((arg: any) => {
            console.log(arg, typeof arg);
      }, false);
      webview.dispatch((arg: any) => {
            console.log(arg, typeof arg);
      }, "I am a string");
      webview.run();
}
export function webviewBind() {
      const webview = new Webview(true);

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
