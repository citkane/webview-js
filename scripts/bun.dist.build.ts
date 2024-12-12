import { $ } from "bun";

export const rootFilesToCopy = ["deno.json", "LICENSE", "README.md"];
export const rootDirsToCopy = ["cmake"];
export const distDir = "dist";
export const srcDir = "src";

const pkgInstallString =
      "bun run src/isBun.js && bun src/install/index.js || node src/install/index.js";

await build();

export async function build() {
      await clean();
      await bunBuild();
      await copyDirs();
      await copyRootFiles();
      await makeDistPackageJson();
}

export function clean(dir = distDir) {
      return $`
      mkdir -p ${dir}
      find ${dir} -mindepth 1 -delete
      `;
}
export function bunBuild() {
      return $`
      echo "Building type definitions..."
      tsc -p ./src/tsconfig.json
      echo "Compiling TS to JS..."
      bun build --target=node --sourcemap=external ${srcDir}/isBun.js --outdir ${distDir}/src
      bun build --target=node --sourcemap=external ${srcDir} --outdir ${distDir} --splitting
      bun build --target=node --sourcemap=external ${srcDir}/install --outdir ${distDir}/src --splitting
      bun build --target=node test/run.test/run.ts --outdir test/run.test --splitting
      `;
}
export function copyDirs(sourceDirs = rootDirsToCopy, targetDir = distDir) {
      const promises = sourceDirs.map((childDir) => {
            return $`cp -Rf ${childDir} ${targetDir}`;
      });
      return Promise.all(promises);
}
export function copyRootFiles(sourceFiles = rootFilesToCopy, targetDir = distDir) {
      const promises = sourceFiles.map((sourceFile) => {
            return $`cp -f ${sourceFile} ${targetDir}`;
      });
      return Promise.all(promises);
}

export async function makeDistPackageJson() {
      const pkg = await Bun.file("package.json").json();

      const package_json = Object.keys(pkg).reduce((distPkg, key) => {
            const k = key as keyof typeof pkg;
            switch (key) {
                  case "scripts":
                        distPkg.scripts = { install: pkgInstallString };
                        break;
                  case "devDependencies":
                        break;
                  default:
                        distPkg[key] = pkg[k];
            }
            return distPkg;
      }, {} as Record<string, any>);

      return Bun.write(
            `${distDir}/package.json`,
            JSON.stringify(package_json, null, "\t")
      );
}
