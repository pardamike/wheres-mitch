export interface VisibilityCallbacks {
  onHidden(): void;
  onVisible(): void;
}

export function attachVisibilityLifecycle(callbacks: VisibilityCallbacks): () => void {
  const listener = () => {
    if (document.hidden) {
      callbacks.onHidden();
    } else {
      callbacks.onVisible();
    }
  };
  document.addEventListener('visibilitychange', listener);
  return () => document.removeEventListener('visibilitychange', listener);
}
