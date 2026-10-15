(function () {
  'use strict';

  const API_KEY = 'AIzaSyBScWzVqlmvvCbb0zk5cH5YGtrJMiVuH9s';
  const PLAYLIST_ID = 'PLKuh7kVBP-A4';
  const MAX_VIDEOS = 60;
  const PAGE_SIZE = 15;
  const gallery = document.getElementById('videoGallery');
  const statusEl = document.getElementById('videoGalleryStatus');
  const modal = document.getElementById('videoModal');
  const frame = document.getElementById('videoModalFrame');
  const counter = document.getElementById('videoModalCounter');
  const previous = document.getElementById('videoModalPrev');
  const next = document.getElementById('videoModalNext');
  const close = document.getElementById('videoModalClose');

  if (!gallery) return;

  let videos = [];
  let rendered = 0;
  let currentIndex = -1;
  let loadMore;

  function setStatus(message) {
    if (statusEl) statusEl.textContent = message || '';
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function thumbnail(item) {
    const thumbnails = item.snippet && item.snippet.thumbnails;
    const image = thumbnails && (thumbnails.maxres || thumbnails.standard || thumbnails.high || thumbnails.medium || thumbnails.default);
    return image ? image.url : '';
  }

  async function fetchVideos() {
    const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('maxResults', '50');
    url.searchParams.set('playlistId', PLAYLIST_ID);
    url.searchParams.set('key', API_KEY);
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok || data.error) throw new Error(data.error?.message || 'YouTube API error');
    return (data.items || []).slice(0, MAX_VIDEOS).filter(item => item.snippet?.resourceId?.videoId);
  }

  function buildCard(item) {
    const title = item.snippet.title || 'Untitled video';
    const videoId = item.snippet.resourceId.videoId;
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'video-card';
    card.dataset.videoId = videoId;
    card.setAttribute('aria-label', 'Play video: ' + title);
    card.innerHTML = '<div class="video-card__thumb"><img src="' + escapeHtml(thumbnail(item)) + '" alt="' + escapeHtml(title) + '" loading="lazy" decoding="async"><div class="video-card__play" aria-hidden="true"><iconify-icon icon="lucide:play-circle"></iconify-icon></div></div><h3 class="video-card__title">' + escapeHtml(title) + '</h3>';
    return card;
  }

  function updateLoadMore() {
    const remaining = videos.length - rendered;
    if (remaining <= 0) {
      loadMore?.remove();
      loadMore = null;
      return;
    }
    if (!loadMore) {
      loadMore = document.createElement('button');
      loadMore.type = 'button';
      loadMore.className = 'video-load-more';
      loadMore.addEventListener('click', renderNextPage);
      gallery.after(loadMore);
    }
    loadMore.innerHTML = '<span>Load more (' + remaining + ' remaining)</span><iconify-icon icon="lucide:arrow-down"></iconify-icon>';
  }

  function renderNextPage() {
    const page = videos.slice(rendered, rendered + PAGE_SIZE);
    page.forEach(item => gallery.appendChild(buildCard(item)));
    rendered += page.length;
    updateLoadMore();
  }

  function updateModal() {
    const item = videos[currentIndex];
    if (!item || !frame) return;
    const videoId = item.snippet.resourceId.videoId;
    frame.innerHTML = '<iframe src="https://www.youtube.com/embed/' + encodeURIComponent(videoId) + '?autoplay=1&rel=0&modestbranding=1" title="YouTube video player" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
    if (counter) counter.textContent = 'Video ' + (currentIndex + 1) + ' of ' + videos.length;
    if (previous) previous.disabled = currentIndex <= 0;
    if (next) next.disabled = currentIndex >= videos.length - 1;
  }

  function openModal(videoId) {
    currentIndex = videos.findIndex(item => item.snippet.resourceId.videoId === videoId);
    if (currentIndex < 0 || !modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    updateModal();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    if (frame) frame.innerHTML = '';
    document.body.style.overflow = '';
    currentIndex = -1;
  }

  gallery.addEventListener('click', event => {
    const card = event.target.closest('.video-card');
    if (card) openModal(card.dataset.videoId);
  });
  close?.addEventListener('click', closeModal);
  previous?.addEventListener('click', () => { if (currentIndex > 0) { currentIndex -= 1; updateModal(); } });
  next?.addEventListener('click', () => { if (currentIndex < videos.length - 1) { currentIndex += 1; updateModal(); } });
  modal?.addEventListener('click', event => { if (event.target === modal) closeModal(); });
  document.addEventListener('keydown', event => {
    if (!modal?.classList.contains('active')) return;
    if (event.key === 'Escape') closeModal();
    if (event.key === 'ArrowLeft' && currentIndex > 0) { currentIndex -= 1; updateModal(); }
    if (event.key === 'ArrowRight' && currentIndex < videos.length - 1) { currentIndex += 1; updateModal(); }
  });

  fetchVideos().then(data => {
    videos = data;
    gallery.innerHTML = '';
    if (!videos.length) {
      setStatus('No videos are available right now. Please check back soon.');
      return;
    }
    renderNextPage();
  }).catch(error => {
    console.error('YouTube gallery error:', error);
    gallery.innerHTML = '';
    setStatus('Sorry — videos could not be loaded right now. Please try again shortly.');
  });
})();
