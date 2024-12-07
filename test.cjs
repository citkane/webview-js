const lib = require('./bin/node.libwebview-x86_64.node')
console.log(lib)

const webview = lib.webview_create(1,null)
lib.webview_run(webview)
