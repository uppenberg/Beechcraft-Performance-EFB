const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '../..');
const PORT = Number(process.env.TEST_PORT || 4173);
let mode = 'normal';
let updateMarker = 0;

function updatedIndex(content) {
  return Buffer.from(content.toString()
    .replace('<head>', `<head><meta name="test-release" content="${updateMarker}">`)
    .replace(/(<meta name="app-release" content=")[^"]+(">)/, `$1test-release-${updateMarker}$2`));
}

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

function sendJson(response, status, value) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(value));
}

function createTestServer() {
  return http.createServer((request, response) => {
    const requestUrl = new URL(request.url, `http://${request.headers.host || '127.0.0.1'}`);

    if (requestUrl.pathname === '/__test__/health') {
      return sendJson(response, 200, { ready: true, mode });
    }

    if (requestUrl.pathname === '/__test__/mode' && request.method === 'POST') {
      let body = '';
      request.setEncoding('utf8');
      request.on('data', (chunk) => { body += chunk; });
      request.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          if (!['normal', 'fail-workbook', 'offline', 'updated', 'updated-broken'].includes(payload.mode)) {
            return sendJson(response, 400, { error: 'Unknown test server mode.' });
          }
          mode = payload.mode;
          if (mode.startsWith('updated')) updateMarker += 1;
          sendJson(response, 200, { mode, updateMarker });
        } catch {
          sendJson(response, 400, { error: 'Invalid JSON.' });
        }
      });
      return;
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405);
      return response.end('Method not allowed');
    }

    let pathname;
    try {
      pathname = decodeURIComponent(requestUrl.pathname);
    } catch {
      response.writeHead(400);
      return response.end('Invalid path');
    }

    if (mode === 'offline') {
      response.writeHead(503, { 'cache-control': 'no-store' });
      return response.end('Simulated offline network');
    }
    if ((mode === 'fail-workbook' || mode === 'updated-broken') && /\/(?:se-ltl|se-kvl|se-mju|B190)\.xlsx$/i.test(pathname)) {
      response.writeHead(503, { 'cache-control': 'no-store' });
      return response.end('Simulated workbook download failure');
    }

    const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    let filePath = path.resolve(ROOT, relativePath);
    if (filePath !== ROOT && !filePath.startsWith(`${ROOT}${path.sep}`)) {
      response.writeHead(403);
      return response.end('Forbidden');
    }
    try {
      if (fs.statSync(filePath).isDirectory()) filePath = path.join(filePath, 'index.html');
    } catch {
      response.writeHead(404);
      return response.end('Not found');
    }

    let content;
    try {
      content = fs.readFileSync(filePath);
    } catch {
      response.writeHead(404);
      return response.end('Not found');
    }
    if (mode.startsWith('updated') && pathname.endsWith('/version.js')) {
      content = Buffer.from(`self.APP_VERSION = 'test-release-${updateMarker}';\n`);
    } else if (mode.startsWith('updated') && (pathname === '/' || pathname.endsWith('/index.html'))) {
      content = updatedIndex(content);
    } else if (mode.startsWith('updated') && pathname.endsWith('/js/app.js')) {
      content = Buffer.concat([content, Buffer.from(`\nwindow.__testRelease = ${updateMarker};\n`)]);
    } else if (mode.startsWith('updated') && pathname.endsWith('/asset-manifest.js')) {
      const sandbox = { self: {} };
      vm.runInNewContext(content.toString(), sandbox);
      const manifest = sandbox.self.EFB_ASSET_MANIFEST;
      manifest.version = `test-release-${updateMarker}`;
      for (const asset of ['./index.html', './version.js', './js/app.js']) {
        let bytes = fs.readFileSync(path.join(ROOT, asset));
        if (asset === './index.html') bytes = updatedIndex(bytes);
        if (asset === './version.js') bytes = Buffer.from(`self.APP_VERSION = 'test-release-${updateMarker}';\n`);
        if (asset === './js/app.js') bytes = Buffer.concat([bytes, Buffer.from(`\nwindow.__testRelease = ${updateMarker};\n`)]);
        manifest.hashes[asset] = crypto.createHash('sha256').update(bytes).digest('hex');
      }
      manifest.buildId = crypto.createHash('sha256').update(JSON.stringify({ version: manifest.version, hashes: manifest.hashes })).digest('hex');
      content = Buffer.from(`self.EFB_ASSET_MANIFEST = ${JSON.stringify(manifest)};\n`);
    }
    if (pathname.endsWith('/sw.js') && mode.startsWith('updated')) {
      content = Buffer.concat([content, Buffer.from(`\n// Playwright update marker ${updateMarker}\n`)]);
    }

    const headers = {
      'content-type': MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'content-length': String(content.length),
      'cache-control': pathname.endsWith('/sw.js') ? 'no-cache' : 'no-cache',
      'x-content-type-options': 'nosniff',
    };
    response.writeHead(200, headers);
    response.end(request.method === 'HEAD' ? undefined : content);
  });
}

if (require.main === module) {
  const server = createTestServer();
  server.listen(PORT, '127.0.0.1', () => {
    process.stdout.write(`Playwright test server listening on http://127.0.0.1:${PORT}\n`);
  });
}

module.exports = { createTestServer };
