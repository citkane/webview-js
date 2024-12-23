import type bunFFI from "bun:ffi";
import type { Webview } from "./constructors/class.Webview";

export { handle_kind, size_hint, type bunFFI };

declare global {
      interface libWebview extends libSwig {
            webview_bind: (
                  handle: Pointer,
                  name: Uint8Array | string,
                  fn: FunctionPointer,
                  userArg: Pointer
            ) => void;
            webview_create: (debug: 0 | 1, handle?: Pointer) => number;
            webview_destroy: (handle: Pointer) => void;
            webview_dispatch: (
                  handle: Pointer,
                  callback: FunctionPointer,
                  userArg: Pointer
            ) => void;
            webview_eval: (handle: Pointer, js: Uint8Array | string) => void;
            webview_get_native_handle: (handle: Pointer, kind: handle_kind) => number;
            webview_get_window: (handle: Pointer) => number;
            webview_init: (handle: Pointer, js: Uint8Array | string) => void;
            webview_navigate: (handle: Pointer, url: Uint8Array | string) => void;
            webview_return: (
                  handle: Pointer,
                  bindId: Pointer,
                  status: number,
                  result: Uint8Array
            ) => void;
            webview_run: (handle: Pointer) => void;
            webview_set_html: (handle: Pointer, html: Uint8Array | string) => void;
            webview_set_size: (
                  handle: Pointer,
                  width: number,
                  height: number,
                  hints: size_hint
            ) => void;
            webview_set_title: (handle: Pointer, title: Uint8Array | string) => void;
            webview_terminate: (handle: Pointer) => void;
            webview_unbind: (handle: Pointer, name: Uint8Array | string) => void;
      }
      interface libSwig {
            swig_value: (pointer: Pointer) => number;
            swig_create: (value: number) => Pointer;
            swig_jsCallback: (callBack: (w: Pointer, userArg: any) => void) => Pointer;
      }
      type runtimes = "bun" | "deno" | "node";
      type Pointer = bunFFI.Pointer | Deno.PointerValue;
      type FunctionPointer = bunFFI.Pointer | Deno.PointerObject | Function;
      type JSCallback<T extends bunFFI.JSCallback | Deno.UnsafeCallback<any> | Function> =
            T;

      type userCB<T extends any | void> = (...args: any[]) => T;
      type dispatchCB = (id: Pointer, userCb: userCB<void>, userArg?: any) => void;
      type bindCallback = (
            id: Pointer,
            argsStringPointer: Pointer | string,
            userCbFnc: userCB<any>,
            userArgPointer?: Pointer | string
      ) => void;
      type dispatchFactory = {
            [key in runtimes]: (dispatch: dispatchCB) => JSCallback<any>;
      };
      type bindFactory = {
            [key in runtimes]: (bind: bindCallback) => JSCallback<any>;
      };
}
enum handle_kind {
      /** Top-level window. GtkWindow pointer (GTK), NSWindow pointer (Cocoa) or HWND (Win32). */
      UI_WINDOW,
      /** Browser widget. GtkWidget pointer (GTK), NSView pointer (Cocoa) or HWND (Win32) */
      UI_WIDGET,
      /** Browser controller. WebKitWebView pointer (WebKitGTK), WKWebView pointer (Cocoa/WebKit) or ICoreWebView2Controller pointer (Win32/WebView2) */
      BROWSER_CONTROLLER,
}
enum size_hint {
      /** Width and height are default size. */
      HINT_NONE,
      /** Width and height are minimum bounds */
      HINT_MIN,
      /** Width and height are maximum bounds */
      HINT_MAX,
      /** Window size can not be changed by a user */
      HINT_FIXED,
}
