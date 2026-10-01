import { spawn, spawnSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const backendDir = fileURLToPath(new URL("../../backend-spring", import.meta.url));
const isWindows = process.platform === "win32";

const infra = spawnSync("docker", ["compose", "up", "-d"], {
  cwd: backendDir,
  stdio: "inherit",
});
if (infra.status !== 0) {
  console.error("docker compose failed. Is Docker running?");
  process.exit(infra.status ?? 1);
}

const mvnw = join(backendDir, isWindows ? "mvnw.cmd" : "mvnw");
const app = spawn(isWindows ? `"${mvnw}"` : mvnw, ["spring-boot:run"], {
  cwd: backendDir,
  stdio: "inherit",
  shell: isWindows,
});

app.on("exit", (code) => process.exit(code ?? 0));
