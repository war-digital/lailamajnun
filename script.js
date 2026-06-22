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
  const storyScreen = document.getElementById('story-screen');
  const giftScreen = document.getElementById('gift-screen');
  const wishesScreen = document.getElementById('wishes-screen');
  const thankyouScreen = document.getElementById('thankyou-screen');
  
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

  // 6. Section 3 (Schedule) -> Section 4 (Love Story) (Move Forward)
  function triggerScheduleExit() {
    if (isTransitioningSchedule) return;
    isTransitioningSchedule = true;

    // Trigger Section 3 exit forward animations
    scheduleScreen.classList.add('exit-schedule');

    setTimeout(() => {
      // Hide Section 3
      scheduleScreen.classList.add('hidden-screen');
      scheduleScreen.classList.remove('active-schedule');
      scheduleScreen.classList.remove('exit-schedule');

      // Show Section 4
      storyScreen.classList.remove('hidden-screen');
      void storyScreen.offsetWidth;
      storyScreen.classList.add('active-story');

      isTransitioningSchedule = false;
    }, 800);
  }

  let isTransitioningStory = false;

  // 7. Section 4 (Love Story) -> Section 3 (Schedule) (Move Backward)
  function triggerStoryExitBack() {
    if (isTransitioningStory) return;
    isTransitioningStory = true;

    // Trigger Section 4 exit-back animations
    storyScreen.classList.add('exit-story-back');

    setTimeout(() => {
      // Hide Section 4
      storyScreen.classList.add('hidden-screen');
      storyScreen.classList.remove('active-story');
      storyScreen.classList.remove('exit-story-back');

      // Show Section 3
      scheduleScreen.classList.remove('hidden-screen');
      void scheduleScreen.offsetWidth;
      scheduleScreen.classList.add('active-schedule');

      isTransitioningStory = false;
    }, 800);
  }

  // 8. Section 4 (Love Story) -> Section 5 (Wedding Gift) (Move Forward)
  function triggerStoryExit() {
    if (isTransitioningStory) return;
    isTransitioningStory = true;

    // Trigger Section 4 exit forward animations
    storyScreen.classList.add('exit-story');

    setTimeout(() => {
      // Hide Section 4
      storyScreen.classList.add('hidden-screen');
      storyScreen.classList.remove('active-story');
      storyScreen.classList.remove('exit-story');

      // Show Section 5
      giftScreen.classList.remove('hidden-screen');
      void giftScreen.offsetWidth;
      giftScreen.classList.add('active-gift');

      isTransitioningStory = false;
    }, 800);
  }

  let isTransitioningGift = false;

  // 9. Section 5 (Wedding Gift) -> Section 4 (Love Story) (Move Backward)
  function triggerGiftExitBack() {
    if (isTransitioningGift) return;
    isTransitioningGift = true;

    // Trigger Section 5 exit-back animations
    giftScreen.classList.add('exit-gift-back');

    setTimeout(() => {
      // Hide Section 5
      giftScreen.classList.add('hidden-screen');
      giftScreen.classList.remove('active-gift');
      giftScreen.classList.remove('exit-gift-back');

      // Show Section 4
      storyScreen.classList.remove('hidden-screen');
      void storyScreen.offsetWidth;
      storyScreen.classList.add('active-story');

      isTransitioningGift = false;
    }, 800);
  }

  // 10. Section 5 (Wedding Gift) -> Section 6 (Wishes) (Move Forward)
  function triggerGiftExit() {
    if (isTransitioningGift) return;
    isTransitioningGift = true;

    // Trigger Section 5 exit forward animations
    giftScreen.classList.add('exit-gift');

    setTimeout(() => {
      // Hide Section 5
      giftScreen.classList.add('hidden-screen');
      giftScreen.classList.remove('active-gift');
      giftScreen.classList.remove('exit-gift');

      // Show Section 6
      wishesScreen.classList.remove('hidden-screen');
      void wishesScreen.offsetWidth;
      wishesScreen.classList.add('active-wishes');

      isTransitioningGift = false;
    }, 800);
  }

  let isTransitioningWishes = false;

  // 11. Section 6 (Wishes) -> Section 5 (Wedding Gift) (Move Backward)
  function triggerWishesExitBack() {
    if (isTransitioningWishes) return;
    isTransitioningWishes = true;

    // Trigger Section 6 exit-back animations
    wishesScreen.classList.add('exit-wishes-back');

    setTimeout(() => {
      // Hide Section 6
      wishesScreen.classList.add('hidden-screen');
      wishesScreen.classList.remove('active-wishes');
      wishesScreen.classList.remove('exit-wishes-back');

      // Show Section 5
      giftScreen.classList.remove('hidden-screen');
      void giftScreen.offsetWidth;
      giftScreen.classList.add('active-gift');

      isTransitioningWishes = false;
    }, 800);
  }

  // 12. Section 6 (Wishes) -> Section 7 (Thank You) (Move Forward)
  function triggerWishesExit() {
    if (isTransitioningWishes) return;
    isTransitioningWishes = true;

    // Trigger Section 6 exit forward animations
    wishesScreen.classList.add('exit-wishes');

    setTimeout(() => {
      // Hide Section 6
      wishesScreen.classList.add('hidden-screen');
      wishesScreen.classList.remove('active-wishes');
      wishesScreen.classList.remove('exit-wishes');

      // Show Section 7
      thankyouScreen.classList.remove('hidden-screen');
      void thankyouScreen.offsetWidth;
      thankyouScreen.classList.add('active-thankyou');

      isTransitioningWishes = false;
    }, 800);
  }

  let isTransitioningThankyou = false;

  // 13. Section 7 (Thank You) -> Section 6 (Wishes) (Move Backward)
  function triggerThankyouExitBack() {
    if (isTransitioningThankyou) return;
    isTransitioningThankyou = true;

    // Trigger Section 7 exit-back animations
    thankyouScreen.classList.add('exit-thankyou-back');

    setTimeout(() => {
      // Hide Section 7
      thankyouScreen.classList.add('hidden-screen');
      thankyouScreen.classList.remove('active-thankyou');
      thankyouScreen.classList.remove('exit-thankyou-back');

      // Show Section 6
      wishesScreen.classList.remove('hidden-screen');
      void wishesScreen.offsetWidth;
      wishesScreen.classList.add('active-wishes');

      isTransitioningThankyou = false;
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
    const isScrollAtBottom = scheduleCardsContainer.scrollHeight - scheduleCardsContainer.scrollTop <= scheduleCardsContainer.clientHeight + 5;
    
    // Go backward if swiping down AND the cards list is scrolled to the top
    if (diffY < -50 && scheduleCardsContainer.scrollTop === 0) {
      triggerScheduleExitBack(); // Swipe down -> Go backward
    }
    // Go forward if swiping up AND the cards list is scrolled to the bottom
    else if (diffY > 50 && isScrollAtBottom) {
      triggerScheduleExit(); // Swipe up -> Go forward
    }
  }, { passive: true });

  scheduleScreen.addEventListener('wheel', (e) => {
    const isScrollAtBottom = scheduleCardsContainer.scrollHeight - scheduleCardsContainer.scrollTop <= scheduleCardsContainer.clientHeight + 5;
    
    // Go backward if scrolling up AND the cards list is scrolled to the top
    if (e.deltaY < 0 && scheduleCardsContainer.scrollTop === 0) {
      triggerScheduleExitBack(); // Scroll up -> Go backward
    }
    // Go forward if scrolling down AND the cards list is scrolled to the bottom
    else if (e.deltaY > 0 && isScrollAtBottom) {
      triggerScheduleExit(); // Scroll down -> Go forward
    }
  }, { passive: true });

  // --- Section 4 (Love Story) Interaction Listeners ---
  const storyTimelineContainer = document.querySelector('.story-timeline-container');
  let touchStartStoryY = 0;

  storyScreen.addEventListener('touchstart', (e) => {
    touchStartStoryY = e.touches[0].clientY;
  }, { passive: true });

  storyScreen.addEventListener('touchend', (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diffY = touchStartStoryY - touchEndY;
    const isScrollAtTop = !storyTimelineContainer || storyTimelineContainer.scrollTop === 0;
    const isScrollAtBottom = !storyTimelineContainer || (storyTimelineContainer.scrollHeight - storyTimelineContainer.scrollTop <= storyTimelineContainer.clientHeight + 5);
    
    // Go backward if swiping down AND the timeline list is scrolled to the top
    if (diffY < -50 && isScrollAtTop) {
      triggerStoryExitBack(); // Swipe down -> Go backward
    }
    // Go forward if swiping up AND the timeline list is scrolled to the bottom
    else if (diffY > 50 && isScrollAtBottom) {
      triggerStoryExit(); // Swipe up -> Go forward
    }
  }, { passive: true });

  storyScreen.addEventListener('wheel', (e) => {
    const isScrollAtTop = !storyTimelineContainer || storyTimelineContainer.scrollTop === 0;
    const isScrollAtBottom = !storyTimelineContainer || (storyTimelineContainer.scrollHeight - storyTimelineContainer.scrollTop <= storyTimelineContainer.clientHeight + 5);
    
    // Go backward if scrolling up AND the timeline list is scrolled to the top
    if (e.deltaY < 0 && isScrollAtTop) {
      triggerStoryExitBack(); // Scroll up -> Go backward
    }
    // Go forward if scrolling down AND the timeline list is scrolled to the bottom
    else if (e.deltaY > 0 && isScrollAtBottom) {
      triggerStoryExit(); // Scroll down -> Go forward
    }
  }, { passive: true });

  // --- Section 5 (Wedding Gift) Interaction Listeners ---
  const giftCardsContainer = document.querySelector('.gift-cards');
  let touchStartGiftY = 0;

  giftScreen.addEventListener('touchstart', (e) => {
    touchStartGiftY = e.touches[0].clientY;
  }, { passive: true });

  giftScreen.addEventListener('touchend', (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diffY = touchStartGiftY - touchEndY;
    const isScrollAtTop = !giftCardsContainer || giftCardsContainer.scrollTop === 0;
    const isScrollAtBottom = !giftCardsContainer || (giftCardsContainer.scrollHeight - giftCardsContainer.scrollTop <= giftCardsContainer.clientHeight + 5);
    
    // Go backward if swiping down AND the gift list is scrolled to the top
    if (diffY < -50 && isScrollAtTop) {
      triggerGiftExitBack(); // Swipe down -> Go backward
    }
    // Go forward if swiping up AND the gift list is scrolled to the bottom
    else if (diffY > 50 && isScrollAtBottom) {
      triggerGiftExit(); // Swipe up -> Go forward
    }
  }, { passive: true });

  giftScreen.addEventListener('wheel', (e) => {
    const isScrollAtTop = !giftCardsContainer || giftCardsContainer.scrollTop === 0;
    const isScrollAtBottom = !giftCardsContainer || (giftCardsContainer.scrollHeight - giftCardsContainer.scrollTop <= giftCardsContainer.clientHeight + 5);
    
    // Go backward if scrolling up AND the gift list is scrolled to the top
    if (e.deltaY < 0 && isScrollAtTop) {
      triggerGiftExitBack(); // Scroll up -> Go backward
    }
    // Go forward if scrolling down AND the gift list is scrolled to the bottom
    else if (e.deltaY > 0 && isScrollAtBottom) {
      triggerGiftExit(); // Scroll down -> Go forward
    }
  }, { passive: true });

  // --- Clipboard Copy Feature ---
  const copyButtons = document.querySelectorAll('.btn-copy');
  copyButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-target');
      const targetElement = document.getElementById(targetId);
      if (!targetElement) return;

      // Filter out icon element html tags if copying address or physical gifts
      const textToCopy = targetElement.innerText || targetElement.textContent;
      
      navigator.clipboard.writeText(textToCopy.trim()).then(() => {
        // Show temporary success feedback
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fa-solid fa-check"></i> Tersalin!';
        button.style.background = 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)'; // Green feedback
        
        setTimeout(() => {
          button.innerHTML = originalHTML;
          button.style.background = ''; // Restore original
        }, 2000);
      }).catch(err => {
        console.error('Gagal menyalin rekening: ', err);
      });
    });
  });

  // --- Section 6 (Wishes & RSVP) Interaction Listeners ---
  const wishesListContainer = document.getElementById('wishes-list');
  let touchStartWishesY = 0;

  wishesScreen.addEventListener('touchstart', (e) => {
    touchStartWishesY = e.touches[0].clientY;
  }, { passive: true });

  wishesScreen.addEventListener('touchend', (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diffY = touchStartWishesY - touchEndY;
    const isScrollAtTop = !wishesListContainer || wishesListContainer.scrollTop === 0;
    const isScrollAtBottom = !wishesListContainer || (wishesListContainer.scrollHeight - wishesListContainer.scrollTop <= wishesListContainer.clientHeight + 5);
    
    // Go backward if swiping down AND the wishes list is scrolled to the top
    if (diffY < -50 && isScrollAtTop) {
      triggerWishesExitBack(); // Swipe down -> Go backward
    }
    // Go forward if swiping up AND the wishes list is scrolled to the bottom
    else if (diffY > 50 && isScrollAtBottom) {
      triggerWishesExit(); // Swipe up -> Go forward
    }
  }, { passive: true });

  wishesScreen.addEventListener('wheel', (e) => {
    const isScrollAtTop = !wishesListContainer || wishesListContainer.scrollTop === 0;
    const isScrollAtBottom = !wishesListContainer || (wishesListContainer.scrollHeight - wishesListContainer.scrollTop <= wishesListContainer.clientHeight + 5);
    
    // Go backward if scrolling up AND the wishes list is scrolled to the top
    if (e.deltaY < 0 && isScrollAtTop) {
      triggerWishesExitBack(); // Scroll up -> Go backward
    }
    // Go forward if scrolling down AND the wishes list is scrolled to the bottom
    else if (e.deltaY > 0 && isScrollAtBottom) {
      triggerWishesExit(); // Scroll down -> Go forward
    }
  }, { passive: true });

  // --- Section 7 (Thank You) Interaction Listeners ---
  let touchStartThankyouY = 0;

  thankyouScreen.addEventListener('touchstart', (e) => {
    touchStartThankyouY = e.touches[0].clientY;
  }, { passive: true });

  thankyouScreen.addEventListener('touchend', (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diffY = touchStartThankyouY - touchEndY;
    
    // Go backward if swiping down
    if (diffY < -50) {
      triggerThankyouExitBack(); // Swipe down -> Go backward
    }
  }, { passive: true });

  thankyouScreen.addEventListener('wheel', (e) => {
    // Go backward if scrolling up
    if (e.deltaY < 0) {
      triggerThankyouExitBack(); // Scroll up -> Go backward
    }
  }, { passive: true });

  // --- Wishes Board / RSVP Logic ---
  const wishesForm = document.getElementById('wishes-form');
  const wishesList = document.getElementById('wishes-list');
  const wishesCountEl = document.getElementById('wishes-count');

  // Pre-load default wishes if not present in local storage
  const defaultWishes = [
    {
      name: "Andi & Keluarga",
      rsvp: "Hadir",
      message: "Selamat menempuh hidup baru Laila & Majnun! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.",
      date: new Date('2026-06-20T10:00:00').toLocaleString()
    },
    {
      name: "Siti Rahma",
      rsvp: "Hadir",
      message: "Selamat ya! Lancar-lancar sampai hari H. Semoga dilimpahi kebahagiaan selalu.",
      date: new Date('2026-06-21T15:30:00').toLocaleString()
    },
    {
      name: "Budi Santoso",
      rsvp: "Tidak Hadir",
      message: "Selamat berbahagia untuk kedua mempelai. Mohon maaf tidak bisa hadir langsung, namun doa kami menyertai.",
      date: new Date('2026-06-22T08:15:00').toLocaleString()
    }
  ];

  function getWishes() {
    const stored = localStorage.getItem('wedding_wishes');
    if (!stored) {
      localStorage.setItem('wedding_wishes', JSON.stringify(defaultWishes));
      return defaultWishes;
    }
    return JSON.parse(stored);
  }

  function saveWishes(wishes) {
    localStorage.setItem('wedding_wishes', JSON.stringify(wishes));
  }

  function renderWishes() {
    if (!wishesList || !wishesCountEl) return;
    const wishes = getWishes();
    
    // Copy array so we don't mutate original
    const wishesToRender = [...wishes];
    
    // Sort wishes so latest is at the top
    wishesToRender.reverse();

    wishesCountEl.innerText = wishesToRender.length;
    wishesList.innerHTML = '';

    wishesToRender.forEach(wish => {
      const item = document.createElement('div');
      item.className = 'wish-item';
      
      const rsvpClass = wish.rsvp.toLowerCase().replace(' ', '-');
      
      item.innerHTML = `
        <div class="wish-item-header">
          <span class="wish-item-name">${escapeHtml(wish.name)}</span>
          <span class="wish-item-rsvp rsvp-${rsvpClass}">${wish.rsvp}</span>
        </div>
        <p class="wish-item-message">${escapeHtml(wish.message)}</p>
      `;
      wishesList.appendChild(item);
    });
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  if (wishesForm) {
    wishesForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nameInput = document.getElementById('wish-name');
      const rsvpSelect = document.getElementById('wish-rsvp');
      const messageInput = document.getElementById('wish-message');
      
      const name = nameInput.value.trim();
      const rsvp = rsvpSelect.value;
      const message = messageInput.value.trim();
      
      if (!name || !rsvp || !message) return;
      
      const wishes = getWishes();
      wishes.push({
        name: name,
        rsvp: rsvp,
        message: message,
        date: new Date().toLocaleString()
      });
      
      saveWishes(wishes);
      renderWishes();
      
      // Clear inputs
      nameInput.value = '';
      rsvpSelect.value = '';
      messageInput.value = '';
      
      // Scroll wishes list to top to show new wish
      if (wishesList) {
        wishesList.scrollTop = 0;
      }
    });
  }

  // Load and render initially
  renderWishes();

  /* ==========================================================================
     COUNTDOWN TIMER LOGIC (Targets August 17, 2026 10:00:00 WITA)
     ========================================================================== */
  const targetDate = new Date('August 17, 2026 10:00:00').getTime();
  
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  function updateCountdown() {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      if (daysEl) daysEl.innerText = "00";
      if (hoursEl) hoursEl.innerText = "00";
      if (minutesEl) minutesEl.innerText = "00";
      if (secondsEl) secondsEl.innerText = "00";
      return;
    }

    const d = Math.floor(difference / (1000 * 60 * 60 * 24));
    const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((difference % (1000 * 60)) / 1000);

    if (daysEl) daysEl.innerText = d.toString().padStart(2, '0');
    if (hoursEl) hoursEl.innerText = h.toString().padStart(2, '0');
    if (minutesEl) minutesEl.innerText = m.toString().padStart(2, '0');
    if (secondsEl) secondsEl.innerText = s.toString().padStart(2, '0');
  }

  updateCountdown(); // Run once initially
  setInterval(updateCountdown, 1000);
});
