export function notCreatedWarning(handle: Pointer, command: string) {
      if (!!handle) return;
      console.warn(
            `\x1b[33mWebview-js warning: Must call 'create' before '${command}'\x1b[0m`
      );
}
export function alreadyCreatedWarning(handle: Pointer) {
      if (!handle) return false;
      console.warn(
            `\x1b[33mWebview-js warning: 'create' was already called. Returning an existing handle.\x1b[0m`
      );
      return true;
}
