import { $ } from "bun";

await $`
    rm -rf ./dist
    bun ./scripts/bun.build.assets.ts
    bun build --target=node --sourcemap=external ./demo.ts --outdir ./dist --external ./src/index.js
    bun build --target=node --watch --sourcemap=external ./src --outdir ./dist
`;
