import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  bindPublicationCopyButtons,
  renderFullPublications,
} from '../assets/js/renderers/publications.js';

test('renderFullPublications adds a BibTeX copy button when publication has bibtex', () => {
  const mountEl = { innerHTML: '' };
  const bibtex = '@inproceedings{ma2026example,\n  title={Example Paper}\n}';

  renderFullPublications([{
    title: 'Example Paper',
    authors: [{ name: 'Tianyi Ma', isMe: true }],
    venue: 'ExampleConf 2026',
    image: '',
    links: { pdf: 'https://example.com/paper.pdf' },
    bibtex,
  }], mountEl);

  assert.match(mountEl.innerHTML, /data-bibtex-copy/);
  assert.match(mountEl.innerHTML, /Copy BibTeX/);
  assert.match(mountEl.innerHTML, new RegExp(encodeURIComponent(bibtex).replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('bindPublicationCopyButtons copies BibTeX and shows copied feedback', async () => {
  const listeners = new Map();
  const button = {
    dataset: {
      bibtex: encodeURIComponent('@article{ma2026example}'),
    },
    disabled: false,
    innerHTML: 'Copy BibTeX',
    classList: {
      add() {},
      remove() {},
    },
    addEventListener(name, listener) {
      listeners.set(name, listener);
    },
  };
  const root = {
    querySelectorAll(selector) {
      return selector === '[data-bibtex-copy]' ? [button] : [];
    },
  };
  const writes = [];
  const clipboard = {
    async writeText(value) {
      writes.push(value);
    },
  };

  bindPublicationCopyButtons(root, clipboard, { resetDelayMs: 0 });
  await listeners.get('click')();

  assert.deepEqual(writes, ['@article{ma2026example}']);
  assert.match(button.innerHTML, /Copied/);
});

test('every publication includes BibTeX data', async () => {
  const publications = JSON.parse(await readFile(new URL('../data/publications.json', import.meta.url), 'utf8'));

  assert.ok(publications.length > 0);
  publications.forEach((pub) => {
    assert.equal(typeof pub.bibtex, 'string', `${pub.title} is missing bibtex`);
    assert.match(pub.bibtex, /^@\w+\{/);
  });
});
