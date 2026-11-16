import { useSyncExternalStore } from 'react';
import { getSaved, subscribe, isSaved, toggleSaved } from '../data/saved';

export function useSaved() {
  const saved = useSyncExternalStore(subscribe, getSaved);
  return {
    saved,
    count: saved.length,
    isSaved,
    toggleSaved,
  };
}
