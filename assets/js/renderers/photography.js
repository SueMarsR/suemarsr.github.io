const FALLBACK_IMG = 'data/images/icon-owl-2.ico';

export function createPhotoGallery(data, { galleryEl, aboutEl, prevBtn, nextBtn }) {
  if (aboutEl && data.about) {
    aboutEl.innerHTML = `
      <h2 class="text-2xl font-semibold text-gray-800 mb-4">About My Photography</h2>
      <p class="text-gray-700 leading-relaxed">${data.about}</p>`;
  }

  if (!galleryEl) return { next: () => {}, prev: () => {} };

  const photos = data.photos || [];
  let index = 0;

  function display() {
    if (!photos.length) {
      galleryEl.innerHTML = '<p class="text-gray-500 text-center p-8">No photos yet.</p>';
      return;
    }
    const p = photos[index];
    galleryEl.innerHTML = `<img src="${p.src}" alt="${p.alt}" class="w-full h-full object-cover rounded-lg" onerror="this.onerror=null;this.src='${FALLBACK_IMG}';">`;
  }

  const next = () => { index = (index + 1) % photos.length; display(); };
  const prev = () => { index = (index - 1 + photos.length) % photos.length; display(); };

  if (nextBtn) nextBtn.addEventListener('click', next);
  if (prevBtn) prevBtn.addEventListener('click', prev);

  display();
  return { next, prev };
}
