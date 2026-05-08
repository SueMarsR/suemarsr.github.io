const FALLBACK_IMG = 'data/images/icon-owl-2.ico';

function formatAuthors(authors) {
  return authors.map((a) => {
    const name = a.equalContrib ? `${a.name}*` : a.name;
    return a.isMe ? `<span class="author-me">${name}</span>` : name;
  }).join(', ');
}

function linkButtons(links) {
  return Object.entries(links).map(([name, url]) =>
    `<a href="${url}" target="_blank" rel="noopener noreferrer" class="font-semibold text-blue-600 hover:underline">[${name.charAt(0).toUpperCase() + name.slice(1)}]</a>`
  ).join('\n');
}

function imageWithFallback(src) {
  const url = src || FALLBACK_IMG;
  return `<img src="${url}" alt="Paper Thumbnail" class="md:w-1/4 w-full h-48 md:h-auto object-cover" onerror="this.onerror=null;this.src='${FALLBACK_IMG}';">`;
}

function thumbWithFallback(src) {
  const url = src || FALLBACK_IMG;
  return `<img src="${url}" alt="Paper Thumbnail" class="w-full sm:w-32 h-auto rounded-md object-cover" onerror="this.onerror=null;this.src='${FALLBACK_IMG}';">`;
}

export function renderFullPublications(publications, mountEl) {
  if (!mountEl) return;

  const html = publications.map((pub, idx) => `
    <div class="flex flex-col md:flex-row items-center bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow fade-in-section" style="animation-delay: ${idx * 100}ms;">
      ${imageWithFallback(pub.image)}
      <div class="p-6 flex-1">
        <h2 class="text-xl font-semibold text-blue-700 mb-2">${pub.title}</h2>
        <p class="text-gray-700 mb-3 publication-authors">${formatAuthors(pub.authors)}</p>
        <p class="text-gray-600 italic mb-4">${pub.venue}</p>
        <div class="space-x-4 uppercase">${linkButtons(pub.links)}</div>
      </div>
    </div>`).join('');

  mountEl.innerHTML = html;
}

export function renderRecentPublications(publications, mountEl, count = 2) {
  if (!mountEl) return;

  const html = publications.slice(0, count).map((pub) => `
    <div class="flex flex-col sm:flex-row items-center gap-4">
      ${thumbWithFallback(pub.image)}
      <div class="flex-1">
        <h3 class="font-semibold text-blue-700">${pub.title}</h3>
        <p class="text-sm text-gray-700 publication-authors">${formatAuthors(pub.authors)}</p>
        <p class="text-sm text-gray-600 italic">${pub.venue}</p>
      </div>
    </div>`).join('');

  mountEl.innerHTML = html;
}
