document.addEventListener('DOMContentLoaded', function () {

  /* ================= MOBILE MENU ================= */
  var mobileToggle = document.getElementById('mobileToggle');
  var mobileClose = document.getElementById('mobileClose');
  var mobileMenu = document.getElementById('mobileMenu');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', function () {
      mobileMenu.classList.add('open');
    });
  }
  if (mobileClose && mobileMenu) {
    mobileClose.addEventListener('click', function () {
      mobileMenu.classList.remove('open');
    });
  }
  mobileMenu && mobileMenu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { mobileMenu.classList.remove('open'); });
  });

  /* ================= NAV GLASS ON SCROLL ================= */
  var nav = document.querySelector('.nav');
  if (nav) {
    var onScrollNav = function () {
      if (window.scrollY > 40) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    onScrollNav();
    window.addEventListener('scroll', onScrollNav, { passive: true });
  }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================= PRELOADER (cinematic entry) ================= */
  var preloader = document.getElementById('preloader');
  function runPreloader() {
    if (!preloader) return;
    document.body.classList.add('preloading');
    var ring = preloader.querySelector('.preloader-ring-progress');
    var label = preloader.querySelector('.preloader-label');

    if (reduceMotion || typeof gsap === 'undefined') {
      setTimeout(function () {
        preloader.classList.add('done');
        preloader.style.display = 'none';
        document.body.classList.remove('preloading');
        var heroEls = document.querySelectorAll('[data-hero-in]');
        heroEls.forEach(function (el) {
          el.style.opacity = 1;
          el.style.transform = 'none';
        });
      }, 300);
      return;
    }

    var tl = gsap.timeline();
    tl.to(ring, { strokeDashoffset: 0, duration: 1.3, ease: 'power2.inOut' })
      .to(label, { opacity: 1, duration: 0.4 }, '-=0.9')
      .to(preloader, {
        yPercent: -100,
        duration: 0.9,
        ease: 'power3.inOut',
        delay: 0.25,
        onComplete: function () {
          preloader.style.display = 'none';
          document.body.classList.remove('preloading');
        }
      })
      .add(revealHero, '-=0.55');
  }

  function revealHero() {
    if (typeof gsap === 'undefined' || reduceMotion) return;
    var heroEls = document.querySelectorAll('[data-hero-in]');
    gsap.to(heroEls, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
      stagger: 0.12
    });
  }

  // Preloader plays on every homepage load (and always on logo click)
  var isHome = document.body.dataset.page === 'home';
  if (isHome && preloader) {
    runPreloader();
  } else if (preloader) {
    preloader.style.display = 'none';
  }

  // Replay intro on brand click
  var brandMark = document.querySelector('.brand-mark');
  if (brandMark && preloader) {
    brandMark.addEventListener('click', function (e) {
      if (!isHome) return;
      e.preventDefault();
      preloader.style.display = 'flex';
      preloader.classList.remove('done');
      gsap.set(preloader, { yPercent: 0 });
      var ring = preloader.querySelector('.preloader-ring-progress');
      var label = preloader.querySelector('.preloader-label');
      gsap.set(ring, { strokeDashoffset: 402 });
      gsap.set(label, { opacity: 0 });
      gsap.set(document.querySelectorAll('[data-hero-in]'), { opacity: 0, y: 24 });
      runPreloader();
    });
  }

  /* ================= SCROLL REVEALS ================= */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    if (!reduceMotion) {
      document.querySelectorAll('[data-reveal]').forEach(function (el) {
        gsap.fromTo(el, { opacity: 0, y: 28 }, {
          opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%' }
        });
      });

      document.querySelectorAll('[data-reveal-group]').forEach(function (group) {
        var items = group.querySelectorAll('[data-reveal-item]');
        gsap.fromTo(items, { opacity: 0, y: 24 }, {
          opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.09,
          scrollTrigger: { trigger: group, start: 'top 85%' }
        });
      });

      // subtle parallax on hero visual
      document.querySelectorAll('[data-parallax]').forEach(function (el) {
        gsap.to(el, {
          yPercent: -10,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 }
        });
      });
    } else {
      document.querySelectorAll('[data-reveal], [data-reveal-item]').forEach(function (el) {
        el.style.opacity = 1;
      });
    }
  } else {
    // Fallback IntersectionObserver
    var revealEls = document.querySelectorAll('[data-reveal], [data-reveal-item]');
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      revealEls.forEach(function (el) { observer.observe(el); });
    }
  }

  /* ================= CURSOR GLOW ================= */
  if (window.innerWidth > 900 && !reduceMotion) {
    var glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    var glowX = 0, glowY = 0, curX = 0, curY = 0;
    document.addEventListener('mousemove', function (e) {
      glowX = e.clientX; glowY = e.clientY;
      glow.style.opacity = 1;
    });
    function animGlow() {
      curX += (glowX - curX) * 0.12;
      curY += (glowY - curY) * 0.12;
      glow.style.left = curX + 'px';
      glow.style.top = curY + 'px';
      requestAnimationFrame(animGlow);
    }
    animGlow();
  }

  /* ================= MAGNETIC BUTTONS ================= */
  if (window.innerWidth > 900 && !reduceMotion && typeof gsap !== 'undefined') {
    document.querySelectorAll('.btn-primary, .btn-clay, .chatbot-toggle, .instagram-float').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, { x: x * 0.28, y: y * 0.28, duration: 0.4, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', function () {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  /* ================= TILT ON SERVICE / TEAM CARDS ================= */
  if (window.innerWidth > 900 && !reduceMotion && typeof gsap !== 'undefined') {
    document.querySelectorAll('.service-card, .team-photo').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        gsap.to(card, { rotateY: px * 6, rotateX: -py * 6, duration: 0.5, ease: 'power2.out', transformPerspective: 800 });
      });
      card.addEventListener('mouseleave', function () {
        gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: 'power3.out' });
      });
    });
  }

  /* ================= MARQUEE duplicate content for seamless loop ================= */
  document.querySelectorAll('.marquee-track').forEach(function (track) {
    track.innerHTML += track.innerHTML;
  });

  /* ================= SPLIT-TEXT HERO TITLE (char stagger) ================= */
  var heroTitle = document.querySelector('.hero-title');
  if (heroTitle && typeof gsap !== 'undefined' && !reduceMotion && isHomeInit()) {
    // handled within hero fade via data-hero-in; kept simple for performance
  }
  function isHomeInit() { return document.body.dataset.page === 'home'; }

  /* ================= NUMBER COUNT-UP ON SCROLL ================= */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !reduceMotion) {
    document.querySelectorAll('.about-stat-num').forEach(function (el) {
      var raw = el.textContent.trim();
      var match = raw.match(/^(\d+)(.*)$/);
      if (!match) return;
      var target = parseInt(match[1], 10);
      var suffix = match[2] || '';
      var obj = { val: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: function () {
          gsap.to(obj, {
            val: target,
            duration: 1.4,
            ease: 'power2.out',
            onUpdate: function () { el.textContent = Math.round(obj.val) + suffix; }
          });
        }
      });
    });
  }

  /* ================= HERO CANVAS — floating particles ================= */
  var canvas = document.getElementById('heroCanvas');
  if (canvas && !reduceMotion && window.innerWidth > 640) {
    var ctx = canvas.getContext('2d');
    var particles = [];
    var W, H, DPR = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(DPR, DPR);
    }
    resize();
    window.addEventListener('resize', resize);

    var colors = ['rgba(169,130,47,0.35)', 'rgba(201,163,86,0.3)', 'rgba(138,106,38,0.25)'];
    for (var i = 0; i < 26; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.6 + 0.6,
        vy: -(Math.random() * 0.25 + 0.05),
        vx: (Math.random() - 0.5) * 0.15,
        color: colors[i % colors.length]
      });
    }

    function tick() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(function (p) {
        p.y += p.vy;
        p.x += p.vx;
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
      requestAnimationFrame(tick);
    }
    tick();
  }

  /* ================= BOOKING WIZARD ================= */
  var wizard = document.getElementById('bookingWizard');
  if (wizard) {
    var steps = Array.prototype.slice.call(wizard.querySelectorAll('.wizard-panel'));
    var dots = Array.prototype.slice.call(wizard.querySelectorAll('.wizard-step-dot'));
    var labelSpans = Array.prototype.slice.call(wizard.querySelectorAll('.wizard-step-label span'));
    var current = 0;

    function showStep(idx) {
      steps.forEach(function (s, i) { s.classList.toggle('active', i === idx); });
      dots.forEach(function (d, i) {
        d.classList.toggle('done', i < idx);
        d.classList.toggle('active', i === idx);
      });
      labelSpans.forEach(function (l, i) { l.classList.toggle('current', i === idx); });
      current = idx;
      if (idx === steps.length - 1) updateSummary();
      wizard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function validateStep(idx) {
      var panel = steps[idx];
      var required = panel.querySelectorAll('[required]');
      for (var i = 0; i < required.length; i++) {
        var field = required[i];
        if (field.type === 'radio') {
          var group = panel.querySelectorAll('input[name="' + field.name + '"]');
          var checked = Array.prototype.some.call(group, function (r) { return r.checked; });
          if (!checked) { alert(wizard.dataset.msgRequired || 'Por favor preencha este campo.'); return false; }
        } else if (!field.value) {
          field.focus();
          return false;
        }
      }
      return true;
    }

    wizard.querySelectorAll('[data-next]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!validateStep(current)) return;
        if (current < steps.length - 1) showStep(current + 1);
      });
    });
    wizard.querySelectorAll('[data-prev]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (current > 0) showStep(current - 1);
      });
    });

    // service selection cards
    wizard.querySelectorAll('.service-option').forEach(function (opt) {
      opt.addEventListener('click', function () {
        wizard.querySelectorAll('.service-option').forEach(function (o) { o.classList.remove('selected'); });
        opt.classList.add('selected');
        opt.querySelector('input').checked = true;
      });
    });

    // time slot selection
    wizard.querySelectorAll('.time-slot').forEach(function (slot) {
      slot.addEventListener('click', function () {
        wizard.querySelectorAll('.time-slot').forEach(function (s) { s.classList.remove('selected'); });
        slot.classList.add('selected');
        slot.querySelector('input').checked = true;
      });
    });

    function updateSummary() {
      var summary = document.getElementById('wizardSummary');
      if (!summary) return;
      var name = wizard.querySelector('[name="full_name"]');
      var email = wizard.querySelector('[name="email"]');
      var phone = wizard.querySelector('[name="phone"]');
      var selectedService = wizard.querySelector('.service-option.selected .service-option-name');
      var date = wizard.querySelector('[name="booking_date"]');
      var selectedTime = wizard.querySelector('.time-slot.selected');

      summary.innerHTML = '';
      var rows = [
        [summary.dataset.lName, name ? name.value : ''],
        [summary.dataset.lEmail, email ? email.value : ''],
        [summary.dataset.lPhone, phone ? phone.value : ''],
        [summary.dataset.lService, selectedService ? selectedService.textContent : ''],
        [summary.dataset.lDate, date ? date.value : ''],
        [summary.dataset.lTime, selectedTime ? selectedTime.dataset.label : '']
      ];
      rows.forEach(function (r) {
        var row = document.createElement('div');
        row.className = 'wizard-summary-row';
        row.innerHTML = '<span class="label">' + r[0] + '</span><span>' + (r[1] || '—') + '</span>';
        summary.appendChild(row);
      });
    }

    showStep(0);
  }
});
