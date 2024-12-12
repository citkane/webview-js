import { expect, test, describe } from "bun:test";
import { detectRuntime, ffiTypes } from "../../src/util";

describe("Unit test utility functions", () => {
      test("detect the runtime", function () {
            let runtime = detectRuntime();
            expect(runtime).toBe("bun");
            expect(typeof Deno === "undefined").toBeTrue();
            process.env.jsRuntime = "node";
            runtime = detectRuntime();
            expect(runtime).toBe("node");
      });
      test("get Bun runtime ffi type", async () => {
            process.env.jsRuntime = "bun";
            expect(ffiTypes("bun")).toEqual({
                  i32: 5,
                  ptr: 12,
                  void: 13,
                  cstring: 14,
                  function: 17,
            });
      });
      test("get Deno runtime ffi type", () => {
            process.env.jsRuntime = "deno";
            expect(ffiTypes("deno")).toEqual({
                  i32: "i32",
                  ptr: "pointer",
                  void: "void",
                  function: "function",
                  cstring: "buffer",
            });
      });
      test("get Node runtime ffi type", () => {
            process.env.jsRuntime = "node";
            expect(ffiTypes("node")).toBeEmptyObject;
      });
});
