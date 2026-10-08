import os from 'os';
import path from 'path';
import fs from 'fs/promises';
import { existsSync, readdirSync } from 'fs';
import { FilesystemEntry, SystemDiscoveryResult, SystemLocation } from './types';
import { getFolderCategoryAndIcon, getFileCategoryAndIcon } from './smartIcons';


// Helper to format file size
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Find folder candidates matching names (case-insensitive, hyphen/space variations)
async function findFolderLocation(patterns: string[], searchRoots: string[]): Promise<{ path: string; realPath: string } | null> {
  // First check direct matches in search roots
  for (const root of searchRoots) {
    if (!existsSync(root)) continue;
    try {
      const entries = await fs.readdir(root, { withFileTypes: true });
      for (const entry of entries) {
        const entryNameLower = entry.name.toLowerCase().replace(/[-_\s]/g, '');
        for (const pattern of patterns) {
          const patternNormalized = pattern.toLowerCase().replace(/[-_\s]/g, '');
          if (entryNameLower === patternNormalized) {
            const fullPath = path.join(root, entry.name);
            try {
              const real = await fs.realpath(fullPath);
              return { path: fullPath, realPath: real };
            } catch {
              return { path: fullPath, realPath: fullPath };
            }
          }
        }
      }
    } catch {
      // Ignore permission errors on search
    }
  }

  // Fallback: check one level deeper in searchRoots
  for (const root of searchRoots) {
    if (!existsSync(root)) continue;
    try {
      const entries = await fs.readdir(root, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          const subDir = path.join(root, entry.name);
          try {
            const subEntries = await fs.readdir(subDir, { withFileTypes: true });
            for (const sub of subEntries) {
              const subNameLower = sub.name.toLowerCase().replace(/[-_\s]/g, '');
              for (const pattern of patterns) {
                const patternNormalized = pattern.toLowerCase().replace(/[-_\s]/g, '');
                if (subNameLower === patternNormalized) {
                  const fullPath = path.join(subDir, sub.name);
                  try {
                    const real = await fs.realpath(fullPath);
                    return { path: fullPath, realPath: real };
                  } catch {
                    return { path: fullPath, realPath: fullPath };
                  }
                }
              }
            }
          } catch {
            // skip inaccessible
          }
        }
      }
    } catch {
      // skip
    }
  }

  return null;
}

// Read preview children of a folder (first few items for visual hero card)
async function getPreviewChildren(folderPath: string, limit = 6): Promise<{ items: FilesystemEntry[]; count: number; modifiedAt: string }> {
  try {
    const stats = await fs.stat(folderPath);
    const modifiedAt = stats.mtime.toISOString();
    const dirents = await fs.readdir(folderPath, { withFileTypes: true });
    
    // Filter out hidden files or system files
    const visible = dirents.filter(d => !d.name.startsWith('$') && !d.name.startsWith('.Trash') && !d.name.startsWith('pagefile'));
    const count = visible.length;

    const sample = visible.slice(0, limit);
    const previewItems: FilesystemEntry[] = [];

    for (const d of sample) {
      const itemPath = path.join(folderPath, d.name);
      try {
        const itemStat = await fs.stat(itemPath);
        const isDir = d.isDirectory();
        const ext = path.extname(d.name);
        const { category, icon } = isDir
          ? getFolderCategoryAndIcon(d.name)
          : getFileCategoryAndIcon(d.name, null);

        previewItems.push({
          id: itemPath,
          name: d.name,
          path: itemPath,
          isDirectory: isDir,
          isFile: !isDir,
          isSymlink: d.isSymbolicLink(),
          size: itemStat.size,
          formattedSize: formatBytes(itemStat.size),
          extension: ext,
          mimeType: null,
          category,
          resourceIcon: icon,
          createdAt: itemStat.birthtime.toISOString(),
          modifiedAt: itemStat.mtime.toISOString(),
          isHidden: d.name.startsWith('.'),
        });
      } catch {
        // Skip unreadable item
      }
    }

    return { items: previewItems, count, modifiedAt };
  } catch {
    return { items: [], count: 0, modifiedAt: new Date().toISOString() };
  }
}

export async function discoverFilesystem(resourcesDir: string): Promise<SystemDiscoveryResult> {
  const homedir = os.homedir();
  const platform = os.platform();
  const searchRoots = [homedir, '/mnt', '/media', '/run/media', '/Volumes'];

  // Discover Desktop
  let desktopPath = path.join(homedir, 'Desktop');
  if (!existsSync(desktopPath)) {
    desktopPath = path.join(homedir, 'desktop');
  }
  let desktopReal = desktopPath;
  if (existsSync(desktopPath)) {
    try {
      desktopReal = await fs.realpath(desktopPath);
    } catch {
      desktopReal = desktopPath;
    }
  }

  // Discover Parallel World
  const parallelFound = await findFolderLocation(
    ['Parallel-World', 'Parallel World', 'parallel-world', 'ParallelWorld', 'parallelworld'],
    searchRoots
  );

  // Discover 2nd World
  const secondWorldFound = await findFolderLocation(
    ['2nd-World', '2nd World', '2nd-world', 'Second-World', 'Second World', 'second-world', '2ndWorld'],
    searchRoots
  );

  const desktopPreview = await getPreviewChildren(desktopPath);
  const parallelPath = parallelFound?.path || path.join(homedir, 'Parallel-World');
  const parallelReal = parallelFound?.realPath || parallelPath;
  const parallelPreview = await getPreviewChildren(parallelReal);

  const secondWorldPath = secondWorldFound?.path || path.join(homedir, '2nd-World');
  const secondWorldReal = secondWorldFound?.realPath || secondWorldPath;
  const secondWorldPreview = await getPreviewChildren(secondWorldReal);

  // Build Primary Locations
  const primaryLocations = {
    desktop: {
      id: 'desktop',
      name: 'Desktop',
      path: desktopPath,
      realPath: desktopReal,
      exists: existsSync(desktopPath),
      category: 'desktop' as const,
      resourceIcon: '/api/resources/system.png',
      itemCount: desktopPreview.count,
      modifiedAt: desktopPreview.modifiedAt,
      previewChildren: desktopPreview.items,
      description: 'Main operating system desktop space and active working directory.',
    },
    parallelWorld: {
      id: 'parallel-world',
      name: 'Parallel World',
      path: parallelPath,
      realPath: parallelReal,
      exists: !!parallelFound && existsSync(parallelReal),
      category: 'parallel-world' as const,
      resourceIcon: '/api/resources/cloud.png',
      itemCount: parallelPreview.count,
      modifiedAt: parallelPreview.modifiedAt,
      previewChildren: parallelPreview.items,
      description: 'Creative sandbox, experimental projects, and autonomous prototypes.',
    },
    secondWorld: {
      id: 'second-world',
      name: '2nd World',
      path: secondWorldPath,
      realPath: secondWorldReal,
      exists: !!secondWorldFound && existsSync(secondWorldReal),
      category: 'second-world' as const,
      resourceIcon: '/api/resources/database.png',
      itemCount: secondWorldPreview.count,
      modifiedAt: secondWorldPreview.modifiedAt,
      previewChildren: secondWorldPreview.items,
      description: 'Deep storage, archives, AI repositories, and secondary volumes.',
    },
  };

  // Discover standard user directories
  const standardNames = [
    { name: 'Documents', icon: '/api/resources/documents.png', category: 'document' as const },
    { name: 'Downloads', icon: '/api/resources/downloads.png', category: 'downloads' as const },
    { name: 'Pictures', icon: '/api/resources/images.png', category: 'image' as const },
    { name: 'Videos', icon: '/api/resources/videos.png', category: 'video' as const },
    { name: 'Music', icon: '/api/resources/music.png', category: 'music' as const },
  ];

  const standardLocations: SystemLocation[] = [];
  for (const std of standardNames) {
    const stdPath = path.join(homedir, std.name);
    if (existsSync(stdPath)) {
      const prev = await getPreviewChildren(stdPath, 3);
      let real = stdPath;
      try {
        real = await fs.realpath(stdPath);
      } catch {
        // ignore
      }
      standardLocations.push({
        id: std.name.toLowerCase(),
        name: std.name,
        path: stdPath,
        realPath: real,
        exists: true,
        category: std.category,
        resourceIcon: std.icon,
        itemCount: prev.count,
        modifiedAt: prev.modifiedAt,
        previewChildren: prev.items,
        description: `Standard user ${std.name} location.`,
      });
    }
  }

  // Scan resources directory
  let resourceFiles: string[] = [];
  try {
    if (existsSync(resourcesDir)) {
      resourceFiles = readdirSync(resourcesDir).filter(f => f.endsWith('.png') || f.endsWith('.svg'));
    }
  } catch {
    // skip
  }

  return {
    os: {
      platform,
      release: os.release(),
      type: os.type(),
      arch: os.arch(),
      hostname: os.hostname(),
      homedir,
    },
    primaryLocations,
    standardLocations,
    resources: resourceFiles,
  };
}
