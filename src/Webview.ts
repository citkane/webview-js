import koffi, { type IKoffiCType } from "koffi";
import { Bindings } from "./Bindings.js";
import { libFileName } from "./utils.js";

const lib = koffi.load(libFileName);

export class Webview extends Bindings {
      constructor(debug: boolean = false, handle?: IKoffiCType, logger = console) {
            super(lib, debug, handle, logger);
      }
}
