import { _bind, _dispatch, toCString } from "../util";
import { FFI } from "./class.FFI";
import { size_hint, type Pointer } from "../types";

export class Webview extends FFI {
      handle!: Pointer;
      constructor(debug = false, refHandle?: number) {
            super();
            this.handle = this.lib.webview_create(
                  debug ? 1 : 0,
                  refHandle ? (refHandle as Pointer) : null
            ) as Pointer;
      }
      /** Runs the main loop until it's terminated. */
      run = () => {
            this.lib.webview_run(this.handle);
            this.lib.webview_destroy(this.handle);
            this.handle = null;
      };

      /**
       * Updates the title of the native window.
       * @param title
       */
      set_title = (title: string) =>
            this.lib.webview_set_title(this.handle, toCString(title));

      /**
       * Navigates webview to the given URL. URL may be a properly encoded data URI.
       * @example ```
       * webview_navigate("https://github.com/webview/webview");
       * webview_navigate("data:text/html,%3Ch1%3EHello%3C%2Fh1%3E");
       * webview_navigate("data:text/html;base64,PGgxPkhlbGxvPC9oMT4=");
       * ```
       * @param url
       */
      navigate = (url: string) => this.lib.webview_navigate(this.handle, toCString(url));

      /**
       * Load HTML content into the webview.
       * @example ```
       * webview_set_html("<h1>Hello</h1>");
       * ```
       * @param html
       */
      set_html = (html: string) =>
            this.lib.webview_set_html(this.handle, toCString(html));

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
      set_size = (
            width: number,
            height: number,
            hints: size_hint = size_hint.HINT_NONE
      ) => this.lib.webview_set_size(this.handle, width, height, hints);

      /**
       * Injects JavaScript code to be executed immediately upon loading a page. The code will be executed before window.onload.
       * @param js
       */
      init = (js: string) => this.lib.webview_init(this.handle, toCString(js));

      /**
       * Evaluates arbitrary JavaScript code.
       *
       * Use bindings if you need to communicate the result of the evaluation.
       * @param js
       */
      eval = (js: string) => this.lib.webview_eval(this.handle, toCString(js));

      /**
       * Binds a function pointer to a new global JavaScript function.
       *
       * Internally, JS glue code is injected to create the JS function by the given name.
       * The callback function is passed a request identifier, a request string and a user-provided argument.
       * The request string is a JSON array of the arguments passed to the JS function.
       *
       * @param name
       * @param fn
       * @param userArg
       */
      bind = (name: string, fn: (...args: any[]) => void, userArg?: any) =>
            _bind.bind(this)(name, fn, userArg);

      /**
       * Schedules a function to be invoked on the thread with the run/event loop.
       * Use this function e.g. to interact with the library or native handles.
       * @param fn
       * @param userArg
       */
      dispatch = (fn: (...args: any[]) => void, userArg?: any) =>
            _dispatch.bind(this)(fn, userArg);

      /**
       * Removes a binding created with {@link bind bind()}.
       * @param name
       */
      unbind = (name: string) => this.lib.webview_unbind(this.handle, toCString(name));

      /**
       * Stops the main loop. It is safe to call this function from another other background thread.
       * @param handle The handle (pointer) of the webview instance to terminate
       */
      terminate = (handle = this.handle) => this.lib.webview_terminate(handle);
}
