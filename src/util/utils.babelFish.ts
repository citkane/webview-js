export type ffiTypes<T = number | string> = Record<keyof typeof denoFFIType, T>;

import { detectRuntime } from ".";
import type { bunFFI } from "../types";

const encoder = new TextEncoder();
const runtime = detectRuntime();

export const denoFFIType = {
      i32: "i32",
      ptr: "pointer",
      void: "void",
      function: "function",
      cstring: "buffer",
};

export const ffiTypes = (runtime = detectRuntime()) => {
      if (runtime === "deno") return denoFFIType as ffiTypes;

      if (runtime === "bun") {
            const _ffi = require("bun:ffi").FFIType;

            // trim the fat of the full Bun FFIType to avoid downstream doubts.
            // ie. keep babelFish ffi `Object` keys consistent across platforms
            return Object.keys(_ffi).reduce((ffi, key) => {
                  const k = key as keyof typeof _ffi;
                  if (key in denoFFIType) ffi[key] = _ffi[k];
                  return ffi;
            }, {} as Record<any, any>) as ffiTypes;
      }

      // ffiTypes will remain empty `Object` for Node.
      // Node is swig wrapped and has no FFI definition in this package
      console.warn("ffi(): Node is swig wrapped and has no ffi");
      return {} as ffiTypes;
};

export function covertBunToDenoFFI(def: Record<"args" | "returns", any>) {
      return Object.keys(def).reduce((_def, key) => {
            _def.parameters = def.args;
            _def.result = def.returns;
            return _def;
      }, {} as Record<"parameters" | "result", any>);
}

// Deno does not have an inbuilt `suffix` function
export function suffixDeno(os: string) {
      if (os === "windows") return "dll";
      if (os === "darwin") return "dylib";
      return "so";
}

export function toCString<T = Uint8Array | string>(
      text: string,
      runtime = detectRuntime()
): T {
      if (runtime === "bun" || runtime === "deno") {
            return encoder.encode(`${text}\0`) as T;
      }
      return text as T;
}
export function fromCStringPointer(
      pointer?: Pointer | string,
      runtime = detectRuntime()
) {
      if (!pointer) return null;
      if (runtime === "bun") {
            const { CString } = require("bun:ffi") as typeof bunFFI;
            return new CString(pointer as bunFFI.Pointer).toString();
      }
      if (runtime === "deno") {
            const unsafePointerView = new Deno.UnsafePointerView(
                  pointer as Deno.PointerObject
            );
            return unsafePointerView.getCString();
      }
      //It is "node", which is swig wrapped
      return pointer as string;
}

export function getPointerFromJSCallback(JSCb: FFICallbackReturns) {
      if (runtime == "bun") return (JSCb as bunFFI.JSCallback).ptr!;
      if (runtime === "deno") return (JSCb as Deno.UnsafeCallback).pointer!;
      return JSCb as Function;
}
