import { $ } from "bun";

await $`
    rm -rf ./dist
    bun build --target=node --sourcemap=external ./src --outdir ./dist
    bun build --target=node --sourcemap=external ./src/install --outdir ./dist/src
    # bun build --target=node --sourcemap=external ./demo.ts --outdir ./dist --external ./src/index.js
    cp -R ./cmake ./dist
    # cp -R ./docs ./dist
    cp ./package.json ./dist
    cp ./LICENSE ./dist
    cp ./README.md ./dist
`;
