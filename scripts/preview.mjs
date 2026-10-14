// Preview the static production export with gzip, as a production CDN serves it.
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { gzipSync } from "node:zlib";
const root = resolve("out");
const port = Number(process.env.PORT || 3002);
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
};
const cache = new Map();
http
  .createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
      let file = resolve(root, "." + pathname);
      if (!file.startsWith(root + sep) && file !== root) {
        res.writeHead(403);
        res.end();
        return;
      }
      if ((await stat(file)).isDirectory()) file = resolve(file, "index.html");
      let entry = cache.get(file);
      if (!entry) {
        const data = await readFile(file);
        entry = { data, gzip: /\.(html|js|css|json|svg)$/.test(file) ? gzipSync(data) : null };
        cache.set(file, entry);
      }
      const compressed = entry.gzip && /gzip/.test(req.headers["accept-encoding"] || "");
      const body = compressed ? entry.gzip : entry.data;
      res.writeHead(200, {
        "Content-Type": mime[extname(file)] || "application/octet-stream",
        "Content-Length": body.length,
        Vary: "Accept-Encoding",
        ...(compressed ? { "Content-Encoding": "gzip" } : {}),
      });
      res.end(req.method === "HEAD" ? undefined : body);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  })
  .listen(port, "127.0.0.1", () => console.log(`Production preview: http://127.0.0.1:${port}`));
