/**
 * Iron Clan Fitness Studio - Main Client Script
 * Features:
 * - Sticky Navigation & Scroll Spy
 * - Mobile Drawer Menu
 * - Live Operating Hours Calculator (IST / Bangalore)
 * - Program Category Filter
 * - Gallery Lightbox with Keyboard & Touch Gestures
 * - Interactive 360° Virtual Tour Canvas Viewer (Yaw/Pitch/Zoom/Fullscreen)
 * - Membership Plan Selector
 * - Form Validation & WhatsApp Direct Enquiry Dispatcher
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initLiveHours();
  initProgramFilters();
  initGalleryLightbox();
  init360TourViewer();
  initMembershipSelectors();
  initContactForm();
  initOwnerWhatsAppManager();
  setCurrentYear();
});

/* ==========================================================================
   1. Navigation & Scroll Spy
   ========================================================================== */
function initNavigation() {
  const header = document.getElementById('site-header');
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const drawerClose = document.getElementById('drawer-close');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const navLinks = document.querySelectorAll('.nav-link');
  const drawerLinks = document.querySelectorAll('.drawer-link');
  const sections = document.querySelectorAll('section[id]');

  // Sticky header background
  function handleScroll() {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }

    // Scroll Spy for active nav link
    const scrollPosition = window.scrollY + 120;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPosition >= top && scrollPosition < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Mobile Drawer Toggle
  function openMobileNav() {
    mobileNav?.classList.add('open');
    mobileNav?.setAttribute('aria-hidden', 'false');
    mobileToggle?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    mobileNav?.classList.remove('open');
    mobileNav?.setAttribute('aria-hidden', 'true');
    mobileToggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  mobileToggle?.addEventListener('click', openMobileNav);
  drawerClose?.addEventListener('click', closeMobileNav);
  drawerBackdrop?.addEventListener('click', closeMobileNav);

  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileNav();
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileNav?.classList.contains('open')) {
      closeMobileNav();
    }
  });
}

/* ==========================================================================
   2. Live Operating Hours Calculator (Bengaluru / IST Time)
   Hours: Mon-Sat 5:00 AM - 10:00 PM, Sun 7:00 AM - 10:00 AM
   ========================================================================== */
function initLiveHours() {
  function checkHours() {
    // Get time in Asia/Kolkata timezone
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour12: false,
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
    });

    const parts = formatter.formatToParts(now);
    let weekday = '';
    let hour = 0;
    let minute = 0;

    parts.forEach(p => {
      if (p.type === 'weekday') weekday = p.value;
      if (p.type === 'hour') hour = parseInt(p.value, 10);
      if (p.type === 'minute') minute = parseInt(p.value, 10);
    });

    const timeVal = hour * 60 + minute;
    const isSunday = weekday === 'Sun';

    let isOpen = false;
    let statusText = '';

    if (isSunday) {
      // 7:00 AM (420 min) to 10:00 AM (600 min)
      if (timeVal >= 420 && timeVal < 600) {
        isOpen = true;
        statusText = 'Open Now · Closes at 10:00 AM';
      } else {
        isOpen = false;
        statusText = timeVal < 420 ? 'Closed · Opens 7:00 AM Sunday' : 'Closed for Sunday · Opens 5:00 AM Monday';
      }
    } else {
      // Mon - Sat: 5:00 AM (300 min) to 10:00 PM (1320 min)
      if (timeVal >= 300 && timeVal < 1320) {
        isOpen = true;
        statusText = 'Open Today · Closes at 10:00 PM';
      } else {
        isOpen = false;
        statusText = timeVal < 300 ? 'Closed · Opens at 5:00 AM' : 'Closed for the night · Opens 5:00 AM';
      }
    }

    // Update Hero badge
    const heroStatus = document.getElementById('hero-live-status');
    if (heroStatus) {
      const indicator = heroStatus.querySelector('.status-indicator');
      const label = heroStatus.querySelector('.status-label');
      if (indicator) {
        indicator.classList.toggle('closed', !isOpen);
      }
      if (label) {
        label.textContent = `${isOpen ? '🟢' : '🔴'} ${statusText}`;
      }
    }

    // Update Drawer badge
    const drawerStatus = document.getElementById('drawer-live-status');
    if (drawerStatus) {
      const dot = drawerStatus.querySelector('.status-dot');
      const text = drawerStatus.querySelector('.status-text');
      if (dot) {
        dot.classList.toggle('closed', !isOpen);
      }
      if (text) {
        text.textContent = statusText;
      }
    }

    // Update Location card badge
    const locStatus = document.getElementById('location-live-status');
    if (locStatus) {
      const indicator = locStatus.querySelector('.status-indicator');
      const text = locStatus.querySelector('.status-text');
      if (indicator) {
        indicator.classList.toggle('closed', !isOpen);
      }
      if (text) {
        text.textContent = statusText;
      }
    }

    // Highlight current day in hours table
    const dayIndex = now.getDay(); // 0 is Sunday, 1 is Monday...
    const rows = document.querySelectorAll('.hours-row');
    rows.forEach(row => {
      const rowDay = parseInt(row.getAttribute('data-day') || '-1', 10);
      if (rowDay === dayIndex) {
        row.classList.add('today');
        const dayLabel = row.querySelector('.day-name');
        if (dayLabel && !dayLabel.textContent?.includes('(Today)')) {
          dayLabel.textContent = `${dayLabel.textContent} (Today)`;
        }
      } else {
        row.classList.remove('today');
      }
    });
  }

  checkHours();
  // Refresh status every minute
  setInterval(checkHours, 60000);
}

/* ==========================================================================
   3. Programs / Services Filtering
   ========================================================================== */
function initProgramFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.program-card');
  const programInquireBtns = document.querySelectorAll('.program-inquire-btn');
  const contactProgramSelect = document.getElementById('contact-program');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.opacity = '1';
          }, 50);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Clicking "Enquire for This Program"
  programInquireBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const progName = btn.getAttribute('data-program');
      if (contactProgramSelect && progName) {
        // Find matching option
        for (let i = 0; i < contactProgramSelect.options.length; i++) {
          if (contactProgramSelect.options[i].text.toLowerCase().includes(progName.toLowerCase()) ||
              contactProgramSelect.options[i].value.toLowerCase().includes(progName.toLowerCase())) {
            contactProgramSelect.selectedIndex = i;
            break;
          }
        }
      }

      // Smooth scroll to contact form
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          document.getElementById('contact-name')?.focus();
        }, 500);
      }
    });
  });
}

/* ==========================================================================
   4. Gallery & Fullscreen Lightbox Modal
   ========================================================================== */
function initGalleryLightbox() {
  const galleryFilters = document.querySelectorAll('.gallery-filter-btn');
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const lightboxBackdrop = document.getElementById('lightbox-backdrop');

  let activeIndex = 0;
  let visibleItems = [...galleryItems];

  // Gallery Filtering
  galleryFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-gfilter');

      galleryFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      visibleItems = [];
      galleryItems.forEach(item => {
        const cat = item.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          item.style.display = 'block';
          visibleItems.push(item);
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // Open Lightbox
  function openLightbox(index) {
    if (visibleItems.length === 0) return;
    activeIndex = (index + visibleItems.length) % visibleItems.length;
    const targetItem = visibleItems[activeIndex];

    const src = targetItem.getAttribute('data-src') || '';
    const caption = targetItem.getAttribute('data-caption') || '';

    if (lightboxImg) {
      lightboxImg.src = src;
      lightboxImg.alt = caption;
    }
    if (lightboxCaption) {
      lightboxCaption.textContent = caption;
    }
    if (lightboxCounter) {
      lightboxCounter.textContent = `${activeIndex + 1} / ${visibleItems.length}`;
    }

    lightbox?.classList.add('open');
    lightbox?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox?.classList.remove('open');
    lightbox?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function showNext() {
    openLightbox(activeIndex + 1);
  }

  function showPrev() {
    openLightbox(activeIndex - 1);
  }

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const index = visibleItems.indexOf(item);
      if (index !== -1) {
        openLightbox(index);
      }
    });
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxBackdrop?.addEventListener('click', closeLightbox);
  lightboxNext?.addEventListener('click', showNext);
  lightboxPrev?.addEventListener('click', showPrev);

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (!lightbox?.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });

  // Touch Swipe for mobile lightbox
  let touchStartX = 0;
  let touchEndX = 0;

  lightbox?.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox?.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 50) {
      if (diff < 0) showNext();
      else showPrev();
    }
  }
}

/* ==========================================================================
   5. Interactive 360° Virtual Tour Canvas Viewer
   Provides genuine panoramic spherical/cylindrical camera navigation:
   - Drag to look horizontally and vertically in 360°
   - Mousewheel and touch pinch zoom
   - Auto-rotation toggle
   - Fullscreen mode
   - Multiple gym zone panoramas (Strength, CrossFit Turf, Cardio)
   ========================================================================== */
function init360TourViewer() {
  const container = document.getElementById('tour-viewer-container');
  const canvas = document.getElementById('tour-canvas');
  if (!canvas || !container) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const rotateBtn = document.getElementById('tour-rotate-btn');
  const zoomInBtn = document.getElementById('tour-zoom-in');
  const zoomOutBtn = document.getElementById('tour-zoom-out');
  const fullscreenBtn = document.getElementById('tour-fullscreen-btn');
  const zoneBtns = document.querySelectorAll('.tour-zone-btn');
  const hintEl = document.getElementById('tour-hint');

  // Scene Images
  const scenes = {
    main: '/images/tour-360.jpg',
    turf: '/images/crossfit.jpg',
    cardio: '/images/cardio.jpg',
  };

  let currentImage = new Image();
  let imageLoaded = false;

  // Camera angles
  let yaw = 0; // horizontal angle in radians
  let pitch = 0; // vertical angle in radians (-0.4 to 0.4)
  let fov = 1.0; // zoom factor (0.6 to 1.8)

  let isDragging = false;
  let lastX = 0;
  let lastY = 0;
  let velocityX = 0;
  let velocityY = 0;
  let autoRotate = true;
  let animationFrameId;

  function loadScene(src) {
    imageLoaded = false;
    currentImage = new Image();
    currentImage.crossOrigin = 'anonymous';
    currentImage.src = src;
    currentImage.onload = () => {
      imageLoaded = true;
      render();
    };
  }

  loadScene(scenes.main);

  function resizeCanvas() {
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = rect.height * (window.devicePixelRatio || 1);
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Rendering engine: draws panoramic cylindrical projection
  function render() {
    if (!imageLoaded || !canvas.width || !canvas.height) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Apply auto-rotation if enabled and not dragging
    if (autoRotate && !isDragging) {
      yaw += 0.0015;
    }

    // Apply inertia damping
    if (!isDragging) {
      yaw += velocityX;
      pitch += velocityY;
      velocityX *= 0.92;
      velocityY *= 0.92;
    }

    // Clamp pitch
    pitch = Math.max(-0.4, Math.min(0.4, pitch));

    // Normalize yaw between 0 and 2*PI
    yaw = (yaw % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);

    // Draw panoramic image with wrap-around
    const imgW = currentImage.width;
    const imgH = currentImage.height;

    // View slice width proportional to FOV
    const sliceWidth = (imgW / (2 * Math.PI)) * (1.2 / fov);
    const sliceHeight = imgH * (0.8 / fov);

    // Offset in image coords based on yaw
    const offsetX = (yaw / (2 * Math.PI)) * imgW;
    const offsetY = (imgH / 2) - (pitch * imgH) - (sliceHeight / 2);

    // First slice
    const s1X = offsetX % imgW;
    const s1W = Math.min(sliceWidth, imgW - s1X);
    const dest1W = (s1W / sliceWidth) * w;

    try {
      ctx.drawImage(
        currentImage,
        s1X, Math.max(0, offsetY),
        s1W, Math.min(sliceHeight, imgH),
        0, 0,
        dest1W, h
      );

      // Wrap-around second slice if visible view crosses boundary
      if (s1W < sliceWidth) {
        const s2W = sliceWidth - s1W;
        const dest2X = dest1W;
        const dest2W = w - dest1W;

        ctx.drawImage(
          currentImage,
          0, Math.max(0, offsetY),
          s2W, Math.min(sliceHeight, imgH),
          dest2X, 0,
          dest2W, h
        );
      }
    } catch {
      // Fallback
    }

    // Draw realistic illuminated IRON CLAN gym wall sign in 360 space
    drawGymWallSign(ctx, w, h, yaw, pitch, fov);

    // Subtle compass / orientation indicator in corner
    drawOrientationWidget(ctx, w, h, yaw);

    animationFrameId = requestAnimationFrame(render);
  }

  function drawGymWallSign(ctx, w, h, currentYaw, currentPitch, currentFov) {
    // Fix sign at yaw angle = 0.35 radians (anchored to the gym wall in 360 space)
    const signTargetYaw = 0.35;
    let angleDiff = (signTargetYaw - currentYaw);
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

    const visibleHalfAngle = 0.8 / currentFov;
    if (Math.abs(angleDiff) < visibleHalfAngle) {
      const screenX = (w / 2) + (angleDiff / visibleHalfAngle) * (w / 2);
      const screenY = (h / 2) + (currentPitch * 420 * currentFov) - (50 * currentFov);

      const signScale = Math.max(0.65, Math.min(1.3, currentFov));
      const signW = 320 * signScale;
      const signH = 84 * signScale;

      ctx.save();
      ctx.translate(screenX, screenY);

      // Shadow behind plaque
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 8;

      // Dark plaque background
      ctx.fillStyle = 'rgba(11, 13, 18, 0.95)';
      ctx.beginPath();
      const r = 8 * signScale;
      const x = -signW / 2;
      const y = -signH / 2;
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + signW - r, y);
      ctx.quadraticCurveTo(x + signW, y, x + signW, y + r);
      ctx.lineTo(x + signW, y + signH - r);
      ctx.quadraticCurveTo(x + signW, y + signH, x + signW - r, y + signH);
      ctx.lineTo(x + r, y + signH);
      ctx.quadraticCurveTo(x, y + signH, x, y + signH - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fill();

      // Glowing amber border
      ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
      ctx.shadowBlur = 14;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5 * signScale;
      ctx.stroke();

      // Reset shadow for crisp text
      ctx.shadowBlur = 0;

      // Main Gym Title
      ctx.fillStyle = '#ffffff';
      ctx.font = `800 ${Math.round(22 * signScale)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('IRON CLAN', 0, -12 * signScale);

      // Subtitle
      ctx.fillStyle = '#f59e0b';
      ctx.font = `700 ${Math.round(10 * signScale)}px sans-serif`;
      ctx.fillText('FITNESS STUDIO · BANASHANKARI', 0, 16 * signScale);

      ctx.restore();
    }
  }

  function drawOrientationWidget(ctx, w, h, yawAngle) {
    ctx.save();
    ctx.translate(60, h - 50);
    ctx.fillStyle = 'rgba(9, 10, 15, 0.7)';
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // North arrow
    ctx.rotate(-yawAngle);
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(5, 6);
    ctx.lineTo(-5, 6);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  render();

  // Mouse & Touch Interaction
  function onPointerDown(e) {
    isDragging = true;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    lastX = clientX;
    lastY = clientY;
    velocityX = 0;
    velocityY = 0;

    if (hintEl) {
      hintEl.classList.add('fade-out');
    }
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

    const deltaX = clientX - lastX;
    const deltaY = clientY - lastY;

    lastX = clientX;
    lastY = clientY;

    const sensitivity = 0.0035 / fov;
    velocityX = -deltaX * sensitivity;
    velocityY = deltaY * sensitivity;

    yaw += velocityX;
    pitch += velocityY;
  }

  function onPointerUp() {
    isDragging = false;
  }

  container.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);

  container.addEventListener('touchstart', onPointerDown, { passive: true });
  window.addEventListener('touchmove', onPointerMove, { passive: true });
  window.addEventListener('touchend', onPointerUp, { passive: true });

  // Zoom with scroll wheel
  container.addEventListener('wheel', e => {
    e.preventDefault();
    if (e.deltaY < 0) {
      fov = Math.min(1.6, fov + 0.1);
    } else {
      fov = Math.max(0.7, fov - 0.1);
    }
  }, { passive: false });

  // Zoom Buttons
  zoomInBtn?.addEventListener('click', () => {
    fov = Math.min(1.6, fov + 0.15);
  });

  zoomOutBtn?.addEventListener('click', () => {
    fov = Math.max(0.7, fov - 0.15);
  });

  // Auto-rotate toggle
  rotateBtn?.addEventListener('click', () => {
    autoRotate = !autoRotate;
    rotateBtn.classList.toggle('active', autoRotate);
    const label = rotateBtn.querySelector('span');
    if (label) {
      label.textContent = autoRotate ? 'Rotating' : 'Auto-Rotate';
    }
  });

  // Fullscreen View
  fullscreenBtn?.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      container.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  });

  document.addEventListener('fullscreenchange', () => {
    setTimeout(resizeCanvas, 100);
  });

  // Scene / Zone Switching
  zoneBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const sceneKey = btn.getAttribute('data-scene') || 'main';
      if (scenes[sceneKey]) {
        zoneBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadScene(scenes[sceneKey]);
        yaw = 0;
        pitch = 0;
      }
    });
  });

  // Tour Mode Switcher (Interactive 360 vs Google Maps Street View & Photos)
  const tabCanvas = document.getElementById('tab-canvas-tour');
  const tabMaps = document.getElementById('tab-maps-tour');
  const containerCanvas = document.getElementById('tour-viewer-container');
  const containerMaps = document.getElementById('tour-maps-container');

  tabCanvas?.addEventListener('click', () => {
    tabCanvas.classList.add('active');
    tabMaps?.classList.remove('active');
    if (containerCanvas) containerCanvas.style.display = 'block';
    if (containerMaps) containerMaps.style.display = 'none';
    resizeCanvas();
  });

  tabMaps?.addEventListener('click', () => {
    tabMaps?.classList.add('active');
    tabCanvas?.classList.remove('active');
    if (containerCanvas) containerCanvas.style.display = 'none';
    if (containerMaps) containerMaps.style.display = 'block';
  });
}

/* ==========================================================================
   6. Membership Plan Inquire Buttons
   ========================================================================== */
function initMembershipSelectors() {
  const planBtns = document.querySelectorAll('.plan-select-btn');
  const programSelect = document.getElementById('contact-program');

  planBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const planName = btn.getAttribute('data-plan') || '';

      if (programSelect && planName) {
        for (let i = 0; i < programSelect.options.length; i++) {
          if (programSelect.options[i].text.toLowerCase().includes(planName.toLowerCase()) ||
              programSelect.options[i].value.toLowerCase().includes(planName.toLowerCase())) {
            programSelect.selectedIndex = i;
            break;
          }
        }
      }

      // Scroll smoothly to contact form
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          document.getElementById('contact-name')?.focus();
        }, 500);
      }
    });
  });
}

/* ==========================================================================
   7. Contact & Booking Form with Validation & WhatsApp Integration
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('enquiry-form');
  const nameInput = document.getElementById('contact-name');
  const phoneInput = document.getElementById('contact-phone');
  const emailInput = document.getElementById('contact-email');
  const programSelect = document.getElementById('contact-program');
  const slotSelect = document.getElementById('contact-slot');
  const messageInput = document.getElementById('contact-message');
  const feedback = document.getElementById('form-feedback');
  const submitBtn = document.getElementById('submit-btn');
  const whatsappSubmitBtn = document.getElementById('whatsapp-submit-btn');

  const nameError = document.getElementById('name-error');
  const phoneError = document.getElementById('phone-error');
  const emailError = document.getElementById('email-error');
  const programError = document.getElementById('program-error');

  function clearErrors() {
    if (nameError) nameError.textContent = '';
    if (phoneError) phoneError.textContent = '';
    if (emailError) emailError.textContent = '';
    if (programError) programError.textContent = '';
    if (feedback) {
      feedback.textContent = '';
      feedback.className = 'form-feedback';
    }
  }

  function validate() {
    clearErrors();
    let isValid = true;

    // Name validation
    const nameVal = nameInput?.value.trim() || '';
    if (nameVal.length < 2) {
      if (nameError) nameError.textContent = 'Please enter your full name (minimum 2 characters).';
      isValid = false;
    }

    // Phone validation (10 digits Indian phone format)
    const phoneVal = phoneInput?.value.replace(/\D/g, '') || '';
    if (phoneVal.length < 10) {
      if (phoneError) phoneError.textContent = 'Please enter a valid 10-digit mobile number.';
      isValid = false;
    }

    // Optional email validation
    const emailVal = emailInput?.value.trim() || '';
    if (emailVal.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailVal)) {
        if (emailError) emailError.textContent = 'Please enter a valid email address.';
        isValid = false;
      }
    }

    // Program selection validation
    if (!programSelect?.value) {
      if (programError) programError.textContent = 'Please choose a program or membership plan.';
      isValid = false;
    }

    return isValid;
  }

  // Handle standard submit
  form?.addEventListener('submit', e => {
    e.preventDefault();
    if (!validate()) return;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting your enquiry...';
    }

    // Simulate saving and confirmation
    setTimeout(() => {
      const submission = {
        name: nameInput?.value.trim(),
        phone: phoneInput?.value.trim(),
        email: emailInput?.value.trim() || 'Not provided',
        program: programSelect?.value,
        slot: slotSelect?.value,
        message: messageInput?.value.trim() || 'No message provided',
        date: new Date().toISOString(),
      };

      try {
        const saved = JSON.parse(localStorage.getItem('iron_clan_enquiries') || '[]');
        saved.push(submission);
        localStorage.setItem('iron_clan_enquiries', JSON.stringify(saved));
      } catch {
        // storage fallback
      }

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Enquiry & Book Visit';
      }

      if (feedback) {
        feedback.className = 'form-feedback success';
        feedback.innerHTML = `<strong>Enquiry Received!</strong> Thank you ${submission.name}. Our front desk at Banashankari will reach out to <strong>${submission.phone}</strong> shortly with exact membership details.`;
      }

      form.reset();
    }, 700);
  });

  // Handle Direct WhatsApp Dispatch to Owner
  whatsappSubmitBtn?.addEventListener('click', () => {
    const ownerPhone = getOwnerWhatsAppNumber();
    const name = nameInput?.value.trim() || 'Potential Member';
    const phone = phoneInput?.value.trim() || 'Not provided';
    const program = programSelect?.value || 'General Membership';
    const slot = slotSelect?.value || 'Anytime';
    const msg = messageInput?.value.trim() || 'Looking for membership pricing and a studio visit.';

    const waText = encodeURIComponent(
      `*Iron Clan Fitness Studio Enquiry*\n` +
      `To: Guru sir / Gym Management\n` +
      `From: ${name}\n` +
      `Phone: ${phone}\n` +
      `Program/Plan: ${program}\n` +
      `Preferred Slot: ${slot}\n` +
      `Message: ${msg}`
    );

    const waUrl = `https://wa.me/${ownerPhone}?text=${waText}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  });
}

/* ==========================================================================
   8. Owner WhatsApp Configuration & Dynamic Linker
   ========================================================================== */
const DEFAULT_OWNER_WHATSAPP = '919739297111';

function getOwnerWhatsAppNumber() {
  const stored = localStorage.getItem('iron_clan_owner_phone');
  if (stored && stored.trim().length >= 10 && stored !== '919567769721') {
    return stored.replace(/\D/g, '');
  }
  return DEFAULT_OWNER_WHATSAPP;
}

function formatPhoneDisplay(number) {
  const digits = number.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return `+${digits}`;
}

function updateWhatsAppLinks() {
  const ownerNum = getOwnerWhatsAppNumber();
  const directBtn = document.getElementById('direct-whatsapp-btn');
  const floatingBtn = document.getElementById('floating-whatsapp-btn');
  const phoneLabel = document.getElementById('owner-phone-label');

  const defaultMsg = encodeURIComponent(
    'Hi Guru sir / Iron Clan Fitness Studio, I would like to enquire about gym membership and book a visit.'
  );

  if (directBtn) {
    directBtn.href = `https://wa.me/${ownerNum}?text=${defaultMsg}`;
  }
  if (floatingBtn) {
    floatingBtn.href = `https://wa.me/${ownerNum}?text=${defaultMsg}`;
  }
  if (phoneLabel) {
    phoneLabel.textContent = formatPhoneDisplay(ownerNum);
  }
}

function initOwnerWhatsAppManager() {
  updateWhatsAppLinks();

  const editBtn = document.getElementById('edit-owner-phone-btn');
  editBtn?.addEventListener('click', () => {
    const current = getOwnerWhatsAppNumber();
    const input = prompt(
      "Enter Gym Owner's WhatsApp Number (e.g. 9567769721 or 919567769721):",
      current
    );

    if (input !== null) {
      const clean = input.replace(/\D/g, '');
      if (clean.length === 10) {
        localStorage.setItem('iron_clan_owner_phone', '91' + clean);
        updateWhatsAppLinks();
        alert(`Owner WhatsApp successfully linked to: +91 ${clean}`);
      } else if (clean.length === 12 && clean.startsWith('91')) {
        localStorage.setItem('iron_clan_owner_phone', clean);
        updateWhatsAppLinks();
        alert(`Owner WhatsApp successfully linked to: +${clean}`);
      } else if (clean.length >= 8) {
        localStorage.setItem('iron_clan_owner_phone', clean);
        updateWhatsAppLinks();
        alert(`Owner WhatsApp successfully linked to: +${clean}`);
      } else {
        alert("Please enter a valid mobile number (e.g. 10 digits).");
      }
    }
  });
}

function setCurrentYear() {
  const yr = document.getElementById('current-year');
  if (yr) {
    yr.textContent = new Date().getFullYear().toString();
  }
}
