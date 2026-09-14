/* ============================================================
   GitHub Image Gallery — auto-updating from a repo folder
   With "Load more" pagination
   ============================================================ */
(function () {
  'use strict';

  // ==== CONFIG ============================================
  const OWNER       = 'kabrownie';
  const REPO        = 'my-renders';    // ← your repo name
  const BRANCH      = 'main';          // ← 'main' or 'master'
  const FOLDER      = 'renders';       // ← your folder
  const GALLERY_ID  = 'githubGallery';
  const PAGE_SIZE   = 12;              // images per "page"
  // ========================================================

  const gallery = document.getElementById(GALLERY_ID);
  if (!gallery) return;

  let allImages = [];
  let renderedSoFar = 0;

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function titleFromFilename(name) {
    return name
      .replace(/\.[^.]+$/, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  const IMAGE_EXT = /\.(png|jpe?g|webp|gif|avif)$/i;

  async function fetchImages() {
    const url = 'https://api.github.com/repos/'
      + OWNER + '/' + REPO
      + '/contents/' + FOLDER
      + '?ref=' + BRANCH;

    const res = await fetch(url, {
      headers: { 'Accept': 'application/vnd.github+json' }
    });

    if (!res.ok) throw new Error('GitHub API error: ' + res.status);

    const files = await res.json();
    if (!Array.isArray(files)) throw new Error('Unexpected GitHub response');

    return files
      .filter(f => f.type === 'file' && IMAGE_EXT.test(f.name))
      .map(f => ({ name: f.name, url: f.download_url }));
  }

  /* ---------- Render next chunk ---------- */
  function renderNextChunk() {
    const chunk = allImages.slice(renderedSoFar, renderedSoFar + PAGE_SIZE);
    const frag  = document.createDocumentFragment();

    chunk.forEach(img => {
      const title = titleFromFilename(img.name);

      const figure = document.createElement('figure');
      figure.className = 'gallery-item';
      figure.innerHTML =
        '<img src="' + escapeHtml(img.url) + '" alt="' + escapeHtml(title) +
        '" loading="lazy" decoding="async">';

      frag.appendChild(figure);
    });

    gallery.appendChild(frag);
    renderedSoFar += chunk.length;
    updateLoadMoreButton();
  }

  /* ---------- Load more button ---------- */
  let loadMoreBtn = null;

  function createLoadMoreButton() {
    loadMoreBtn = document.createElement('button');
    loadMoreBtn.type = 'button';
    loadMoreBtn.className = 'video-load-more';
    loadMoreBtn.innerHTML =
      '<span>Load more</span>' +
      '<iconify-icon icon="lucide:arrow-down"></iconify-icon>';
    loadMoreBtn.addEventListener('click', function () {
      loadMoreBtn.disabled = true;
      loadMoreBtn.classList.add('is-loading');
      requestAnimationFrame(() => {
        renderNextChunk();
        loadMoreBtn.disabled = false;
        loadMoreBtn.classList.remove('is-loading');
      });
    });
    return loadMoreBtn;
  }

  function updateLoadMoreButton() {
    const remaining = allImages.length - renderedSoFar;

    if (remaining <= 0) {
      if (loadMoreBtn && loadMoreBtn.parentNode) {
        loadMoreBtn.parentNode.removeChild(loadMoreBtn);
      }
      return;
    }

    if (!loadMoreBtn) {
      loadMoreBtn = createLoadMoreButton();
      gallery.parentNode.insertBefore(loadMoreBtn, gallery.nextSibling);
    }

    loadMoreBtn.querySelector('span').textContent =
      'Load more (' + remaining + ' remaining)';
  }

  /* ---------- Init ---------- */
  async function init() {
    try {
      // Skeleton placeholders while loading
      gallery.innerHTML =
        '<div class="gallery-item video-card--skeleton" aria-hidden="true"></div>'
          .repeat(PAGE_SIZE);

      allImages = await fetchImages();

      if (!allImages.length) {
        gallery.innerHTML =
          '<p style="color:rgba(255,255,255,.7);grid-column:1/-1;text-align:center;">' +
          'No images yet — check back soon.</p>';
        return;
      }

      gallery.innerHTML = '';
      renderNextChunk();
      console.log('✅ Loaded ' + allImages.length + ' images from GitHub.');
    } catch (err) {
      console.error('GitHub gallery error:', err);
      gallery.innerHTML =
        '<p style="color:rgba(255,255,255,.7);grid-column:1/-1;text-align:center;">' +
        'Images could not be loaded right now.</p>';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();