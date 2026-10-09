/* ==========================================================================
   Samyukthaa Fashions - Interactive Functionality & Mobile Enhancements
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initLiveStoreStatus();
  initHeroShowcase();
  initGalleryFiltering();
  initLightbox();
  initMobileNav();
  initHeaderScroll();
});

/* --------------------------------------------------------------------------
   1. Live Store Hours & Status Indicator
   Hours: 10:00 AM to 8:00 PM everyday
   -------------------------------------------------------------------------- */
function initLiveStoreStatus() {
  const statusEl = document.getElementById('live-store-status');
  const footerStatusEl = document.getElementById('footer-store-status');
  if (!statusEl) return;

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour + currentMinute / 60;

  const openTime = 10.0; // 10:00 AM
  const closeTime = 20.0; // 8:00 PM

  const isOpen = currentTime >= openTime && currentTime < closeTime;

  if (isOpen) {
    const text = 'Open Today · Closes 8:00 PM';
    statusEl.textContent = text;
    if (footerStatusEl) {
      footerStatusEl.textContent = 'Open Today · 10:00 AM – 8:00 PM';
    }
  } else {
    const text = 'Closed Now · Opens 10:00 AM';
    statusEl.textContent = text;
    if (footerStatusEl) {
      footerStatusEl.textContent = 'Closed Now · Opens Tomorrow 10:00 AM';
    }
    const dot = document.querySelector('.status-indicator-dot');
    if (dot) {
      dot.style.backgroundColor = '#e07a5f';
    }
    const pulseDot = document.querySelector('.pulse-dot');
    if (pulseDot) {
      pulseDot.style.backgroundColor = '#e07a5f';
    }
  }
}

/* --------------------------------------------------------------------------
   2. Hero Section Image Switcher (Touch + Click)
   -------------------------------------------------------------------------- */
function initHeroShowcase() {
  const mainImg = document.getElementById('hero-feature-img');
  const thumbs = document.querySelectorAll('.hero-thumb');
  if (!mainImg || !thumbs.length) return;

  thumbs.forEach(thumb => {
    const handleSelect = () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');

      const targetSrc = thumb.getAttribute('data-img');
      if (targetSrc && !mainImg.src.endsWith(targetSrc)) {
        mainImg.style.opacity = '0.3';
        setTimeout(() => {
          mainImg.src = targetSrc;
          mainImg.style.opacity = '1';
        }, 120);
      }
    };

    thumb.addEventListener('click', handleSelect);
  });
}

/* --------------------------------------------------------------------------
   3. Gallery Filtering (Smooth Mobile Swiping)
   -------------------------------------------------------------------------- */
function initGalleryFiltering() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (!filterBtns.length || !galleryItems.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Auto scroll active button into view in mobile filter carousel
      btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

      const filterVal = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        if (filterVal === 'all' || itemCategory === filterVal) {
          item.classList.remove('hidden');
          item.style.opacity = '0';
          setTimeout(() => {
            item.style.opacity = '1';
          }, 40);
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   4. Interactive Fullscreen Lightbox Modal (with Touch Swipe Support)
   -------------------------------------------------------------------------- */
function initLightbox() {
  const modal = document.getElementById('lightbox-modal');
  const backdrop = document.getElementById('lightbox-backdrop');
  const closeBtn = document.getElementById('lightbox-close');
  const modalImg = document.getElementById('lightbox-img');
  const modalTitle = document.getElementById('lightbox-title');
  const modalDesc = document.getElementById('lightbox-desc');
  const modalWaBtn = document.getElementById('lightbox-wa-btn');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  if (!modal || !modalImg) return;

  let visibleItems = [];
  let currentIndex = 0;

  function updateVisibleItems() {
    visibleItems = Array.from(document.querySelectorAll('.gallery-item:not(.hidden)'));
  }

  function showItem(index) {
    updateVisibleItems();
    if (visibleItems.length === 0) return;

    if (index < 0) {
      currentIndex = visibleItems.length - 1;
    } else if (index >= visibleItems.length) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }

    const currentItem = visibleItems[currentIndex];
    const imgSrc = currentItem.getAttribute('data-img');
    const title = currentItem.getAttribute('data-title') || 'Samyukthaa Fashions';
    const desc = currentItem.getAttribute('data-desc') || '';

    modalImg.src = imgSrc;
    modalImg.alt = title;
    modalTitle.textContent = title;
    modalDesc.textContent = desc;

    // Dynamic WhatsApp Link
    const waText = encodeURIComponent(`Hello Samyukthaa Fashions, I am interested in: "${title}". Could you please share more details or price?`);
    modalWaBtn.href = `https://wa.me/919866695009?text=${waText}`;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Attach click listeners to gallery cards
  document.querySelectorAll('.gallery-item').forEach(item => {
    const trigger = item.querySelector('.gallery-thumb-wrap');
    if (trigger) {
      trigger.addEventListener('click', () => {
        updateVisibleItems();
        const itemIdx = visibleItems.indexOf(item);
        showItem(itemIdx !== -1 ? itemIdx : 0);
      });
    }
  });

  // Modal navigation & controls
  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showItem(currentIndex - 1);
  });

  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showItem(currentIndex + 1);
  });

  // Touch Swipe navigation for mobile
  let touchStartX = 0;
  let touchEndX = 0;

  modal.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  modal.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const threshold = 50; // min distance
    if (touchEndX < touchStartX - threshold) {
      // Swiped Left -> Next
      showItem(currentIndex + 1);
    }
    if (touchEndX > touchStartX + threshold) {
      // Swiped Right -> Prev
      showItem(currentIndex - 1);
    }
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') showItem(currentIndex - 1);
    if (e.key === 'ArrowRight') showItem(currentIndex + 1);
  });
}

/* --------------------------------------------------------------------------
   5. Mobile Drawer Navigation & Outside Click
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const toggleBtn = document.getElementById('mobile-toggle');
  const drawer = document.getElementById('mobile-drawer');
  if (!toggleBtn || !drawer) return;

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isActive = drawer.classList.toggle('active');
    toggleBtn.classList.toggle('active', isActive);
  });

  // Close when clicking any nav link
  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      drawer.classList.remove('active');
      toggleBtn.classList.remove('active');
    });
  });

  // Close when clicking outside drawer
  document.addEventListener('click', (e) => {
    if (drawer.classList.contains('active') && !drawer.contains(e.target) && !toggleBtn.contains(e.target)) {
      drawer.classList.remove('active');
      toggleBtn.classList.remove('active');
    }
  });
}

/* --------------------------------------------------------------------------
   6. Header Scroll Elevation
   -------------------------------------------------------------------------- */
function initHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.45)';
      header.style.background = 'rgba(20, 10, 6, 0.98)';
    } else {
      header.style.boxShadow = 'var(--shadow-md)';
      header.style.background = 'rgba(26, 13, 7, 0.95)';
    }
  }, { passive: true });
}
