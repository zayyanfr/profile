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

    const cardImg = e.target.closest('.project-card-img');
    const link = e.target.closest('.project-card a');

    if (cardImg) {
        // Tapping/clicking the image directly
        const card = cardImg.closest('.project-card');
        const cardLink = card ? card.querySelector('a') : null;
        if (cardLink) {
            e.preventDefault();
            openProjectModal(cardLink);
        }
    } else if (link) {
        // Clicking the card body or link
        e.preventDefault();
        openProjectModal(link);
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
    let isDragging = false;
    let isTouching = false;
    let isPaused = false;
    let resumeTimeout = null;
    
    function resetResumeTimeout() {
        if (resumeTimeout) clearTimeout(resumeTimeout);
        resumeTimeout = setTimeout(() => {
            isPaused = false;
        }, 5000);
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
        if (!isDragging && !isTouching && !isPaused) {
            sliderContainer.scrollLeft += autoScrollSpeed;
        }
        
        const currentSetWidth = getSetWidth();
        if (currentSetWidth > 0) {
            if (sliderContainer.scrollLeft >= currentSetWidth * 2) {
                sliderContainer.scrollLeft -= currentSetWidth;
            }
            else if (sliderContainer.scrollLeft <= 0) {
                sliderContainer.scrollLeft += currentSetWidth;
            }
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

    // Mouse Drag (Strictly initiated on the image area)
    let startX = 0;
    let startScrollLeft = 0;
    let dragWalk = 0;

    sliderContainer.addEventListener('mousedown', (e) => {
        const img = e.target.closest('.project-card-img');
        if (!img || e.button !== 0) return; // Only allow drag starting strictly on image

        isDragging = true;
        isPaused = true;
        isSliderActionDrag = false;
        if (resumeTimeout) clearTimeout(resumeTimeout);
        dragWalk = 0;
        startX = e.pageX;
        startScrollLeft = sliderContainer.scrollLeft;
        sliderContainer.classList.add('is-dragging');
        e.preventDefault(); // Prevents native HTML5 image dragging
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const x = e.pageX;
        const walk = (x - startX) * 1.3;
        dragWalk = Math.abs(walk);
        if (dragWalk > 6) {
            isSliderActionDrag = true;
        }
        sliderContainer.scrollLeft = startScrollLeft - walk;
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            sliderContainer.classList.remove('is-dragging');
            resetResumeTimeout();
            setTimeout(() => {
                isSliderActionDrag = false;
            }, 60);
        }
    });

    // Touch Mobile (Swipe strictly allowed starting on the image area)
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartScrollLeft = 0;
    let isTouchDragging = false;
    let isTouchHorizontal = null;

    sliderContainer.addEventListener('touchstart', (e) => {
        const img = e.target.closest('.project-card-img');
        if (!img) return; // Ignore touches outside image area so normal page scrolling works

        isTouching = true;
        isPaused = true;
        isSliderActionDrag = false;
        if (resumeTimeout) clearTimeout(resumeTimeout);

        isTouchDragging = true;
        isTouchHorizontal = null;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartScrollLeft = sliderContainer.scrollLeft;
    }, { passive: true });

    sliderContainer.addEventListener('touchmove', (e) => {
        if (!isTouchDragging) return;
        if (e.cancelable) e.preventDefault(); // Mencegah layar web ikut terswipe

        const currentX = e.touches[0].clientX;
        const diffX = currentX - touchStartX;

        if (Math.abs(diffX) > 6) {
            isSliderActionDrag = true;
        }
        sliderContainer.scrollLeft = touchStartScrollLeft - diffX;
    }, { passive: false });

    sliderContainer.addEventListener('touchend', () => {
        if (isTouchDragging) {
            isTouchDragging = false;
            isTouching = false;
            resetResumeTimeout();
            setTimeout(() => {
                isSliderActionDrag = false;
            }, 60);
        }
    }, { passive: true });

    sliderContainer.addEventListener('touchcancel', () => {
        isTouchDragging = false;
        isTouching = false;
        resetResumeTimeout();
    }, { passive: true });

    // Trackpad swipe / horizontal wheel scroll
    sliderContainer.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            if (e.cancelable) e.preventDefault(); // Mencegah layar web / history navigation ikut swipe
            sliderContainer.scrollLeft += e.deltaX;
            isPaused = true;
            resetResumeTimeout();
        }
    }, { passive: false });

    // Re-initialize vanilla-tilt for cloned elements
    if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll(".project-card"));
    }
}