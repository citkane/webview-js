export type data = { task: keyof typeof tasks; value?: number | string };

import { Webview } from "../../dist/src";

declare const self: Worker;
const webview = new Webview();

postMessage({ value: webview.handle } as data);
self.onmessage = (event: { data: data }) => {
      const { task, value } = event.data;
      tasks[task](value);
};

const tasks = {
      set_title(title?: number | string) {
            webview.set_title(title);
      },
      terminate(handle?: number | string) {
            webview.terminate(Number(handle!));
      },
};
