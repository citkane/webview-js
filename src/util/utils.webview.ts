import type { bunFFI } from "../types";

import { detectRuntime } from "./utils.runtime";
import { fromCStringPointer, getPointerFromJSCallback, toCString } from ".";

const runtime = detectRuntime();

export function _dispatch(
      this: self,
      handle: Pointer,
      userCb: dispatchUsrCbFnc,
      userArg?: any
) {
      webviewJs_dispatch.bind(this)(handle, factoryFFICbDispatch(userCb, userArg));
}
export function _bind(
      this: self,
      handle: Pointer,
      name: string,
      userCb: bindUsrCbFnc,
      userArg?: any
) {
      webviewJs_bind.bind(this)(handle, factoryFFICbBind(userCb), name, userArg);
}

const factoryFFICbDispatch = (
      userCb: dispatchUsrCbFnc,
      userArg?: any
): factoryDispatch => {
      // Clone `userArg` from the same scope to be passed to Webview at next tick.
      const _userArg = typeof userArg === "object" ? structuredClone(userArg) : userArg;

      return {
            bun: (dispatch: dispatchCallback) => {
                  const { JSCallback } = require("bun:ffi") as typeof bunFFI;
                  return new JSCallback(
                        (id: bunFFI.Pointer) => {
                              dispatch(id, userCb, _userArg);
                        },
                        {
                              args: ["ptr"],
                              returns: "void",
                        }
                  ) as bunFFI.JSCallback;
            },
            deno: (dispatch: dispatchCallback) => {
                  return new Deno.UnsafeCallback(
                        {
                              parameters: ["pointer"],
                              result: "void",
                        },
                        (id: Deno.PointerValue) => dispatch(id, userCb, _userArg)
                  );
            },
            node: (dispatch: dispatchCallback) => {
                  return (id: number, arg: never) => {
                        dispatch(id as Pointer, userCb, _userArg);
                  };
            },
      };
};
function webviewJs_dispatch(
      this: self,
      handle: Pointer,
      factoryFFICallback: factoryDispatch
) {
      const makeFFICbFnc = factoryFFICallback[runtime];

      const ffiCbFnc = makeFFICbFnc(
            (id: Pointer, userCbFnc: dispatchUsrCbFnc, userArg?: any) => {
                  const _userArg = typeof userArg === "undefined" ? null : userArg;

                  // Pass in cloned `userArg` from the same scope.
                  // Passing it through `webview_dispatch` is a encoding / decoding nightmare!
                  // I don't see the need for it?
                  userCbFnc(_userArg);
                  //if ("close" in ffiCbFnc) ffiCbFnc.close();
            }
      );

      const fncPointer = getPointerFromJSCallback(ffiCbFnc);

      if (!handle) throw Error("The dispatch target handle must be given.");
      try {
            this.lib.webview_dispatch(handle, fncPointer, null);
      } catch (err) {
            console.info("This is an implementation roadblock specific to node");
            console.error(err);
      }

      //jsCallback.close();
}
const factoryFFICbBind = (userCb: dispatchUsrCbFnc): factoryBind => {
      return {
            bun: (bind: bindCallback) => {
                  const { JSCallback } = require("bun:ffi") as typeof bunFFI;
                  return new JSCallback(
                        (
                              id: bunFFI.Pointer,
                              argsStringPointer: bunFFI.Pointer,
                              userArgPointer?: bunFFI.Pointer
                        ) => bind(id, argsStringPointer, userCb, userArgPointer),
                        {
                              args: ["ptr", "ptr", "ptr"],
                              returns: "void",
                        }
                  );
            },
            deno: (bind: bindCallback) => {
                  return new Deno.UnsafeCallback(
                        {
                              parameters: ["pointer", "pointer", "pointer"],
                              result: "void",
                        },
                        (
                              id: Deno.PointerValue,
                              argsStringPointer: Deno.PointerValue,
                              userArgPointer?: Deno.PointerValue
                        ) => bind(id, argsStringPointer, userCb, userArgPointer)
                  );
            },
            node: (bind: bindCallback) => {
                  return (
                        id: number,
                        argsStringPointer: string,
                        userArgPointer?: string
                  ) => bind(id as Pointer, argsStringPointer, userCb, userArgPointer);
            },
      };
};

function webviewJs_bind(
      this: self,
      handle: Pointer,
      factoryFFICallback: factoryBind,
      name: string,
      userArg?: any
) {
      const _name = toCString(name);
      const argString = typeof userArg === "undefined" ? null : JSON.stringify(userArg);
      const argPointer = !!argString ? toCString(argString) : undefined;
      const makeFFICbFnc = factoryFFICallback[runtime];

      const ffiCbFnc = makeFFICbFnc(
            async (
                  id: Pointer,
                  argsStringPointer: Pointer | string,
                  userCbFnc: bindUsrCbFnc,
                  userArgPointer?: Pointer | string
            ) => {
                  const argString = fromCStringPointer(userArgPointer);
                  const userArg = !!argString ? JSON.parse(argString) : null;

                  const argsString = fromCStringPointer(argsStringPointer) as string;
                  const argValues = JSON.parse(argsString) as any[];

                  try {
                        let result = userCbFnc(...argValues, userArg);
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

      const fncPointer = getPointerFromJSCallback(ffiCbFnc);
      try {
            this.lib.webview_bind(handle, _name, fncPointer, argPointer);
      } catch (err) {
            console.info("This is an implementation roadblock specific to node");
            console.error(err);
      }
}
