export function renderNews(news, mountEl) {
  if (!mountEl) return;

  const items = news.map((n) => `
    <li class="flex items-start">
      <span class="news-date">${n.date}</span>
      <span>${n.html}</span>
    </li>`).join('');

  mountEl.innerHTML = `
    <h2 class="text-2xl font-bold border-b-2 border-blue-500 pb-2 mb-4">News</h2>
    <ul class="space-y-3 text-gray-700">${items}</ul>`;
}
