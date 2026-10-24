import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const root = process.cwd();
const port = Number(process.env.PORT || 4173);
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png" };

createServer((request, response) => {
  const requested = decodeURIComponent((request.url || "/").split("?")[0]);
  const relative = requested === "/" ? "index.html" : requested.replace(/^\/+/, "");
  const path = normalize(join(root, relative));
  if (!path.startsWith(root) || !existsSync(path) || statSync(path).isDirectory()) {
    response.writeHead(404).end("Not found");
    return;
  }
  response.setHeader("Content-Type", types[extname(path)] || "application/octet-stream");
  response.setHeader("Cache-Control", "no-store");
  createReadStream(path).pipe(response);
}).listen(port, "127.0.0.1", () => {
  console.log(`Local preview: http://127.0.0.1:${port}`);
});
