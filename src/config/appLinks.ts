/**
 * appLinks.tsx
 * Configurable external/external shortcuts shown in the explorer UI.
 *
 * These are web links (e.g. a Google Drive folder), NOT local filesystem paths.
 * Edit the `url` value below to point this shortcut at the desired location.
 */
export interface AppLink {
  id: string;
  label: string;
  description: string;
  url: string;
  /** icon name mapped in the consuming components */
  icon: 'graduation' | 'drive' | 'folder';
  accent: string; // tailwind text color class for the icon
}

export const APP_LINKS: AppLink[] = [
  {
    id: 'semester-data',
    label: 'Semester Data',
    description: 'Semester study material, notes and resources',
    url: 'https://drive.google.com/drive/folders/1ZrblKyrycAj2G3WppztODlCLm9iqjP_s?usp=drive_link',
    icon: 'graduation',
    accent: 'text-emerald-400',
  },
];

/** Open an app link in a new browser tab (used when not a filesystem path). */
export function openAppLink(link: AppLink) {
  window.open(link.url, '_blank', 'noopener,noreferrer');
}
