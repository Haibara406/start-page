import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const distDir = path.join(root, "dist");

async function removeAndRecreate(dir) {
    await fs.rm(dir, { recursive: true, force: true });
    await fs.mkdir(dir, { recursive: true });
}

async function copyItem(sourceRelativePath) {
    const source = path.join(root, sourceRelativePath);
    const target = path.join(distDir, sourceRelativePath);
    await fs.cp(source, target, { recursive: true });
}

await removeAndRecreate(distDir);

for (const item of ["index.html", "assets", "CNAME"]) {
    await copyItem(item);
}

console.log("Built GitHub Pages artifact in dist/");
