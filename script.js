document.addEventListener('DOMContentLoaded', () => {
  const openingScreen = document.getElementById('opening-screen');
  const weddingScreen = document.getElementById('wedding-screen');
  const swipeTrack = document.querySelector('.swipe-track');
  const swipeHandle = document.getElementById('swipe-handle');
  const swipeText = document.querySelector('.swipe-text');
  const openingOrnament = document.querySelector('.opening-ornament');
  const bgMusic = document.getElementById('bg-music');
  const musicToggle = document.getElementById('music-toggle');
  const btnOpenInvitation = document.getElementById('btn-open-invitation');
  const guestNameElement = document.getElementById('guest-name');
  const arrumScreen = document.getElementById('arrum-screen');
  const coupleScreen = document.getElementById('couple-screen');
  const scheduleScreen = document.getElementById('schedule-screen');
  
  let isDraggingHandle = false;
  let isDraggingScreen = false;
  let startX = 0;
  let currentX = 0;
  let maxSlide = 0;
  let hasUnlocked = false;

  // Initialize bounds for slider
  function updateBounds() {
    maxSlide = swipeTrack.clientWidth - swipeHandle.clientWidth - 8; // 8px for 4px left/right padding
  }
  updateBounds();
  window.addEventListener('resize', updateBounds);

  /* ==========================================================================
     GET GUEST NAME FROM URL PARAMETERS (?to=Nama+Tamu atau ?u=Nama+Tamu)
     ========================================================================== */
  function loadGuestName() {
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get('to') || urlParams.get('u');
    if (guestName) {
      guestNameElement.innerText = decodeURIComponent(guestName.replace(/\+/g, ' '));
    } else {
      guestNameElement.innerText = "Tamu Undangan";
    }
  }
  loadGuestName();

  /* ==========================================================================
     SWIPE HANDLE DRAGGING LOGIC
     ========================================================================== */
  
  // Touch Events for Handle
  swipeHandle.addEventListener('touchstart', (e) => {
    if (hasUnlocked) return;
    isDraggingHandle = true;
    startX = e.touches[0].clientX;
    swipeHandle.style.transition = 'none';
    swipeText.style.transition = 'none';
    openingOrnament.style.transition = 'none';
  }, { passive: true });

  // Mouse Events for Handle
  swipeHandle.addEventListener('mousedown', (e) => {
    if (hasUnlocked) return;
    isDraggingHandle = true;
    startX = e.clientX;
    swipeHandle.style.transition = 'none';
    swipeText.style.transition = 'none';
    openingOrnament.style.transition = 'none';
    document.body.style.userSelect = 'none';
  });

  /* ==========================================================================
     FULL SCREEN DRAG/SWIPE LOGIC
     ========================================================================== */
  
  openingScreen.addEventListener('touchstart', (e) => {
    if (isDraggingHandle || hasUnlocked) return;
    isDraggingScreen = true;
    startX = e.touches[0].clientX;
    openingScreen.style.transition = 'none';
    openingOrnament.style.transition = 'none';
  }, { passive: true });

  openingScreen.addEventListener('mousedown', (e) => {
    if (e.target.closest('#swipe-handle') || hasUnlocked) return;
    isDraggingScreen = true;
    startX = e.clientX;
    openingScreen.style.transition = 'none';
    openingOrnament.style.transition = 'none';
    document.body.style.userSelect = 'none';
  });

  /* ==========================================================================
     MOVE HANDLERS
     ========================================================================== */
  
  const handleMove = (clientX) => {
    const diff = clientX - startX;

    if (isDraggingHandle) {
      // Limit slide distance
      let translateX = Math.max(0, Math.min(diff, maxSlide));
      swipeHandle.style.transform = `translateX(${translateX}px)`;
      
      // Calculate progress
      const progress = translateX / maxSlide;
      swipeText.style.opacity = Math.max(0.1, 1 - progress * 1.5);
      
      // Pull ornament slightly as handle moves (Parallax feedback)
      openingOrnament.style.transform = `translateX(${translateX * 0.2}px) rotate(${translateX * 0.03}deg)`;
    } 
    else if (isDraggingScreen) {
      // Swipe whole screen right
      let translateX = Math.max(0, diff);
      openingScreen.style.transform = `translateX(${translateX}px)`;
      
      // Accentuate ornament pull effect
      openingOrnament.style.transform = `translateX(${translateX * 0.15}px) rotate(${translateX * 0.02}deg)`;
      
      // Let wedding screen scale up slightly as cover moves
      const progress = Math.min(translateX / window.innerWidth, 1);
      const bgScale = 1.1 - (progress * 0.1);
      weddingScreen.style.transform = `scale(${bgScale})`;
      weddingScreen.style.opacity = progress;
    }
  };

  window.addEventListener('touchmove', (e) => {
    if (!isDraggingHandle && !isDraggingScreen) return;
    handleMove(e.touches[0].clientX);
  }, { passive: false });

  window.addEventListener('mousemove', (e) => {
    if (!isDraggingHandle && !isDraggingScreen) return;
    handleMove(e.clientX);
  });

  /* ==========================================================================
     DRAG END LOGIC
     ========================================================================== */
  
  const handleEnd = (clientX) => {
    if (!isDraggingHandle && !isDraggingScreen) return;
    
    const diff = clientX - startX;
    document.body.style.userSelect = '';

    if (isDraggingHandle) {
      isDraggingHandle = false;
      
      // 80% to unlock
      if (diff >= maxSlide * 0.8) {
        unlockInvitation();
      } else {
        // Snap back handle, text, and ornament
        swipeHandle.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
        swipeText.style.transition = 'opacity 0.4s ease';
        openingOrnament.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
        
        swipeHandle.style.transform = 'translateX(0)';
        swipeText.style.opacity = '1';
        openingOrnament.style.transform = '';
      }
    } 
    else if (isDraggingScreen) {
      isDraggingScreen = false;
      const screenWidth = window.innerWidth;
      
      // 25% of screen width to unlock
      if (diff >= screenWidth * 0.25) {
        unlockInvitation();
      } else {
        // Snap back screen, ornament, and wedding background
        openingScreen.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
        openingOrnament.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
        
        openingScreen.style.transform = 'translateX(0)';
        openingOrnament.style.transform = '';
        
        weddingScreen.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
        weddingScreen.style.transform = '';
        weddingScreen.style.opacity = '';
      }
    }
  };

  window.addEventListener('touchend', (e) => {
    if (e.changedTouches && e.changedTouches.length > 0) {
      handleEnd(e.changedTouches[0].clientX);
    } else {
      handleEnd(0);
    }
  });

  window.addEventListener('mouseup', (e) => {
    handleEnd(e.clientX);
  });

  /* ==========================================================================
     UNLOCK & TRANSITION ACTION (Swipe Cover Unlock)
     ========================================================================== */
  
  function unlockInvitation() {
    if (hasUnlocked) return;
    hasUnlocked = true;

    // Slide out cover screen
    openingScreen.style.transition = 'transform 0.8s cubic-bezier(0.76, 0, 0.24, 1), opacity 0.8s ease';
    openingScreen.style.transform = 'translateX(100%)';
    openingScreen.style.opacity = '0';
    openingScreen.classList.add('slide-out');

    // Slide/animate ornament faster to show it "pulled" away
    openingOrnament.style.transition = 'transform 1s cubic-bezier(0.76, 0, 0.24, 1), opacity 0.8s ease';
    openingOrnament.style.transform = 'translateX(200px) rotate(15deg)';
    openingOrnament.style.opacity = '0';

    // Show wedding screen
    weddingScreen.classList.remove('hidden-screen');
    weddingScreen.style.transition = 'none';
    weddingScreen.style.transform = '';
    weddingScreen.style.opacity = '';
    
    void weddingScreen.offsetWidth; // Force reflow
    weddingScreen.classList.add('active-wedding');
    
    // Show music toggle (but wait for button click to ensure audio plays correctly on all devices)
    musicToggle.classList.remove('hidden');

    setTimeout(() => {
      openingScreen.style.display = 'none';
    }, 1000);
  }

  /* ==========================================================================
     BUKA UNDANGAN BUTTON CLICK HANDLER
     ========================================================================== */
  btnOpenInvitation.addEventListener('click', () => {
    // 1. Play Background Music (guaranteed to play due to direct user click)
    playMusic();
    
    // 2. Perform a beautiful open confirmation (e.g. animate button, show toast)
    btnOpenInvitation.style.transform = 'scale(0.95)';
    setTimeout(() => {
      btnOpenInvitation.style.transform = '';
      
      // Transition to Ar-Rum Screen (Fade out wedding screen, fade in arrum screen)
      weddingScreen.classList.add('fade-out-screen');
      
      setTimeout(() => {
        weddingScreen.classList.add('hidden-screen');
        weddingScreen.classList.remove('active-wedding');
        weddingScreen.classList.remove('fade-out-screen');
        
        arrumScreen.classList.remove('hidden-screen');
        void arrumScreen.offsetWidth; // Trigger reflow for animation
        arrumScreen.classList.add('active-arrum');
      }, 800); // Match CSS fade-out transition duration
    }, 150);

    // Create a beautiful, premium toast notification
    showToast(`Selamat datang, ${guestNameElement.innerText}!`);
  });

  function showToast(message) {
    // Check if toast already exists
    let toast = document.querySelector('.toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast-notification';
      document.body.appendChild(toast);
    }
    toast.innerText = message;
    
    // Add active class
    toast.classList.add('show');
    
    // Remove after 3.5 seconds
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }

  /* ==========================================================================
     MUSIC CONTROLLER
     ========================================================================== */
  
  function playMusic() {
    bgMusic.play().then(() => {
      musicToggle.classList.remove('muted');
    }).catch((err) => {
      console.log("Autoplay blocked. Awaiting user gesture.", err);
    });
  }

  function toggleMusic() {
    if (bgMusic.paused) {
      bgMusic.play();
      musicToggle.classList.remove('muted');
    } else {
      bgMusic.pause();
      musicToggle.classList.add('muted');
    }
  }

  musicToggle.addEventListener('click', toggleMusic);

  /* ==========================================================================
     SCROLL/SWIPE TO SECTION 2 (COUPLE DETAILS SCREEN) & REVERSIBLE NAVIGATION
     ========================================================================== */
  let isTransitioningArrum = false;
  let isTransitioningCouple = false;
  let touchStartY = 0;
  let touchStartCoupleY = 0;

  // 1. Section 1 (Ar-Rum) -> Section 2 (Couple Details) (Move Forward)
  function triggerArrumExit() {
    if (isTransitioningArrum) return;
    isTransitioningArrum = true;

    // Trigger exit animations for Section 1 elements
    arrumScreen.classList.add('exit-arrum');

    setTimeout(() => {
      // Hide Section 1
      arrumScreen.classList.add('hidden-screen');
      arrumScreen.classList.remove('active-arrum');
      arrumScreen.classList.remove('exit-arrum');

      // Show Section 2
      coupleScreen.classList.remove('hidden-screen');
      void coupleScreen.offsetWidth; // Force reflow to trigger animations
      coupleScreen.classList.add('active-couple');

      isTransitioningArrum = false;
    }, 800); // 800ms exit animation duration
  }

  // 2. Section 1 (Ar-Rum) -> Wedding Details Screen (Move Backward)
  function triggerArrumExitBack() {
    if (isTransitioningArrum) return;
    isTransitioningArrum = true;

    // Trigger exit-back animations for Section 1 elements (slide down)
    arrumScreen.classList.add('exit-arrum-back');

    setTimeout(() => {
      // Hide Section 1
      arrumScreen.classList.add('hidden-screen');
      arrumScreen.classList.remove('active-arrum');
      arrumScreen.classList.remove('exit-arrum-back');

      // Show Wedding Screen
      weddingScreen.classList.remove('hidden-screen');
      void weddingScreen.offsetWidth;
      weddingScreen.classList.add('active-wedding');

      isTransitioningArrum = false;
    }, 800);
  }

  // 3. Section 2 (Couple Details) -> Section 1 (Ar-Rum) (Move Backward)
  function triggerCoupleExitBack() {
    if (isTransitioningCouple) return;
    isTransitioningCouple = true;

    // Trigger Section 2 custom split-slide exit animations
    coupleScreen.classList.add('exit-couple');

    setTimeout(() => {
      // Hide Section 2
      coupleScreen.classList.add('hidden-screen');
      coupleScreen.classList.remove('active-couple');
      coupleScreen.classList.remove('exit-couple');

      // Show Section 1
      arrumScreen.classList.remove('hidden-screen');
      void arrumScreen.offsetWidth;
      arrumScreen.classList.add('active-arrum');

      isTransitioningCouple = false;
    }, 800);
  }

  // 4. Section 2 (Couple Details) -> Section 3 (Schedule) (Move Forward)
  function triggerCoupleExit() {
    if (isTransitioningCouple) return;
    isTransitioningCouple = true;

    // Trigger Section 2 exit animations
    coupleScreen.classList.add('exit-couple');

    setTimeout(() => {
      // Hide Section 2
      coupleScreen.classList.add('hidden-screen');
      coupleScreen.classList.remove('active-couple');
      coupleScreen.classList.remove('exit-couple');

      // Show Section 3
      scheduleScreen.classList.remove('hidden-screen');
      void scheduleScreen.offsetWidth; // Force reflow
      scheduleScreen.classList.add('active-schedule');

      isTransitioningCouple = false;
    }, 800);
  }

  let isTransitioningSchedule = false;

  // 5. Section 3 (Schedule) -> Section 2 (Couple Details) (Move Backward)
  function triggerScheduleExitBack() {
    if (isTransitioningSchedule) return;
    isTransitioningSchedule = true;

    // Trigger Section 3 exit-back animations
    scheduleScreen.classList.add('exit-schedule-back');

    setTimeout(() => {
      // Hide Section 3
      scheduleScreen.classList.add('hidden-screen');
      scheduleScreen.classList.remove('active-schedule');
      scheduleScreen.classList.remove('exit-schedule-back');

      // Show Section 2
      coupleScreen.classList.remove('hidden-screen');
      void coupleScreen.offsetWidth;
      coupleScreen.classList.add('active-couple');

      isTransitioningSchedule = false;
    }, 800);
  }

  // --- Section 1 (Ar-Rum) Interaction Listeners ---
  arrumScreen.addEventListener('wheel', (e) => {
    if (e.deltaY > 0) {
      triggerArrumExit(); // Scroll down -> Go forward
    } else if (e.deltaY < 0) {
      triggerArrumExitBack(); // Scroll up -> Go backward
    }
  }, { passive: true });

  arrumScreen.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  arrumScreen.addEventListener('touchend', (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diffY = touchStartY - touchEndY;
    if (diffY > 50) {
      triggerArrumExit(); // Swipe up -> Go forward
    } else if (diffY < -50) {
      triggerArrumExitBack(); // Swipe down -> Go backward
    }
  }, { passive: true });

  // --- Section 2 (Couple Details) Interaction Listeners ---
  coupleScreen.addEventListener('wheel', (e) => {
    if (e.deltaY > 0) {
      triggerCoupleExit(); // Scroll down -> Go forward
    } else if (e.deltaY < 0) {
      triggerCoupleExitBack(); // Scroll up -> Go backward
    }
  }, { passive: true });

  coupleScreen.addEventListener('touchstart', (e) => {
    touchStartCoupleY = e.touches[0].clientY;
  }, { passive: true });

  coupleScreen.addEventListener('touchend', (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diffY = touchStartCoupleY - touchEndY;
    if (diffY > 50) {
      triggerCoupleExit(); // Swipe up -> Go forward
    } else if (diffY < -50) {
      triggerCoupleExitBack(); // Swipe down -> Go backward
    }
  }, { passive: true });

  // --- Section 3 (Schedule) Interaction Listeners ---
  const scheduleCardsContainer = document.querySelector('.schedule-cards');
  let touchStartScheduleY = 0;

  scheduleScreen.addEventListener('touchstart', (e) => {
    touchStartScheduleY = e.touches[0].clientY;
  }, { passive: true });

  scheduleScreen.addEventListener('touchend', (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diffY = touchStartScheduleY - touchEndY;
    // Go backward if swiping down AND the cards list is scrolled to the top
    if (diffY < -50 && scheduleCardsContainer.scrollTop === 0) {
      triggerScheduleExitBack(); // Swipe down -> Go backward
    }
  }, { passive: true });

  scheduleScreen.addEventListener('wheel', (e) => {
    // Go backward if scrolling up AND the cards list is scrolled to the top
    if (e.deltaY < 0 && scheduleCardsContainer.scrollTop === 0) {
      triggerScheduleExitBack(); // Scroll up -> Go backward
    }
  }, { passive: true });
});
