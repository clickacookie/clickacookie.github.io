// footer.js — injected footer component for clickacookie.github.io

(function () {
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = `
    <div class="footer-inner">
      <div class="footer-brand">
        <span class="footer-logo">🍪 ClickACookie</span>
        <p>The sweetest free idle clicker game on the web. Bake cookies, build your empire, unlock achievements — all in your browser.</p>
      </div>
      <div class="footer-links">
        <div class="footer-col">
          <h4>Game</h4>
          <a href="/#game-section">Play Now</a>
          <a href="/#how-to-play">How to Play</a>
          <a href="/#tips-section">Strategy Tips</a>
          <a href="/#golden-section">Golden Cookies</a>
        </div>
        <div class="footer-col">
          <h4>Content</h4>
          <a href="/#buildings-section">Buildings Guide</a>
          <a href="/#upgrades-section">Upgrades Guide</a>
          <a href="/#achievements-section">Achievements</a>
          <a href="/#faq-section">FAQ</a>
        </div>
        <div class="footer-col">
          <h4>Info</h4>
          <a href="/about-section">About Us</a>
          <a href="/contact">Contact</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Use</a>
          <a href="/cookies-policy">Cookies Policy</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© ${new Date().getFullYear()} <a href="https://clickacookie.github.io/">ClickACookie</a> — Free Online Cookie Clicker Game. All rights reserved.</p>
      <p class="footer-tagline">Made with 🍪 and love for idle game fans everywhere.</p>
    </div>
  `;

  const placeholder = document.getElementById('footer-placeholder');
  if (placeholder) placeholder.replaceWith(footer);
  else document.body.appendChild(footer);
})();
