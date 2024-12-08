import { $ } from "bun";
import pkg from "../package.json";

await $`
    rm -rf ./dist/**/*.*
    bun build --target=node --sourcemap=external ./src --outdir ./dist
    bun build --target=node --sourcemap=external ./src/install --outdir ./dist/src
    cp -R ./cmake ./dist
    # cp -R ./docs ./dist
    cp ./isBun.ts ./dist
    cp ./deno.json ./dist
    cp ./LICENSE ./dist
    cp ./README.md ./dist
`;

const nodeBunInstall = "bun run isBun.ts && bun src/install/index.js || node src/install/index.js"
const package_json = Object.keys(pkg).reduce((distPkg, key) => {
      const k = key as keyof typeof pkg;
      switch (key) {
            case "scripts":
                  distPkg.scripts = { install: nodeBunInstall };
                  break;
            case "devDependencies":
                  break;
            default:
                  distPkg[key] = pkg[k];
      }
      return distPkg;
}, {} as Record<string, any>);

await Bun.write("./dist/package.json", JSON.stringify(package_json, null, "\t"));
