#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const BASE_DIR = __dirname;
let PORT = parseInt(process.env.PORT, 10) || 8080;

const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.js': 'text/javascript; charset=UTF-8',
    '.json': 'application/json; charset=UTF-8',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.woff2': 'font/woff2'
};

function openBrowser(url) {
    const start = (process.platform === 'darwin' ? 'open' :
                   process.platform === 'win32' ? 'start' : 'xdg-open');
    exec(`${start} ${url}`, (err) => {
        if (err) {
            // Non-critical if headless
        }
    });
}

function startServer(port) {
    const server = http.createServer((req, res) => {
        let reqPath = req.url.split('?')[0];
        if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

        const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
        const filePath = path.join(BASE_DIR, safePath);

        fs.stat(filePath, (err, stats) => {
            if (err || !stats.isFile()) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found - Truerandom Protocol Missing');
                return;
            }

            const ext = path.extname(filePath).toLowerCase();
            const contentType = MIME_TYPES[ext] || 'application/octet-stream';

            res.writeHead(200, {
                'Content-Type': contentType,
                'Cache-Control': 'no-cache'
            });

            fs.createReadStream(filePath).pipe(res);
        });
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            startServer(port + 1);
        } else {
            console.error('Server error:', err);
        }
    });

    server.listen(port, () => {
        const url = `http://localhost:${port}`;
        console.log('\x1b[36m%s\x1b[0m', `
  ╔════════════════════════════════════════════════════════════════════╗
  ║  ⚡ TRUERANDOM // THE END OF ALL DOMESTIC CIVIL WARS               ║
  ║  Quantum Death-Rolling True Randomiser Online                      ║
  ╚════════════════════════════════════════════════════════════════════╝
        `);
        console.log(`  >> Access Terminal: \x1b[32m${url}\x1b[0m`);
        console.log(`  >> Ready to settle takeaway, dishes, and coffee disputes forever.\n`);
        console.log(`  Press [Ctrl+C] to shutdown server.\n`);

        openBrowser(url);
    });
}

startServer(PORT);
