// ---------- Theme toggle ----------
  const themeToggle = document.getElementById('themeToggle');
  themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-theme');
    themeToggle.setAttribute('aria-pressed', String(isDark));
  });

  // ---------- Mobile menu ----------
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // ---------- Scroll progress bar + back-to-top ring ----------
  const scrollProgress = document.getElementById('scrollProgress');
  const backToTop = document.getElementById('backToTop');
  const ringFill = document.getElementById('progressRingFill');
  const ringCircumference = 125.6;

  function updateScrollProgress(){
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = pct + '%';
    ringFill.style.strokeDashoffset = String(ringCircumference - (pct / 100) * ringCircumference);
    backToTop.classList.toggle('visible', scrollTop > 400);
  }
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ---------- Rotating headline word ----------
  const rotatingWords = ['Digital Experiences', 'Scalable Products', 'Brand Stories'];
  const rotatingEl = document.getElementById('rotatingWord');
  let wordIndex = 0;
  if(!prefersReducedMotionCheck()){
    setInterval(() => {
      rotatingEl.classList.add('swap');
      setTimeout(() => {
        wordIndex = (wordIndex + 1) % rotatingWords.length;
        rotatingEl.textContent = rotatingWords[wordIndex];
        rotatingEl.classList.remove('swap');
      }, 300);
    }, 2800);
  }
  function prefersReducedMotionCheck(){
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // ---------- Animated stat counters (trigger on scroll into view) ----------
  const statNumbers = document.querySelectorAll('.stat-number');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        animateCount(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  statNumbers.forEach(el => statObserver.observe(el));

  function animateCount(el){
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();
    function tick(now){
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if(progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ---------- Magnetic tilt on service cards ----------
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateX = ((y / rect.height) - 0.5) * -8;
      const rotateY = ((x / rect.width) - 0.5) * 8;
      card.style.transform = `translateY(-8px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) rotateX(0) rotateY(0)';
    });
  });

  // ---------- Hero dot-grid canvas (signature element) ----------
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d');
  let w, h, dots = [];
  const spacing = 34;
  let mouse = { x: -9999, y: -9999 };

  function resize(){
    const hero = canvas.parentElement;
    w = canvas.width = hero.offsetWidth;
    h = canvas.height = hero.offsetHeight;
    dots = [];
    for(let x = spacing/2; x < w; x += spacing){
      for(let y = spacing/2; y < h; y += spacing){
        dots.push({ x, y, baseR: 1.4 });
      }
    }
  }
  window.addEventListener('resize', resize);
  canvas.parentElement.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.parentElement.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const accentColor = () => document.body.classList.contains('dark-theme') ? '148,152,255' : '91,95,239';

  function draw(t){
    ctx.clearRect(0, 0, w, h);
    const color = accentColor();
    for(const d of dots){
      const dx = d.x - mouse.x, dy = d.y - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const influence = Math.max(0, 1 - dist / 140);
      const drift = prefersReducedMotion ? 0 : Math.sin(t/2200 + d.x * 0.01 + d.y * 0.01) * 0.6;
      const r = d.baseR + influence * 2.2 + drift * 0.3;
      const alpha = 0.18 + influence * 0.5;
      ctx.beginPath();
      ctx.arc(d.x, d.y + drift, Math.max(0.4, r), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color},${alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  resize();
  requestAnimationFrame(draw);
