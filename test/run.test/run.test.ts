import { test, describe } from "bun:test";
import {
      webviewBind,
      webviewChild,
      webviewDispatch,
      webviewEval,
      webviewHelloWindow,
      webviewInit,
      webviewNavigate,
} from "./run";

describe("run webview instances", function () {
      test.only("webview child process", function (done) {
            webviewChild(done);
            //done();
      });
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
