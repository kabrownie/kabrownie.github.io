/* ============================================================
   YouTube Video Gallery — auto-updating from a playlist
   With "Load more" pagination + prev/next lightbox navigation
   ============================================================ */
(function () {
  'use strict';

  // ==== CONFIG ============================================
  const API_KEY     = 'AIzaSyBScWzVqlmvvCbb0zk5cH5YGtrJMiVuH9s';
  const PLAYLIST_ID = 'PLKuh7kVBP-A4';
  const MAX_VIDEOS  = 60;
  const PAGE_SIZE   = 15;
  // ========================================================

  const gallery  = document.getElementById('videoGallery');
  const statusEl = document.getElementById('videoGalleryStatus');
  if (!gallery) return;

  let allItems = [];
  let renderedSoFar = 0;

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg || '';
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function pickThumb(thumbs) {
    if (!thumbs) return '';
    const t = thumbs.maxres || thumbs.standard || thumbs.high
           || thumbs.medium || thumbs.default || {};
    return t.url || '';
  }

  /* ---------- Fetch all videos from playlist ---------- */
  async function fetchAllItems() {
    const items = [];
    let pageToken = '';

    while (items.length < MAX_VIDEOS) {
      const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
      url.searchParams.set('part', 'snippet');
      url.searchParams.set('maxResults', '50');
      url.searchParams.set('playlistId', PLAYLIST_ID);
      url.searchParams.set('key', API_KEY);
      if (pageToken) url.searchParams.set('pageToken', pageToken);

      const res  = await fetch(url.toString());
      const data = await res.json();

      if (data.error) throw new Error(data.error.message || 'YouTube API error');

      (data.items || []).forEach(i => items.push(i));
      if (!data.nextPageToken) break;
      pageToken = data.nextPageToken;
    }

    return items.slice(0, MAX_VIDEOS);
  }

  /* ---------- Build one card ---------- */
  function buildCard(item) {
    const snippet = item.snippet || {};
    const videoId = snippet.resourceId && snippet.resourceId.videoId;
    if (!videoId) return null;

    const title = snippet.title || 'Untitled';
    const thumb = pickThumb(snippet.thumbnails);

    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'video-card';
    card.dataset.videoId = videoId;
    card.setAttribute('aria-label', 'Play video: ' + title);

    card.innerHTML =
      '<div class="video-card__thumb">' +
        '<img src="' + escapeHtml(thumb) + '" alt="' + escapeHtml(title) + '" loading="lazy" decoding="async">' +
        '<div class="video-card__play" aria-hidden="true">' +
          '<iconify-icon icon="lucide:play-circle"></iconify-icon>' +
        '</div>' +
      '</div>' +
      '<h3 class="video-card__title">' + escapeHtml(title) + '</h3>';

    return card;
  }

  /* ---------- Render next chunk ---------- */
  function renderNextChunk() {
    const chunk = allItems.slice(renderedSoFar, renderedSoFar + PAGE_SIZE);
    const frag  = document.createDocumentFragment();

    chunk.forEach(item => {
      const card = buildCard(item);
      if (card) frag.appendChild(card);
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
    const remaining = allItems.length - renderedSoFar;

    if (remaining <= 0) {
      if (loadMoreBtn && loadMoreBtn.parentNode) {
        loadMoreBtn.parentNode.removeChild(loadMoreBtn);
      }
      if (allItems.length > PAGE_SIZE) {
        setStatus('You’ve reached the end — ' + allItems.length + ' videos shown.');
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

  /* ---------- Modal with prev/next ---------- */
  const modal       = document.getElementById('videoModal');
  const modalFrame  = document.getElementById('videoModalFrame');
  const modalClose  = document.getElementById('videoModalClose');
  const modalPrev   = document.getElementById('videoModalPrev');
  const modalNext   = document.getElementById('videoModalNext');
  const modalCounter = document.getElementById('videoModalCounter');

  let currentIndex = -1; // index inside allItems

  function getVideoIdAt(index) {
    const item = allItems[index];
    if (!item || !item.snippet || !item.snippet.resourceId) return null;
    return item.snippet.resourceId.videoId || null;
  }

  function updateNavState() {
    if (!modalPrev || !modalNext || !modalCounter) return;
    modalPrev.disabled = currentIndex <= 0;
    modalNext.disabled = currentIndex >= allItems.length - 1;
    modalCounter.textContent =
      'Video ' + (currentIndex + 1) + ' of ' + allItems.length;
  }

  function loadVideoAtIndex(index) {
    const videoId = getVideoIdAt(index);
    if (!videoId) return;

    currentIndex = index;

    modalFrame.innerHTML =
      '<iframe src="https://www.youtube.com/embed/' + videoId +
      '?autoplay=1&rel=0&modestbranding=1" ' +
      'allow="autoplay; encrypted-media; picture-in-picture" ' +
      'allowfullscreen title="YouTube video player"></iframe>';

    updateNavState();
  }

  function openVideo(videoId) {
    if (!modal || !modalFrame) return;

    // Find the index of this videoId inside allItems
    const idx = allItems.findIndex(item => {
      const s = item.snippet;
      return s && s.resourceId && s.resourceId.videoId === videoId;
    });

    if (idx === -1) return;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    loadVideoAtIndex(idx);
  }

  function closeVideo() {
    if (!modal || !modalFrame) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    modalFrame.innerHTML = '';
    document.body.style.overflow = '';
    currentIndex = -1;
  }

  function goPrev() {
    if (currentIndex > 0) loadVideoAtIndex(currentIndex - 1);
  }

  function goNext() {
    if (currentIndex < allItems.length - 1) loadVideoAtIndex(currentIndex + 1);
  }

  // Delegated click on gallery cards
  gallery.addEventListener('click', function (e) {
    const card = e.target.closest('.video-card');
    if (!card || !card.dataset.videoId) return;
    openVideo(card.dataset.videoId);
  });

  if (modalClose) modalClose.addEventListener('click', closeVideo);
  if (modalPrev) modalPrev.addEventListener('click', goPrev);
  if (modalNext) modalNext.addEventListener('click', goNext);
  if (modal) modal.addEventListener('click', function (e) {
    if (e.target === modal) closeVideo();
  });

  document.addEventListener('keydown', function (e) {
    if (!modal || !modal.classList.contains('active')) return;
    if (e.key === 'Escape') closeVideo();
    if (e.key === 'ArrowLeft') goPrev();
    if (e.key === 'ArrowRight') goNext();
  });

  /* ---------- Init ---------- */
  async function init() {
    if (!API_KEY || API_KEY.indexOf('PASTE_YOUR') === 0) {
      setStatus('Video gallery is not configured yet.');
      return;
    }

    try {
      setStatus('Loading videos…');
      allItems = await fetchAllItems();

      if (!allItems.length) {
        setStatus('No videos are available right now. Please check back soon.');
        return;
      }

      gallery.innerHTML = '';
      renderNextChunk();
      setStatus('');
      console.log('✅ Loaded ' + allItems.length + ' videos from playlist.');
    } catch (err) {
      console.error('YouTube gallery error:', err);
      gallery.innerHTML = '';
      setStatus('Sorry — videos could not be loaded right now. Please try again shortly.');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();