import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import mime from 'mime-types';
import chokidar from 'chokidar';
import { fileURLToPath } from 'url';
import { discoverFilesystem } from './discovery';
import {
  readDirectory,
  searchScopedFiles,
  createFolder,
  createFile,
  renameItem,
  deleteItem,
  moveItem,
  copyItem,
  openItemInOS,
  readFilePreviewContent,
} from './filesystem';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const resourcesDir = path.resolve(projectRoot, 'resources');

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

app.use(cors());
app.use(express.json());

// Serve resources folder
app.use('/api/resources', express.static(resourcesDir, {
  maxAge: '1d',
  immutable: true,
}));

// Fallback for missing resource icons -> serve unknown.png
app.use('/api/resources', (_req, res) => {
  const fallback = path.join(resourcesDir, 'unknown.png');
  if (fs.existsSync(fallback)) {
    res.sendFile(fallback);
  } else {
    res.status(404).send('Not found');
  }
});

// 1. Filesystem Discovery API
app.get('/api/discovery', async (_req: Request, res: Response) => {
  try {
    const discovery = await discoverFilesystem(resourcesDir);
    res.json(discovery);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Discovery failed' });
  }
});

// 2. Browse Directory API
app.get('/api/browse', async (req: Request, res: Response) => {
  const targetPath = (req.query.path as string) || process.cwd();
  try {
    const result = await readDirectory(targetPath);
    res.json(result);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to read directory' });
  }
});

// 3. Search API
app.get('/api/search', async (req: Request, res: Response) => {
  const scopePath = (req.query.scope as string) || process.cwd();
  const query = (req.query.q as string) || '';
  const fileType = (req.query.type as string) || 'all';

  try {
    const results = await searchScopedFiles({
      query,
      scopePath,
      fileType,
      maxResults: 100,
    });
    res.json({ results });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Search failed' });
  }
});

// 4. Raw file streaming (with range support for audio/video/images)
app.get('/api/file/raw', (req: Request, res: Response) => {
  const filePath = req.query.path as string;
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  try {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      return res.status(400).json({ error: 'Path is a directory' });
    }

    const mimeType = mime.lookup(filePath) || 'application/octet-stream';
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': mimeType,
      });
      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': stat.size,
        'Content-Type': mimeType,
      });
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to stream file' });
  }
});

// 5. Text / Code preview content
app.get('/api/file/preview', async (req: Request, res: Response) => {
  const filePath = req.query.path as string;
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  try {
    const preview = await readFilePreviewContent(filePath);
    res.json(preview);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to read file preview' });
  }
});

// 6. Native OS Action: Open file or folder
app.post('/api/action/open', async (req: Request, res: Response) => {
  const { path: targetPath } = req.body;
  if (!targetPath || !fs.existsSync(targetPath)) {
    return res.status(404).json({ error: 'Target path not found' });
  }

  const result = await openItemInOS(targetPath);
  res.json(result);
});

// 7. Action: Create Folder
app.post('/api/action/create-folder', async (req: Request, res: Response) => {
  const { parentPath, name } = req.body;
  if (!parentPath || !name) {
    return res.status(400).json({ error: 'Parent path and folder name are required' });
  }

  const result = await createFolder(parentPath, name);
  res.json(result);
});

// 7.5 Action: Create File
app.post('/api/action/create-file', async (req: Request, res: Response) => {
  const { parentPath, name } = req.body;
  if (!parentPath || !name) {
    return res.status(400).json({ error: 'Parent path and file name are required' });
  }

  const result = await createFile(parentPath, name);
  res.json(result);
});

// 8. Action: Rename
app.post('/api/action/rename', async (req: Request, res: Response) => {
  const { path: targetPath, newName } = req.body;
  if (!targetPath || !newName) {
    return res.status(400).json({ error: 'Target path and new name are required' });
  }

  const result = await renameItem(targetPath, newName);
  res.json(result);
});

// 9. Action: Move (Drag-and-Drop)
app.post('/api/action/move', async (req: Request, res: Response) => {
  const { sourcePath, targetDirPath } = req.body;
  if (!sourcePath || !targetDirPath) {
    return res.status(400).json({ error: 'Source and target directories are required' });
  }

  const result = await moveItem(sourcePath, targetDirPath);
  res.json(result);
});

// 10. Action: Copy
app.post('/api/action/copy', async (req: Request, res: Response) => {
  const { sourcePath, targetDirPath } = req.body;
  if (!sourcePath || !targetDirPath) {
    return res.status(400).json({ error: 'Source and target directories are required' });
  }

  const result = await copyItem(sourcePath, targetDirPath);
  res.json(result);
});

// 11. Action: Delete
app.post('/api/action/delete', async (req: Request, res: Response) => {
  const { path: targetPath } = req.body;
  if (!targetPath) {
    return res.status(400).json({ error: 'Target path is required' });
  }

  const result = await deleteItem(targetPath);
  res.json(result);
});

// 12. Real-time Filesystem Watcher SSE endpoint
app.get('/api/watch', (req: Request, res: Response) => {
  const watchPath = (req.query.path as string) || '';
  if (!watchPath || !fs.existsSync(watchPath)) {
    return res.status(400).json({ error: 'Valid watch path required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  res.write(`data: ${JSON.stringify({ type: 'connected', path: watchPath })}\n\n`);

  const watcher = chokidar.watch(watchPath, {
    depth: 0,
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 300 },
  });

  const sendUpdate = (event: string, itemPath: string) => {
    res.write(`data: ${JSON.stringify({ type: 'change', event, path: itemPath, timestamp: Date.now() })}\n\n`);
  };

  watcher.on('add', (p) => sendUpdate('add', p));
  watcher.on('unlink', (p) => sendUpdate('unlink', p));
  watcher.on('addDir', (p) => sendUpdate('addDir', p));
  watcher.on('unlinkDir', (p) => sendUpdate('unlinkDir', p));
  watcher.on('change', (p) => sendUpdate('change', p));

  req.on('close', () => {
    watcher.close();
  });
});

// Mount Vite or static production dist
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        // Avoid crashing when the Vite HMR websocket port is already taken
        hmr: { port: 24678 },
      },
      appType: 'spa',
      root: projectRoot,
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(projectRoot, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  tryListen(0, isProduction);
}

// Try to bind to the requested port; if it is already in use, walk forward to
// the next free port and report clearly instead of crashing with EADDRINUSE.
function tryListen(attempt: number, isProduction: boolean) {
  const server = app.listen(PORT + attempt, () => {
    const actualPort = (server.address() as { port: number }).port;
    console.log(`[Filesystem Explorer] Server running on http://localhost:${actualPort}`);
    console.log(`[Filesystem Explorer] Mode: ${isProduction ? 'Production' : 'Development'}`);
    if (attempt > 0) {
      console.log(`[Filesystem Explorer] NOTE: Port ${PORT} was in use; using port ${actualPort} instead.`);
    }
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE' && attempt < 20) {
      const next = attempt + 1;
      console.warn(`[Filesystem Explorer] Port ${PORT + attempt} is in use, trying ${PORT + next}...`);
      tryListen(next, isProduction);
    } else {
      console.error('[Filesystem Explorer] Failed to start server:', err.message);
      process.exit(1);
    }
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
