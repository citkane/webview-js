type runtime = "bun" | "deno" | "node";
const testsMessage = `detectRuntime(): set 'process.env.jsRuntime' to override the detected runtime`;
const isTest = process.env.NODE_ENV === "test";

let emitted = false;

export function detectRuntime() {
      if (isTest) {
            if (!!process.env.jsRuntime) return process.env.jsRuntime as runtime;
            if (!emitted) {
                  emitted = true;
                  console.info(testsMessage);
            }
      }

      if (typeof Deno !== "undefined") {
            return "deno";
      }
      if (typeof Bun !== "undefined") {
            return "bun";
      }
      return "node";
}
