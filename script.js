// DARK MODE
const body = document.body;
const btnToggle = document.getElementById("btnToggle");
const savedDarkMode = localStorage.getItem("darkMode");

// Default is dark mode, so it only turns light if explicitly saved as "false"
if (savedDarkMode === "false") {
    body.classList.remove("dark");
    btnToggle.innerHTML = "🌙";
} else {
    body.classList.add("dark");
    btnToggle.innerHTML = "☀️";
}

btnToggle.addEventListener("click", () => {
    body.classList.toggle("dark");
    const isDark = body.classList.contains("dark");
    localStorage.setItem("darkMode", isDark);
    btnToggle.innerHTML = isDark ? "☀️" : "🌙";
});

// ACTIVE NAVIGATION HIGHLIGHT ON SCROLL
const sections = document.querySelectorAll("header, section, footer");
const navLinks = document.querySelectorAll(".navbar-nav .nav-link");

function getScrollOffset(targetElement, targetId) {
    const navbar = document.querySelector('.navbar');
    const navHeight = navbar ? navbar.offsetHeight : 70;
    const targetTop = targetElement.getBoundingClientRect().top + window.pageYOffset;
    const targetHeight = targetElement.offsetHeight;
    const windowHeight = window.innerHeight;

    if (targetId === '#project') {
        // Tepat di tengah layar di bawah navbar
        const availableHeight = windowHeight - navHeight;
        const offset = Math.max(15, (availableHeight - targetHeight) / 2);
        return Math.max(0, targetTop - navHeight - offset);
    }
    return Math.max(0, targetTop - navHeight - 15);
}

// SMOOTH SCROLL FOR NAV LINKS (EXACT POSITIONING)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#' || !targetId) return;
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            e.preventDefault();
            const targetScroll = getScrollOffset(targetElement, targetId);
            window.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
            });
            history.pushState(null, null, targetId);
        }
    });
});

// Auto position if page loaded with #project hash
window.addEventListener('load', () => {
    if (window.location.hash === '#project') {
        const projectSection = document.getElementById('project');
        if (projectSection) {
            setTimeout(() => {
                const targetScroll = getScrollOffset(projectSection, '#project');
                window.scrollTo({
                    top: targetScroll,
                    behavior: 'smooth'
                });
            }, 150);
        }
    }
});

window.addEventListener("scroll", () => {
    let current = "";
    const navbar = document.querySelector('.navbar');
    const navHeight = navbar ? navbar.offsetHeight : 70;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= (sectionTop - navHeight - 120)) {
            current = section.getAttribute("id");
        }
    });

    navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href").substring(1) === current) {
            link.classList.add("active");
        }
    });
});

// AUTO CLOSE OFFCANVAS ON MOBILE LINK CLICK
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        const offcanvasElement = document.getElementById('offcanvasNavbar');
        if (offcanvasElement && offcanvasElement.classList.contains('show')) {
            const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
            if (bsOffcanvas) {
                bsOffcanvas.hide();
            }
        }
    });
});

// INITIALIZE AOS ANIMATION
AOS.init({
    duration: 800,
    once: true,
    offset: 100
});

// SCROLL PROGRESS BAR
const scrollProgress = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
    const totalScroll = document.documentElement.scrollTop;
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scroll = `${totalScroll / windowHeight * 100}%`;
    
    if (scrollProgress) {
        scrollProgress.style.width = scroll;
    }
});

// TYPED.JS INITIALIZATION
if (document.getElementById('typed-text')) {
    new Typed('#typed-text', {
        strings: ['Mahasiswa Informatika', 'Web Developer', 'Python Enthusiast', 'Universitas Sultan Ageng Tirtayasa'],
        typeSpeed: 50,
        backSpeed: 30,
        backDelay: 1500,
        loop: true
    });
}

// PROJECT LINK CONFIRMATION (MODAL UI)
const confirmModal = document.getElementById('projectConfirmModal');
const modalProjectName = document.getElementById('modalProjectName');
const modalConfirmBtn = document.getElementById('modalConfirmBtn');
let bsModal = null;

if (confirmModal) {
    bsModal = new bootstrap.Modal(confirmModal);
}

function openProjectModal(linkElement) {
    if (!bsModal || !linkElement) return;
    const url = linkElement.getAttribute('href');
    const projectName = linkElement.textContent.trim();
    
    // Set modal content
    modalProjectName.textContent = projectName;
    modalConfirmBtn.setAttribute('href', url);
    
    // Handle modal close after clicking "Lanjutkan"
    modalConfirmBtn.addEventListener('click', () => {
        bsModal.hide();
    }, { once: true });
    
    bsModal.show();
}

// Global drag tracker to distinguish clicks from drags/swipes
let isSliderActionDrag = false;

document.body.addEventListener('click', (e) => {
    // If a drag/swipe just occurred on the slider, suppress modal opening
    if (isSliderActionDrag) {
        e.preventDefault();
        e.stopPropagation();
        return;
    }

    const card = e.target.closest('.project-card');
    if (card && card.closest('#projectSliderContainer')) {
        const link = card.querySelector('a');
        if (link) {
            e.preventDefault();
            openProjectModal(link);
        }
    }
});

// PROJECT HORIZONTAL SCROLL & SCALE ANIMATION
const sliderContainer = document.getElementById('projectSliderContainer');
const slider = document.getElementById('projectSlider');

if (sliderContainer && slider) {
    let originalSlides = Array.from(document.querySelectorAll('.original-slide'));

    // Clone slides for infinite scroll
    originalSlides.forEach(slide => {
        let clone = slide.cloneNode(true);
        clone.classList.remove('original-slide');
        slider.appendChild(clone);
    });
    originalSlides.forEach(slide => {
        let clone = slide.cloneNode(true);
        clone.classList.remove('original-slide');
        slider.appendChild(clone);
    });

    const allSlides = Array.from(document.querySelectorAll('.project-slide'));

    function getSetWidth() {
        if (allSlides.length < originalSlides.length * 2) return 0;
        return allSlides[originalSlides.length].offsetLeft - allSlides[0].offsetLeft;
    }

    let autoScrollSpeed = 1; // px per frame
    let isMouseDragging = false;
    let isTouching = false;
    let isPaused = false;
    let resumeTimeout = null;

    let startX = 0;
    let startScrollLeft = 0;
    let dragDistance = 0;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartScrollLeft = 0;
    let isHorizontalSwipe = false;
    let isDirectionDetermined = false;

    function pauseAutoScroll() {
        isPaused = true;
        if (resumeTimeout) clearTimeout(resumeTimeout);
    }
    
    function resetResumeTimeout() {
        if (resumeTimeout) clearTimeout(resumeTimeout);
        resumeTimeout = setTimeout(() => {
            isPaused = false;
        }, 5000); // Mulai jalan kembali setelah 5 detik tidak ada swipe
    }

    function checkInfiniteWrap() {
        const currentSetWidth = getSetWidth();
        if (currentSetWidth <= 0) return;

        if (sliderContainer.scrollLeft >= currentSetWidth * 2) {
            sliderContainer.scrollLeft -= currentSetWidth;
            startScrollLeft -= currentSetWidth;
            touchStartScrollLeft -= currentSetWidth;
        } else if (sliderContainer.scrollLeft <= 10) {
            sliderContainer.scrollLeft += currentSetWidth;
            startScrollLeft += currentSetWidth;
            touchStartScrollLeft += currentSetWidth;
        }
    }
    
    function updateScaling() {
        const containerCenter = sliderContainer.getBoundingClientRect().left + sliderContainer.clientWidth / 2;
        
        allSlides.forEach(slide => {
            const rect = slide.getBoundingClientRect();
            const slideCenter = rect.left + rect.width / 2;
            const distanceFromCenter = Math.abs(containerCenter - slideCenter);
            
            const maxDistance = sliderContainer.clientWidth / 2 + rect.width;
            
            let scale = 1 - (distanceFromCenter / maxDistance) * 0.3; 
            if (scale < 0.7) scale = 0.7; 
            if (scale > 1.05) scale = 1.05; 
            
            let opacity = 1 - (distanceFromCenter / maxDistance) * 0.5;
            if (opacity < 0.4) opacity = 0.4;
            if (opacity > 1) opacity = 1;

            slide.style.transform = `scale(${scale})`;
            slide.style.opacity = opacity;
        });
    }

    function autoScroll() {
        if (!isMouseDragging && !isTouching && !isPaused) {
            sliderContainer.scrollLeft += autoScrollSpeed;
            checkInfiniteWrap();
        }
        updateScaling();
        requestAnimationFrame(autoScroll);
    }

    // Initialize
    setTimeout(() => {
        const currentSetWidth = getSetWidth();
        if (currentSetWidth > 0) {
            sliderContainer.scrollLeft = currentSetWidth;
        }
        updateScaling();
        autoScroll();
    }, 100);

    // Mouse Drag (Anywhere on slider)
    sliderContainer.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return; // Only main left click

        isMouseDragging = true;
        isSliderActionDrag = false;

        startX = e.pageX;
        startScrollLeft = sliderContainer.scrollLeft;
        dragDistance = 0;

        sliderContainer.classList.add('is-dragging');
        e.preventDefault(); // Prevents native link/image dragging
    });

    window.addEventListener('mousemove', (e) => {
        if (!isMouseDragging) return;

        const x = e.pageX;
        const walk = (x - startX) * 1.3;
        dragDistance = Math.abs(walk);

        if (dragDistance > 6) {
            isSliderActionDrag = true;
            pauseAutoScroll(); // Hanya berhenti saat aktif di-drag ke kanan/kiri
        }

        sliderContainer.scrollLeft = startScrollLeft - walk;
        checkInfiniteWrap();
        updateScaling();
    });

    window.addEventListener('mouseup', () => {
        if (isMouseDragging) {
            isMouseDragging = false;
            sliderContainer.classList.remove('is-dragging');

            if (isSliderActionDrag) {
                resetResumeTimeout(); // Berhenti dan mulai jalan lagi setelah 5 detik tidak ada swipe
                setTimeout(() => {
                    isSliderActionDrag = false;
                }, 120);
            }
        }
    });

    // Touch Mobile (Swipe horizontal vs scroll vertical)
    sliderContainer.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return;

        isTouching = true;
        isSliderActionDrag = false;
        isHorizontalSwipe = false;
        isDirectionDetermined = false;

        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartScrollLeft = sliderContainer.scrollLeft;
        dragDistance = 0;
    }, { passive: true });

    sliderContainer.addEventListener('touchmove', (e) => {
        if (!isTouching || e.touches.length !== 1) return;

        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = currentX - touchStartX;
        const diffY = currentY - touchStartY;

        if (!isDirectionDetermined) {
            if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) {
                isDirectionDetermined = true;
                if (Math.abs(diffX) >= Math.abs(diffY)) {
                    isHorizontalSwipe = true;
                } else {
                    isHorizontalSwipe = false;
                    // User is scrolling the page vertically! Allow normal browser scrolling
                    return;
                }
            } else {
                return;
            }
        }

        // Allow vertical page scroll
        if (!isHorizontalSwipe) return;

        // Prevent vertical jitter during horizontal swipe
        if (e.cancelable) e.preventDefault();

        // Berhenti hanya saat aktif di-swipe kanan/kiri
        pauseAutoScroll();

        dragDistance = Math.abs(diffX);
        if (dragDistance > 6) {
            isSliderActionDrag = true;
        }

        sliderContainer.scrollLeft = touchStartScrollLeft - diffX;
        checkInfiniteWrap();
        updateScaling();
    }, { passive: false });

    function handleTouchEnd() {
        if (isTouching) {
            isTouching = false;

            if (isSliderActionDrag || isHorizontalSwipe) {
                resetResumeTimeout(); // Berhenti dan mulai jalan lagi setelah 5 detik tidak ada swipe
                setTimeout(() => {
                    isSliderActionDrag = false;
                }, 120);
            }
        }
    }

    sliderContainer.addEventListener('touchend', handleTouchEnd, { passive: true });
    sliderContainer.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    // Trackpad swipe / horizontal wheel scroll
    sliderContainer.addEventListener('wheel', (e) => {
        const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey;
        if (isHorizontal) {
            if (e.cancelable) e.preventDefault();
            const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
            sliderContainer.scrollLeft += delta;
            checkInfiniteWrap();
            updateScaling();
            pauseAutoScroll();
            resetResumeTimeout(); // Mulai jalan lagi setelah 5 detik tidak ada swipe
        }
    }, { passive: false });

    // Re-initialize vanilla-tilt for cloned elements
    if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll(".project-card"));
    }
}