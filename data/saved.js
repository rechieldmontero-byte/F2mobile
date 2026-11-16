let saved = [];
const listeners = new Set();

function emit() {
  listeners.forEach((fn) => fn());
}

export function toggleSaved(product) {
  const exists = saved.find((p) => p.id === product.id);
  saved = exists
    ? saved.filter((p) => p.id !== product.id)
    : [...saved, product];
  emit();
}

export function isSaved(id) {
  return saved.some((p) => p.id === id);
}

export function getSaved() {
  return saved;
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
