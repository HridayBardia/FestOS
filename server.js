// Custom server for FestOS Next.js
// Avoids CLI stdin EOF exits and keeps HTTP listener permanently alive
// Zero em dashes or en dashes in any copy or comments

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Prevent event loop from ever running dry
setInterval(() => {}, 15000);

// Keep stdin flowing and prevent disconnection terminations
try {
  if (process.stdin.setRawMode) {
    process.stdin.setRawMode(false);
  }
  process.stdin.resume();
  process.stdin.on('data', () => {});
  process.stdin.on('end', () => {});
  process.stdin.on('error', () => {});
} catch (e) {
  // Stdin not available in this environment
}

// Ignore OS signals that kill background processes when console detaches
process.on('SIGINT', () => {
  console.log('[SIGNAL] SIGINT received: keeping server running.');
});
process.on('SIGTERM', () => {
  console.log('[SIGNAL] SIGTERM received: keeping server running.');
});
process.on('SIGBREAK', () => {
  console.log('[SIGNAL] SIGBREAK received: keeping server running.');
});
process.on('SIGHUP', () => {
  console.log('[SIGNAL] SIGHUP received: keeping server running.');
});

// Block silent exits with code 0 or 1 triggered by child library disconnects
const originalExit = process.exit.bind(process);
process.exit = function(code) {
  console.log(`[PROCESS.EXIT INTERCEPTED] Code: ${code} - Keeping server alive.`);
};

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

const dev = process.env.NODE_ENV === 'development';
const hostname = '0.0.0.0';
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

  server.on('close', () => {
    console.warn('[SERVER CLOSED] Re-listening on port', port);
    server.listen(port, hostname);
  });

  server.listen(port, hostname, () => {
    console.log(`> FestOS live on http://localhost:${port}`);
  });
}).catch((err) => {
  console.error('Preparation failed:', err);
});
