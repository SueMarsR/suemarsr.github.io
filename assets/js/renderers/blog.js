const BLOG_PREVIEW_BLOCKS = 4;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeUrl(url) {
  const value = String(url || '').trim();
  return /^(https?:\/\/|#)/.test(value) ? value : '#';
}

function renderInlineMarkdown(text) {
  let html = escapeHtml(text);

  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
    const href = safeUrl(url);
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="link">${label}</a>`;
  });

  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return html;
}

function listHtml(items, ordered) {
  const tag = ordered ? 'ol' : 'ul';
  return `<${tag}>${items.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join('')}</${tag}>`;
}

function markdownToHtml(markdown) {
  const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let paragraph = [];
  let list = [];
  let listOrdered = false;
  let quote = [];
  let skippedTitle = false;

  function flushParagraph() {
    if (!paragraph.length) return;
    blocks.push(`<p>${renderInlineMarkdown(paragraph.join(' '))}</p>`);
    paragraph = [];
  }

  function flushList() {
    if (!list.length) return;
    blocks.push(listHtml(list, listOrdered));
    list = [];
    listOrdered = false;
  }

  function flushQuote() {
    if (!quote.length) return;
    blocks.push(`<blockquote>${quote.map((line) => `<p>${renderInlineMarkdown(line)}</p>`).join('')}</blockquote>`);
    quote = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      flushQuote();
      continue;
    }

    const heading = /^(#{1,4})\s+(.+)$/.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      flushQuote();

      if (heading[1].length === 1 && !skippedTitle) {
        skippedTitle = true;
        continue;
      }

      const level = Math.min(heading[1].length + 1, 5);
      blocks.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    const ordered = /^\d+\.\s+(.+)$/.exec(line);
    if (ordered) {
      flushParagraph();
      flushQuote();
      if (list.length && !listOrdered) flushList();
      listOrdered = true;
      list.push(ordered[1]);
      continue;
    }

    const unordered = /^[-*]\s+(.+)$/.exec(line);
    if (unordered) {
      flushParagraph();
      flushQuote();
      if (list.length && listOrdered) flushList();
      listOrdered = false;
      list.push(unordered[1]);
      continue;
    }

    const blockquote = /^>\s?(.*)$/.exec(line);
    if (blockquote) {
      flushParagraph();
      flushList();
      quote.push(blockquote[1]);
      continue;
    }

    flushList();
    flushQuote();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  flushQuote();

  return blocks.join('\n');
}

function previewHtml(blocks, expanded) {
  const visible = expanded ? blocks : blocks.slice(0, BLOG_PREVIEW_BLOCKS);
  return visible.join('\n');
}

function expandLabel(langKey, expanded) {
  if (langKey === 'cn') return expanded ? '收起' : '展开全文';
  return expanded ? 'Show less' : 'Read more';
}

async function loadMarkdown(url) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status} ${res.statusText}`);
  return res.text();
}

export async function renderBlog(blog, { latestEl, archiveEl }) {
  if (latestEl && blog.latest) {
    const p = blog.latest;
    const meta = [p.date, p.source].filter(Boolean).join(' · ');
    const languages = p.languages || {};
    const languageEntries = Object.entries(languages);
    const defaultLang = languageEntries[0]?.[0];
    const current = defaultLang ? languages[defaultLang] : p;
    const hasSwitch = languageEntries.length > 1;

    latestEl.innerHTML = `
      <h2 class="text-2xl font-bold border-b-2 border-blue-500 pb-2 mb-4">Latest Post</h2>
      <article class="space-y-4 text-gray-700" id="${p.slug || 'latest-post'}">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p class="text-sm text-gray-500">${meta}</p>
            <h3 class="blog-title text-xl font-semibold text-gray-900 leading-snug">${current.title}</h3>
          </div>
          ${hasSwitch ? `
            <div class="blog-language-switch" role="group" aria-label="Blog language">
              ${languageEntries.map(([key, lang], idx) => `
                <button type="button" class="blog-language-button${idx === 0 ? ' active' : ''}" data-blog-lang="${key}">
                  ${lang.label || key.toUpperCase()}
                </button>`).join('')}
            </div>` : ''}
        </div>
        <p class="blog-summary text-gray-700 leading-relaxed">${current.summary || p.summary || ''}</p>
        ${p.url ? `
          <a href="${p.url}" target="_blank" rel="noopener noreferrer" class="inline-block text-blue-600 hover:underline font-semibold">
            Read the full post →
          </a>` : ''}
        <div class="blog-content leading-relaxed text-gray-800"></div>
        <button type="button" class="blog-expand-button" aria-expanded="false" hidden>Read more</button>
      </article>`;

    const titleEl = latestEl.querySelector('.blog-title');
    const summaryEl = latestEl.querySelector('.blog-summary');
    const contentEl = latestEl.querySelector('.blog-content');
    const expandButton = latestEl.querySelector('.blog-expand-button');
    const buttons = Array.from(latestEl.querySelectorAll('[data-blog-lang]'));
    let activeLang = defaultLang;
    let activeBlocks = [];
    let expanded = false;

    function renderContentPreview() {
      if (!contentEl) return;
      contentEl.innerHTML = previewHtml(activeBlocks, expanded);
      if (expandButton) {
        const canExpand = activeBlocks.length > BLOG_PREVIEW_BLOCKS;
        expandButton.hidden = !canExpand;
        expandButton.textContent = expandLabel(activeLang, expanded);
        expandButton.setAttribute('aria-expanded', String(expanded));
      }
    }

    async function selectLanguage(langKey) {
      const lang = languages[langKey];
      if (!lang || !contentEl) return;

      activeLang = langKey;
      expanded = false;
      buttons.forEach((button) => {
        const active = button.dataset.blogLang === langKey;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });

      if (titleEl) titleEl.textContent = lang.title;
      if (summaryEl) summaryEl.textContent = lang.summary || '';

      if (lang.contentUrl) {
        contentEl.innerHTML = '<p class="text-gray-500">Loading post...</p>';
        const markdown = await loadMarkdown(lang.contentUrl);
        activeBlocks = markdownToHtml(markdown).split('\n').filter(Boolean);
        renderContentPreview();
      } else {
        activeBlocks = [];
        renderContentPreview();
      }
    }

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        selectLanguage(button.dataset.blogLang).catch((err) => {
          if (contentEl) {
            contentEl.innerHTML = `<p class="text-red-700">Failed to load post: ${escapeHtml(err.message)}</p>`;
          }
        });
      });
    });

    if (expandButton) {
      expandButton.addEventListener('click', () => {
        expanded = !expanded;
        renderContentPreview();
      });
    }

    if (defaultLang) {
      await selectLanguage(defaultLang);
    }
  }

  if (archiveEl) {
    const items = (blog.archive || []).map((p) => `
      <li>
        <a href="${p.url}" ${p.url?.startsWith('#') ? '' : 'target="_blank" rel="noopener noreferrer"'} class="text-blue-600 hover:underline font-semibold">
          ${p.title}
        </a>
      </li>`).join('');

    archiveEl.innerHTML = `
      <h2 class="text-2xl font-bold border-b-2 border-blue-500 pb-2 mb-4">Archive</h2>
      <ul class="space-y-3 text-gray-700">${items}</ul>`;
  }
}
