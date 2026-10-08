import { useEffect } from 'react';
import { useExplorerStore } from '../store/useExplorerStore';

export function useFilesystemWatcher() {
  const { state, refresh } = useExplorerStore();
  const currentPath = state.currentPath;

  useEffect(() => {
    if (!currentPath) return;

    let eventSource: EventSource | null = null;
    let debounceTimer: ReturnType<typeof setTimeout> | undefined = undefined;


    try {
      eventSource = new EventSource(`/api/watch?path=${encodeURIComponent(currentPath)}`);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'change') {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
              refresh();
            }, 300);
          }
        } catch {
          // ignore
        }
      };

      eventSource.onerror = () => {
        eventSource?.close();
      };
    } catch {
      // ignore
    }

    return () => {
      clearTimeout(debounceTimer);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [currentPath, refresh]);
}
