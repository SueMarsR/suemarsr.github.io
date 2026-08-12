import test from 'node:test';
import assert from 'node:assert/strict';

import { renderProfile } from '../assets/js/renderers/profile.js';

test('renderProfile foregrounds a research tagline and research heading', () => {
  const headerEl = { innerHTML: '' };
  const aboutEl = { innerHTML: '' };
  const originalDocument = globalThis.document;
  globalThis.document = {
    title: '',
    querySelectorAll() { return []; },
  };

  try {
    renderProfile({
      name: 'Tianyi Ma',
      title: 'Ph.D. Student',
      researchTagline: 'Researching multimodal reasoning agents for interactive worlds.',
      aboutHeading: 'Research',
      about: 'Research content.',
      socials: [],
    }, { headerEl, aboutEl });
  } finally {
    if (originalDocument === undefined) delete globalThis.document;
    else globalThis.document = originalDocument;
  }

  assert.match(headerEl.innerHTML, /Researching multimodal reasoning agents/);
  assert.match(aboutEl.innerHTML, />Research<\/h2>/);
});
