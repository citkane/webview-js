import { bind, dispatch, notCreatedWarning, toCString } from "../util/index.js";
import { FFI } from "./class.FFI.js";
import { size_hint } from "../types.js";

export class Webview extends FFI {
      handle!: Pointer;
      constructor(private debug = false) {
            super();
      }
      create(handle?: number, debug = this.debug) {
            try {
                  const newHandle = this.lib.webview_create(
                        debug ? 1 : 0,
                        handle ? (handle as Pointer) : null
                  ) as Pointer;
                  this.handle = !!this.handle ? this.handle : newHandle;
                  return newHandle;
            } catch (err) {
                  console.error(err);
                  return null;
            }
      }

      /** Runs the main loop until it's terminated. */
      run(handle = this.handle) {
            if (!handle) throw Error("Must call `create` before `run`");

            this.lib.webview_run(handle);
            this.destroy(handle);
      }
      destroy(handle: Pointer) {
            this.lib.webview_destroy(handle);
            handle = null;
      }
      /**
       * Updates the title of the native window.
       * @param title
       */
      set_title(handle: Pointer, title: string): void;
      set_title(title: string): void;
      set_title(titleOrHandle: string | Pointer, title?: string) {
            const handle = !!title ? (titleOrHandle as Pointer) : this.handle;
            notCreatedWarning(handle, "set_title");
            title = !!title ? title : (titleOrHandle as string);

            this.lib.webview_set_title(handle, toCString(title));
      }

      /**
       * Navigates webview to the given URL. URL may be a properly encoded data URI.
       * @example ```
       * webview_navigate("https://github.com/webview/webview");
       * webview_navigate("data:text/html,%3Ch1%3EHello%3C%2Fh1%3E");
       * webview_navigate("data:text/html;base64,PGgxPkhlbGxvPC9oMT4=");
       * ```
       * @param url
       */
      navigate(pointer: Pointer, url: string): void;
      navigate(url: string): void;
      navigate(urlOrHandle: string | Pointer, url?: string) {
            const handle = !!url ? (urlOrHandle as Pointer) : this.handle;
            notCreatedWarning(handle, "navigate");
            url = !!url ? url : (urlOrHandle as string);

            this.lib.webview_navigate(handle, toCString(url));
      }

      /**
       * Load HTML content into the webview.
       * @example ```
       * webview_set_html("<h1>Hello</h1>");
       * ```
       * @param html
       */
      set_html(handle: Pointer, html: string): void;
      set_html(html: string): void;
      set_html(htmlOrHandle: string | Pointer, html?: string) {
            const handle = !!html ? (htmlOrHandle as Pointer) : this.handle;
            notCreatedWarning(handle, "set_html");
            html = !!html ? html : (htmlOrHandle as string);
            this.lib.webview_set_html(handle, toCString(html));
      }

      /**
       * Updates the size of the native window.
       *
       * Remarks:
       *
       * Using HINT_MAX for setting the maximum window size is not supported with GTK 4 because X11-specific functions such as gtk_window_set_geometry_hints were removed. This option has no effect when using GTK 4.
       * @param width
       * @param height
       * @param hints type size_hint
       */
      set_size(handle: Pointer, width: number, height: number, hints?: size_hint): void;
      set_size(width: number, height: number, hints?: size_hint): void;
      set_size(
            widthOrPointer: number | Pointer,
            heightOrWidth: number,
            hintsOrHeight?: size_hint | number,
            hints?: size_hint
      ) {
            const hasHandle = !isHint(hintsOrHeight);
            const handle = hasHandle ? (widthOrPointer as Pointer) : this.handle;
            notCreatedWarning(handle, "set_size");

            const width = hasHandle ? heightOrWidth : (widthOrPointer as number);
            const height = hasHandle ? (hintsOrHeight as number) : heightOrWidth;
            hints = hasHandle ? hints : (hintsOrHeight as size_hint);
            hints = typeof hints === "undefined" ? size_hint.HINT_MIN : hints;

            this.lib.webview_set_size(handle, width, height, hints);

            function isHint(value?: number) {
                  return typeof value === "undefined"
                        ? true
                        : typeof value === "number" && value <= 3;
            }
      }

      /**
       * Injects JavaScript code to be executed immediately upon loading a page. The code will be executed before window.onload.
       * @param js
       */
      init(handle: Pointer, js: string): void;
      init(js: string): void;
      init(jsOrHandle: string | Pointer, js?: string) {
            const handle = !!js ? (jsOrHandle as Pointer) : this.handle;
            notCreatedWarning(handle, "init");
            js = !!js ? js : (jsOrHandle as string);
            this.lib.webview_init(handle, toCString(js));
      }

      /**
       * Evaluates arbitrary JavaScript code.
       *
       * Use bindings if you need to communicate the result of the evaluation.
       * @param js
       */
      eval(handle: Pointer, js: string): void;
      eval(js: string): void;
      eval(jsOrHandle: string | Pointer, js?: string) {
            const handle = !!js ? (jsOrHandle as Pointer) : this.handle;
            notCreatedWarning(handle, "eval");
            js = !!js ? js : (jsOrHandle as string);

            this.lib.webview_eval(handle, toCString(js));
      }

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
            const fn = hasHandle ? userArgOrUserCB : userCbOrName;
            userArg = hasHandle ? userArg : userArgOrUserCB;

            bind.bind(this)(handle, name, fn, userArg);
      }

      /**
       * Schedules a function to be invoked on the thread with the run/event loop.
       * Use this function e.g. to interact with the library or native handles.
       * @param userCB
       * @param userArg
       */
      dispatch = (handle: Pointer, userCB: userCB<void>, userArg?: any) => {
            dispatch.bind(this)(handle, userCB, userArg);
      };

      /**
       * Removes a binding created with {@link bind bind()}.
       * @param name
       */
      unbind(handle: Pointer, name: string): void;
      unbind(name: string): void;
      unbind(nameOrHandle: string | Pointer, name?: string) {
            const handle = !!name ? (nameOrHandle as Pointer) : this.handle;
            notCreatedWarning(handle, "unbind");
            name = !!name ? name : (nameOrHandle as string);

            this.lib.webview_unbind(handle, toCString(name));
      }

      /**
       * Stops the main loop. It is safe to call this function from another other background thread.
       * @param handle The handle (pointer) of the webview instance to terminate
       */
      terminate = (handle: Pointer) => this.lib.webview_terminate(handle);
}
