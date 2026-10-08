export type FileCategory =
  | 'folder'
  | 'desktop'
  | 'parallel-world'
  | 'second-world'
  | 'image'
  | 'video'
  | 'audio'
  | 'music'
  | 'code'
  | 'document'
  | 'archive'
  | 'application'
  | 'downloads'
  | 'games'
  | 'database'
  | 'backup'
  | 'design'
  | 'font'
  | 'notes'
  | 'education'
  | 'finance'
  | 'security'
  | 'system'
  | 'chat'
  | 'cloud'
  | 'media'
  | 'network'
  | 'presentation'
  | 'projects'
  | 'trash'
  | 'bookmarks'
  | 'unknown';

export interface FilesystemEntry {
  id: string;
  name: string;
  path: string;
  isDirectory: boolean;
  isFile: boolean;
  isSymlink: boolean;
  realPath?: string;
  size: number;
  formattedSize: string;
  extension: string;
  mimeType: string | null;
  category: FileCategory;
  resourceIcon?: string;
  createdAt: string;
  modifiedAt: string;
  accessedAt?: string;
  isHidden: boolean;
  childCount?: number;
  isFavorite?: boolean;
}

export interface SystemLocation {
  id: string;
  name: string;
  path: string;
  realPath: string;
  exists: boolean;
  category: FileCategory;
  resourceIcon: string;
  itemCount: number;
  modifiedAt: string;
  previewChildren: FilesystemEntry[];
  description: string;
}

export interface SystemDiscoveryResult {
  os: {
    platform: string;
    release: string;
    type: string;
    arch: string;
    hostname: string;
    homedir: string;
  };
  primaryLocations: {
    desktop: SystemLocation;
    parallelWorld: SystemLocation;
    secondWorld: SystemLocation;
  };
  standardLocations: SystemLocation[];
  resources: string[];
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface DirectoryContentResult {
  currentPath: string;
  realPath: string;
  parentPath: string | null;
  breadcrumbs: BreadcrumbItem[];
  entries: FilesystemEntry[];
  totalItems: number;
  totalSize: number;
  formattedTotalSize: string;
  error?: string;
}

export type LayoutMode = 'grid' | 'compact' | 'list' | 'gallery' | 'cinematic';

export type IconSize = 'tiny' | 'small' | 'medium' | 'large' | 'huge';

export type SortField = 'name' | 'size' | 'modified' | 'created' | 'type';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
  foldersFirst: boolean;
}

export type FilterCategory = 'all' | 'folders' | 'image' | 'video' | 'audio' | 'document' | 'code' | 'archive' | 'application';
