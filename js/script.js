let introActive = true;
let currentState = 0;
let scrollAccumulator = 0;
let touchStartY = 0; 
let touchMoveY = 0;
const SCROLL_THRESHOLD = 450; 

// 1. GLOBAL DEVICE DETECTION (MUST BE TOP FOR STYLES)
const hasTouch = ( 'ontouchstart' in window ) || ( navigator.maxTouchPoints > 0 );
const isMobile = (hasTouch && window.innerWidth <= 1366) || (window.innerWidth <= 1024);

// BUILD VERSION: 2026.04.02.1930 (REMOTE MEDIA READY)
console.log("%c WIMP CI/CD Version: 2026.04.02.1930 ", "background: #111; color: #00ff00; font-weight: bold; padding: 5px;");
console.log("WIMP Debug: FTP Upload Sync Confirmed");
console.log("WIMP Debug: isMobile =", isMobile, "hasTouch =", hasTouch, "width =", window.innerWidth);

function bootstrapStyles() {
    console.log("WIMP Debug: Injecting Critical Fault-Tolerant Styles...");
    const style = document.createElement('style');
    style.innerHTML = `
        /* --- FORCED VIDEO PATH (SLIDER ENABLED) --- */
        #background-media-container { display: none !important; }
        #intro-video { display: block !important; opacity: 1; }
        #background-media-container {
            position: absolute !important; top: 0 !important; left: 0 !important;
            width: 100% !important; height: 100% !important;
            z-index: 1 !important; overflow: hidden !important;
            background: transparent !important;
            display: ${isMobile ? 'block' : 'none'} !important; /* HIDE ON DESKTOP */
        }
        #intro-video {
            position: absolute !important; top: 0 !important; left: 0 !important;
            width: ${isMobile ? '100vw' : '100%'} !important;
            height: 100vh !important;
            object-fit: cover !important;
            object-position: ${isMobile ? '70% center' : 'center'} !important;
            opacity: 0;
            z-index: 10 !important; /* ALWAYS ON TOP REGARDLESS OF DEVICE */
            display: block; /* Allow JS to hide if play() fails */
        }
        #sticky-frame {
            position: sticky;
            top: 0;
            width: 100%;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            background-color: #000;
        }
        .background-slide {
            position: absolute !important; top: 0 !important; left: 0 !important;
            width: 100% !important; height: 100% !important;
            background-size: cover !important; background-position: center !important;
            opacity: 0; transition: opacity 2s ease-in-out !important;
            transform: scale(1.1);
        }
        .background-slide.active { opacity: 1 !important; }
        .background-slide.animate-zoom-in { animation: kb-zoom-in 30s infinite alternate ease-in-out !important; }
        @keyframes kb-zoom-in {
            0% { transform: scale(1.1) translate(0, 0); }
            100% { transform: scale(1.4) translate(-2%, -3%); }
        }
        /* Essential layout for overlays if CSS fails */
        .intro-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; transition: opacity 1.2s; z-index: 10; }
        .intro-overlay.show { opacity: 1 !important; }
    `;
    document.head.appendChild(style);
}
bootstrapStyles();

window.WIMP_DEBUG = {
    get state() { return currentState; },
    get intro() { return introActive; },
    get isMobile() { return isMobile; }
};

const introScroll = document.getElementById('intro-scroll');
const stickyFrame = document.getElementById('sticky-frame');
const scrollIndicator = document.getElementById('scroll-indicator');
const galleryContainer = document.getElementById('container');
const whiteOutOverlay = document.getElementById('white-out-overlay');
const overlayLogo = document.getElementById('intro-overlay-logo');
const overlayProject = document.getElementById('intro-overlay-project');
const overlayText = document.getElementById('intro-overlay-text');
const overlayTitle = document.getElementById('intro-overlay-title');
let allSlides = [];
const video = document.getElementById('intro-video');
const startOverlay = document.getElementById('start-overlay');
const startButton = document.getElementById('start-button');

const ANIMATIONS = ['animate-zoom-in', 'animate-zoom-out', 'animate-pan-left', 'animate-pan-right'];
let currentSlideIndex = 0;
let slideInterval = null;

function applyRandomAnimation(slide) {
  ANIMATIONS.forEach(cls => slide.classList.remove(cls));
  const randomAnim = ANIMATIONS[Math.floor(Math.random() * ANIMATIONS.length)];
  slide.classList.add(randomAnim);
}

function startSlider() {
  if (allSlides.length === 0) {
    allSlides = Array.from(document.querySelectorAll('.background-slide'));
  }
  if (slideInterval || allSlides.length === 0) return;
  
  // iOS Safari Nudge: Reset all then set first slide synchronously
  allSlides.forEach(s => s.classList.remove('active'));
  
  // Force first slide state immediately for instant feedback
  if (allSlides[currentSlideIndex]) {
    applyRandomAnimation(allSlides[currentSlideIndex]);
    allSlides[currentSlideIndex].classList.add('active');
  }

  slideInterval = setInterval(() => {
    if (allSlides.length === 0) return;
    allSlides[currentSlideIndex].classList.remove('active');
    currentSlideIndex = (currentSlideIndex + 1) % allSlides.length;
    const nextSlide = allSlides[currentSlideIndex];
    applyRandomAnimation(nextSlide);
    nextSlide.classList.add('active');
  }, 7000); 
}

function stopSlider() {
  if (slideInterval) {
    clearInterval(slideInterval);
    slideInterval = null;
  }
}

/**
 * Global Initialization
 * Triggers cinematic presentation based on device on page load.
 */
// Apply detection class to body immediately
if (isMobile) {
    document.body.classList.add('is-mobile');
} else {
    document.body.classList.add('is-desktop');
}

/**
 * Initialization Sequence
 * Now triggered by user interaction (Start Button) to satisfy iOS requirements.
 */
function initExperience() {
  console.log("WIMP Debug: initExperience triggered at", new Date().toLocaleTimeString());
  if (!introActive) return; 

  // 1. Hide the start button immediately (Native-style)
  if (startButton) {
    startButton.classList.add('hide');
  }

  // 2. Clear state and prepare intro
  currentState = 0;
  
  if (video) {
    console.log("WIMP Debug: Attempting Video Playback (High-Quality Path)");
    video.style.display = 'block'; 
    video.style.zIndex = '10';
    
    video.play().then(() => {
      console.log("WIMP Debug: Video playback success!");
      video.style.opacity = '1';
    }).catch(e => {
      console.warn("WIMP Debug: Video explicitly failed or blocked. Syncing Slider Fallback.", e);
      startSlider();
    });
  } else {
    console.log("WIMP Debug: No video found. Starting Slider.");
    startSlider();
  }
  
  // --- TOUCH NAVIGATION FOR MOBILE/TABLET ---
window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
}, {passive: true});

window.addEventListener('touchmove', (e) => {
    if (introActive) return; // Ignore during intro

    const touchEndY = e.touches[0].clientY;
    const deltaY = touchStartY - touchEndY; // Positive = swipe up (scroll down)
    
    // We multiply deltaY to make it feel responsive compared to mouse wheel
    handleScroll({ deltaY: deltaY * 1.5 });
    
    // Reset start to current for continuous swipe feeling
    touchStartY = touchEndY;
}, {passive: true});

// 10. Initial Render
renderState(0);
}

// Attach listener to Start Button with Mobile Touch Support
if (startButton) {
    startButton.addEventListener('click', initExperience);
    startButton.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent double trigger
        initExperience();
    }, {passive: false});
    console.log("WIMP Debug: Start Button Listeners (Click + Touch) Attached");
} 

// FAILSAFE: If user hasn't clicked in 5 seconds, and screen is still black, try to init anyway
setTimeout(() => {
    if (introActive && currentState === 0 && startOverlay && !startOverlay.classList.contains('fade-out')) {
        console.log("WIMP Debug: Failsafe triggered - Auto-starting Experience");
        initExperience(); // Actually start the experience
    }
}, 5000);

/**
 * Idempotent State Engine
 */
function showOverlay(el) { if (el) el.classList.add('show'); }
function hideOverlay(el) { if (el) el.classList.remove('show'); }

function renderState(index) {
  console.log("WIMP Debug: renderState(", index, ")");
  bootstrapStyles(); // Ensure styles are present on every state change
  // 1. Initial Resets (Base State)
  [overlayLogo, overlayProject, overlayText, overlayTitle, scrollIndicator].forEach(el => hideOverlay(el));
  whiteOutOverlay.style.opacity = '0';
  
  if (isMobile) {
    if (allSlides.length === 0) allSlides = Array.from(document.querySelectorAll('.background-slide'));
    allSlides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentSlideIndex);
    });
  } else {
    if (video) {
      video.style.opacity = '1';
      video.style.display = 'block';
      video.style.transition = 'opacity 1s ease-in-out';
    }
  }

  // 2. Specific Stage Overrides
  switch(index) {
    case 0: 
      showOverlay(scrollIndicator);
      break;
    case 1:
    case 2:
      showOverlay(overlayLogo);
      break;
    case 3: 
      break;
    case 4:
    case 5:
      showOverlay(overlayProject);
      break;
    case 6: 
      break;
    case 7:
    case 8:
      showOverlay(overlayText);
      break;
    case 9: // WHITE CURTAIN 
      whiteOutOverlay.style.opacity = '1';
      if (window.innerWidth <= 1366) {
        allSlides.forEach(slide => slide.classList.remove('active'));
      } else {
        if (video) {
          video.style.opacity = '0'; 
          video.style.transition = 'opacity 0.4s ease-in-out'; 
        }
      }
      break;
    case 10: 
      whiteOutOverlay.style.opacity = '1';
      showOverlay(overlayTitle);
      if (window.innerWidth <= 1366) {
        allSlides.forEach(slide => slide.classList.remove('active'));
      } else {
        if (video) video.style.opacity = '0'; 
      }
      break;
    case 11: // Pure White Screen 
      whiteOutOverlay.style.opacity = '1';
      if (window.innerWidth <= 1366) {
        allSlides.forEach(slide => slide.classList.remove('active'));
      } else {
        if (video) video.style.opacity = '0';
      }
      break;
    case 12: // Gallery entry
      enterGallery();
      break;
  }
}

// Initial state render
// renderState(0);

function updateState(direction) {
  if (direction > 0 && currentState < 12) {
    currentState++;
  } else if (direction < 0 && currentState > 0) {
    currentState--;
  } else {
    return;
  }
  renderState(currentState);
}

function enterGallery() {
  if (!introActive) return;
  introActive = false;

  galleryContainer.classList.remove('hidden');
  galleryContainer.style.opacity = "0";

  setTimeout(() => {
    galleryContainer.classList.add('active');
    galleryContainer.style.opacity = "1";

    setTimeout(() => {
      introScroll.style.display = 'none';
      stopSlider();
    }, 1500);
  }, 50);
}

function returnToIntro() {
  if (introActive) return;
  introActive = true;

  whiteOutOverlay.style.transition = 'none';
  whiteOutOverlay.style.opacity = '1';
  whiteOutOverlay.offsetHeight; 
  whiteOutOverlay.style.transition = 'opacity 1.2s ease-in-out';

  introScroll.style.display = 'block';
  introScroll.style.opacity = '1';
  if (window.innerWidth <= 1366) {
    allSlides.forEach(slide => slide.classList.remove('active'));
  }

  galleryContainer.classList.remove('active');
  galleryContainer.style.opacity = "0";

  setTimeout(() => {
    galleryContainer.classList.add('hidden');
    currentState = 11; 
    renderState(currentState);
    if (window.innerWidth <= 1366) startSlider();
  }, 500);
}

window.addEventListener('wheel', (e) => {
  if (introActive) {
    scrollAccumulator += Math.abs(e.deltaY);
    if (scrollAccumulator >= SCROLL_THRESHOLD) {
      updateState(e.deltaY > 0 ? 1 : -1);
      scrollAccumulator = 0;
    }
  } else {
    handleGalleryWheel(e);
  }
});

window.addEventListener('touchstart', (e) => { 
  touchStartY = e.touches[0].clientY; 
}, {passive: true});

window.addEventListener('touchend', (e) => {
  const touchEndY = e.changedTouches[0].clientY;
  const deltaY = touchStartY - touchEndY;
  
  if (introActive) {
    if (Math.abs(deltaY) > 50) {
      updateState(deltaY > 0 ? 1 : -1);
    }
  } else {
    // Gallery Navigation Logic
    if (Math.abs(deltaY) > 60) { // Threshold for swipe
        if (currentIndex === 0 && deltaY < -70) { 
            returnToIntro();
        } else if (deltaY > 0) {
            if (currentIndex < sections.length - 1) showSlide(currentIndex + 1);
        } else {
            if (currentIndex > 0) showSlide(currentIndex - 1);
        }
    }
  }
});

// Gallery Logic
const artworks = [
  { image: 'images/1.png', title: 'Wind in my pages #1', details: 'liner on paper<br>50x70 cm without frame<br>wooden frame, museum glass<br>2024' },
  { image: 'images/2.png', title: 'Wind in my pages #2', details: 'liner on paper<br>50x70 cm without frame<br>wooden frame, museum glass<br>2024' },
  { image: 'images/3.png', title: 'Wind in my pages #3', details: 'liner on paper<br>50x70 cm without frame<br>wooden frame, museum glass<br>2024' },
  { image: 'images/4.png', title: 'Wind in my pages #4', details: 'liner on paper<br>50x70 cm without frame<br>wooden frame, museum glass<br>2024' },
  { image: 'images/5.png', title: 'Wind in my pages #5', details: 'liner on paper<br>50x70 cm without frame<br>wooden frame, museum glass<br>2024' },
  { image: 'images/14.png', title: 'Wind in my pages #14', details: 'liner on paper<br>47x57 cm with frame<br>37x27 cm without frame<br>wooden frame, museum glass<br>2020' },
  { image: 'images/13.png', title: 'Wind in my pages #13', details: 'liner on paper<br>47x57 cm with frame<br>37x27 cm without frame<br>wooden frame, museum glass<br>2020' },
  { image: 'images/12.png', title: 'Wind in my pages #12', details: 'liner on paper<br>47x57 cm with frame<br>37x27 cm without frame<br>wooden frame, museum glass<br>2020' },
];

const container = document.getElementById('container');
artworks.forEach((art, i) => {
  const section = document.createElement('div');
  section.className = 'section' + (i === 0 ? ' active' : '');
  section.innerHTML = `
    <div class="image-container">
      <img src="${art.image}" alt="${art.title}">
    </div>
    <div class="text-container">
      <div class="title">${art.title}</div>
      <div class="details">${art.details}</div>
    </div>
  `;
  container.appendChild(section);
});

let currentIndex = 0;
const sections = document.querySelectorAll('.section');

function showSlide(index) {
  if (index < 0 || index >= sections.length) return;
  sections[currentIndex].classList.remove('active');
  currentIndex = index;
  sections[currentIndex].classList.add('active');
}

let wheelThrottle = false;
function handleGalleryWheel(e) {
  if (wheelThrottle) return;
  
  if (currentIndex === 0 && e.deltaY < 0) {
    returnToIntro();
    return;
  }

  wheelThrottle = true;
  setTimeout(() => wheelThrottle = false, 700);
  if (e.deltaY > 0) {
    if (currentIndex < sections.length - 1) showSlide(currentIndex + 1);
  } else {
    if (currentIndex > 0) showSlide(currentIndex - 1);
  }
}


