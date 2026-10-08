import path from 'path';
import { FileCategory } from './types';

export function getFolderCategoryAndIcon(folderName: string, subNames: string[] = []): { category: FileCategory; icon: string } {
  const lower = folderName.toLowerCase();
  const subLower = subNames.map(s => s.toLowerCase());

  // Special system/custom folder checks
  if (lower === 'desktop') {
    return { category: 'desktop', icon: '/api/resources/system.png' };
  }
  if (lower.includes('parallel-world') || lower.includes('parallel world') || lower.includes('parallel')) {
    return { category: 'parallel-world', icon: '/api/resources/cloud.png' };
  }
  if (lower.includes('2nd-world') || lower.includes('2nd world') || lower.includes('second world')) {
    return { category: 'second-world', icon: '/api/resources/media.png' };
  }

  // Name based heuristics
  if (/^(doc|document|docs|paper|papers|report|reports|sem|assignment)/.test(lower) || lower.includes('document')) {
    return { category: 'document', icon: '/api/resources/documents.png' };
  }
  if (/^(img|image|images|pic|pics|picture|pictures|photo|photos|wallpaper|wallpapers|screenshot|screenshots)/.test(lower)) {
    return { category: 'image', icon: '/api/resources/images.png' };
  }
  if (/^(vid|video|videos|movie|movies|film|films|stream|yt|recording|recordings|shorts|shrts)/.test(lower)) {
    return { category: 'video', icon: '/api/resources/videos.png' };
  }
  if (/^(music|audio|sound|song|songs|track|tracks|podcast|podcasts)/.test(lower)) {
    return { category: 'music', icon: '/api/resources/music.png' };
  }
  if (/^(code|src|source|dev|development|script|scripts|python|java|cpp|rust|go|langchain|backend|frontend)/.test(lower)) {
    return { category: 'code', icon: '/api/resources/code.png' };
  }
  if (/^(project|projects|work|workspace|kalakriti|creative|sih|minicloud|lab|beacon)/.test(lower)) {
    return { category: 'projects', icon: '/api/resources/projects.png' };
  }
  if (/^(download|downloads|dl)/.test(lower)) {
    return { category: 'downloads', icon: '/api/resources/downloads.png' };
  }
  if (/^(archive|archives|zip|rar|compressed|tar|backup|backups)/.test(lower)) {
    return { category: 'archive', icon: '/api/resources/archive.png' };
  }
  if (/^(app|apps|application|applications|bin|program|programs|steam|steamlibrary|putty)/.test(lower)) {
    return { category: 'application', icon: '/api/resources/apps.png' };
  }
  if (/^(database|db|sql|postgres|mysql|mongo|sqlite|data|dataset)/.test(lower) || lower.includes('data base')) {
    return { category: 'database', icon: '/api/resources/database.png' };
  }
  if (/^(design|ui|ux|figma|art|graphic|graphics|assets|drawing)/.test(lower)) {
    return { category: 'design', icon: '/api/resources/design.png' };
  }
  if (/^(education|edu|book|books|school|college|iiit|course|courses|study|learn|maths|math|biology|bio)/.test(lower)) {
    return { category: 'education', icon: '/api/resources/education.png' };
  }
  if (/^(finance|money|expense|wallet|crypto|billing|tax|invoice)/.test(lower) || lower.includes('expense')) {
    return { category: 'finance', icon: '/api/resources/finance.png' };
  }
  if (/^(note|notes|memo|memos|journal|diary|log|logs)/.test(lower)) {
    return { category: 'notes', icon: '/api/resources/notes.png' };
  }
  if (/^(font|fonts|typography)/.test(lower)) {
    return { category: 'font', icon: '/api/resources/fonts.png' };
  }
  if (/^(game|games|gaming)/.test(lower)) {
    return { category: 'games', icon: '/api/resources/games.png' };
  }
  if (/^(security|sec|key|keys|ssh|cert|certs|auth|ssl)/.test(lower)) {
    return { category: 'security', icon: '/api/resources/security.png' };
  }
  if (/^(net|network|networkings|network sem|wifi|vpn|proxy)/.test(lower) || lower.includes('network')) {
    return { category: 'network', icon: '/api/resources/network.png' };
  }
  if (/^(system|sys|config|os|evaluation os|windows|linux|etc)/.test(lower)) {
    return { category: 'system', icon: '/api/resources/system.png' };
  }
  if (/^(trash|recycle|\$recycle\.bin|\.trash)/.test(lower)) {
    return { category: 'trash', icon: '/api/resources/trash.png' };
  }
  if (/^(cloud|drive|dropbox|onedrive|gdrive|nextcloud)/.test(lower)) {
    return { category: 'cloud', icon: '/api/resources/cloud.png' };
  }

  // Children based heuristics if available
  if (subLower.some(s => s.endsWith('.png') || s.endsWith('.jpg') || s.endsWith('.jpeg') || s.endsWith('.webp'))) {
    return { category: 'image', icon: '/api/resources/images.png' };
  }
  if (subLower.some(s => s.endsWith('.py') || s.endsWith('.ts') || s.endsWith('.js') || s.endsWith('.json') || s.endsWith('.rs') || s.endsWith('.cpp'))) {
    return { category: 'code', icon: '/api/resources/code.png' };
  }
  if (subLower.some(s => s.endsWith('.mp4') || s.endsWith('.mkv') || s.endsWith('.webm'))) {
    return { category: 'video', icon: '/api/resources/videos.png' };
  }
  if (subLower.some(s => s.endsWith('.mp3') || s.endsWith('.wav') || s.endsWith('.flac'))) {
    return { category: 'music', icon: '/api/resources/music.png' };
  }
  if (subLower.some(s => s.endsWith('.pdf') || s.endsWith('.docx') || s.endsWith('.txt'))) {
    return { category: 'document', icon: '/api/resources/documents.png' };
  }

  // Default folder icon
  return { category: 'folder', icon: '/api/resources/unknown.png' };
}

export function getFileCategoryAndIcon(fileName: string, mimeType: string | null): { category: FileCategory; icon: string } {
  const ext = path.extname(fileName).toLowerCase();

  // Images
  if (['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.bmp', '.ico', '.tiff'].includes(ext) || mimeType?.startsWith('image/')) {
    return { category: 'image', icon: '/api/resources/images.png' };
  }

  // Videos
  if (['.mp4', '.mkv', '.webm', '.mov', '.avi', '.wmv', '.flv', '.m4v'].includes(ext) || mimeType?.startsWith('video/')) {
    return { category: 'video', icon: '/api/resources/videos.png' };
  }

  // Audio
  if (['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac', '.wma'].includes(ext) || mimeType?.startsWith('audio/')) {
    return { category: 'music', icon: '/api/resources/music.png' };
  }

  // Code
  if (['.js', '.jsx', '.ts', '.tsx', '.py', '.cpp', '.c', '.h', '.hpp', '.java', '.go', '.rs', '.html', '.css', '.scss', '.json', '.sh', '.bash', '.yml', '.yaml', '.toml', '.xml', '.sql', '.php', '.cs', '.kt', '.swift'].includes(ext)) {
    return { category: 'code', icon: '/api/resources/code.png' };
  }

  // Documents
  if (['.pdf', '.doc', '.docx', '.txt', '.md', '.rtf', '.odt', '.csv', '.xlsx', '.xls', '.ppt', '.pptx'].includes(ext)) {
    if (ext === '.presentation' || ext === '.ppt' || ext === '.pptx') {
      return { category: 'presentation', icon: '/api/resources/presentation.png' };
    }
    if (ext === '.notes' || ext === '.txt' || ext === '.md') {
      return { category: 'notes', icon: '/api/resources/notes.png' };
    }
    return { category: 'document', icon: '/api/resources/documents.png' };
  }

  // Archives
  if (['.zip', '.tar', '.gz', '.bz2', '.7z', '.rar', '.xz', '.tgz'].includes(ext)) {
    return { category: 'archive', icon: '/api/resources/archive.png' };
  }

  // Executables / Apps
  if (['.exe', '.app', '.dmg', '.iso', '.deb', '.rpm', '.apk', '.jar', '.bin', '.msi', '.AppImage'].includes(ext)) {
    return { category: 'application', icon: '/api/resources/apps.png' };
  }

  // Fonts
  if (['.ttf', '.otf', '.woff', '.woff2'].includes(ext)) {
    return { category: 'font', icon: '/api/resources/fonts.png' };
  }

  // Database
  if (['.db', '.sqlite', '.sqlite3', '.sql', '.mdb'].includes(ext)) {
    return { category: 'database', icon: '/api/resources/database.png' };
  }

  return { category: 'unknown', icon: '/api/resources/unknown.png' };
}
