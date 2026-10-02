import { spawn } from "node:child_process";
import { connect } from "node:net";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const serviceDir = fileURLToPath(new URL("../../thumbnail-service", import.meta.url));
const isWindows = process.platform === "win32";

const KAFKA = { host: "localhost", port: 9092 };
const GIVE_UP_AFTER_MS = 3 * 60 * 1000;

function kafkaIsUp() {
  return new Promise((resolve) => {
    const socket = connect(KAFKA, () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("error", () => resolve(false));
    socket.setTimeout(1500, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

const startedWaiting = Date.now();
let announced = false;
while (!(await kafkaIsUp())) {
  if (Date.now() - startedWaiting > GIVE_UP_AFTER_MS) {
    console.error(`Kafka never came up on ${KAFKA.host}:${KAFKA.port}. Is Docker running?`);
    process.exit(1);
  }
  if (!announced) {
    console.log(`Waiting for Kafka on ${KAFKA.host}:${KAFKA.port}...`);
    announced = true;
  }
  await new Promise((resolve) => setTimeout(resolve, 2000));
}

const mvnw = join(serviceDir, isWindows ? "mvnw.cmd" : "mvnw");
const app = spawn(isWindows ? `"${mvnw}"` : mvnw, ["spring-boot:run"], {
  cwd: serviceDir,
  stdio: "inherit",
  shell: isWindows,
});

app.on("exit", (code) => process.exit(code ?? 0));
