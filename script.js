// DARK MODE
const body = document.body;
const btnToggle = document.getElementById("btnToggle");
const savedDarkMode = localStorage.getItem("darkMode");

if (savedDarkMode === "true") {
    body.classList.add("dark");
    btnToggle.innerHTML = "☀️ Light Mode";
} else {
    body.classList.remove("dark");
    btnToggle.innerHTML = "🌙 Dark Mode";
}

btnToggle.addEventListener("click", () => {
    body.classList.toggle("dark");
    const isDark = body.classList.contains("dark");
    localStorage.setItem("darkMode", isDark);
    btnToggle.innerHTML = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
});

// ACTIVE NAVIGATION HIGHLIGHT ON SCROLL
const sections = document.querySelectorAll("header, section, footer");
const navLinks = document.querySelectorAll(".navbar-nav .nav-link");

const observerOptions = {
    root: null,
    rootMargin: "-80px 0px -40% 0px",
    threshold: 0
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navLinks.forEach(link => {
                link.classList.remove("active");
                if (link.getAttribute("href").substring(1) === entry.target.id) {
                    link.classList.add("active");
                }
            });
        }
    });
}, observerOptions);

sections.forEach(section => {
    if (section.id) {
        observer.observe(section);
    }
});