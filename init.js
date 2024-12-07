
if (typeof Deno !== "undefined") {
    console.log("Deno");
}
if (typeof Bun !== "undefined") {
    console.log("Bun");
}
if (typeof Bun === "undefined" && typeof process !== "undefined" && process.versions && process.versions.node) {
    console.log("Node");
}



/*
Bun:
/home/michaeladmin/code/projects/webview-js/node_modules/.bin:
/home/michaeladmin/code/projects/node_modules/.bin:
/home/michaeladmin/code/node_modules/.bin:
/home/michaeladmin/node_modules/.bin:
/home/node_modules/.bin:
/node_modules/.bin:
/home/michaeladmin/.nvm/versions/node/v22.12.0/bin:
/home/michaeladmin/.bun/bin:
/home/michaeladmin/.deno/bin:
/usr/local/bin:
/usr/bin:
/bin:
/usr/local/games:
/usr/games:
/tmp/.180ef236ec8939bd-00000001.node-gyp

Node:
/home/michaeladmin/code/projects/webview-js/node_modules/.bin:
/home/michaeladmin/code/projects/node_modules/.bin:
/home/michaeladmin/code/node_modules/.bin:
/home/michaeladmin/node_modules/.bin:
/home/node_modules/.bin:
/node_modules/.bin:
/home/michaeladmin/.nvm/versions/node/v22.12.0/lib/node_modules/npm/node_modules/@npmcli/run-script/lib/node-gyp-bin:
/home/michaeladmin/.nvm/versions/node/v22.12.0/bin:
/home/michaeladmin/.bun/bin:
/home/michaeladmin/.deno/bin:
/usr/local/bin:
/usr/bin:
/bin:
/usr/local/games:
/usr/games

*/