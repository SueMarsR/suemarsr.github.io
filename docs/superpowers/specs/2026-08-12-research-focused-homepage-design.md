# Research-Focused Homepage Redesign

## Goal

Rework the homepage at `suemarsr.github.io` so that visitors immediately
understand Tianyi Ma's research direction: building multimodal reasoning
agents for interactive worlds. The homepage will use SkillNav and SaaS-Bench
as the two featured examples, while preserving the academic profile,
publications, experience, and contact paths already on the site.

## Audience and outcome

The primary visitors are prospective research collaborators, faculty, and AI
research hiring teams. Within one screen of the homepage, they should be able
to identify the research theme and open a primary paper, project page, or code
repository for either featured project. Visitors seeking a conventional
academic record should still find the existing publications and experience
sections without navigation changes.

## Positioning and copy

The hero title remains the author's name and academic affiliation. Its
research-facing subtitle will be:

> Building multimodal reasoning agents for interactive worlds.

The revised About section will state that the research concerns how agents
perceive, reason, and act across embodied and software environments. It will
retain the verified MSU / HLR Lab affiliation and advisor relationship, and
will explicitly name multimodal reasoning, agents, and vision-and-language
navigation as the research areas.

The site stays English-first. Copy must be precise and evidence-backed: it
must not invent personal contributions to SaaS-Bench, invent evaluation
numbers, or make capability claims that cannot be supported by the linked
paper or project materials.

## Homepage information architecture

The Home page will appear in this order:

1. Existing profile hero and social/contact links.
2. Revised About section containing the research statement.
3. New **Featured Research** section with two project cards.
4. Existing News section.
5. Existing Recent Publications section and its link to the full publication
   page.
6. Existing Experience section.

The navigation, dedicated Publications page, Blog, Photography page, footer,
and existing JSON-backed data loading pattern remain intact.

## Featured Research section

Featured research is represented by a dedicated JSON data file and a focused
renderer. This keeps visual content separate from the profile biography and
allows future projects to be added without changing layout code.

Each project card presents a thumbnail, project label, venue/status, one
short evidence-based summary, and accessible outbound links. Links open in a
new tab and have `noopener noreferrer` protection.

### SkillNav

- Label: `SkillNav`
- Venue/status: `ACL 2026 Oral`
- Summary: a mixture of skill-based vision-and-language navigation agents;
  the project breaks navigation into specialists and uses a VLM router to
  compose them for complex instruction following.
- Links: arXiv paper, project page, official HLR/SkillNav repository.

### SaaS-Bench

- Label: `SaaS-Bench`
- Venue/status: `Preprint · 2026`
- Summary: an evaluation benchmark for computer-use agents completing
  multi-step professional workflows in real, self-hosted SaaS applications;
  its task verifier scores the resulting application state.
- Links: arXiv paper, UniPat project page, canonical UniPat-AI/SaaS-Bench
  repository.

## Visual and responsive behavior

The new section will follow the existing white-card, blue-accent visual
system. Cards will be a two-column grid on wider screens and a single column
on narrow screens. The project thumbnail is decorative context; its `alt`
text names the project. The primary content—including project name, venue,
summary, and links—remains readable and usable without the image.

The current page-loading error handling must continue to work if the featured
research JSON request fails. The Featured Research renderer accepts an array
and writes only into its supplied mount element.

## Data and code boundaries

- `data/profile.json`: identity, social links, footer, and revised biography.
- `data/featured-research.json`: structured content for SkillNav and
  SaaS-Bench only.
- `assets/js/renderers/featured-research.js`: markup generation for the two
  featured project cards.
- `assets/js/main.js`: loads the feature data alongside the existing JSON and
  invokes the new renderer.
- `index.html`: adds the `featured-research-section` mount point after About.
- `assets/css/main.css`: defines only the project-card layout and small-screen
  breakpoint behavior not already covered by Tailwind utilities.
- `tests/featured-research.test.mjs`: locks the card's public content contract
  and link hardening behavior.

## Acceptance criteria

1. The browser title and hero still identify Tianyi Ma and MSU, and existing
   email, Scholar, GitHub, LinkedIn, and CV links continue to render.
2. The homepage makes “multimodal reasoning agents for interactive worlds”
   visible before Featured Research.
3. Exactly two featured cards appear in the stated order: SkillNav, then
   SaaS-Bench.
4. The cards contain the specified venue/status, summaries, and canonical
   paper/project/code links; no unverified metrics or personal-contribution
   claims appear.
5. The featured cards display side-by-side at desktop width and stack at
   mobile width.
6. Existing publication tests, new renderer/data tests, and a static server
   smoke check pass.

## Non-goals

- No changes to the GitHub Profile README.
- No changes to publication authorship, citation data, experience entries, or
  the rest of the site's navigation.
- No new framework, build system, analytics, or third-party dependency.
