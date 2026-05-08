export function renderExperience(items, mountEl) {
  if (!mountEl) return;

  const blocks = items.map((it) => `
    <div>
      <h3 class="font-semibold text-lg">${it.role}</h3>
      <p class="text-gray-600">${it.org}${it.period ? `, ${it.period}` : ''}</p>
      ${it.note ? `<p class="text-gray-500 text-sm">${it.note}</p>` : ''}
    </div>`).join('');

  mountEl.innerHTML = `
    <h2 class="text-2xl font-bold border-b-2 border-blue-500 pb-2 mb-4">Experience</h2>
    <div class="space-y-4">${blocks}</div>`;
}
