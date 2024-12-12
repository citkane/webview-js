import type { Webview } from "../class/class.Webview";
import type { bunFFI, FunctionPointer, Pointer } from "../types";

import { ffiTypes, fromCStringPointer, toCString } from "./utils.babelFish";
import { detectRuntime } from "./utils.runtime";

const runtime = detectRuntime();

export function _bind(
      this: InstanceType<typeof Webview>,
      name: string,
      fn: (...args: any[]) => any,
      userArg?: any
) {
      let bindPointer: FunctionPointer;
      const _name = toCString(name) as Uint8Array;

      if (typeof userArg !== "undefined") {
            userArg = JSON.stringify(userArg);
            userArg = toCString(userArg);
      }

      switch (runtime) {
            case "bun":
                  bindPointer = bunBind.bind(this)(fn);
                  break;
            case "deno":
                  bindPointer = denoBind.bind(this)(fn);
                  break;
      }

      this.lib.webview_bind(this.handle, _name, bindPointer!, userArg);
}

export function _dispatch(
      this: InstanceType<typeof Webview>,
      fn: (...args: any[]) => void,
      userArg?: any
) {
      let dispatchPointer: bunFFI.Pointer | Deno.PointerObject;
      userArg = typeof userArg === "object" ? structuredClone(userArg) : userArg;
      switch (runtime) {
            case "bun":
                  dispatchPointer = toBunDispatch(fn, userArg);
                  break;
            case "deno":
                  dispatchPointer = toDenoDispatch(fn, userArg);

                  break;
      }

      this.lib.webview_dispatch(this.handle, dispatchPointer!);
}

function bunBind(this: InstanceType<typeof Webview>, fn: (...args: any[]) => any) {
      const { JSCallback, CString, read } = require("bun:ffi") as typeof bunFFI;
      const ffi = ffiTypes(runtime) as ffiTypes<number>;

      const bindCallback = new JSCallback(
            (
                  id: bunFFI.Pointer,
                  argsStringPointer: bunFFI.Pointer,
                  userArgPointer?: bunFFI.Pointer
            ) => {
                  const _args = fromCStringPointer(argsStringPointer) as string;
                  const _value = !!userArgPointer
                        ? fromCStringPointer(userArgPointer)
                        : null;

                  const argValues = JSON.parse(_args) as any[];
                  const userArgValue = !!_value ? (JSON.parse(_value) as any) : null;

                  runBindCallback.bind(this)(id, fn, argValues, userArgValue);
            },
            {
                  args: [ffi.ptr, ffi.ptr, ffi.ptr],
                  returns: ffi.void,
            }
      );
      return bindCallback.ptr!;

      //bindCallback.close();
}
function denoBind(this: InstanceType<typeof Webview>, fn: (...args: any[]) => any) {
      const bindCallback = new Deno.UnsafeCallback(
            {
                  parameters: ["pointer", "pointer", "pointer"],
                  result: "void",
            },
            (
                  id: Deno.PointerValue,
                  argsStringPointer: Deno.PointerValue,
                  userArgPointer?: Deno.PointerValue
            ) => {
                  const _args = fromCStringPointer(argsStringPointer) as string;
                  const _value = !!userArgPointer
                        ? fromCStringPointer(userArgPointer)
                        : null;

                  const argValues = JSON.parse(_args) as any[];
                  const userArgValue = !!_value ? (JSON.parse(_value) as any) : null;

                  runBindCallback.bind(this)(id, fn, argValues, userArgValue);
            }
      );
      return bindCallback.pointer;

      //bindCallback.close();
}
async function runBindCallback(
      this: InstanceType<typeof Webview>,
      id: Pointer,
      fn: (...args: any[]) => any,
      argValues: any[],
      userValue?: any
) {
      try {
            let result = fn(...argValues, userValue || null);
            if (result instanceof Promise) result = await result;
            result = JSON.stringify(result);
            result = toCString(result);

            this.lib.webview_return(this.handle, id, 0, result);
      } catch (err: any) {
            err = JSON.stringify(err);
            err = toCString(err);

            this.lib.webview_return(this.handle, id, 1, err);
      }
}

function toBunDispatch(fn: (...args: any[]) => void, userArg?: any) {
      const { JSCallback } = require("bun:ffi") as typeof bunFFI;
      const ffi = ffiTypes(runtime) as ffiTypes<number>;
      const dispatchCallback = new JSCallback(
            (id: bunFFI.Pointer, _userArg: bunFFI.Pointer) => {
                  userArg = typeof userArg === "undefined" ? null : userArg;
                  // Pass in `userArg` or a clone `userArg` of from the same scope.
                  // Passing it through `webview_dispatch` is a encoding / decoding nightmare!
                  // I don't see the need for it?
                  fn(userArg);
                  dispatchCallback.close();
            },
            {
                  args: [ffi.ptr, ffi.ptr],
                  returns: ffi.void,
            }
      );
      return dispatchCallback.ptr!;
}
function toDenoDispatch(fn: (...args: any[]) => void, userArg?: any) {
      const dispatchCallback = new Deno.UnsafeCallback(
            {
                  parameters: ["pointer", "pointer"],
                  result: "void",
            },
            (id: Deno.PointerValue, _userArg: Deno.PointerValue) => {
                  userArg = typeof userArg === "undefined" ? null : userArg;
                  // Pass in `userArg` or a clone `userArg` of from the same scope.
                  // Passing it through `webview_dispatch` is a encoding / decoding nightmare!
                  // I don't see the need for it?
                  fn(userArg);
                  //dispatchCallback.close();
            }
      );
      return dispatchCallback.pointer;
}
