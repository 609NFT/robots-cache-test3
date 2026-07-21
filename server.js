const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

http.createServer((req, res) => {
  try {
    let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    if (urlPath === '/') urlPath = '/index.html';
    const servedPath = urlPath.startsWith('/images/') ? path.join('/public', urlPath) : urlPath;
    let filePath = path.join(__dirname, servedPath);
    // prevent path escape
    if (!filePath.startsWith(__dirname)) filePath = path.join(__dirname, 'index.html');
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(__dirname, 'index.html');
    }
    const ext = path.extname(filePath);
    const body = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(body);
  } catch (e) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<html><body style="background:#0a0a0f;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh"><h1>Setting up...</h1></body></html>');
  }
}).listen(PORT, () => console.log('Server ready on port ' + PORT));
