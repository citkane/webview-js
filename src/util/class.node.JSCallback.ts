const lib = require("../../../.bin/libwebview.node");

export class JSCallback {
      constructor() {
            const self = new lib.swigJsCallback();
      }
      handle(self: typeof lib.swigJsCallback, a: number, b: number) {
            return a * b;
      }
}
