const os = require("node:os");
const { join, dirname, resolve } = require("node:path");

const currentDir = getCurrentDir();
const encoder = new TextEncoder();
const { platform, machine } = os;
const libDir = join(currentDir, "../bin");

let _libFileName = process.env.WEBVIEW_PATH;
//let _shim = {} as _shim<any>;

switch (true) {
      case !_libFileName && platform() === "darwin":
            _libFileName = `libwebview-macos-${machine()}.dylib`;
            _libFileName = join(libDir, _libFileName);
            break;
      case !_libFileName && platform() === "linux":
            _libFileName = `libwebview-linux-${machine()}.so`;
            _libFileName = join(libDir, _libFileName);
            break;
      case !_libFileName && platform() === "win32":
            let _machine = machine();
            _machine = _machine === "x86_64" ? "AMD64" : _machine;
            _libFileName = `libwebview-windows-${_machine}.dll`;
            _libFileName = join(libDir, _libFileName);
            break;
      default:
            if (!_libFileName)
                  throw Error(`Unsupported platform ${platform} : ${machine()}`);
}
/*
switch (detectRuntime()) {
      case "Node":
            _shim.lib = getLibWebviewSymbolsNode(_libFileName!);
            //_shim.JSCallback = Deno.UnsafeCallback;
            //_shim.CString = (ptr: Deno.PointerObject) =>
            //new Deno.UnsafePointerView(ptr).getCString();
            break;
      case "Deno":
            _shim.lib = getLibWebviewSymbols<"Deno">(_libFileName!, Deno.dlopen, "Deno");
            _shim.JSCallback = Deno.UnsafeCallback;
            _shim.CString = (ptr: Deno.PointerObject) =>
                  new Deno.UnsafePointerView(ptr).getCString();
            break;
      case "Bun":
            const {
                  dlopen: bunDlopen,
                  CString: bunCstring,
                  JSCallback: bunJSCallback,
            } = await import("bun:ffi");
            _shim.lib = getLibWebviewSymbols<"Bun">(_libFileName!, bunDlopen, "Bun");
            _shim.JSCallback = bunJSCallback;
            _shim.CString = (ptr: bunPointer) => new bunCstring(ptr).toString();
}
            */
export const libFileName = _libFileName!;
//export const shim = _shim;

export function toCstring(value: string) {
      return encoder.encode(`${value}\0`);
}
export function toTypedArray(object: object) {
      const buffer = Buffer.from(JSON.stringify(object));
      const typedArray = new Uint8Array(buffer);
      return typedArray;
}
/*
export function detectRuntime() {
      if (typeof Deno !== "undefined") {
            return "Deno";
      }
      if (typeof Bun !== "undefined") {
            return "Bun";
      }

      if (typeof process !== "undefined" && process.versions && process.versions.node) {
            return "Node";
      }

      throw Error("Unknown runtime");
}
*/
function getCurrentDir() {
      const fileName = import.meta.url.replace("file://", "");
      return dirname(resolve(fileName));
}

// @todo parsing and passing binary numbers is complicated...
// ATM, I am just passing them as strings fot the user to convert to what their logic expects.
/*
export function toPointer(number: number | bigint) {
      if (isBigInt(number)) {
            return toCstring(number.toString());
      }
      if (isInteger(number)) {
            return toCstring(number.toString());
      }
      if (isFloat32(number)) {
            return toCstring(number.toString());
      }
      if (isFloat64(number)) {
            return toCstring(number.toString());
      }
      return null;
}
function isBigInt(value: number | bigint) {
      return typeof value === "bigint";
}
function isInteger(value: number) {
      return Number.isInteger(value);
}
function isFloat32(value: number) {
      const float32 = new Float32Array(1);
      float32[0] = value;
      return float32[0] === value && !Number.isInteger(value);
}
function isFloat64(value: number) {
      return typeof value === "number" && !Number.isInteger(value);
}
*/
