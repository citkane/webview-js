import { Webview } from "./src/index.js";
import { resolve } from "node:path";

const url = new URL(`file://${resolve("./docs/html/index.html")}`);
const webview = new Webview(true);

webview.bind("boundFn", (message: string) => console.log(message));
webview.init(`
      boundFn("Hello from the bound side")      
`);

webview.navigate(url.toString());

webview.dispatch((foo: string) => {
      console.log("dispatched");
      console.log(foo);
}, 100);

webview.run();
