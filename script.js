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
const projectLinks = document.querySelectorAll('.project-card a');
const confirmModal = document.getElementById('projectConfirmModal');
const modalProjectName = document.getElementById('modalProjectName');
const modalConfirmBtn = document.getElementById('modalConfirmBtn');

if (confirmModal) {
    const bsModal = new bootstrap.Modal(confirmModal);
    
    projectLinks.forEach(link => {
        link.addEventListener('click', (e) => {
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
        });
    });
}