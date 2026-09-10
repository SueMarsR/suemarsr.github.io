import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { renderExperience } from '../assets/js/renderers/experience.js';
import { renderNews } from '../assets/js/renderers/news.js';

test('homepage experience no longer presents the UniPat internship', async () => {
  const experience = JSON.parse(await readFile(new URL('../data/experience.json', import.meta.url), 'utf8'));
  const mountEl = { innerHTML: '' };

  renderExperience(experience, mountEl);

  assert.doesNotMatch(mountEl.innerHTML, /UniPat AI/i);
  assert.doesNotMatch(mountEl.innerHTML, /Research Intern/i);
});

test('homepage news no longer announces the UniPat internship', async () => {
  const news = JSON.parse(await readFile(new URL('../data/news.json', import.meta.url), 'utf8'));
  const mountEl = { innerHTML: '' };

  renderNews(news, mountEl, 5);

  assert.doesNotMatch(mountEl.innerHTML, /Joining[\s\S]*Research Intern/i);
});
