/* ============================================================
   GitHub Image Gallery — auto-updating from a repo folder
   ============================================================ */
(function () {
  'use strict';

  // ==== CONFIG ============================================
  const OWNER       = 'kabrownie';
  const REPO        = 'my-renders';    // ← your new repo name
  const BRANCH      = 'main';          // ← 'main' or 'master' (see Step 4)
  const FOLDER      = 'branding';      // ← folder for THIS page
  const GALLERY_ID  = 'githubGallery';
  // ========================================================

  const gallery = document.getElementById(GALLERY_ID);
  if (!gallery) return;

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

  function render(images) {
    gallery.innerHTML = '';

    if (!images.length) {
      gallery.innerHTML =
        '<p style="color:rgba(255,255,255,.7);grid-column:1/-1;text-align:center;">' +
        'No images yet — check back soon.</p>';
      return;
    }

    const frag = document.createDocumentFragment();

    images.forEach(img => {
      const title = titleFromFilename(img.name);

      const figure = document.createElement('figure');
      figure.className = 'gallery-item';
      figure.innerHTML =
        '<img src="' + escapeHtml(img.url) + '" alt="' + escapeHtml(title) +
        '" loading="lazy" decoding="async">' +
        '<figcaption><strong>' + escapeHtml(title) + '</strong></figcaption>';

      frag.appendChild(figure);
    });

    gallery.appendChild(frag);
    console.log('✅ Rendered ' + images.length + ' images from GitHub.');
  }

  async function init() {
    try {
      gallery.innerHTML =
        '<div class="gallery-item video-card--skeleton" aria-hidden="true"></div>'.repeat(6);
      const images = await fetchImages();
      render(images);
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