// Custom server for FestOS Next.js
// Avoids CLI stdin EOF exits and keeps HTTP listener permanently alive
// Zero em dashes or en dashes in any copy or comments

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Prevent event loop from ever running dry
setInterval(() => {}, 30000);

// Prevent Next.js or child libraries from quitting when stdin closes in non-interactive shells
try {
  process.stdin.resume();
  const origOn = process.stdin.on.bind(process.stdin);
  process.stdin.on = function(event, listener) {
    if (event === 'end' || event === 'close') {
      return process.stdin;
    }
    return origOn(event, listener);
  };
} catch (e) {
  // Stdin not available
}

// Block silent exits with code 0 triggered by background shell disconnection
const originalExit = process.exit.bind(process);
process.exit = function(code) {
  if (code === 0 || code === undefined) {
    console.log('[BLOCKED PROCESS.EXIT(0)] Keeping server alive in background.');
    return;
  }
  console.error(`[FATAL EXIT] Code: ${code}`);
  originalExit(code);
};

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  server.on('error', (err) => {
    console.error('[SERVER ERROR]', err);
  });

  server.listen(port, () => {
    console.log(`> FestOS live on http://${hostname}:${port}`);
  });
}).catch((err) => {
  console.error('Preparation failed:', err);
  originalExit(1);
});
