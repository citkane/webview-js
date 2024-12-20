export function notCreatedWarning(handle: Pointer, command: string) {
      if (!!handle) return;
      console.warn(
            `\x1b[33mWebview-js warning: Must call 'create' before '${command}'\x1b[0m`
      );
}
