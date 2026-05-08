const FALLBACK_IMG = 'data/images/icon-owl-2.ico';

const SOCIAL_ICONS = {
  email:    { lucide: 'mail',      hover: 'hover:text-blue-600' },
  github:   { lucide: 'github',    hover: 'hover:text-gray-900' },
  cv:       { lucide: 'file-text', hover: 'hover:text-red-600' },
  scholar:  { svg: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M5.242 13.769L0 9.5L12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9 12 9s-5.548 2.249-6.758 4.769zM12 10c-1.654 0-3 1.346-3 3s1.346 3 3 3 3-1.346 3-3-1.346-3-3-3z"/></svg>', hover: 'hover:text-blue-600' },
  linkedin: { svg: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>', hover: 'hover:text-blue-700' },
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
        <div class="flex space-x-4 mt-4">${socials}</div>
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
