import { native_handle_kind, size_hint } from "./types.js";
import { toCstring, toTypedArray } from "./utils.js";
import { FFI } from "./ffi.js";
import koffi, {
      type IKoffiCType,
      type IKoffiLib,
      type IKoffiRegisteredCallback,
} from "koffi";

const lib = require("../bin/webviewjs.node");

const defaultSize: [number, number, number] = [900, 600, size_hint.WEBVIEW_HINT_NONE];
const bindCallbacks = new Map<string, IKoffiRegisteredCallback>();

export class Bindings {
      //extends FFI {
      private handle: IKoffiCType | null;

      /**
       * Creates a new {@link https://github.com/webview/webview | webview} instance.
       *
       * @param debug Enable developer tools if supported by the backend.
       */
      constructor(debug: boolean = false, handle?: IKoffiCType, logger?: Console) {
            //super(_lib, logger);

            this.handle = lib.webview_create(debug ? 1 : 0, handle || null);
            if (!this.handle) {
                  const errorMessage = `Webview creation failed. Expected to get a pointer handle, but got nothing`;
                  throw Error(errorMessage);
            }

            this.setSize(...defaultSize);
      }
      /**
       * The native handle of the window associated with the webview instance.
       * The handle can be a GtkWindow pointer (GTK), NSWindow pointer (Cocoa) or HWND (Win32)
       * depending on the OS context
       */
      get window() {
            return lib.webview_get_window(this.handle)!;
      }

      /**
       * Get a native handle of choice.
       *
       * @param kind The kind of handle to retrieve.
       * @returns The native handle (window, widget or controller) or NULL.
       */
      getNativeHandle = (
            kind = native_handle_kind.WEBVIEW_NATIVE_HANDLE_KIND_UI_WINDOW
      ) => {
            return lib.webview_get_native_handle(this.handle, kind);
      };

      /**
       * Runs the main loop until it's terminated.
       */
      run = () => {
            lib.webview_run(this.handle);
            this.destroy();
      };

      /**
       * Updates the size of the native window.
       *
       * Using WEBVIEW_HINT_MAX for setting the maximum window size is not supported with GTK 4
       * because X11-specific functions such as gtk_window_set_geometry_hints were removed.
       * This option has no effect when using GTK 4.
       *
       * @param width
       * @param height
       * @param hint
       */
      setSize = (width: number, height: number, hint: size_hint) => {
            lib.webview_set_size(this.handle, width, height, hint);
      };

      /**
       * Updates the title of the native window.
       * @param title
       */
      setTitle = (title: string) => {
            lib.webview_set_title(this.handle, toCstring(title));
      };

      /**
       * Navigates webview to the given URL. URL may be a properly encoded data URI.
       *
       * @example
       * webview_navigate("https://github.com/webview/webview");
       * webview_navigate("data:text/html,%3Ch1%3EHello%3C%2Fh1%3E");
       * webview_navigate("data:text/html;base64,PGgxPkhlbGxvPC9oMT4=");
       *
       * @param url
       */
      navigate = (url: string) => {
            lib.webview_navigate(this.handle, toCstring(url));
      };

      /**
       * Load HTML content into the webview.
       * @param html
       */
      setHtml = (html: string) => {
            lib.webview_set_html(this.handle, toCstring(html));
      };

      /**
       * Injects JavaScript code to be executed immediately upon loading a page.
       * The code will be executed before window.onload.
       *
       * @param js JS content.
       */
      init = (js: string) => {
            lib.webview_init(this.handle, toCstring(js));
      };
      /**
       * Schedules a function to be invoked on the thread with the run/event loop. Use this function e.g. to interact with the library or native handles.
       * @param fnc
       * @param userArg
       */
      dispatch(
            fnc: (...args: any[]) => any,
            userArg?: object | number | bigint | string
      ) {
            //const _userArg = this.parseUserArg(userArg);
            //const dispatchFnc = this.makeDispatchFnc(fnc);
            //lib.webview_dispatch(this.handle, dispatchFnc, _userArg);
      }

      /**
       * Binds a function pointer to a new global JavaScript function.
       *
       * Internally, JS glue code is injected to create the JS function by the given name.
       * The callback function is passed a request identifier, a request string and a user-provided argument.
       * The request string is a JSON array of the arguments passed to the JS function.
       *
       * @param name The unique name of the function as it will be named in the browser `window` context
       * @param callBack The function that will be called on the service side.
       * @param userArg An optional C/C++ user argument
       */

      bind = (name: string, callBack: (...args: any[]) => any, userArg?: string) => {
            if (bindCallbacks.has(name)) {
                  const errMessage = `"${name}" is already a registered bind callback`;
                  //return this.logger.error(Error(errMessage));
            }

            const _userArg = this.parseUserArg(userArg);

            const _callBack = async (
                  bindId: IKoffiCType,
                  argValuesString: string,
                  userArg?: any
            ) => {
                  const argValues: Parameters<typeof callBack> =
                        JSON.parse(argValuesString);
                  try {
                        const result = callBack(...argValues, userArg);
                        result instanceof Promise
                              ? result.then((result) =>
                                      this.return(bindId, 0, JSON.stringify(result))
                                )
                              : this.return(bindId, 0, JSON.stringify(result));
                  } catch (err) {
                        this.return(bindId, 1, String(err));
                  }
            };

            //const bindFnc = this.makeBindFnc(_callBack);
            //bindCallbacks.set(name, bindFnc);
            //this.lib.webview_bind(this.handle, name, bindFnc, _userArg);
      };
      /**
       * Removes a binding created with {@link bind}.
       * @param name
       */
      unbind(name: string) {
            lib.webview_unbind(this.handle, toCstring(name));
            const bindCallback = bindCallbacks.get(name);
            if (!!bindCallback) {
                  koffi.unregister(bindCallback);
            }
            bindCallbacks.delete(name);
      }

      private destroy = () => {
            bindCallbacks.forEach((bindId) => this.unbind);
            lib.webview_terminate(this.handle);
            lib.webview_destroy(this.handle);
            this.handle = null;
      };
      private create = (debug: boolean = false, window?: number) => {
            return lib.webview_create(debug ? 1 : 0, window || null);
      };
      private return = (bindId: IKoffiCType, status: number, result?: string) => {
            lib.webview_return(
                  this.handle,
                  bindId,
                  status,
                  result ? toCstring(result) : null
            );
      };

      private parseUserArg(arg?: any) {
            if (!arg) return null;

            let argString = "";
            if (typeof arg === "string") argString = arg;
            if (typeof arg === "number" || typeof arg === "bigint")
                  argString = String(arg);
            if (typeof arg === "object") argString = JSON.stringify(arg);

            if (!argString) {
                  const errorString = `user arg must be an 'object', 'number', 'bigint' or 'string'. Got '${typeof arg}'`;
                  //this.logger.warn(errorString);
                  console.trace();
                  return null;
            }
            return argString; //koffi.encode(koffi.pointer("char *"), "char *", argString);
      }
}
