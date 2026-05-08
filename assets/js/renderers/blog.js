export function renderBlog(blog, { latestEl, archiveEl }) {
  if (latestEl && blog.latest) {
    const p = blog.latest;
    const meta = [p.date, p.source].filter(Boolean).join(' · ');
    latestEl.innerHTML = `
      <h2 class="text-2xl font-bold border-b-2 border-blue-500 pb-2 mb-4">Latest Post</h2>
      <article class="space-y-3 text-gray-700">
        <p class="text-sm text-gray-500">${meta}</p>
        <h3 class="text-xl font-semibold text-gray-900 leading-snug">${p.title}</h3>
        <p class="text-gray-700 leading-relaxed">${p.summary}</p>
        <a href="${p.url}" target="_blank" rel="noopener noreferrer" class="inline-block text-blue-600 hover:underline font-semibold">
          Read the full post →
        </a>
      </article>`;
  }

  if (archiveEl) {
    const items = (blog.archive || []).map((p) => `
      <li>
        <a href="${p.url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline font-semibold">
          ${p.title}
        </a>
      </li>`).join('');

    archiveEl.innerHTML = `
      <h2 class="text-2xl font-bold border-b-2 border-blue-500 pb-2 mb-4">Archive</h2>
      <ul class="space-y-3 text-gray-700">${items}</ul>`;
  }
}
