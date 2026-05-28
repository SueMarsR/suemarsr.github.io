const FALLBACK_IMG = 'data/images/icon-owl-2.ico';

// Outline (stroke) SVG wrapper matching Lucide's default style, so brand icons
// stay visually consistent with Lucide line icons (mail, file-text, etc.).
// Lucide dropped its `github`/`linkedin` brand icons, so those are inlined here.
function outlineSvg(paths) {
  return `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

const SOCIAL_ICONS = {
  email:    { lucide: 'mail',           hover: 'hover:text-blue-600' },
  scholar:  { lucide: 'graduation-cap', hover: 'hover:text-blue-600' },
  github:   { svg: outlineSvg('<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>'), hover: 'hover:text-gray-900' },
  linkedin: { svg: outlineSvg('<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>'), hover: 'hover:text-blue-700' },
  cv:       { lucide: 'file-text',      hover: 'hover:text-red-600' },
};

function renderSocial(s) {
  const def = SOCIAL_ICONS[s.type] || { lucide: 'link', hover: 'hover:text-blue-600' };
  const inner = def.svg ? def.svg : `<i data-lucide="${def.lucide}" class="w-6 h-6"></i>`;
  return `<a href="${s.href}" ${s.type === 'email' ? '' : 'target="_blank" rel="noopener noreferrer"'} class="text-gray-500 ${def.hover}" title="${s.title}">${inner}</a>`;
}

export function renderProfile(profile, { headerEl, aboutEl, navLogoEl, footerEl }) {
  if (headerEl) {
    const socials = profile.socials.map(renderSocial).join('\n');
    headerEl.innerHTML = `
      <img class="w-32 h-32 rounded-full object-cover shadow-lg"
           src="${profile.avatar}" alt="${profile.name}"
           onerror="this.onerror=null;this.src='${FALLBACK_IMG}';">
      <div class="flex-1">
        <h1 class="text-4xl font-bold text-gray-900">${profile.name}</h1>
        <p class="text-md text-gray-500">${profile.title}</p>
        <div class="flex items-center space-x-4 mt-4">${socials}</div>
      </div>`;
  }

  if (aboutEl) {
    aboutEl.innerHTML = `
      <h2 class="text-2xl font-bold border-b-2 border-blue-500 pb-2 mb-4">About Me</h2>
      <p class="text-gray-700 leading-relaxed space-y-4">${profile.about}</p>`;
  }

  if (navLogoEl && profile.navLogo) {
    navLogoEl.innerHTML = `
      <img id="nav-logo-img"
           class="w-6 h-6 rounded-full object-cover shadow-lg"
           src="${profile.navLogo}" alt="${profile.name}"
           onerror="this.onerror=null;this.src='${FALLBACK_IMG}';">`;
  }

  if (footerEl && profile.footer) {
    footerEl.innerHTML = `<p>${profile.footer}</p>`;
  }

  if (profile.favicon) {
    document.querySelectorAll('link[rel="icon"]').forEach((l) => { l.href = profile.favicon; });
  }

  document.title = `${profile.name} - Homepage`;
}
