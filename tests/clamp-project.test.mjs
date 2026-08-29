import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const clampRoot = path.join(siteRoot, 'CLAMP');

test('publishes the CLAMP research page at the personal Pages subpath', () => {
  const indexPath = path.join(clampRoot, 'index.html');

  assert.ok(existsSync(indexPath), 'CLAMP/index.html should be published');
  const html = readFileSync(indexPath, 'utf8');
  assert.match(html, /https:\/\/suemarsr\.github\.io\/CLAMP\//i);
  assert.ok(existsSync(path.join(clampRoot, 'assets/site.css')));
  assert.ok(existsSync(path.join(clampRoot, 'assets/site.js')));
  assert.ok(existsSync(path.join(clampRoot, 'assets/paper/clamp-camera-ready.pdf')));
});

test('publishes the Findings of EMNLP 2026 citation artifact', () => {
  const citation = readFileSync(path.join(clampRoot, 'CITATION.bib'), 'utf8');

  assert.match(citation, /^@inproceedings\{ma2026clamp,/);
  assert.match(
    citation,
    /booktitle\s*=\s*\{Findings of the Association for Computational Linguistics: EMNLP 2026\}/,
  );
  assert.doesNotMatch(citation, /@article|preprint/i);
});
