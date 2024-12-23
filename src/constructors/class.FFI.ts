type FFIBun = typeof FFIBun;
type FFIDeno = Record<keyof FFIBun, ReturnType<typeof convertBunToDenoFFI>>;

import { join, dirname } from "node:path";
import {
      covertBunToDenoFFI as convertBunToDenoFFI,
      detectRuntime,
      ffiTypes,
      suffixDeno,
} from "../util/index.js";

const runtime = detectRuntime();
const ffi = ffiTypes();

export class FFI {
      protected libWv!: libWebview;
      //protected libPtr?: libPointers;
      constructor() {
            const thisDir = dirname(import.meta.filename);
            const binDir = join(thisDir, "../../../.bin");

            switch (runtime) {
                  case "node":
                        const nodeLibPath = join(binDir, "libwebview.node");
                        const pointerLibPath = join(binDir, "libpointers.node");
                        this.libWv = require(nodeLibPath);
                        //this.libPtr = require(pointerLibPath);
                        break;
                  case "bun":
                        const bunLibPath = join(binDir, "libwebview");
                        this.libWv = this.ffiBun(bunLibPath);
                        break;
                  case "deno":
                        const denoLibPath = join(binDir, "libwebview");
                        this.libWv = this.ffiDeno(denoLibPath);
            }
      }
      //nodePointerValue = this.libPtr?.value;
      //nodePointerCreate = this.libPtr?.create;

      private ffiBun = (libPath: string) => {
            const { dlopen, suffix } = require("bun:ffi");
            const path = join(`${libPath}.${suffix}`);

            const { symbols } = dlopen(path, FFIBun);
            return symbols as libWebview;
      };
      private ffiDeno = (libPath: string) => {
            const suffix = suffixDeno(Deno.build.os);
            const path = join(`${libPath}.${suffix}`);

            const { symbols } = Deno.dlopen(path, FFIDeno);
            return symbols as libWebview;
      };
}

const FFIBun = {
      webview_create: {
            args: [ffi.i32, ffi.ptr],
            returns: ffi.ptr,
      },
      webview_destroy: {
            args: [ffi.ptr],
            returns: ffi.void,
      },
      webview_run: {
            args: [ffi.ptr],
            returns: ffi.void,
      },
      webview_terminate: {
            args: [ffi.ptr],
            returns: ffi.void,
      },
      webview_dispatch: {
            args: [ffi.ptr, ffi.function],
            returns: ffi.void,
      },
      webview_get_window: {
            args: [ffi.ptr],
            returns: ffi.ptr,
      },
      webview_get_native_handle: {
            args: [ffi.ptr, ffi.i32],
            returns: ffi.ptr,
      },
      webview_set_title: {
            args: [ffi.ptr, ffi.cstring],
            returns: ffi.void,
      },
      webview_set_size: {
            args: [ffi.ptr, ffi.i32, ffi.i32, ffi.i32],
            returns: ffi.void,
      },
      webview_navigate: {
            args: [ffi.ptr, ffi.cstring],
            returns: ffi.void,
      },
      webview_set_html: {
            args: [ffi.ptr, ffi.cstring],
            returns: ffi.void,
      },
      webview_init: {
            args: [ffi.ptr, ffi.cstring],
            returns: ffi.void,
      },
      webview_eval: {
            args: [ffi.ptr, ffi.cstring],
            returns: ffi.void,
      },
      webview_bind: {
            args: [ffi.ptr, ffi.cstring, ffi.function, ffi.cstring],
            returns: ffi.void,
      },
      webview_unbind: {
            args: [ffi.ptr, ffi.cstring],
            returns: ffi.void,
      },
      webview_return: {
            args: [ffi.ptr, ffi.ptr, ffi.i32, ffi.cstring],
            returns: ffi.void,
      },
};

// FFI API for Deno is similar to that for Bun, but uses keys `{parameters, result}` in lieu of `{args, returns}`
// This anonymous function re-maps the keys
const FFIDeno = (() => {
      return Object.keys(FFIBun).reduce((_FFI, key) => {
            const k = key as keyof typeof FFIBun;
            _FFI[k] = convertBunToDenoFFI(FFIBun[k]);
            return _FFI;
      }, {} as FFIDeno);
})();
