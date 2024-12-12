import { test, describe } from "bun:test";
import {
      webviewBind,
      webviewDispatch,
      webviewEval,
      webviewHelloWindow,
      webviewInit,
      webviewNavigate,
} from "./run";

describe("run webview instances", function () {
      test("webview Hello Window", function (done) {
            webviewHelloWindow();
            done();
      });
      test("webview navigate", function (done) {
            webviewNavigate();
            done();
      });
      test("webview init", function (done) {
            webviewInit();
            done();
      });
      test("webview eval", function (done) {
            webviewEval();
            done();
      });
      test("webview dispatch", function (done) {
            webviewDispatch();
            done();
      });
      test("webview bind", (done) => {
            webviewBind();
            done();
      });
});

/** 
 * It does not seem possible to have more than 1 webview on the same thread,
 * not on GTK anyhow - it causes kernel panic.
 * This makes moot getting a handle on `webview` for the purpose of:
 * - webview_terminate
 * - webview_dispatch
 * 
 * Preserving this here for de-bugging
const worker = new Worker(resolve("./test/run.test/worker.run.ts"));
const worker2 = new Worker(resolve("./test/run.test/worker.run.ts"));

test("quickRun", async function (done) {
      let workerHandle: number;
      let worker2Handle: number;

      worker.onmessage = (event: { data: data }) => {
            workerHandle = event.data.value! as number;
            console.log({ workerHandle });
      };
      worker2.onmessage = (event: { data: data }) => {
            worker2Handle = event.data.value! as number;
            console.log({ worker2Handle });
      };

      //done();
});
*/
