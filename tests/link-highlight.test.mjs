import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('text links use a cursor-following highlight for hover and keyboard focus', async () => {
  const css = await readFile(new URL('../assets/css/main.css', import.meta.url), 'utf8');

  assert.match(css, /\.hover-highlight:hover[\s\S]*\.hover-highlight:focus-visible/);
  assert.match(css, /background(?:-color)?:\s*var\(--color-accent\)/);
  assert.match(css, /color:\s*#fff/);
  assert.doesNotMatch(css, /\.featured-research-link:hover\s*\{[^}]*text-decoration:\s*underline/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});
