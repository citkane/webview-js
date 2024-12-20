export * from "./utils.runtime.js";
export * from "./utils.babelFish.js";
export * from "./utils.webview.js";
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
