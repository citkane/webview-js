import { $ } from "bun";

await $`
    rm -rf ./build
    bun build --target=node --sourcemap=external ./src --outdir ./build
    bun build --target=node --sourcemap=external ./demo.ts --outdir ./build --external ./src/index.js
    bun ./scripts/bun.build.assets.ts
`;
