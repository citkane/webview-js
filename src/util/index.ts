import { detectRuntime } from "./utils.runtime.js";

export * from "./utils.runtime.js";
export * from "./utils.babelFish.js";
export * from "./log.messages.js";

export function html5(bodyInner = "Hello World") {
      return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>HTML 5 Boilerplate</title>
</head>
<body>
  ${bodyInner}
</body>
</html>
`;
}

export function makeWorker(
      fileRelativePath: string,
      listenCallback: (handle: Pointer) => void
) {
      const runtime = detectRuntime();
      if (runtime === "node") {
            const { Worker } = require("node:worker_threads");
            const { join } = require("node:path");
            const worker = new Worker(join(__dirname, fileRelativePath), {
                  workerData: {},
            });
            worker.on("message", (handle: Pointer) => listenCallback(handle));
            return worker;
      }
      const filePath = import.meta.resolve(fileRelativePath);
      if (runtime === "deno") {
            const worker = new Worker(filePath, { type: "module" });
            worker.onmessage = (event: { data: bigint }) => {
                  const pointerValue = Deno.UnsafePointer.create(event.data);
                  listenCallback(pointerValue);
            };
            return worker;
      }
      const worker = new Worker(filePath);
      worker.onmessage = (event: { data: Pointer }) => listenCallback(event.data);
      return worker;
}
