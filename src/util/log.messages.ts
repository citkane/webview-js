import type { bunFFI } from "../types.js";

export function notCreatedWarning(handle: Pointer, command: string) {
      if (!!handle) return false;
      const error = Error(`\x1b[33mMust call 'create' before '${command}'\x1b[0m`);
      console.warn(error);
      return true;
}

export function unsetBindWarning(
      name: string,
      bindMap: Map<string, JSCallback<Deno.UnsafeCallback | bunFFI.JSCallback>>
) {
      if (bindMap.has(name)) return false;
      const error = Error(`
\x1b[33mNo function named "${name}" has been bound on this thread.
'bind' and 'unbind' must be managed on the same thread.\x1b[0m
      `);
      console.warn(error);
      return true;
}
