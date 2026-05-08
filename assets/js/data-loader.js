const cache = new Map();

export async function loadJSON(path) {
  if (cache.has(path)) return cache.get(path);

  const promise = fetch(path, { cache: 'no-cache' }).then((res) => {
    if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status} ${res.statusText}`);
    return res.json();
  });

  cache.set(path, promise);
  try {
    return await promise;
  } catch (err) {
    cache.delete(path);
    throw err;
  }
}
