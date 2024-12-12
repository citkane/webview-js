export type ffiTypes<T = number | string> = Record<keyof typeof denoFFIType, T>;

import { detectRuntime } from ".";
import type { bunFFI, Pointer } from "../types";

const encoder = new TextEncoder();

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

export function getSuffixDeno(os: string) {
      let suffix = "";
      switch (os) {
            case "windows":
                  suffix = "dll";
                  break;
            case "darwin":
                  suffix = "dylib";
                  break;
            default:
                  suffix = "so";
                  break;
      }
      return suffix;
}

export function toCString(text: string, runtime = detectRuntime()) {
      if (runtime === "bun") {
            return encoder.encode(`${text}\0`);
      }
      if (runtime === "deno") {
            return encoder.encode(`${text}\0`);
      }
      return text;
}
export function fromCStringPointer(pointer: Pointer, runtime = detectRuntime()) {
      switch (runtime) {
            case "bun":
                  const { CString } = require("bun:ffi") as typeof bunFFI;
                  return new CString(pointer as bunFFI.Pointer).toString();
      }
}
