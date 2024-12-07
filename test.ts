import { dlopen, suffix } from "bun:ffi";

//console.log({ suffix });

const { symbols: lib } = dlopen("./bin/jsc.libwebview-x86_64.so", {
      webview_create: {},
      webview_destroy: {},
      webview_run: {},
      webview_terminate: {},
      webview_dispatch: {},
      webview_get_window: {},
      webview_get_native_handle: {},
      webview_set_title: {},
      webview_set_size: {},
      webview_navigate: {},
      webview_set_html: {},
      webview_init: {},
      webview_eval: {},
      webview_bind: {},
      webview_unbind: {},
      webview_return: {},
});

console.log(lib);
lib.webview_create(1, null);
