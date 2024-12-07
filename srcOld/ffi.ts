/*
export const DispatchCallback = koffi.pointer(
      koffi.proto("DispatchCallback", "void *", ["string"])
);
const BindCallback = koffi.pointer(
      koffi.proto("BindCallback", "void", ["int", "string"])
);
*/
const DispatchCallback = koffi.proto("DispatchCallback", "void", ["int", "str"]);
const BindCallback = koffi.pointer(
      koffi.proto("BindCallback", "void", ["int", "str", "str"])
);

export class FFI {
      protected lib: Record<string, KoffiFunction>;

      /*
      protected DispatchCallback = koffi.proto("DispatchCallback", "void *", [
            "int *",
            "string",
      ]);
      */
      constructor(lib: IKoffiLib, public logger = console) {
            this.lib = {
                  webview_create: lib.func("webview_create", "int *", ["int", "int *"]),
                  webview_run: lib.func("webview_run", "void", ["int *"]),
                  webview_terminate: lib.func("webview_terminate", "void", ["int *"]),
                  webview_destroy: lib.func("webview_destroy", "void", ["int *"]),
                  webview_set_title: lib.func("webview_set_title", "void", [
                        "int *",
                        "string",
                  ]),
                  webview_set_html: lib.func("webview_set_html", "void", [
                        "int *",
                        "string",
                  ]),
                  webview_navigate: lib.func("webview_navigate", "void", [
                        "int *",
                        "string",
                  ]),
                  webview_init: lib.func("webview_init", "void", ["int *", "string"]),
                  webview_eval: lib.func("webview_eval", "void", ["int *", "string"]),
                  webview_dispatch: lib.func("webview_dispatch", "void", [
                        "int *",
                        koffi.pointer(DispatchCallback),
                        "string",
                  ]),

                  webview_bind: lib.func("webview_bind", "void", [
                        "int *",
                        "string",
                        koffi.pointer(BindCallback),
                        "string",
                  ]),

                  webview_return: lib.func("webview_return", "void", [
                        "int *",
                        "string",
                        "int",
                        "string",
                  ]),
                  webview_unbind: lib.func("webview_unbind", "void", ["int *", "string"]),
                  webview_set_size: lib.func("webview_set_size", "void", [
                        "int *",
                        "int",
                        "int",
                        "int",
                  ]),
                  webview_get_window: lib.func("webview_get_window", "int *", ["int *"]),
                  webview_version: lib.func("webview_version", "void *", []),
            };
      }
      protected makeDispatchFnc = (fnc: (...args: any[]) => any) => {
            const dispatchFnc = koffi.register((_id: number, userArg: any) => {
                  if (!userArg) return fnc();
                  userArg = parseUserArg(userArg);
                  fnc(userArg);
            }, koffi.pointer(DispatchCallback));

            return dispatchFnc;
      };
      protected makeBindFnc = (
            //fnc: (...args: any[]) => any,
            _callBack: (bindId: IKoffiCType, argsString: string, userArg?: any) => void
      ) => {
            const bindFnc = koffi.register(
                  (bindId: IKoffiCType, argsString: string, userArg?: any) => {
                        if (!userArg) return _callBack(bindId, argsString);
                        userArg = parseUserArg(userArg);
                        _callBack(bindId, argsString, userArg);
                        //const argValuesString = _argsString
                        //? new this.CString(_argsString)
                        //: "";

                        //_callBack(_id, argValuesString.toString());
                  },
                  koffi.pointer(BindCallback)
            );

            return bindFnc;
      };
}
function parseUserArg(value: string) {
      const num = Number(value);
      if (!isNaN(num)) return num;
      let result;
      try {
            result = JSON.parse(value);
      } catch (err) {
            result = value;
      }
      return result;
}

/*
export function getLibWebviewSymbols<T extends runtimes>(
      libFilePath: string,
      dlopen: dlopen[T],
      runtime: T
) {
      //@ts-expect-error
      const lib = dlopen(libFilePath, symbols[runtime]);
      return lib.symbols;
}

const _symbols = {
      webview_create: {
            args: ["i32", "ptr"],
            returns: "ptr",
      },
      webview_destroy: {
            args: ["ptr"],
            returns: "void",
      },
      webview_run: {
            args: ["ptr"],
            returns: "void",
      },
      webview_terminate: {
            args: ["ptr"],
            returns: "void",
      },
      webview_dispatch: {
            args: ["ptr", "function", "ptr"],
            returns: "void",
      },
      webview_get_window: {
            args: ["ptr"],
            returns: "ptr",
      },
      webview_get_native_handle: {
            args: ["ptr", "i32"],
            returns: "ptr",
      },
      webview_set_title: {
            args: ["ptr", "cstring"],
            returns: "void",
      },
      webview_set_size: {
            args: ["ptr", "i32", "i32", "i32"],
            returns: "void",
      },
      webview_navigate: {
            args: ["ptr", "cstring"],
            returns: "void",
      },
      webview_set_html: {
            args: ["ptr", "cstring"],
            returns: "void",
      },
      webview_init: {
            args: ["ptr", "ptr"],
            returns: "void",
      },
      webview_eval: {
            args: ["ptr", "ptr"],
            returns: "void",
      },
      webview_bind: {
            args: ["ptr", "cstring", "function", "cstring"],
            returns: "void",
      },
      webview_unbind: {
            args: ["ptr", "ptr"],
            returns: "void",
      },
      webview_return: {
            args: ["ptr", "cstring", "i32", "cstring"],
            returns: "void",
      },
};
const symbols = {
      Bun: _symbols,
      Node: _symbols,
      Deno: Object.keys(_symbols).reduce((symbols, key) => {
            const k = key as keyof denoSymbols;
            const parameters = mapPtrsToDeno(_symbols[k].args);
            const result = mapPtrsToDeno([_symbols[k].returns])[0];
            symbols[k] = { parameters, result };
            return symbols;
      }, {} as denoSymbols),
};

function mapPtrsToDeno(ptrs: string[]) {
      return ptrs.map((ptr) => {
            if (ptr === "ptr") return "pointer";
            if (ptr === "cstring") return "pointer";
            return ptr as denoFFI;
      });
}
type denoSymbols = {
      [key in keyof typeof _symbols]: { parameters: denoFFI[]; result: denoFFI };
};
type denoFFI = "pointer" | "i32" | "void" | "function";
*/
