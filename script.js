/**
 * ROMANTIC MEMORY WEBSITE - Main Application
 * Vanilla JS, ES6 modules, structured state management
 */

// ============================================
// IMAGE FILENAMES (all 12 photos)
// ============================================
const IMAGE_FILES = [
  'anitkabir.jpeg',
  'ankara.jpeg',
  'ataturk.jpeg',
  'caddebostan.jpeg',
  'cafer-erol.jpeg',
  'elit-world.jpeg',
  'gulhane.jpeg',
  'ilk-bulusma.jpeg',
  'kuzguncuk.jpeg',
  'masukiye.jpeg',
  'yalova-vapur.jpeg',
  'yilbasi-kurabiye.jpeg'
];

// ============================================
// QUESTIONS CONFIGURATION
// ============================================
const QUESTIONS = [
  'aşağıdaki fotoğraflardan hangisi daha unutulmazdı?',
  'hangisini ilerde çerçeveletmek istersin aşkım?',
  'sadece bize özel kalmalı dediğin fotoğrafı seç aşkım',
  'kombinin en renkli olduğu fotoğrafımızı seç bebeğim',
  'ikisinden birini vesikalık seçeceksin deseler hangisini tercih edersin?',
  'içinden hangisi geliyorsa onu seç'
];

// ============================================
// APPLICATION STATE (no global pollution)
// ============================================
const state = {
  availableImages: [...IMAGE_FILES],
  selectedImages: [],
  currentQuestionIndex: 0,
  isQuestionSix: false
};

// ============================================
// DOM REFERENCES
// ============================================
const DOM = {
  questionView: document.getElementById('question-view'),
  resultsView: document.getElementById('results-view'),
  galleryView: document.getElementById('gallery-view'),
  questionTitle: document.getElementById('question-title'),
  imagesContainer: document.getElementById('images-container'),
  selectedImages: document.getElementById('selected-images'),
  galleryBtn: document.getElementById('gallery-btn'),
  galleryGrid: document.getElementById('gallery-grid'),
  galleryBack: document.getElementById('gallery-back'),
  modal: document.getElementById('modal'),
  modalClose: document.getElementById('modal-close'),
  modalImage: document.getElementById('modal-image'),
  modalContent: document.getElementById('modal-content')
};

// ============================================
// UTILITY: Shuffle array (Fisher-Yates)
// ============================================
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ============================================
// UTILITY: Pick N random items from array
// ============================================
function pickRandom(arr, n) {
  const shuffled = shuffleArray(arr);
  return shuffled.slice(0, n);
}

// ============================================
// CANVAS HEARTS - requestAnimationFrame
// ============================================
const HeartsCanvas = (() => {
  const canvas = document.getElementById('hearts-canvas');
  const ctx = canvas.getContext('2d');
  const HEART_COUNT = 100;
  const hearts = [];

  function drawHeart(ctx, x, y, size, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(size * 0.5, size * 0.5);
    ctx.fillStyle = 'rgba(220, 130, 150, 0.38)';
    ctx.beginPath();
    ctx.moveTo(0, 0.4);
    ctx.bezierCurveTo(0, 0, -0.5, -0.3, -0.5, 0.2);
    ctx.bezierCurveTo(-0.5, 0.6, 0, 0.9, 0, 1.2);
    ctx.bezierCurveTo(0, 0.9, 0.5, 0.6, 0.5, 0.2);
    ctx.bezierCurveTo(0.5, -0.3, 0, 0, 0, 0.4);
    ctx.fill();
    ctx.restore();
  }

  function initHearts() {
    for (let i = 0; i < HEART_COUNT; i++) {
      hearts.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 0.04 + Math.random() * 0.06,
        speed: 0.3 + Math.random() * 0.8,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02
      });
    }
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);
  }

  function animate() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    hearts.forEach((heart) => {
      heart.y += heart.speed;
      heart.rotation += heart.rotationSpeed;
      if (heart.y > h + 20) heart.y = -20;
      if (heart.y < -20) heart.y = h + 20;

      const scale = Math.min(w, h) * heart.size;
      drawHeart(ctx, heart.x, heart.y, scale, heart.rotation);
    });

    requestAnimationFrame(animate);
  }

  function start() {
    resize();
    initHearts();
    window.addEventListener('resize', resize);
    animate();
  }

  return { start };
})();

// ============================================
// QUESTION RENDERING
// ============================================
function renderQuestion() {
  const questionIndex = state.currentQuestionIndex;
  const isQ6 = questionIndex === 5;
  state.isQuestionSix = isQ6;

  DOM.questionTitle.textContent = QUESTIONS[questionIndex];
  DOM.imagesContainer.innerHTML = '';

  const picks = pickRandom(state.availableImages, 2);

  picks.forEach((filename, index) => {
    const card = document.createElement('div');
    card.className = `choice-card ${index === 0 ? 'left' : 'right'}`;
    card.dataset.filename = filename;

    const img = document.createElement('img');
    img.src = `images/${filename}`;
    img.alt = `Seçenek ${index + 1}`;
    if (isQ6) img.classList.add('blurred');

    card.appendChild(img);
    card.addEventListener('click', () => handleImageSelect(card, filename, isQ6));
    DOM.imagesContainer.appendChild(card);
  });
}

// ============================================
// IMAGE SELECTION HANDLER
// ============================================
function handleImageSelect(card, filename, isQ6) {
  const cards = DOM.imagesContainer.querySelectorAll('.choice-card');

  if (isQ6) {
    card.querySelector('img').classList.remove('blurred');
    card.querySelector('img').classList.add('unblurred');
    cards.forEach((c) => {
      if (c !== card) c.style.pointerEvents = 'none';
    });
    card.style.pointerEvents = 'none';
    state.selectedImages.push(filename);
    state.availableImages = state.availableImages.filter((f) => f !== filename);
    setTimeout(() => transitionToResults(), 3000);
    return;
  }

  state.selectedImages.push(filename);
  state.availableImages = state.availableImages.filter((f) => f !== filename);
  state.currentQuestionIndex++;

  cards.forEach((c) => (c.style.pointerEvents = 'none'));
  card.querySelector('img').style.transform = 'scale(1.05)';

  if (state.currentQuestionIndex < 6) {
    setTimeout(() => transitionToNextQuestion(), 600);
  } else {
    setTimeout(() => transitionToResults(), 600);
  }
}

// ============================================
// VIEW TRANSITIONS (fade + slide)
// ============================================
function transitionToNextQuestion() {
  DOM.questionView.classList.add('exit');
  requestAnimationFrame(() => {
    setTimeout(() => {
      DOM.questionView.classList.remove('exit');
      renderQuestion();
    }, 400);
  });
}

function transitionToResults() {
  DOM.questionView.classList.add('exit');
  requestAnimationFrame(() => {
    setTimeout(() => {
      DOM.questionView.classList.remove('active');
      DOM.questionView.classList.remove('exit');
      showResults();
      DOM.resultsView.classList.add('active');
    }, 400);
  });
}

// ============================================
// RESULTS PAGE
// ============================================
function showResults() {
  DOM.selectedImages.innerHTML = '';
  const delays = [0, 400, 800, 1200, 1600, 2000];

  state.selectedImages.forEach((filename, index) => {
    const item = document.createElement('div');
    item.className = 'result-item';
    item.style.animationDelay = `${delays[index]}ms`;

    const img = document.createElement('img');
    img.src = `images/${filename}`;
    img.alt = `Seçilen fotoğraf ${index + 1}`;
    item.appendChild(img);
    DOM.selectedImages.appendChild(item);
  });
}

// ============================================
// GALLERY
// ============================================
function showGallery() {
  DOM.resultsView.classList.remove('active');
  DOM.galleryView.classList.add('active');
  DOM.galleryBack.style.display = 'block';
  DOM.galleryGrid.innerHTML = '';

  IMAGE_FILES.forEach((filename) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    const img = document.createElement('img');
    img.src = `images/${filename}`;
    img.alt = filename;
    item.appendChild(img);
    item.addEventListener('click', () => openModal(filename));
    DOM.galleryGrid.appendChild(item);
  });
}

// ============================================
// MODAL (zoom in/out)
// ============================================
const Modal = (() => {
  let scale = 1;
  let lastTouchDistance = 0;

  function open(filename) {
    DOM.modalImage.src = `images/${filename}`;
    scale = 1;
    DOM.modalImage.style.transform = 'scale(1)';
    DOM.modal.classList.add('active');
  }

  function close() {
    DOM.modal.classList.remove('active');
  }

  function setScale(newScale) {
    scale = Math.max(0.5, Math.min(4, newScale));
    DOM.modalImage.style.transform = `scale(${scale})`;
  }

  function handleWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(scale + delta);
  }

  function handleTouchStart(e) {
    if (e.touches.length === 2) {
      lastTouchDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }

  function handleTouchMove(e) {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = (dist - lastTouchDistance) * 0.01;
      setScale(scale + delta);
      lastTouchDistance = dist;
    }
  }

  DOM.modalContent.addEventListener('wheel', handleWheel, { passive: false });
  DOM.modalContent.addEventListener('touchstart', handleTouchStart, { passive: true });
  DOM.modalContent.addEventListener('touchmove', handleTouchMove, { passive: false });

  DOM.modalClose.addEventListener('click', close);
  DOM.modal.addEventListener('click', (e) => {
    if (e.target === DOM.modal) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && DOM.modal.classList.contains('active')) close();
  });

  return { open, close };
})();

function openModal(filename) {
  Modal.open(filename);
}

// ============================================
// EVENT BINDINGS
// ============================================
function showResultsFromGallery() {
  DOM.galleryView.classList.remove('active');
  DOM.resultsView.classList.add('active');
}

DOM.galleryBtn.addEventListener('click', showGallery);
DOM.galleryBack.addEventListener('click', showResultsFromGallery);

// ============================================
// INITIALIZATION
// ============================================
function init() {
  HeartsCanvas.start();
  state.availableImages = shuffleArray([...IMAGE_FILES]);
  state.selectedImages = [];
  state.currentQuestionIndex = 0;
  renderQuestion();
}

init();
