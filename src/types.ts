/*
import {
      type Pointer as bunPointer,
      type CString as bunCstring,
      type dlopen as bunDlopen,
      type JSCallback as bunJSCallback,
      type FFIFunction,
} from "bun:ffi";
 */
//import type { detectRuntime } from "./utils.js";

//type Fns = Record<string, FFIFunction>;

//export type runtimes = ReturnType<typeof detectRuntime>;
export enum native_handle_kind {
      /** Top-level window. GtkWindow pointer (GTK), NSWindow pointer (Cocoa) or HWND (Win32).  */
      WEBVIEW_NATIVE_HANDLE_KIND_UI_WINDOW,
      /** Browser widget. GtkWidget pointer (GTK), NSView pointer (Cocoa) or HWND (Win32).  */
      WEBVIEW_NATIVE_HANDLE_KIND_UI_WIDGET,
      //** Browser controller. WebKitWebView pointer (WebKitGTK), WKWebView pointer (Cocoa/WebKit) or ICoreWebView2Controller pointer (Win32/WebView2). */
      WEBVIEW_NATIVE_HANDLE_KIND_BROWSER_CONTROLLER,
}
export enum size_hint {
      /** Width and height are default size.  */
      WEBVIEW_HINT_NONE,
      /** Width and height are minimum bounds. */
      WEBVIEW_HINT_MIN,
      /** Width and height are maximum bounds. */
      WEBVIEW_HINT_MAX,
      /** Window size can not be changed by a user. */
      WEBVIEW_HINT_FIXED,
}

/*
export type Pointer = bunPointer;
export type JSCallback = {
      Bun: typeof bunJSCallback;
      Deno: typeof Deno.UnsafeCallback;
      Node: typeof bunJSCallback;
};
export type CString = {
      Bun: (ptr: bunPointer) => ReturnType<InstanceType<typeof bunCstring>["toString"]>;
      Deno: (
            ptr: Deno.PointerObject
      ) => ReturnType<InstanceType<typeof Deno.UnsafePointerView>["getCString"]>;
      Node: (ptr: bunPointer) => ReturnType<InstanceType<typeof bunCstring>["toString"]>;
};
export type dlopen = {
      Bun: typeof bunDlopen;
      Deno: typeof Deno.dlopen;
      Node: typeof bunDlopen;
};
export type lib = {
      Bun: ReturnType<dlopen["Bun"]>;
      Deno: ReturnType<dlopen["Deno"]>;
      Node: ReturnType<dlopen["Node"]>;
};
export type shim<T extends runtimes> = {
      dlopen: dlopen[T];
      CString: CString[T];
      JSCallback: JSCallback[T];
      lib: lib[T];
};
*/
