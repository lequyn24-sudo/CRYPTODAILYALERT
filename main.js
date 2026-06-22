import logoDark from '/Logo darkmode.png';
import logoLight from '/lOGO LIGHTMODE.png';

export function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Initialize theme from localStorage or system preference
  const currentTheme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', currentTheme);

  const updateLogo = (theme) => {
    const logos = document.querySelectorAll('.logo-img, .footer-logo');
    logos.forEach(logo => {
        if (logo) {
            logo.src = theme === 'dark' ? logoDark : logoLight;
            if (theme === 'light') {
                logo.classList.add('is-light-mode');
            } else {
                logo.classList.remove('is-light-mode');
            }
        }
    });
  };

  updateLogo(currentTheme);
  
  if (themeToggle) {
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        themeIcon.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    }
    
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('theme', nextTheme);
      updateLogo(nextTheme);
      if (themeIcon) {
          themeIcon.textContent = nextTheme === 'dark' ? '☀️' : '🌙';
      }
    });
  }

  // Active Nav Logic
  const currentPath = window.location.pathname;
  const currentSearch = window.location.search;
  
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(link => {
    const linkUrl = new URL(link.href, window.location.origin);
    const linkPath = linkUrl.pathname;
    const linkSearch = linkUrl.search;
    
    if (currentPath.includes('category.html') && linkPath.includes('category.html')) {
        if (currentSearch === linkSearch) {
            link.classList.add('active');
        }
    } else if ((currentPath === '/' || currentPath.includes('index.html')) && 
               (linkPath === '/' || linkPath.includes('index.html'))) {
        link.classList.add('active');
    }
  });
}

export function initScrollAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
  });
}

// BFCache Reflow Fix for Safari layout shift on back navigation
window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    document.body.style.display = 'none';
    document.body.offsetHeight; // trigger reflow
    document.body.style.display = '';
  }
});
