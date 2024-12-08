const path = process.env.PATH!
if(path.includes("node-gyp-bin;") || path.includes("node-gyp-bin:")) process.exit(1)