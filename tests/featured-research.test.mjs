import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { renderFeaturedResearch } from '../assets/js/renderers/featured-research.js';

const project = {
  name: 'SkillNav',
  label: 'Multimodal Reasoning · Embodied Agents',
  venue: 'ACL 2026 Oral',
  summary: 'A skill-based navigation project.',
  artifact: 'Official code and checkpoints.',
  image: 'data/images/pub/publication-SkillNav.svg',
  links: [{ label: 'Code', url: 'https://github.com/HLR/SkillNav' }],
};

test('renderFeaturedResearch renders the research artifact and hardened links', () => {
  const mountEl = { innerHTML: '' };

  renderFeaturedResearch([project], mountEl);

  assert.match(mountEl.innerHTML, /Open Research Artifact/);
  assert.match(mountEl.innerHTML, /rel="noopener noreferrer"/);
  assert.match(mountEl.innerHTML, /SkillNav/);
});

test('featured research data names SkillNav then SaaS-Bench with canonical links', async () => {
  const projects = JSON.parse(await readFile(new URL('../data/featured-research.json', import.meta.url), 'utf8'));

  assert.deepEqual(projects.map(({ name }) => name), ['SkillNav', 'SaaS-Bench']);
  assert.ok(projects[0].links.some(({ url }) => url === 'https://github.com/HLR/SkillNav'));
  assert.ok(projects[1].links.some(({ url }) => url === 'https://github.com/UniPat-AI/SaaS-Bench'));
});
