import { DirectoryContentResult, FilesystemEntry, SystemDiscoveryResult } from '../types/filesystem';

const API_BASE = '/api';

export async function fetchDiscovery(): Promise<SystemDiscoveryResult> {
  const res = await fetch(`${API_BASE}/discovery`);
  if (!res.ok) throw new Error(`Discovery failed: ${res.statusText}`);
  return res.json();
}

export async function browseDirectory(path?: string): Promise<DirectoryContentResult> {
  const url = path ? `${API_BASE}/browse?path=${encodeURIComponent(path)}` : `${API_BASE}/browse`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Browse failed: ${res.statusText}`);
  return res.json();
}

export async function searchFiles(scope: string, query: string, type = 'all'): Promise<FilesystemEntry[]> {
  const url = `${API_BASE}/search?scope=${encodeURIComponent(scope)}&q=${encodeURIComponent(query)}&type=${encodeURIComponent(type)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Search failed: ${res.statusText}`);
  const data = await res.json();
  return data.results || [];
}

export async function openItemInOS(path: string): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`${API_BASE}/action/open`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  });
  return res.json();
}

export async function createNewFolder(parentPath: string, name: string): Promise<{ success: boolean; path?: string; error?: string }> {
  const res = await fetch(`${API_BASE}/action/create-folder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ parentPath, name }),
  });
  return res.json();
}

export async function createNewFile(parentPath: string, name: string): Promise<{ success: boolean; path?: string; error?: string }> {
  const res = await fetch(`${API_BASE}/action/create-file`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ parentPath, name }),
  });
  return res.json();
}

export async function renameItem(path: string, newName: string): Promise<{ success: boolean; newPath?: string; error?: string }> {
  const res = await fetch(`${API_BASE}/action/rename`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, newName }),
  });
  return res.json();
}

export async function deleteItem(path: string): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`${API_BASE}/action/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  });
  return res.json();
}

export async function moveItem(sourcePath: string, targetDirPath: string): Promise<{ success: boolean; newPath?: string; error?: string }> {
  const res = await fetch(`${API_BASE}/action/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourcePath, targetDirPath }),
  });
  return res.json();
}

export async function copyItem(sourcePath: string, targetDirPath: string): Promise<{ success: boolean; newPath?: string; error?: string }> {
  const res = await fetch(`${API_BASE}/action/copy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourcePath, targetDirPath }),
  });
  return res.json();
}

export async function fetchFilePreview(path: string): Promise<{ content: string; truncated: boolean; lines: number; error?: string }> {
  const res = await fetch(`${API_BASE}/file/preview?path=${encodeURIComponent(path)}`);
  if (!res.ok) throw new Error('Preview fetch failed');
  return res.json();
}

export function getFileRawUrl(path: string): string {
  return `${API_BASE}/file/raw?path=${encodeURIComponent(path)}`;
}
