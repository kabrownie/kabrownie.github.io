// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Navbar background change on scroll
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
});

// Add subtle class for styling (optional)
const style = document.createElement('style');
style.textContent = `.site-header.scrolled { background: rgba(11, 12, 14, 0.95); }`;
document.head.appendChild(style);

// Scroll-to-top button
const scrollBtn = document.getElementById('scrollBtn');
window.addEventListener('scroll', () => {
    scrollBtn.classList.toggle('visible', window.scrollY > 500);
});

scrollBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Typing effect for hero
const typingElement = document.getElementById('typing');
const phrases = [
    'Nominated for the 14th Kalasha Awards 2026.', 
    '3D animator and software developer.', 
    'Building stories in Blender.', 
    'Crafting clean code for Android, Flutter & web.'
];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
    const current = phrases[phraseIndex];
    if (isDeleting) {
        typingElement.textContent = current.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typingElement.textContent = current.substring(0, charIndex + 1);
        charIndex++;
    }

    if (!isDeleting && charIndex === current.length) {
        isDeleting = true;
        setTimeout(typeEffect, 2000);
        return;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(typeEffect, 400);
        return;
    }

    setTimeout(typeEffect, isDeleting ? 40 : 80);
}

typeEffect();