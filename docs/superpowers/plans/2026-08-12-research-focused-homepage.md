# Research-Focused Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the homepage research-led around multimodal reasoning agents, with SkillNav and SaaS-Bench as credible open research-system highlights.

**Architecture:** Retain the static JSON-plus-renderer structure. Extend profile data and its renderer for the research positioning; add one `featured-research.json` source and its renderer; then mount it through the existing asynchronous loader. Node tests cover profile markup, project-card markup/data, homepage wiring, and the responsive layout hooks.

**Tech Stack:** HTML, CSS, browser-native ES modules, JSON, Node.js built-in test runner.

## Global Constraints

- Use English-first, evidence-backed copy only; do not claim personal SaaS-Bench contributions, unverified metrics, or unverified engineering employment.
- Preserve existing profile social links, publication data, experience data, navigation, Blog, and Photography pages.
- Keep the dependency-free architecture; do not add a framework, build system, or package manager.
- New external links use `target="_blank" rel="noopener noreferrer"`.
- Research Highlights appears after Research and before News, ordered SkillNav then SaaS-Bench.

---

### Task 1: Make the researcher identity explicit in the profile

**Files:**
- Create: `tests/profile.test.mjs`
- Modify: `data/profile.json`
- Modify: `assets/js/renderers/profile.js`

**Interfaces:**
- Consumes: profile JSON with optional `researchTagline` and `aboutHeading` string fields.
- Produces: `renderProfile(profile, mounts)` renders the tagline in `headerEl` and heading in `aboutEl`, with `About Me` as the fallback heading.

- [ ] **Step 1: Write the failing profile-rendering test**

```js
test('renderProfile foregrounds a research tagline and research heading', () => {
  const headerEl = { innerHTML: '' };
  const aboutEl = { innerHTML: '' };
  renderProfile({
    name: 'Tianyi Ma', title: 'Ph.D. Student',
    researchTagline: 'Researching multimodal reasoning agents for interactive worlds.',
    aboutHeading: 'Research', about: 'Research content.', socials: [],
  }, { headerEl, aboutEl });
  assert.match(headerEl.innerHTML, /Researching multimodal reasoning agents/);
  assert.match(aboutEl.innerHTML, />Research<\/h2>/);
});
```

- [ ] **Step 2: Run the test to verify it fails because the renderer lacks the new fields**

Run: `node --test tests/profile.test.mjs`

Expected: FAIL because the header lacks the tagline and the heading is `About Me`.

- [ ] **Step 3: Add the verified research profile data**

In `data/profile.json`, add:

```json
"researchTagline": "Researching multimodal reasoning agents for interactive worlds.",
"aboutHeading": "Research",
"about": "I am a Ph.D. Student in <a href=\"https://hlr.github.io\" target=\"_blank\" class=\"link\">HLR lab</a> in the Department of Computer Science and Engineering at Michigan State University, advised by <a href=\"https://www.cse.msu.edu/~kordjams/\" target=\"_blank\" class=\"link\">Prof. Parisa Kordjamshidi</a>. My research asks how agents can perceive, reason, and act across embodied and software environments, with a focus on multimodal reasoning, agents, and vision-and-language navigation. I translate these ideas into open, reproducible research artifacts and evaluation infrastructure."
```

Keep current MSU, HLR Lab, advisor, avatar, social, and footer values unchanged.

- [ ] **Step 4: Implement the two optional fields in `assets/js/renderers/profile.js`**

```js
const tagline = profile.researchTagline
  ? `<p class="mt-2 text-lg font-medium text-blue-700">${profile.researchTagline}</p>`
  : '';
const aboutHeading = profile.aboutHeading || 'About Me';
```

Append `tagline` after the existing title paragraph, and use `aboutHeading` in the existing About heading template.

- [ ] **Step 5: Run the profile and publication tests**

Run: `node --test tests/profile.test.mjs tests/publications.test.mjs`

Expected: PASS with 4 tests, 0 failures.

- [ ] **Step 6: Commit the profile identity change**

```bash
git add data/profile.json assets/js/renderers/profile.js tests/profile.test.mjs
git commit -m "feat: foreground research focus on homepage"
```

### Task 2: Add structured Research Highlights data and markup

**Files:**
- Create: `data/featured-research.json`
- Create: `assets/js/renderers/featured-research.js`
- Create: `tests/featured-research.test.mjs`

**Interfaces:**
- Consumes: project objects with `name`, `label`, `venue`, `summary`, `artifact`, `image`, and `links: { label, url }[]`.
- Produces: `renderFeaturedResearch(projects, mountEl)`, which writes one card per project into `mountEl.innerHTML` and returns safely if no mount is supplied.

- [ ] **Step 1: Write failing renderer and data-contract tests**

```js
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
```

- [ ] **Step 2: Run the test to verify it fails because the module and data file do not exist**

Run: `node --test tests/featured-research.test.mjs`

Expected: FAIL with a module-not-found or file-not-found error.

- [ ] **Step 3: Create `data/featured-research.json` with these evidence-backed records**

```json
[
  {
    "name": "SkillNav", "label": "Multimodal Reasoning · Embodied Agents", "venue": "ACL 2026 Oral",
    "summary": "A mixture of skill-based vision-and-language navigation agents that decomposes navigation into specialists and uses a VLM router to compose them for complex instruction following.",
    "artifact": "Official code, skill-specific annotations, and trained specialist checkpoints.",
    "image": "data/images/pub/publication-SkillNav.svg",
    "links": [{ "label": "Paper", "url": "https://arxiv.org/abs/2508.07642" }, { "label": "Project", "url": "https://hlr.github.io/SkillNav/" }, { "label": "Code", "url": "https://github.com/HLR/SkillNav" }]
  },
  {
    "name": "SaaS-Bench", "label": "Multimodal Reasoning · Computer-Use Agents", "venue": "Preprint · 2026",
    "summary": "An evaluation benchmark for computer-use agents completing multi-step professional workflows in real, self-hosted SaaS applications, scored by task verifiers that inspect application state.",
    "artifact": "Locally deployable task environments and an evaluation harness with verifier contracts.",
    "image": "data/images/pub/publication-SaaS-Bench.svg",
    "links": [{ "label": "Paper", "url": "https://arxiv.org/abs/2605.15777" }, { "label": "Project", "url": "https://unipat.ai/blog/SaaS-Bench" }, { "label": "Code", "url": "https://github.com/UniPat-AI/SaaS-Bench" }]
  }
]
```

- [ ] **Step 4: Implement `renderFeaturedResearch` with escaped text and hardened external links**

```js
export function renderFeaturedResearch(projects, mountEl) {
  if (!mountEl) return;
  mountEl.innerHTML = projects.map((project) => `
    <article class="featured-research-card">
      <img src="${escapeAttr(project.image)}" alt="${escapeAttr(project.name)} project illustration">
      <div class="featured-research-card-body">
        <p class="featured-research-label">${escapeHtml(project.label)}</p>
        <h3>${escapeHtml(project.name)}</h3>
        <p class="featured-research-venue">${escapeHtml(project.venue)}</p>
        <p>${escapeHtml(project.summary)}</p>
        <p class="featured-research-artifact"><strong>Open Research Artifact</strong>${escapeHtml(project.artifact)}</p>
        <div>${project.links.map(renderLink).join('')}</div>
      </div>
    </article>`).join('');
}
```

Define `escapeHtml`, `escapeAttr`, and `renderLink` in that module. `renderLink` escapes its label and uses the required `target` and `rel` attributes.

- [ ] **Step 5: Run the renderer and data tests**

Run: `node --test tests/featured-research.test.mjs`

Expected: PASS with 2 tests, 0 failures.

- [ ] **Step 6: Commit the featured research unit**

```bash
git add data/featured-research.json assets/js/renderers/featured-research.js tests/featured-research.test.mjs
git commit -m "feat: add research highlight cards"
```

### Task 3: Mount Research Highlights and add responsive styles

**Files:**
- Create: `tests/homepage-research-focus.test.mjs`
- Modify: `index.html`
- Modify: `assets/js/main.js`
- Modify: `assets/css/main.css`

**Interfaces:**
- Consumes: `renderFeaturedResearch(projects, mountEl)` and `data/featured-research.json`.
- Produces: Home has `#featured-research-section` after `#about-section`; `init()` loads the data and renders it into `#featured-research-list`.

- [ ] **Step 1: Write failing homepage-wiring and layout tests**

```js
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
```

- [ ] **Step 2: Run the tests to verify they fail before homepage wiring exists**

Run: `node --test tests/homepage-research-focus.test.mjs`

Expected: FAIL because the mount, loader source, renderer call, and CSS grid do not exist.

- [ ] **Step 3: Add the section after `#about-section` in `index.html`**

```html
<section id="featured-research-section" class="bg-white p-6 rounded-lg shadow-md mb-8 fade-in-section" style="animation-delay: 150ms;">
  <h2 class="text-2xl font-bold border-b-2 border-blue-500 pb-2 mb-4">Research Highlights</h2>
  <p class="text-gray-700 leading-relaxed mb-6">I study multimodal reasoning for agents that perceive, reason, and act in interactive worlds. These projects pair research contributions with open, reproducible systems for building and evaluating agents.</p>
  <div id="featured-research-list" class="featured-research-grid"></div>
</section>
```

- [ ] **Step 4: Load and render the source in `assets/js/main.js`**

```js
import { renderFeaturedResearch } from './renderers/featured-research.js';
// Add featuredResearch: 'data/featured-research.json' to DATA.
// Add loadJSON(DATA.featuredResearch) as the seventh Promise.all item.
renderFeaturedResearch(featuredResearch, $('#featured-research-list'));
```

Keep the six existing loads and renderer calls intact.

- [ ] **Step 5: Add scoped styling in `assets/css/main.css`**

```css
.featured-research-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.featured-research-card { border: 1px solid #e5e7eb; border-radius: var(--radius-card); overflow: hidden; }
.featured-research-card img { height: 11rem; object-fit: cover; width: 100%; }
.featured-research-artifact strong { display: block; }

@media (max-width: 640px) {
  .featured-research-grid { grid-template-columns: 1fr; }
}
```

Add concrete card-body, label, venue, artifact, and link styles using existing color variables so the cards are legible without JavaScript layout helpers.

- [ ] **Step 6: Run the full Node suite**

Run: `node --test tests/*.test.mjs`

Expected: PASS with 9 tests, 0 failures.

- [ ] **Step 7: Serve the site and run the static smoke check**

```bash
python3 -m http.server 4173 --bind 127.0.0.1 >/tmp/suemarsr-homepage-server.log 2>&1 &
server_pid=$!
trap 'kill "$server_pid"' EXIT
curl -fsS http://127.0.0.1:4173/ | rg 'Research Highlights'
curl -fsS http://127.0.0.1:4173/data/featured-research.json | jq -e 'length == 2 and .[0].name == "SkillNav" and .[1].name == "SaaS-Bench"'
```

Expected: the section title is present and `jq` returns `true`.

- [ ] **Step 8: Commit homepage wiring and styles**

```bash
git add index.html assets/js/main.js assets/css/main.css tests/homepage-research-focus.test.mjs
git commit -m "feat: present research highlights on home"
```

### Task 4: Verify delivered content and scope

**Files:**
- Verify: `data/profile.json`, `data/featured-research.json`, `index.html`, `assets/js/main.js`, `assets/js/renderers/featured-research.js`, `assets/css/main.css`, and `tests/*.test.mjs`.

**Interfaces:**
- Consumes: all completed source and test units.
- Produces: evidence that content, static resources, test behavior, and git scope match the approved design.

- [ ] **Step 1: Run all tests**

Run: `node --test tests/*.test.mjs`

Expected: PASS with 9 tests, 0 failures.

- [ ] **Step 2: Inspect final scope and copy**

Run:

```bash
git diff master...HEAD --check
git diff master...HEAD -- data/profile.json data/featured-research.json index.html assets/js/main.js assets/js/renderers/featured-research.js assets/css/main.css
git status --short --branch
```

Expected: only design/plan documents, implementation files, and focused tests are changed; no copy asserts personal SaaS-Bench contributions or unverified metrics.

- [ ] **Step 3: Preserve the implementation commits as the final code history**

No further code commit is needed when Steps 1–2 are clean. Do not amend the design or plan commits.
