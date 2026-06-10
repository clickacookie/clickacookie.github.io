// header.js — injected header component for clickacookie.github.io

(function () {
  const header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML = `
    <div class="header-inner">
      <a href="#game-section" class="logo" aria-label="Click A Cookie Home">
        <span class="logo-icon">🍪</span>
        <span class="logo-text">Click<span class="logo-accent">A</span>Cookie</span>
      </a>
      <nav class="main-nav" id="main-nav" aria-label="Main navigation">
        <a href="#game-section" class="nav-link">Play Now</a>
        <a href="#how-to-play" class="nav-link">How to Play</a>
        <a href="#buildings-section" class="nav-link">Buildings</a>
        <a href="#achievements-section" class="nav-link">Achievements</a>
        <a href="#tips-section" class="nav-link">Tips</a>
        <a href="#faq-section" class="nav-link">FAQ</a>
      </nav>
      <button class="hamburger" id="hamburger" aria-label="Open menu" aria-expanded="false" aria-controls="main-nav">
        <span></span><span></span><span></span>
      </button>
    </div>
  `;

  const placeholder = document.getElementById('header-placeholder');
  if (placeholder) placeholder.replaceWith(header);
  else document.body.prepend(header);

  // Hamburger toggle
  const hamburger = header.querySelector('#hamburger');
  const nav = header.querySelector('#main-nav');
  hamburger.addEventListener('click', () => {
    const open = nav.classList.toggle('nav-open');
    hamburger.classList.toggle('is-open', open);
    hamburger.setAttribute('aria-expanded', open);
  });

  // Close nav on link click
  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('nav-open');
      hamburger.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', false);
    });
  });

  // Scroll effect
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  });
})();
