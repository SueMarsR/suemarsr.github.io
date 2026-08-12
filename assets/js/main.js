import { loadJSON } from './data-loader.js';
import { renderProfile } from './renderers/profile.js';
import { renderNews } from './renderers/news.js';
import { renderFullPublications, renderRecentPublications } from './renderers/publications.js';
import { renderExperience } from './renderers/experience.js';
import { renderBlog } from './renderers/blog.js';
import { createPhotoGallery } from './renderers/photography.js';
import { renderFeaturedResearch } from './renderers/featured-research.js';

const DATA = {
  profile:      'data/profile.json',
  news:         'data/news.json',
  publications: 'data/publications.json',
  experience:   'data/experience.json',
  blog:         'data/blog.json',
  photography:  'data/photography.json',
  featuredResearch: 'data/featured-research.json',
};

function $(sel, root = document) { return root.querySelector(sel); }
function $$(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

function initNavigation() {
  const pages = $$('.page');
  const links = $$('.nav-link');

  function showPage(pageId) {
    pages.forEach((p) => p.classList.toggle('active', p.id === pageId));
    links.forEach((l) => l.classList.toggle('active', l.dataset.page === pageId));

    const newPage = document.getElementById(pageId);
    if (newPage) {
      newPage.querySelectorAll('.fade-in-section').forEach((section, i) => {
        section.style.animation = 'none';
        // eslint-disable-next-line no-unused-expressions
        section.offsetHeight;
        section.style.animation = `fadeIn 0.6s ease-out forwards ${i * 100}ms`;
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = link.dataset.page;
      if (id) showPage(id);
    });
  });

  // Inline triggers (e.g., "View all publications →")
  $$('[data-page-link]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      showPage(el.dataset.pageLink);
    });
  });

  return showPage;
}

async function init() {
  initNavigation();

  // Load all data in parallel
  const [profile, news, publications, experience, blog, photography, featuredResearch] = await Promise.all([
    loadJSON(DATA.profile),
    loadJSON(DATA.news),
    loadJSON(DATA.publications),
    loadJSON(DATA.experience),
    loadJSON(DATA.blog),
    loadJSON(DATA.photography),
    loadJSON(DATA.featuredResearch),
  ]);

  renderProfile(profile, {
    headerEl: $('#profile-header'),
    aboutEl:  $('#about-section'),
    navLogoEl: $('#nav-logo'),
    footerEl: $('#footer'),
  });

  renderFeaturedResearch(featuredResearch, $('#featured-research-list'));

  renderNews(news, $('#news-section'), 5);

  renderFullPublications(publications, $('#publications-list'));
  renderRecentPublications(publications, $('#recent-publications-list'), 2);

  renderExperience(experience, $('#experience-section'));

  await renderBlog(blog, {
    latestEl:  $('#blog-latest'),
    archiveEl: $('#blog-archive'),
  });

  createPhotoGallery(photography, {
    galleryEl: $('#gallery-image-container'),
    aboutEl:   $('#photography-about'),
    prevBtn:   $('#gallery-prev'),
    nextBtn:   $('#gallery-next'),
  });

  // Re-create lucide icons after dynamic content lands
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  init().catch((err) => {
    console.error('Site init failed:', err);
    const main = document.querySelector('main');
    if (main) {
      main.insertAdjacentHTML('afterbegin',
        `<div class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
           Failed to load site content: ${err.message}
         </div>`);
    }
  });
});
