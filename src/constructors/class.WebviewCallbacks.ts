import type { bunFFI } from "../types.js";

import { FFI } from "./class.FFI.js";
import {
      detectRuntime,
      fromCStringPointer,
      getPointerFromJSCallback,
      notCreatedWarning,
      toCString,
      unsetBindWarning,
} from "../util/index.js";

const runtime = detectRuntime();

// Keep a registry of `bind` JSCallbacks so that they can be retrieved to `close()`
// ie. release their memory when no longer required.
const bindCallbacks = new Map<
      string,
      JSCallback<Deno.UnsafeCallback | bunFFI.JSCallback>
>();

export class WebviewCallbacks extends FFI {
      handle!: Pointer;
      constructor() {
            super();
      }
      /**
       * Schedules a function to be invoked on the thread with the run/event loop.
       * Use this function e.g. to interact with the library or native handles.
       * @param userCB
       * @param userArg
       */
      dispatch = (handle: Pointer, userCB: userCB<void>, userArg?: any) => {
            const JSCallbackFactory = dispatchFactory(userCB, userArg)[runtime];
            const JSCallback = JSCallbackFactory(
                  (id: Pointer, userCB: userCB<void>, userArg: any | null) => {
                        userCB(userArg);
                        closeJSCallback(JSCallback as JSCallback<any>);
                  }
            );
            const callbackPointer = getPointerFromJSCallback(JSCallback)!;

            try {
                  this.lib.webview_dispatch(handle, callbackPointer, null);
            } catch (err) {
                  console.error(err);
            }
      };

      /**
       * Binds a function pointer to a new global JavaScript function.
       *
       * Internally, JS glue code is injected to create the JS function by the given name.
       * The callback function is passed a request identifier, a request string and a user-provided argument.
       * The request string is a JSON array of the arguments passed to the JS function.
       *
       * @param name
       * @param userCB
       * @param userArg
       */
      bind(handle: Pointer, name: string, userCB: userCB<any>, userArg?: any): void;
      bind(name: string, userCB: userCB<any>, userArg?: any): void;
      bind(
            nameOrHandle: string | Pointer,
            userCbOrName: userCB<any> | string,
            userArgOrUserCB?: any | userCB<any>,
            userArg?: any
      ) {
            const hasHandle = typeof nameOrHandle !== "string";
            const handle = hasHandle ? nameOrHandle : this.handle;
            notCreatedWarning(handle, "bind");
            const name = hasHandle ? (userCbOrName as string) : (nameOrHandle as string);
            const userCB = hasHandle ? userArgOrUserCB : userCbOrName;
            userArg = hasHandle ? userArg : userArgOrUserCB;

            const JSCallbackFactory = bindFactory(userCB)[runtime];
            //_bind.bind(this)(handle, JSCallbackFactory, name, userArg);
            const _name = toCString(name);
            const noUserArg = typeof userArg === "undefined";
            const argString = noUserArg ? undefined : JSON.stringify(userArg);
            const argPointer = argString === undefined ? null : toCString(argString);

            const JSCallback = JSCallbackFactory(
                  async (
                        id: Pointer,
                        argsStringPointer: Pointer | string,
                        userCb: userCB<any>,
                        userArgPointer?: Pointer | string
                  ) => {
                        const argString = fromCStringPointer(userArgPointer);
                        const userArg = !!argString ? JSON.parse(argString) : null;

                        const argsString = fromCStringPointer(argsStringPointer);
                        const argValues = JSON.parse(argsString!) as any[];

                        try {
                              let result = userCb(...argValues, userArg) || "";
                              if (result instanceof Promise) result = await result;
                              result = JSON.stringify(result);
                              result = toCString(result);

                              this.lib.webview_return(handle, id, 0, result);
                        } catch (err: any) {
                              err = JSON.stringify(err || "");
                              err = toCString(err);

                              this.lib.webview_return(handle, id, 1, err);
                        }
                  }
            );

            const callbackPointer = getPointerFromJSCallback(JSCallback)!;
            try {
                  this.lib.webview_bind(
                        handle,
                        _name,
                        callbackPointer,
                        argPointer as Pointer
                  );
                  setBindJSCallback(name, JSCallback);
            } catch (err) {
                  //console.log({ fn: callbackPointer.toString() });
                  //console.info("This is an implementation roadblock specific to node");
                  console.error(err);
            }
      }

      /**
       * Removes a binding created with {@link bind bind()}.
       * @param name
       */
      unbind(handle: Pointer, name: string): void;
      unbind(name: string): void;
      unbind(nameOrHandle: string | Pointer, name?: string) {
            const handle = !!name ? (nameOrHandle as Pointer) : this.handle;
            if (notCreatedWarning(handle, "unbind")) return;

            name = !!name ? name : (nameOrHandle as string);
            if (unsetBindWarning(name, bindCallbacks)) return;

            this.lib.webview_unbind(handle, toCString(name));
            unsetBindJSCallback(name);
      }

      destroy(handle: Pointer) {
            this.lib.webview_destroy(handle);
            if (handle === this.handle) {
                  bindCallbacks.forEach((JSCallback) => JSCallback.close());
                  bindCallbacks.clear();
            }
            handle = null;
      }
}

function dispatchFactory(userCb: userCB<void>, userArg?: any) {
      // Clone `userArg` from the same scope to be passed to Webview at next tick.
      // Passing it through `webview_dispatch` is a encoding / decoding nightmare!
      // I don't see the need for it?
      const _userArg =
            typeof userArg === "undefined"
                  ? null
                  : typeof userArg === "object"
                  ? structuredClone(userArg)
                  : userArg;

      return {
            bun: (dispatchCB: dispatchCB) => {
                  const { JSCallback } = require("bun:ffi") as typeof bunFFI;
                  return new JSCallback(
                        (id: bunFFI.Pointer) => {
                              dispatchCB(id, userCb, _userArg);
                        },
                        {
                              args: ["ptr"],
                              returns: "void",
                        }
                  ) as bunFFI.JSCallback;
            },
            deno: (dispatchCB: dispatchCB) => {
                  return new Deno.UnsafeCallback(
                        {
                              parameters: ["pointer"],
                              result: "void",
                        },
                        (id: Deno.PointerValue) => {
                              dispatchCB(id, userCb, _userArg);
                        }
                  );
            },
            node: (dispatchCB: dispatchCB) => {
                  return (id: number, arg: never) => {
                        dispatchCB(id as Pointer, userCb, _userArg);
                  };
            },
      };
}

function bindFactory(userCb: userCB<any>) {
      return {
            bun: (bindCb: bindCallback) => {
                  const { JSCallback } = require("bun:ffi") as typeof bunFFI;
                  return new JSCallback(
                        (
                              id: bunFFI.Pointer,
                              argsStringPointer: bunFFI.Pointer,
                              userArgPointer?: bunFFI.Pointer
                        ) => bindCb(id, argsStringPointer, userCb, userArgPointer),
                        {
                              args: ["ptr", "ptr", "ptr"],
                              returns: "void",
                        }
                  );
            },
            deno: (bindCB: bindCallback) => {
                  return new Deno.UnsafeCallback(
                        {
                              parameters: ["pointer", "pointer", "pointer"],
                              result: "void",
                        },
                        (
                              id: Deno.PointerValue,
                              argsStringPointer: Deno.PointerValue,
                              userArgPointer?: Deno.PointerValue
                        ) => bindCB(id, argsStringPointer, userCb, userArgPointer)
                  );
            },
            node: (bindCB: bindCallback) => {
                  return (id: object, argsString: string, userArg?: any | null) => {
                        bindCB(id as Pointer, argsString, userCb, userArg);
                  };
            },
      };
}

function unsetBindJSCallback(name: string) {
      if (runtime === "node") return;
      const JSCallback = bindCallbacks.get(name)!;
      bindCallbacks.delete(name);
      JSCallback.close();
}
function setBindJSCallback(name: string, JSCallback: JSCallback<any>) {
      if (runtime === "node") return;
      if (bindCallbacks.has(name)) {
            const error = Error(`Function with name "${name}" is already bound.`);
            console.warn(error);
            return;
      }
      bindCallbacks.set(name, JSCallback);
}
function closeJSCallback(
      JSCallback: JSCallback<Deno.UnsafeCallback | bunFFI.JSCallback>
) {
      if (runtime === "node") return;
      setTimeout(() => JSCallback.close());
}

/*
function dispatch(this: self, handle: Pointer, userCb: userCB<void>, userArg?: any) {
      const JSCallbackFactory = dispatchFactory(userCb, userArg)[runtime];
      _dispatch.bind(this)(handle, JSCallbackFactory);
}
function bind(
      this: self,
      handle: Pointer,
      name: string,
      userCb: userCB<any>,
      userArg?: any
) {
      const JSCallbackFactory = bindFactory(userCb)[runtime];
      _bind.bind(this)(handle, JSCallbackFactory, name, userArg);
}

function _dispatch(
      this: self,
      handle: Pointer,
      JSCallbackFactory: dispatchFactory[typeof runtime]
) {
      const JSCallback = JSCallbackFactory(
            (id: Pointer, userCB: userCB<void>, userArg: any | null) => {
                  userCB(userArg);
                  closeJSCallback(JSCallback);
            }
      );
      const callbackPointer = getPointerFromJSCallback(JSCallback)!;
      try {
            this.lib.webview_dispatch(handle, callbackPointer, null);
      } catch (err) {
            console.error(err);
      }
}

function _bind(
      this: self,
      handle: Pointer,
      JSCallbackFactory: bindFactory[typeof runtime],
      name: string,
      userArg?: any
) {
      const _name = toCString(name);
      const noUserArg = typeof userArg === "undefined";
      const argString = noUserArg ? undefined : JSON.stringify(userArg);
      const argPointer = argString === undefined ? null : toCString(argString);

      const JSCallback = JSCallbackFactory(
            async (
                  id: Pointer,
                  argsStringPointer: Pointer | string,
                  userCb: userCB<any>,
                  userArgPointer?: Pointer | string
            ) => {
                  const argString = fromCStringPointer(userArgPointer);
                  const userArg = !!argString ? JSON.parse(argString) : null;

                  const argsString = fromCStringPointer(argsStringPointer);
                  const argValues = JSON.parse(argsString!) as any[];

                  try {
                        let result = userCb(...argValues, userArg);
                        if (result instanceof Promise) result = await result;
                        result = JSON.stringify(result);
                        result = toCString(result);

                        this.lib.webview_return(handle, id, 0, result);
                  } catch (err: any) {
                        err = JSON.stringify(err);
                        err = toCString(err);

                        this.lib.webview_return(handle, id, 1, err);
                  }
            }
      );

      const callbackPointer = getPointerFromJSCallback(JSCallback)!;
      try {
            this.lib.webview_bind(handle, _name, callbackPointer, argPointer as Pointer);
      } catch (err) {
            //console.log({ fn: callbackPointer.toString() });
            //console.info("This is an implementation roadblock specific to node");
            console.error(err);
      }
}
*/
