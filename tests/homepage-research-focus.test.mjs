import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('home inserts Research Highlights between Research and News', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

  assert.ok(html.indexOf('id="about-section"') < html.indexOf('id="featured-research-section"'));
  assert.ok(html.indexOf('id="featured-research-section"') < html.indexOf('id="news-section"'));
  assert.match(html, /Research Highlights/);
});

test('homepage loads and renders featured research', async () => {
  const main = await readFile(new URL('../assets/js/main.js', import.meta.url), 'utf8');

  assert.match(main, /featuredResearch:\s*'data\/featured-research\.json'/);
  assert.match(main, /renderFeaturedResearch\(featuredResearch, \$\('#featured-research-list'\)\)/);
});

test('featured research cards use a responsive two-column grid', async () => {
  const css = await readFile(new URL('../assets/css/main.css', import.meta.url), 'utf8');

  assert.match(css, /\.featured-research-grid/);
  assert.match(css, /grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*grid-template-columns:\s*1fr/);
});
