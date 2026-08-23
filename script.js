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

window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        // We use 30% of window height as the offset to match the 25vh scroll-padding
        if (window.scrollY >= (sectionTop - window.innerHeight * 0.3)) {
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

if (confirmModal) {
    const bsModal = new bootstrap.Modal(confirmModal);
    
    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('.project-card a');
        if (link) {
            e.preventDefault();
            const url = link.getAttribute('href');
            const projectName = link.textContent.trim();
            
            // Set modal content
            modalProjectName.textContent = projectName;
            modalConfirmBtn.setAttribute('href', url);
            
            // Handle modal close after clicking "Lanjutkan"
            modalConfirmBtn.addEventListener('click', () => {
                bsModal.hide();
            }, { once: true });
            
            bsModal.show();
        }
    });
}

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
        if(currentSetWidth > 0) {
           sliderContainer.scrollLeft = currentSetWidth;
        }
        updateScaling();
        autoScroll();
    }, 100);

    // Mouse Drag
    let startX, startScrollLeft;
    let dragWalk = 0;

    sliderContainer.addEventListener('mouseleave', () => {
        if (isDragging) {
            isDragging = false;
            resetResumeTimeout();
        }
    });

    sliderContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        isPaused = true;
        if (resumeTimeout) clearTimeout(resumeTimeout);
        dragWalk = 0;
        startX = e.pageX - sliderContainer.offsetLeft;
        startScrollLeft = sliderContainer.scrollLeft;
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            resetResumeTimeout();
        }
    });

    sliderContainer.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - sliderContainer.offsetLeft;
        const walk = (x - startX) * 1.5; 
        dragWalk = Math.abs(walk);
        sliderContainer.scrollLeft = startScrollLeft - walk;
    });
    
    // Prevent click on drag
    sliderContainer.addEventListener('click', (e) => {
        if (dragWalk > 5) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);

    // Touch Mobile (Uses native CSS scroll)
    sliderContainer.addEventListener('touchstart', () => {
        isTouching = true;
        isPaused = true;
        if (resumeTimeout) clearTimeout(resumeTimeout);
    }, {passive: true});

    sliderContainer.addEventListener('touchend', () => {
        isTouching = false;
        resetResumeTimeout();
    }, {passive: true});

    // Trackpad swipe / wheel scroll
    sliderContainer.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            isPaused = true;
            resetResumeTimeout();
        }
    }, {passive: true});

    // Re-initialize vanilla-tilt for cloned elements
    if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll(".project-card"));
    }
}