import { execSync } from "node:child_process";
import { platform } from "os";

const isWindows = platform() === "win32";

function getParentProcess(pid: number) {
      const ppid = execSync(`ps -o ppid= -p ${pid}`).toString();
      return Number(ppid);
}
function getParentProcessWin(pid: number) {
      const ppid = execSync(
            `wmic process where (ProcessId=${pid}) get ParentProcessId`
      ).toString();
      return Number(ppid);
}
function getProcessNameWin(pid: number) {
      return execSync(`tasklist /FI "PID eq ${pid}"`).toString();
}
function getProcessName(pid: number) {
      return execSync(`ps -p ${pid} -o comm=`).toString();
}

const parentPID = isWindows
      ? getParentProcessWin(process.ppid)
      : getParentProcess(process.ppid);
const parentName = isWindows ? getProcessNameWin(parentPID) : getProcessName(parentPID);

const path = process.env.PATH!;
const isNode =
      !parentName.startsWith("bun") ||
      path.includes("node-gyp-bin;") ||
      path.includes("node-gyp-bin:");

if (isNode) process.exit(1);
