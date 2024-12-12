// dist/src/index.js
import { createRequire } from "node:module";
import { join, dirname } from "node:path";
var __require = /* @__PURE__ */ createRequire(import.meta.url);
function detectRuntime() {
  if (false) {
  }
  if (typeof Deno !== "undefined") {
    return "deno";
  }
  if (typeof Bun !== "undefined") {
    return "bun";
  }
  return "node";
}
var encoder = new TextEncoder;
var denoFFIType = {
  i32: "i32",
  ptr: "pointer",
  void: "void",
  function: "function",
  cstring: "buffer"
};
var ffiTypes = (runtime = detectRuntime()) => {
  if (runtime === "deno")
    return denoFFIType;
  if (runtime === "bun") {
    const _ffi = __require("bun:ffi").FFIType;
    return Object.keys(_ffi).reduce((ffi, key) => {
      const k = key;
      if (key in denoFFIType)
        ffi[key] = _ffi[k];
      return ffi;
    }, {});
  }
  console.warn("ffi(): Node is swig wrapped and has no ffi");
  return {};
};
function covertBunToDenoFFI(def) {
  return Object.keys(def).reduce((_def, key) => {
    _def.parameters = def.args;
    _def.result = def.returns;
    return _def;
  }, {});
}
function getSuffixDeno(os) {
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
function toCString(text, runtime = detectRuntime()) {
  if (runtime === "bun") {
    return encoder.encode(`${text}\0`);
  }
  if (runtime === "deno") {
    return encoder.encode(`${text}\0`);
  }
  return text;
}
function fromCStringPointer(pointer, runtime = detectRuntime()) {
  switch (runtime) {
    case "bun":
      const { CString } = __require("bun:ffi");
      return new CString(pointer).toString();
  }
}
var runtime = detectRuntime();
function _bind(name, fn, userArg) {
  let bindPointer;
  const _name = toCString(name);
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
  this.lib.webview_bind(this.handle, _name, bindPointer, userArg);
}
function _dispatch(fn, userArg) {
  let dispatchPointer;
  userArg = typeof userArg === "object" ? structuredClone(userArg) : userArg;
  switch (runtime) {
    case "bun":
      dispatchPointer = toBunDispatch(fn, userArg);
      break;
    case "deno":
      dispatchPointer = toDenoDispatch(fn, userArg);
      break;
  }
  this.lib.webview_dispatch(this.handle, dispatchPointer);
}
function bunBind(fn) {
  const { JSCallback, CString, read } = __require("bun:ffi");
  const ffi = ffiTypes(runtime);
  const bindCallback = new JSCallback((id, argsStringPointer, userArgPointer) => {
    const _args = fromCStringPointer(argsStringPointer);
    const _value = userArgPointer ? fromCStringPointer(userArgPointer) : null;
    const argValues = JSON.parse(_args);
    const userArgValue = _value ? JSON.parse(_value) : null;
    runBindCallback.bind(this)(id, fn, argValues, userArgValue);
  }, {
    args: [ffi.ptr, ffi.ptr, ffi.ptr],
    returns: ffi.void
  });
  return bindCallback.ptr;
}
function denoBind(fn) {
  const bindCallback = new Deno.UnsafeCallback({
    parameters: ["pointer", "pointer", "pointer"],
    result: "void"
  }, (id, argsStringPointer, userArgPointer) => {
    const _args = fromCStringPointer(argsStringPointer);
    const _value = userArgPointer ? fromCStringPointer(userArgPointer) : null;
    const argValues = JSON.parse(_args);
    const userArgValue = _value ? JSON.parse(_value) : null;
    runBindCallback.bind(this)(id, fn, argValues, userArgValue);
  });
  return bindCallback.pointer;
}
async function runBindCallback(id, fn, argValues, userValue) {
  try {
    let result = fn(...argValues, userValue || null);
    if (result instanceof Promise)
      result = await result;
    result = JSON.stringify(result);
    result = toCString(result);
    this.lib.webview_return(this.handle, id, 0, result);
  } catch (err) {
    err = JSON.stringify(err);
    err = toCString(err);
    this.lib.webview_return(this.handle, id, 1, err);
  }
}
function toBunDispatch(fn, userArg) {
  const { JSCallback } = __require("bun:ffi");
  const ffi = ffiTypes(runtime);
  const dispatchCallback = new JSCallback((id, _userArg) => {
    userArg = typeof userArg === "undefined" ? null : userArg;
    fn(userArg);
    dispatchCallback.close();
  }, {
    args: [ffi.ptr, ffi.ptr],
    returns: ffi.void
  });
  return dispatchCallback.ptr;
}
function toDenoDispatch(fn, userArg) {
  const dispatchCallback = new Deno.UnsafeCallback({
    parameters: ["pointer", "pointer"],
    result: "void"
  }, (id, _userArg) => {
    userArg = typeof userArg === "undefined" ? null : userArg;
    fn(userArg);
  });
  return dispatchCallback.pointer;
}
var runtime2 = detectRuntime();
var ffi = ffiTypes();

class FFI {
  lib;
  constructor() {
    const thisDir = dirname(import.meta.filename);
    const binDir = join(thisDir, "../../.bin");
    switch (runtime2) {
      case "node":
        const nodeLibPath = join(binDir, "libwebview.node");
        this.lib = __require(nodeLibPath);
        break;
      case "bun":
        const bunLibPath = join(binDir, "libwebview");
        this.lib = this.ffiBun(bunLibPath);
        break;
      case "deno":
        const denoLibPath = join(binDir, "libwebview");
        this.lib = this.ffiDeno(denoLibPath);
    }
  }
  ffiBun = (libPath) => {
    const { dlopen, suffix } = __require("bun:ffi");
    const path = join(`${libPath}.${suffix}`);
    const { symbols } = dlopen(path, FFIBun);
    return symbols;
  };
  ffiDeno = (libPath) => {
    const suffix = getSuffixDeno(Deno.build.os);
    const path = join(`${libPath}.${suffix}`);
    const { symbols } = Deno.dlopen(path, FFIDeno);
    return symbols;
  };
}
var FFIBun = {
  webview_create: {
    args: [ffi.i32, ffi.ptr],
    returns: ffi.ptr
  },
  webview_destroy: {
    args: [ffi.ptr],
    returns: ffi.void
  },
  webview_run: {
    args: [ffi.ptr],
    returns: ffi.void
  },
  webview_terminate: {
    args: [ffi.ptr],
    returns: ffi.void
  },
  webview_dispatch: {
    args: [ffi.ptr, ffi.ptr],
    returns: ffi.void
  },
  webview_get_window: {
    args: [ffi.ptr],
    returns: ffi.ptr
  },
  webview_get_native_handle: {
    args: [ffi.ptr, ffi.i32],
    returns: ffi.ptr
  },
  webview_set_title: {
    args: [ffi.ptr, ffi.cstring],
    returns: ffi.void
  },
  webview_set_size: {
    args: [ffi.ptr, ffi.i32, ffi.i32, ffi.i32],
    returns: ffi.void
  },
  webview_navigate: {
    args: [ffi.ptr, ffi.cstring],
    returns: ffi.void
  },
  webview_set_html: {
    args: [ffi.ptr, ffi.cstring],
    returns: ffi.void
  },
  webview_init: {
    args: [ffi.ptr, ffi.cstring],
    returns: ffi.void
  },
  webview_eval: {
    args: [ffi.ptr, ffi.cstring],
    returns: ffi.void
  },
  webview_bind: {
    args: [ffi.ptr, ffi.cstring, ffi.ptr, ffi.cstring],
    returns: ffi.void
  },
  webview_unbind: {
    args: [ffi.ptr, ffi.cstring],
    returns: ffi.void
  },
  webview_return: {
    args: [ffi.ptr, ffi.ptr, ffi.i32, ffi.cstring],
    returns: ffi.void
  }
};
var FFIDeno = (() => {
  return Object.keys(FFIBun).reduce((_FFI, key) => {
    const k = key;
    _FFI[k] = covertBunToDenoFFI(FFIBun[k]);
    return _FFI;
  }, {});
})();

class Webview extends FFI {
  handle;
  constructor(debug = false, refHandle) {
    super();
    this.handle = this.lib.webview_create(debug ? 1 : 0, refHandle ? refHandle : null);
  }
  run = () => {
    this.lib.webview_run(this.handle);
    this.lib.webview_destroy(this.handle);
    this.handle = null;
  };
  set_title = (title) => this.lib.webview_set_title(this.handle, toCString(title));
  navigate = (url) => this.lib.webview_navigate(this.handle, toCString(url));
  set_html = (html) => this.lib.webview_set_html(this.handle, toCString(html));
  set_size = (width, height, hints = 0) => this.lib.webview_set_size(this.handle, width, height, hints);
  init = (js) => this.lib.webview_init(this.handle, toCString(js));
  eval = (js) => this.lib.webview_eval(this.handle, toCString(js));
  bind = (name, fn, userArg) => _bind.bind(this)(name, fn, userArg);
  dispatch = (fn, userArg) => _dispatch.bind(this)(fn, userArg);
  unbind = (name) => this.lib.webview_unbind(this.handle, toCString(name));
  terminate = (handle = this.handle) => this.lib.webview_terminate(handle);
}

// test/run.test/run.ts
var initString = `
document.addEventListener('DOMContentLoaded', function() {
  console.log("Hello Window");
});
`;
webviewBind();
function webviewHelloWindow() {
  const webview = new Webview(true);
  webview.set_title("Hello Window");
  webview.set_size(900, 900, 0 /* HINT_NONE */);
  webview.set_html("Hello Window");
  webview.run();
}
function webviewNavigate() {
  const webview = new Webview(true);
  webview.set_title("DuckDuckGo");
  webview.set_size(900, 900, 0 /* HINT_NONE */);
  webview.navigate("https://duckduckgo.com/");
  webview.run();
}
function webviewInit() {
  const webview = new Webview(true);
  webview.set_title("webview_init");
  webview.set_size(900, 900, 0 /* HINT_NONE */);
  webview.set_html("Test Init");
  webview.init(initString);
  webview.run();
}
function webviewEval() {
  const webview = new Webview(true);
  webview.set_title("webview_eval");
  webview.set_size(900, 900, 0 /* HINT_NONE */);
  webview.set_html("Test Eval");
  webview.eval(`console.log("Hello Eval")`);
  webview.run();
}
function webviewDispatch() {
  const webview = new Webview(true);
  webview.set_title("webview_dispatch");
  webview.set_size(900, 900, 0 /* HINT_NONE */);
  webview.set_html("Test Dispatch");
  webview.dispatch((arg) => {
    console.log(arg, typeof arg);
  }, -9007199254740991n);
  webview.dispatch((arg) => {
    console.log(arg, typeof arg);
  }, 9007);
  webview.dispatch((arg) => {
    console.log(arg, typeof arg);
  }, 0.00001);
  webview.dispatch((arg) => {
    console.log(arg, typeof arg);
  }, true);
  webview.dispatch((arg) => {
    console.log(arg, typeof arg);
  }, false);
  webview.dispatch((arg) => {
    console.log(arg, typeof arg);
  }, "I am a string");
  webview.run();
}
function webviewBind() {
  const webview = new Webview(true);
  webview.set_title("webview_bind");
  webview.set_size(900, 900, 0 /* HINT_NONE */);
  webview.set_html("Test Bind");
  const bindMe = (value, userValue) => `hello from the bound side: ${value} ${userValue}`;
  webview.bind("bindMe", bindMe, "userValue");
  webview.set_html(`
    <body>Test Bind</body>
    <script>
          bindMe("foo").then(result => console.log(result))
    </script>`);
  webview.run();
}
export {
  webviewNavigate,
  webviewInit,
  webviewHelloWindow,
  webviewEval,
  webviewDispatch,
  webviewBind
};
