import { join, dirname, basename } from "node:path";
import { watch } from "fs";
import * as build from "./bun.dist.build";

const watchDir = join(import.meta.dir, "../");

const watcher = watch(watchDir, { recursive: true }, async (event, filePath) => {
      const dir = dirname(filePath!);
      const fileName = basename(filePath!);
      const action = watchAction(dir, fileName);

      if (action === "skip") return;

      console.log({ action, event, filePath });

      switch (action) {
            case "pkg":
                  await build.makeDistPackageJson();
                  break;
            case "build":
                  try {
                        await build.bunBuild();
                  } catch (err) {
                        console.error(err);
                  }
                  break;
            case "cpDir":
                  const changedDir = build.rootDirsToCopy.find((rootDir) =>
                        dir.startsWith(rootDir)
                  );
                  await build.clean(`${build.distDir}/${changedDir}`);
                  await build.copyDirs([changedDir!]);
                  break;
            case "cpFile":
                  await build.copyRootFiles([fileName]);
      }
      if (watchAction(dir, fileName)) return;

      console.log("changed", { dir, fileName });

      if (fileName === "package.json") {
            return build.makeDistPackageJson();
      }
      if (build.rootFilesToCopy.includes(fileName)) {
            return build.copyRootFiles([fileName]);
      }

      const changedDir = build.rootDirsToCopy.find((rootDir) => dir.startsWith(rootDir));
      if (changedDir) {
            build.clean(`${build.distDir}/${changedDir}`);
            build.copyDirs([changedDir]);
            return;
      }
});

function watchAction(dir: string, fileName: string) {
      if (dir.startsWith(build.distDir)) return "skip";
      if (dir.startsWith(build.srcDir)) return "build";
      if (fileName === "package.json") return "pkg";
      if (dir === "." && build.rootFilesToCopy.includes(fileName)) return "cpFile";
      if (!!build.rootDirsToCopy.find((rootDir) => dir.startsWith(rootDir)))
            return "cpDir";

      return "skip";
}

// close watcher when Ctrl-C is pressed
process.on("SIGINT", () => {
      console.log("Closing watcher...");
      watcher.close();

      process.exit(0);
});
