// test/run.test/run.ts
import { resolve } from "node:path";

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
var runtime = detectRuntime();
var denoFFIType = {
  i32: "i32",
  ptr: "pointer",
  void: "void",
  function: "function",
  cstring: "buffer"
};
var ffiTypes = (runtime2 = detectRuntime()) => {
  if (runtime2 === "deno")
    return denoFFIType;
  if (runtime2 === "bun") {
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
function suffixDeno(os) {
  if (os === "windows")
    return "dll";
  if (os === "darwin")
    return "dylib";
  return "so";
}
function toCString(text, runtime2 = detectRuntime()) {
  if (runtime2 === "bun" || runtime2 === "deno") {
    return encoder.encode(`${text}\0`);
  }
  return text;
}
function fromCStringPointer(pointer, runtime2 = detectRuntime()) {
  if (!pointer)
    return null;
  if (runtime2 === "bun") {
    const { CString } = __require("bun:ffi");
    return new CString(pointer).toString();
  }
  if (runtime2 === "deno") {
    const unsafePointerView = new Deno.UnsafePointerView(pointer);
    return unsafePointerView.getCString();
  }
  return pointer;
}
function getPointerFromJSCallback(JSCb) {
  if (runtime == "bun")
    return JSCb.ptr;
  if (runtime === "deno")
    return JSCb.pointer;
  return JSCb;
}
var runtime2 = detectRuntime();
function _dispatch(handle, userCb, userArg) {
  webviewJs_dispatch.bind(this)(handle, factoryFFICbDispatch(userCb, userArg));
}
function _bind(handle, name, userCb, userArg) {
  webviewJs_bind.bind(this)(handle, factoryFFICbBind(userCb), name, userArg);
}
var factoryFFICbDispatch = (userCb, userArg) => {
  const _userArg = typeof userArg === "object" ? structuredClone(userArg) : userArg;
  return {
    bun: (dispatch) => {
      const { JSCallback } = __require("bun:ffi");
      return new JSCallback((id) => {
        dispatch(id, userCb, _userArg);
      }, {
        args: ["ptr"],
        returns: "void"
      });
    },
    deno: (dispatch) => {
      return new Deno.UnsafeCallback({
        parameters: ["pointer"],
        result: "void"
      }, (id) => dispatch(id, userCb, _userArg));
    },
    node: (dispatch) => {
      return (id, arg) => {
        dispatch(id, userCb, _userArg);
      };
    }
  };
};
function webviewJs_dispatch(handle, factoryFFICallback) {
  const makeFFICbFnc = factoryFFICallback[runtime2];
  const ffiCbFnc = makeFFICbFnc((id, userCbFnc, userArg) => {
    const _userArg = typeof userArg === "undefined" ? null : userArg;
    userCbFnc(_userArg);
  });
  const fncPointer = getPointerFromJSCallback(ffiCbFnc);
  if (!handle)
    throw Error("The dispatch target handle must be given.");
  try {
    this.lib.webview_dispatch(handle, fncPointer, null);
  } catch (err) {
    console.info("This is an implementation roadblock specific to node");
    console.error(err);
  }
}
var factoryFFICbBind = (userCb) => {
  return {
    bun: (bind) => {
      const { JSCallback } = __require("bun:ffi");
      return new JSCallback((id, argsStringPointer, userArgPointer) => bind(id, argsStringPointer, userCb, userArgPointer), {
        args: ["ptr", "ptr", "ptr"],
        returns: "void"
      });
    },
    deno: (bind) => {
      return new Deno.UnsafeCallback({
        parameters: ["pointer", "pointer", "pointer"],
        result: "void"
      }, (id, argsStringPointer, userArgPointer) => bind(id, argsStringPointer, userCb, userArgPointer));
    },
    node: (bind) => {
      return (id, argsStringPointer, userArgPointer) => bind(id, argsStringPointer, userCb, userArgPointer);
    }
  };
};
function webviewJs_bind(handle, factoryFFICallback, name, userArg) {
  const _name = toCString(name);
  const argString = typeof userArg === "undefined" ? null : JSON.stringify(userArg);
  const argPointer = argString ? toCString(argString) : undefined;
  const makeFFICbFnc = factoryFFICallback[runtime2];
  const ffiCbFnc = makeFFICbFnc(async (id, argsStringPointer, userCbFnc, userArgPointer) => {
    const argString2 = fromCStringPointer(userArgPointer);
    const userArg2 = argString2 ? JSON.parse(argString2) : null;
    const argsString = fromCStringPointer(argsStringPointer);
    const argValues = JSON.parse(argsString);
    try {
      let result = userCbFnc(...argValues, userArg2);
      if (result instanceof Promise)
        result = await result;
      result = JSON.stringify(result);
      result = toCString(result);
      this.lib.webview_return(handle, id, 0, result);
    } catch (err) {
      err = JSON.stringify(err);
      err = toCString(err);
      this.lib.webview_return(handle, id, 1, err);
    }
  });
  const fncPointer = getPointerFromJSCallback(ffiCbFnc);
  try {
    this.lib.webview_bind(handle, _name, fncPointer, argPointer);
  } catch (err) {
    console.info("This is an implementation roadblock specific to node");
    console.error(err);
  }
}
function notCreatedWarning(handle, command) {
  if (!!handle)
    return;
  console.warn(`\x1B[33mWebview-js warning: Must call 'create' before '${command}'\x1B[0m`);
}
function alreadyCreatedWarning(handle) {
  if (!handle)
    return false;
  console.warn(`\x1B[33mWebview-js warning: 'create' was already called. Returning an existing handle.\x1B[0m`);
  return true;
}
var runtime3 = detectRuntime();
var ffi = ffiTypes();

class FFI {
  lib;
  constructor() {
    const thisDir = dirname(import.meta.filename);
    const binDir = join(thisDir, "../../.bin");
    switch (runtime3) {
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
    const suffix = suffixDeno(Deno.build.os);
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
  debug;
  handle;
  constructor(debug = false) {
    super();
    this.debug = debug;
  }
  create = (handle) => {
    if (alreadyCreatedWarning(this.handle))
      return this.handle;
    this.handle = this.lib.webview_create(this.debug ? 1 : 0, handle ? handle : null);
    return this.handle;
  };
  run = (handle = this.handle) => {
    if (!handle)
      throw Error("Must call `create` before `run`");
    this.lib.webview_run(handle);
    this.lib.webview_destroy(this.handle);
    this.handle = null;
  };
  set_title = (title, handle = this.handle) => {
    notCreatedWarning(handle, "set_title");
    this.lib.webview_set_title(handle, toCString(title));
  };
  navigate = (url, handle = this.handle) => {
    notCreatedWarning(handle, "navigate");
    this.lib.webview_navigate(handle, toCString(url));
  };
  set_html = (html, handle = this.handle) => {
    notCreatedWarning(handle, "set_html");
    this.lib.webview_set_html(handle, toCString(html));
  };
  set_size = (width, height, hints = 0, handle = this.handle) => {
    notCreatedWarning(handle, "set_size");
    this.lib.webview_set_size(handle, width, height, hints);
  };
  init = (js, handle = this.handle) => {
    notCreatedWarning(handle, "init");
    this.lib.webview_init(handle, toCString(js));
  };
  eval = (js, handle = this.handle) => {
    notCreatedWarning(handle, "eval");
    this.lib.webview_eval(handle, toCString(js));
  };
  bind = (name, fn, userArg, handle = this.handle) => {
    notCreatedWarning(handle, "bind");
    _bind.bind(this)(handle, name, fn, userArg);
  };
  dispatch = (handle, fn, userArg) => {
    _dispatch.bind(this)(handle, fn, userArg);
  };
  unbind = (name, handle = this.handle) => {
    notCreatedWarning(handle, "unbind");
    this.lib.webview_unbind(handle, toCString(name));
  };
  terminate = (handle) => this.lib.webview_terminate(handle);
}

// test/run.test/run.ts
var initString = `
document.addEventListener('DOMContentLoaded', function() {
  console.log("Hello Window");
});
`;
webviewChild();
function webviewChild() {
  const worker = typeof Bun !== "undefined" ? new Worker(resolve("./test/run.test/worker.run.ts")) : new Worker(import.meta.resolve("./worker.run.ts"), {
    type: "module"
  });
  const webview = new Webview;
  let handle;
  worker.onmessage = (event) => {
    handle = getHandle(event.data.pointer);
    webview.set_title("child webview", handle);
    webview.eval(`console.log("evaluated!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")`, handle);
    try {
      webview.dispatch(handle, (arg) => {
        console.log("Hello dispatch", arg);
      }, "arg");
    } catch (err) {
      console.error(err);
    }
    setTimeout(() => {
      webview.terminate(handle);
      worker.terminate();
    }, 1000);
  };
}
function getHandle(pointer) {
  return typeof Bun !== "undefined" ? pointer : Deno.UnsafePointer.create(pointer);
}
function webviewHelloWindow() {
  const webview = new Webview(true);
  webview.create();
  webview.set_title("Hello Window");
  webview.set_size(900, 900, 0 /* HINT_NONE */);
  webview.set_html("Hello Window");
  webview.run();
}
function webviewNavigate() {
  const webview = new Webview(true);
  webview.create();
  webview.set_title("DuckDuckGo");
  webview.set_size(900, 900, 0 /* HINT_NONE */);
  webview.navigate("https://duckduckgo.com/");
  webview.run();
}
function webviewInit() {
  const webview = new Webview(true);
  webview.create();
  webview.set_title("webview_init");
  webview.set_size(900, 900, 0 /* HINT_NONE */);
  webview.set_html("Test Init");
  webview.init(initString);
  webview.run();
}
function webviewEval() {
  const webview = new Webview(true);
  webview.create();
  webview.set_title("webview_eval");
  webview.set_size(900, 900, 0 /* HINT_NONE */);
  webview.set_html("Test Eval");
  webview.eval(`console.log("Hello Eval")`);
  webview.run();
}
function webviewDispatch() {
  const webview = new Webview(true);
  const handle = webview.create();
  webview.set_title("webview_dispatch");
  webview.set_size(900, 900, 0 /* HINT_NONE */);
  webview.set_html("Test Dispatch");
  webview.dispatch(handle, (arg) => {
    console.log(arg, typeof arg);
  }, -9007199254740991n);
  webview.dispatch(handle, (arg) => {
    console.log(arg, typeof arg);
  }, 9007);
  webview.dispatch(handle, (arg) => {
    console.log(arg, typeof arg);
  }, 0.00001);
  webview.dispatch(handle, (arg) => {
    console.log(arg, typeof arg);
  }, true);
  webview.dispatch(handle, (arg) => {
    console.log(arg, typeof arg);
  }, false);
  webview.dispatch(handle, (arg) => {
    console.log(arg, typeof arg);
  }, "I am a string");
  webview.run();
}
function webviewBind() {
  const webview = new Webview(true);
  webview.create();
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
  webviewChild,
  webviewBind
};
