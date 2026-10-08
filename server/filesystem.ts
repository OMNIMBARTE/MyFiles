import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import mime from 'mime-types';
import { execFile } from 'child_process';
import os from 'os';
import { FilesystemEntry, DirectoryContentResult, SearchOptions } from './types';
import { formatBytes } from './discovery';
import { getFolderCategoryAndIcon, getFileCategoryAndIcon } from './smartIcons';

// Open file or folder with native operating system handler
export function openItemInOS(targetPath: string): Promise<{ success: boolean; message?: string }> {
  return new Promise((resolve) => {
    const platform = os.platform();
    let command = 'xdg-open';
    let args = [targetPath];

    if (platform === 'win32') {
      command = 'cmd.exe';
      args = ['/c', 'start', '""', targetPath];
    } else if (platform === 'darwin') {
      command = 'open';
      args = [targetPath];
    }

    execFile(command, args, (error) => {
      if (error) {
        resolve({ success: false, message: error.message });
      } else {
        resolve({ success: true });
      }
    });
  });
}

// Generate interactive breadcrumb list for any absolute path
export function generateBreadcrumbs(targetPath: string): { name: string; path: string }[] {
  const normalized = path.resolve(targetPath);
  const parts = normalized.split(path.sep).filter(Boolean);
  const breadcrumbs: { name: string; path: string }[] = [];

  if (os.platform() === 'win32') {
    let current = '';
    for (let i = 0; i < parts.length; i++) {
      current = i === 0 ? parts[0] + path.sep : path.join(current, parts[i]);
      breadcrumbs.push({
        name: parts[i],
        path: current,
      });
    }
  } else {
    // Unix-like root
    breadcrumbs.push({ name: 'Root', path: '/' });
    let current = '';
    for (const part of parts) {
      current += '/' + part;
      breadcrumbs.push({
        name: part,
        path: current,
      });
    }
  }

  return breadcrumbs;
}

// Read directory contents and rich metadata
export async function readDirectory(targetPath: string): Promise<DirectoryContentResult> {
  const resolved = path.resolve(targetPath);
  let realPath = resolved;

  try {
    realPath = await fs.realpath(resolved);
  } catch {
    realPath = resolved;
  }

  if (!existsSync(realPath)) {
    return {
      currentPath: resolved,
      realPath,
      parentPath: path.dirname(resolved) !== resolved ? path.dirname(resolved) : null,
      breadcrumbs: generateBreadcrumbs(resolved),
      entries: [],
      totalItems: 0,
      totalSize: 0,
      formattedTotalSize: '0 B',
      error: `Directory not found or inaccessible: ${resolved}`,
    };
  }

  try {
    const dirents = await fs.readdir(realPath, { withFileTypes: true });
    const entries: FilesystemEntry[] = [];
    let totalSize = 0;

    for (const dirent of dirents) {
      const itemPath = path.join(realPath, dirent.name);
      const isHidden = dirent.name.startsWith('.');
      const isDir = dirent.isDirectory();
      const isFile = dirent.isFile();
      const isSymlink = dirent.isSymbolicLink();

      try {
        const stats = await fs.stat(itemPath);
        const ext = path.extname(dirent.name);
        const mimeType = isFile ? (mime.lookup(dirent.name) || null) : null;
        totalSize += stats.size;

        let childCount: number | undefined = undefined;
        let subNames: string[] = [];

        if (isDir) {
          try {
            const subEntries = await fs.readdir(itemPath);
            childCount = subEntries.length;
            subNames = subEntries.slice(0, 10);
          } catch {
            childCount = 0;
          }
        }

        const { category, icon } = isDir
          ? getFolderCategoryAndIcon(dirent.name, subNames)
          : getFileCategoryAndIcon(dirent.name, mimeType);

        let realItemPath = itemPath;
        if (isSymlink) {
          try {
            realItemPath = await fs.realpath(itemPath);
          } catch {
            // ignore
          }
        }

        entries.push({
          id: itemPath,
          name: dirent.name,
          path: itemPath,
          realPath: realItemPath,
          isDirectory: isDir,
          isFile,
          isSymlink,
          size: stats.size,
          formattedSize: isDir ? `${childCount ?? 0} items` : formatBytes(stats.size),
          extension: ext,
          mimeType,
          category,
          resourceIcon: icon,
          createdAt: stats.birthtime.toISOString(),
          modifiedAt: stats.mtime.toISOString(),
          accessedAt: stats.atime.toISOString(),
          isHidden,
          childCount,
        });
      } catch {
        // Skip permission errors on individual items
      }
    }

    const parentPath = path.dirname(resolved) !== resolved ? path.dirname(resolved) : null;

    return {
      currentPath: resolved,
      realPath,
      parentPath,
      breadcrumbs: generateBreadcrumbs(resolved),
      entries,
      totalItems: entries.length,
      totalSize,
      formattedTotalSize: formatBytes(totalSize),
    };
  } catch (err: unknown) {
    return {
      currentPath: resolved,
      realPath,
      parentPath: path.dirname(resolved) !== resolved ? path.dirname(resolved) : null,
      breadcrumbs: generateBreadcrumbs(resolved),
      entries: [],
      totalItems: 0,
      totalSize: 0,
      formattedTotalSize: '0 B',
      error: `Unable to read folder: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

// Scoped recursive search within target folder
export async function searchScopedFiles(options: SearchOptions): Promise<FilesystemEntry[]> {
  const { query, scopePath, fileType, maxResults = 100 } = options;
  const qLower = query.toLowerCase().trim();
  const results: FilesystemEntry[] = [];

  if (!existsSync(scopePath)) return [];

  async function walk(dir: string, depth: number) {
    if (depth > 6 || results.length >= maxResults) return;

    try {
      const dirents = await fs.readdir(dir, { withFileTypes: true });
      for (const d of dirents) {
        if (results.length >= maxResults) break;
        if (d.name === 'node_modules' || d.name === '.git' || d.name === '$RECYCLE.BIN') continue;

        const fullPath = path.join(dir, d.name);
        const nameLower = d.name.toLowerCase();
        const matchesQuery = !qLower || nameLower.includes(qLower);

        const isDir = d.isDirectory();
        const ext = path.extname(d.name);
        const mimeType = !isDir ? (mime.lookup(d.name) || null) : null;
        const { category, icon } = isDir
          ? getFolderCategoryAndIcon(d.name)
          : getFileCategoryAndIcon(d.name, mimeType);

        const matchesType = !fileType || fileType === 'all' || category === fileType;

        if (matchesQuery && matchesType) {
          try {
            const stats = await fs.stat(fullPath);
            results.push({
              id: fullPath,
              name: d.name,
              path: fullPath,
              isDirectory: isDir,
              isFile: !isDir,
              isSymlink: d.isSymbolicLink(),
              size: stats.size,
              formattedSize: isDir ? 'Folder' : formatBytes(stats.size),
              extension: ext,
              mimeType,
              category,
              resourceIcon: icon,
              createdAt: stats.birthtime.toISOString(),
              modifiedAt: stats.mtime.toISOString(),
              isHidden: d.name.startsWith('.'),
            });
          } catch {
            // ignore
          }
        }

        if (isDir) {
          await walk(fullPath, depth + 1);
        }
      }
    } catch {
      // ignore
    }
  }

  await walk(scopePath, 0);
  return results;
}

// Safe file creation
export async function createFile(parentPath: string, fileName: string): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    const cleanName = fileName.trim().replace(/[/\\?%*:|"<>]/g, '_');
    if (!cleanName) return { success: false, error: 'Invalid file name' };
    const targetPath = path.join(parentPath, cleanName);
    if (existsSync(targetPath)) {
      return { success: false, error: 'A file or folder with that name already exists' };
    }
    await fs.writeFile(targetPath, '', { encoding: 'utf-8' });
    return { success: true, path: targetPath };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// Safe folder creation
export async function createFolder(parentPath: string, folderName: string): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    const cleanName = folderName.trim().replace(/[/\\?%*:|"<>]/g, '_');
    if (!cleanName) return { success: false, error: 'Invalid folder name' };
    const targetPath = path.join(parentPath, cleanName);
    if (existsSync(targetPath)) {
      return { success: false, error: 'A file or folder with that name already exists' };
    }
    await fs.mkdir(targetPath, { recursive: true });
    return { success: true, path: targetPath };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// Safe rename
export async function renameItem(targetPath: string, newName: string): Promise<{ success: boolean; newPath?: string; error?: string }> {
  try {
    const cleanName = newName.trim().replace(/[/\\?%*:|"<>]/g, '_');
    if (!cleanName) return { success: false, error: 'Invalid name' };
    const parentDir = path.dirname(targetPath);
    const destinationPath = path.join(parentDir, cleanName);
    if (existsSync(destinationPath)) {
      return { success: false, error: 'Destination already exists' };
    }
    await fs.rename(targetPath, destinationPath);
    return { success: true, newPath: destinationPath };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// Safe move (e.g. for drag-and-drop)
export async function moveItem(sourcePath: string, targetDirPath: string): Promise<{ success: boolean; newPath?: string; error?: string }> {
  try {
    const baseName = path.basename(sourcePath);
    const destinationPath = path.join(targetDirPath, baseName);
    if (existsSync(destinationPath)) {
      return { success: false, error: 'An item with the same name already exists in target destination' };
    }
    await fs.rename(sourcePath, destinationPath);
    return { success: true, newPath: destinationPath };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// Safe copy
export async function copyItem(sourcePath: string, targetDirPath: string): Promise<{ success: boolean; newPath?: string; error?: string }> {
  try {
    const baseName = path.basename(sourcePath);
    const destinationPath = path.join(targetDirPath, `Copy of ${baseName}`);
    await fs.cp(sourcePath, destinationPath, { recursive: true });
    return { success: true, newPath: destinationPath };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// Safe delete
export async function deleteItem(targetPath: string): Promise<{ success: boolean; error?: string }> {
  try {
    const stat = await fs.stat(targetPath);
    if (stat.isDirectory()) {
      await fs.rm(targetPath, { recursive: true, force: true });
    } else {
      await fs.unlink(targetPath);
    }
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// Read text or code content for preview (safe size limits)
export async function readFilePreviewContent(filePath: string, maxBytes = 250000): Promise<{ content: string; truncated: boolean; lines: number; error?: string }> {
  try {
    const stat = await fs.stat(filePath);
    if (stat.size > 5000000) {
      return { content: '', truncated: true, lines: 0, error: 'File is too large for text preview (> 5MB)' };
    }
    const fd = await fs.open(filePath, 'r');
    const buffer = Buffer.alloc(Math.min(stat.size, maxBytes));
    const { bytesRead } = await fd.read(buffer, 0, buffer.length, 0);
    await fd.close();

    const content = buffer.toString('utf-8', 0, bytesRead);
    const lines = content.split('\n').length;
    return {
      content,
      truncated: stat.size > maxBytes,
      lines,
    };
  } catch (err: unknown) {
    return { content: '', truncated: false, lines: 0, error: err instanceof Error ? err.message : String(err) };
  }
}

