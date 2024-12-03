import { $ } from "bun";

await $`
    rm -rf ./build
    bun ./scripts/bun.build.assets.ts
    bun build --target=node --sourcemap=external ./demo.ts --outdir ./build --external ./src/index.js
    bun build --target=node --watch --sourcemap=external ./src --outdir ./build
`;
