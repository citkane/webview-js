import type { bunFFI } from "../types.js";

import {
      detectRuntime,
      fromCStringPointer,
      getPointerFromJSCallback,
      toCString,
} from "./index.js";

const runtime = detectRuntime();

export function dispatch(
      this: self,
      handle: Pointer,
      userCb: userCB<void>,
      userArg?: any
) {
      const JSCallbackFactory = dispatchFactory(userCb, userArg)[runtime];
      _dispatch.bind(this)(handle, JSCallbackFactory);
}
export function bind(
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
                  //if ("close" in ffiCbFnc) ffiCbFnc.close();
            }
      );
      const callbackPointer = getPointerFromJSCallback(JSCallback);

      try {
            this.lib.webview_dispatch(handle, callbackPointer, null);
      } catch (err) {
            console.log({ fn: callbackPointer.toString() });
            console.info("This is an implementation roadblock specific to node");
            console.error(err);
      }

      //jsCallback.close();
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

      const callbackPointer = getPointerFromJSCallback(JSCallback);
      try {
            this.lib.webview_bind(handle, _name, callbackPointer, argPointer as Pointer);
      } catch (err) {
            console.log({ fn: callbackPointer.toString() });
            console.info("This is an implementation roadblock specific to node");
            console.error(err);
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
