function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function escapeAttr(value) {
  return escapeHtml(value)
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderLink({ label, url }) {
  return `<a href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer" class="featured-research-link">${escapeHtml(label)}</a>`;
}

export function renderFeaturedResearch(projects, mountEl) {
  if (!mountEl) return;

  mountEl.innerHTML = projects.map((project) => `
    <article class="featured-research-card">
      <img src="${escapeAttr(project.image)}" alt="${escapeAttr(project.name)} project illustration">
      <div class="featured-research-card-body">
        <p class="featured-research-label">${escapeHtml(project.label)}</p>
        <h3>${escapeHtml(project.name)}</h3>
        <p class="featured-research-venue">${escapeHtml(project.venue)}</p>
        <p class="featured-research-summary">${escapeHtml(project.summary)}</p>
        <p class="featured-research-artifact"><strong>Open Research Artifact</strong>${escapeHtml(project.artifact)}</p>
        <div class="featured-research-links">${project.links.map(renderLink).join('')}</div>
      </div>
    </article>`).join('');
}
