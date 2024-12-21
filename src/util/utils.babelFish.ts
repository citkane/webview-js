export type ffiTypes<T = number | string> = Record<keyof typeof denoFFIType, T>;

import { detectRuntime } from "./utils.runtime.js";
import type { bunFFI } from "../types.js";

const encoder = new TextEncoder();
const runtime = detectRuntime();

// A redacted mapping of Bun ffiType keys to Deno ffiTypes
const denoFFIType = {
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
            // ie. keep babelFish ffi `Object` keys redacted and consistent across platforms
            return Object.keys(_ffi).reduce((ffi, key) => {
                  const k = key as keyof typeof _ffi;
                  if (key in denoFFIType) ffi[key] = _ffi[k];
                  return ffi;
            }, {} as Record<any, any>) as ffiTypes;
      }

      // ffiTypes will remain empty `Object` for Node.
      // The Node Webview library is swig wrapped, thus has no FFI definition in this package
      return {} as ffiTypes;
};

export function covertBunToDenoFFI(def: Record<"args" | "returns", any>) {
      return Object.keys(def).reduce((_def, key) => {
            _def.parameters = def.args;
            _def.result = def.returns;
            return _def;
      }, {} as Record<"parameters" | "result", any>);
}

// Unlike Bun, Deno does not have an inbuilt `suffix` function
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
            return Deno.UnsafePointerView.getCString(pointer as Deno.PointerObject);
      }
      //It is "node", which is swig wrapped
      return pointer as string;
}

export function getPointerFromJSCallback(JSCallback: JSCallback<any>) {
      if (runtime == "bun") return (JSCallback as bunFFI.JSCallback).ptr!;
      if (runtime === "deno") return (JSCallback as Deno.UnsafeCallback).pointer!;
      return JSCallback as Pointer;
}

// For multithread IPC, Deno pointerValues need to be coerced to/from numbers.
// If not, the pointerValue object will be serialised and cloned, thus losing memory association.
export function handleAsNumber(handle: Pointer) {
      if (runtime === "deno") {
            return Deno.UnsafePointer.value(handle as Deno.PointerValue);
      }
      return handle as number;
}
export function numberAsHandle(pointer: Pointer) {
      if (runtime === "deno") return Deno.UnsafePointer.create(pointer as any as bigint);
      return pointer;
}
