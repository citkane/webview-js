export const compileString = `
    npm install node-addon-api@latest
    npx node-gyp configure build -C make/node
    mkdir -p ../.bin
    cp -p make/node/build/Release/webview.node ../.bin/libwebview.node
`