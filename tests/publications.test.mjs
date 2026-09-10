import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  bindPublicationCopyButtons,
  renderFullPublications,
  renderRecentPublications,
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

test('SaaS-Bench marks its first three authors as equal contributors', async () => {
  const publications = JSON.parse(await readFile(new URL('../data/publications.json', import.meta.url), 'utf8'));
  const saasBench = publications.find((pub) => pub.title.startsWith('SaaS-Bench:'));

  assert.deepEqual(
    saasBench.authors.slice(0, 3).map(({ name, equalContrib }) => ({ name, equalContrib })),
    [
      { name: 'Kean Shi', equalContrib: true },
      { name: 'Zihang Li', equalContrib: true },
      { name: 'Tianyi Ma', equalContrib: true },
    ],
  );
});

test('recent publications foreground the two accepted EMNLP 2026 papers', async () => {
  const publications = JSON.parse(await readFile(new URL('../data/publications.json', import.meta.url), 'utf8'));
  const mountEl = { innerHTML: '' };

  renderRecentPublications(publications, mountEl, 2);

  assert.match(mountEl.innerHTML, /CLAMP: Constrained Decoding for Vision-Language Embodied Planning/);
  assert.match(mountEl.innerHTML, /EMNLP 2026 Findings/);
  assert.match(mountEl.innerHTML, /MMGR: Multi-Modal Generative Reasoning/);
  assert.match(mountEl.innerHTML, /EMNLP 2026 Main Conference/);
  assert.doesNotMatch(mountEl.innerHTML, /SaaS-Bench/);
});

test('MMGR and CLAMP publication records match their canonical sources', async () => {
  const publications = JSON.parse(await readFile(new URL('../data/publications.json', import.meta.url), 'utf8'));
  const clamp = publications.find((pub) => pub.title.startsWith('CLAMP:'));
  const mmgr = publications.find((pub) => pub.title.startsWith('MMGR:'));

  assert.ok(clamp, 'CLAMP publication is missing');
  assert.equal(clamp.venue, 'EMNLP 2026 Findings');
  assert.deepEqual(clamp.authors.map(({ name }) => name), ['Tianyi Ma', 'Parisa Kordjamshidi']);
  assert.equal(clamp.links.pdf, 'https://arxiv.org/abs/2609.08602');
  assert.equal(clamp.links.project, 'https://suemarsr.github.io/CLAMP/');
  assert.equal(clamp.links.code, 'https://github.com/HLR/CLAMP');
  assert.match(clamp.bibtex, /Findings of the Association for Computational Linguistics: EMNLP 2026/);

  assert.equal(mmgr.venue, 'EMNLP 2026 Main Conference');
  assert.deepEqual(
    mmgr.authors.map(({ name }) => name),
    [
      'Zefan Cai',
      'Haoyi Qiu',
      'Tianyi Ma',
      'Haozhe Zhao',
      'Gengze Zhou',
      'Kung-Hsiang Huang',
      'Parisa Kordjamshidi',
      'Minjia Zhang',
      'Wen Xiao',
      'Jiuxiang Gu',
      'Nanyun Peng',
      'Junjie Hu',
    ],
  );
  assert.match(mmgr.bibtex, /Proceedings of the 2026 Conference on Empirical Methods in Natural Language Processing/);
});
