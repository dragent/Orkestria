/**
 * If node_modules is missing or incomplete (common after git pull or Docker volume drift),
 * run npm ci once before dev/build.
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.join(__dirname, "..");
const markers = [
  path.join(root, "node_modules", "@tanstack", "react-query", "package.json"),
  path.join(root, "node_modules", "next", "package.json"),
];

if (markers.every((p) => fs.existsSync(p))) {
  process.exit(0);
}

console.warn("[frontend] node_modules missing or incomplete — running npm ci…");
const result = spawnSync("npm ci", {
  cwd: root,
  stdio: "inherit",
  shell: true,
});
process.exit(result.status === null ? 1 : result.status);
