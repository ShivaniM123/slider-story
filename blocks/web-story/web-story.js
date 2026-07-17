const AUTOPLAY_MS = 6000;

function clearTimer(state) {
  if (state.timer) {
    clearTimeout(state.timer);
    state.timer = null;
  }
}

function updateNavState(state) {
  const total = state.slides.length;
  const atStart = state.current === 0;
  const atEnd = state.current === total - 1;

  // First slide: nothing before it, so disable the previous arrow.
  state.prevBtn.disabled = atStart;

  // Last slide: the next arrow becomes a replay control.
  state.nextBtn.classList.toggle('web-story-nav-replay', atEnd);
  state.nextBtn.setAttribute('aria-label', atEnd ? 'Replay story' : 'Next slide');
}

function showSlide(block, state, index) {
  const total = state.slides.length;
  const next = Math.max(0, Math.min(index, total - 1));
  state.current = next;

  state.slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === next);
    slide.setAttribute('aria-hidden', i !== next);
  });

  state.bars.forEach((fill, i) => {
    fill.classList.remove('filling');
    if (i < next) {
      fill.style.transform = 'scaleX(1)';
    } else if (i > next) {
      fill.style.transform = 'scaleX(0)';
    } else {
      fill.style.transform = 'scaleX(0)';
      // Force reflow so the animation restarts on re-entry.
      fill.getBoundingClientRect();
      fill.classList.add('filling');
    }
  });

  updateNavState(state);

  clearTimer(state);
  // Advance automatically until the last slide, then stop (no looping).
  if (!state.paused && next < total - 1) {
    state.timer = setTimeout(() => showSlide(block, state, next + 1), AUTOPLAY_MS);
  }
}

function pause(state) {
  state.paused = true;
  clearTimer(state);
  const fill = state.bars[state.current];
  if (fill) {
    const computed = getComputedStyle(fill).transform;
    fill.classList.remove('filling');
    fill.style.transform = computed === 'none' ? 'scaleX(0)' : computed;
  }
}

function resume(block, state) {
  if (!state.paused) return;
  // A manual pause (via the play/pause button) overrides transient resumes
  // from press-and-hold release or the story scrolling back into view.
  if (state.manualPause) return;
  state.paused = false;
  showSlide(block, state, state.current);
}

export default function decorate(block) {
  const rows = [...block.children];

  const viewer = document.createElement('div');
  viewer.className = 'web-story-viewer';

  const slidesEl = document.createElement('div');
  slidesEl.className = 'web-story-slides';

  const slides = rows.map((row, i) => {
    const slide = document.createElement('div');
    slide.className = 'web-story-slide';
    slide.dataset.index = i;

    const [imageCell, textCell] = row.children;
    if (imageCell) {
      imageCell.className = 'web-story-slide-image';
      slide.append(imageCell);
    }
    if (textCell) {
      textCell.className = 'web-story-slide-caption';
      slide.append(textCell);
    }
    return slide;
  });
  slides.forEach((slide) => slidesEl.append(slide));

  const progress = document.createElement('div');
  progress.className = 'web-story-progress';
  const bars = slides.map(() => {
    const bar = document.createElement('div');
    bar.className = 'web-story-progress-bar';
    const fill = document.createElement('div');
    fill.className = 'web-story-progress-fill';
    fill.style.animationDuration = `${AUTOPLAY_MS}ms`;
    bar.append(fill);
    progress.append(bar);
    return fill;
  });

  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'web-story-nav web-story-nav-prev';
  prevBtn.setAttribute('aria-label', 'Previous slide');

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'web-story-nav web-story-nav-next';
  nextBtn.setAttribute('aria-label', 'Next slide');

  const pauseBtn = document.createElement('button');
  pauseBtn.type = 'button';
  pauseBtn.className = 'web-story-playpause';
  pauseBtn.setAttribute('aria-label', 'Pause story');

  const shareBtn = document.createElement('button');
  shareBtn.type = 'button';
  shareBtn.className = 'web-story-share';
  shareBtn.setAttribute('aria-label', 'Share story');

  block.textContent = '';
  viewer.append(slidesEl, progress, pauseBtn, shareBtn);
  // Nav arrows sit in the gutter OUTSIDE the clipped viewer.
  block.append(prevBtn, viewer, nextBtn);

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Web Story');

  const state = {
    slides,
    bars,
    prevBtn,
    nextBtn,
    current: 0,
    timer: null,
    paused: false,
    manualPause: false,
  };

  function setManualPause(isPaused) {
    state.manualPause = isPaused;
    pauseBtn.classList.toggle('is-paused', isPaused);
    pauseBtn.setAttribute('aria-label', isPaused ? 'Play story' : 'Pause story');
    if (isPaused) pause(state);
    else resume(block, state);
  }

  pauseBtn.addEventListener('click', () => setManualPause(!state.manualPause));

  prevBtn.addEventListener('click', () => showSlide(block, state, state.current - 1));
  nextBtn.addEventListener('click', () => {
    // On the last slide the next arrow acts as replay, jumping back to the start.
    const atEnd = state.current === state.slides.length - 1;
    showSlide(block, state, atEnd ? 0 : state.current + 1);
  });

  shareBtn.addEventListener('click', async () => {
    const shareData = { title: document.title, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.url);
        shareBtn.classList.add('copied');
        setTimeout(() => shareBtn.classList.remove('copied'), 1500);
      }
    } catch (e) {
      // user dismissed the share sheet — no action needed
    }
  });

  // Instagram-style tap navigation: a short tap advances (or goes back if the
  // tap lands in the left third); a press-and-hold pauses until release.
  const HOLD_MS = 250;
  let pressTimer = null;
  let didHold = false;

  viewer.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.web-story-playpause, .web-story-share, a')) return;
    didHold = false;
    pressTimer = setTimeout(() => {
      didHold = true;
      if (!state.manualPause) pause(state);
    }, HOLD_MS);
  });

  viewer.addEventListener('pointerup', (e) => {
    if (e.target.closest('.web-story-playpause, .web-story-share, a')) return;
    clearTimeout(pressTimer);
    if (didHold) {
      resume(block, state);
      return;
    }
    const rect = viewer.getBoundingClientRect();
    if (e.clientX - rect.left < rect.width / 3) {
      showSlide(block, state, state.current - 1);
    } else {
      const atEnd = state.current === state.slides.length - 1;
      showSlide(block, state, atEnd ? 0 : state.current + 1);
    }
  });

  viewer.addEventListener('pointerleave', () => {
    clearTimeout(pressTimer);
    if (didHold) resume(block, state);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') showSlide(block, state, state.current + 1);
    if (e.key === 'ArrowLeft') showSlide(block, state, state.current - 1);
  });

  // Pause autoplay when the story scrolls out of view.
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) resume(block, state);
      else pause(state);
    });
  }, { threshold: 0.4 });
  observer.observe(block);

  showSlide(block, state, 0);
}
