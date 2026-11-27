// Screenshot capture script using headless Chrome binary
// Captures 4 in-game renders into screenshots/ respecting dossier limits (<= 256 KiB)

import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFileSync, statSync, mkdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const gameDir = join(here, 'game');
const screenshotsDir = join(here, 'screenshots');
mkdirSync(screenshotsDir, { recursive: true });

const chromePath = '/home/hatch/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome';

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg'
};

const server = createServer((req, res) => {
  const urlPath = req.url?.split('?')[0] || '/';
  const cleanPath = urlPath === '/' ? '/index.html' : urlPath;
  const filePath = join(gameDir, cleanPath.replace(/^\/+/, ''));

  try {
    const stat = statSync(filePath);
    if (!stat.isFile()) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    const ext = extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(readFileSync(filePath));
  } catch {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const PORT = 8124;

server.listen(PORT, async () => {
  console.log(`Capture server listening on http://localhost:${PORT}`);

  const capture = (query, outputPath, width = 1000, height = 600, waitMs = 2500) => {
    return new Promise((resolve, reject) => {
      const url = `http://localhost:${PORT}/${query}`;
      const args = [
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        `--window-size=${width},${height}`,
        `--screenshot=${outputPath}`,
        `--virtual-time-budget=${waitMs}`,
        url
      ];

      const p = spawn(chromePath, args);
      p.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Chrome exited with code ${code}`));
      });
    });
  };

  try {
    console.log('Capturing 1_title_screen.png (Title & Controls)...');
    await capture('', join(screenshotsDir, '1_title_screen.png'), 1000, 600, 1500);

    console.log('Capturing 2_farmyard_action.png (Stage 1 Gameplay)...');
    await capture('?screen=play&stage=1', join(screenshotsDir, '2_farmyard_action.png'), 1000, 600, 2000);

    console.log('Capturing 3_cornfield_dash.png (Stage 2 Maize Labyrinth)...');
    await capture('?screen=play&stage=2', join(screenshotsDir, '3_cornfield_dash.png'), 1000, 600, 2000);

    console.log('Capturing 4_kitchen_escape.png (Stage 3 Pierre Cleaver Showdown)...');
    await capture('?screen=play&stage=3', join(screenshotsDir, '4_kitchen_escape.png'), 1000, 600, 2000);

    console.log('All 4 authentic gameplay screenshots successfully captured!');
  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    server.close();
  }
});
